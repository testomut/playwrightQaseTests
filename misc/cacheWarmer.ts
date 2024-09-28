import type { FullConfig } from '@playwright/test';
import { chromium } from '@playwright/test';
import AuthenticationPage from '../pageObjects/AuthenticationPage';
import * as fs from 'fs';
import * as path from 'path';
import EmailService from '../services/EmailService';
const userAccounts = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../variables/defaultUsers.json'), 'utf-8'));

export default async function globalSetup(config: FullConfig) {
  console.log('[CACHE WARMER] Warming up static files cache...');
  console.time('[CACHE WARMER] Done warming up static files cache.');

  const env = process.env.ENV;
  const environmentUrl = process.env.ENVIRONMENT_URL as string;
  const oldAccountEmail = process.env.OLD_ACCOUNT_EMAIL as string;
  const oldAccountPass = process.env.OLD_ACCOUNT_PASS as string;
  
  const tokenENV = process.env[`TOKEN_${env}`];
  const httpCredentials = {
    username: process.env.BASIC_USERNAME as string,
    password: process.env.BASIC_PASSWORD as string,
  };
  const browser = await chromium.launch();
  const context = await browser.newContext({
    httpCredentials,
    recordHar: {
      path: 'cache/cache.har',
      urlFilter: /(.js|css|\.png|\.jpg|\.jpeg|\.mp3|\.gif|\.svg|\.ico|\.woff|\.woff2|\.ttf|\.eot|vendor\.js|app\.js|app\.css|gtag\/js|react\.js|stripe\.com|settings|grsm)/i
    },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  const authPage = new AuthenticationPage(page, context);
  const emailService = new EmailService(page);
  await authPage.loginUser({email: oldAccountEmail, password: oldAccountPass});
  
  const cookies = await context.cookies();
  const token = cookies.find(cookie => cookie.name === tokenENV)?.value;
  // Save token to a file
  const tokenPath = path.resolve(__dirname, '../variables/token.json');
  let user = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
  user.token = token
  fs.writeFileSync(tokenPath, JSON.stringify({ token }));
  await page.close();
  await context.close();
  await browser.close();
  for(let i=0; userAccounts>i; i++) {
    await emailService.markAllEmailsAsRead(userAccounts[i].email);
    await emailService.markAllEmailsAsRead(userAccounts[i].member.email);
  }
  
  console.timeEnd('[CACHE WARMER] Done warming up static files cache.');
}
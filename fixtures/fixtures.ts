import { test as baseTest } from '@playwright/test';
import AuthenticationPage from '../pageObjects/AuthenticationPage';
import ConversationsPage from '../pageObjects/ConversationsPage';
import CustomCommands from '../utils/CustomCommands';
import EmailService from '../services/EmailService';
import ApiRequest from '../utils/ApiRequests';
import ContactsPage from '../pageObjects/ContactsPage';
import MembersPage from '../pageObjects/MembersPage';
import InboxesPage from '../pageObjects/InboxesPage';
import BillingPage from '../pageObjects/BillingPage';
import AnalyticsPage from '../pageObjects/AnalyticsPage';
import BroadcastsPage from '../pageObjects/BroadcastsPage';
import ClientsPage from '../pageObjects/ClientsPage';
import { RegistrationData } from '../types/Types';
import * as fs from 'fs';
import * as path from 'path';
import SettingsPage from '../pageObjects/SettingsPage';
import TriggersPage from '../pageObjects/TriggersPage';
require('dotenv').config();


const userAccounts = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../variables/defaultUsers.json'), 'utf-8'));
const env = process.env.ENV;
const oldAccountPhone = process.env[`OLD_ACCOUNT_PHONE_${env}`] as string;
const environmentUrl = process.env.ENVIRONMENT_URL as string;
const oldAccountEmail = process.env.OLD_ACCOUNT_EMAIL as string;
const oldAccountPass = process.env.OLD_ACCOUNT_PASS as string;

type TestFixtures = {
    openAuthPage: {
        authPage: AuthenticationPage, 
        conversationsPage: ConversationsPage, 
        userDetails: RegistrationData,
        settingsPage: SettingsPage,
        billingPage: BillingPage
    },
    signUpWithCoupon: {
        authPage: AuthenticationPage, 
        conversationsPage: ConversationsPage, 
        userDetails: RegistrationData,
        settingsPage: SettingsPage,
        billingPage: BillingPage
    }
    openAuthPageCoupon: {
        authPage: AuthenticationPage, 
        conversationsPage: ConversationsPage, 
        userDetails: RegistrationData,
        settingsPage: SettingsPage,
        billingPage: BillingPage
    },
    start: {
        conversationsPage: ConversationsPage, 
        userDetails: RegistrationData,
        authPage: AuthenticationPage,
        emailService: EmailService,
        apiRequest: ApiRequest,
        contactsPage: ContactsPage,
        membersPage: MembersPage,
        settingsPage: SettingsPage,
        inboxesPage: InboxesPage,
        billingPage: BillingPage,
        analyticsPage: AnalyticsPage,
        clientsPage: ClientsPage,
        triggersPage: TriggersPage,
        broadcastsPage: BroadcastsPage,
        amountMessages: number,
    },
    annuallyUpdateAccountSignIn: {
        conversationsPage: ConversationsPage, 
        userDetails: RegistrationData,
        settingsPage: SettingsPage,
        billingPage: BillingPage
    },
    newFreeAccountSignIn: {
        conversationsPage: ConversationsPage, 
        newUser: RegistrationData,
        settingsPage: SettingsPage,
        billingPage: BillingPage
    },
    authPage: AuthenticationPage,
    conversationsPage: ConversationsPage,
    userDetails: RegistrationData,
    emailService: EmailService,
    apiRequest: ApiRequest,
    custom: CustomCommands,
    contactsPage: ContactsPage,
    membersPage: MembersPage,
    settingsPage: SettingsPage,
    inboxesPage: InboxesPage,
    billingPage: BillingPage,
    analyticsPage: AnalyticsPage,
    triggersPage: TriggersPage,
    clientsPage: ClientsPage,
    tagForTest: { newTag: string },
    addFilesLiberty: void,
    customFieldForTest: { newCustomFieldName: string, newCustomFieldValue: string },
    userBalance: { balance: number },
    oldAccountSignIn: { userDetails: RegistrationData, conversationsPage: ConversationsPage }
};

export const test = baseTest.extend<TestFixtures>({
    openAuthPage: async ({ page, context }, use, testInfo) => {
        const userDetails = userAccounts[testInfo.parallelIndex];
        const authPage = new AuthenticationPage(page, context);
        const conversationsPage = new ConversationsPage(page, context);
        const settingsPage = new SettingsPage(page, context);
        const billingPage = new BillingPage(page, context);
        console.time('[Debug] openAuthPage');
        await page.routeFromHAR('cache/cache.har', {
            notFound: 'fallback',
            update: false
        });
        await authPage.visitLoginPage();
        await use({ authPage, conversationsPage, userDetails, settingsPage, billingPage });
        console.timeEnd('[Debug] openAuthPage');
    },
    signUpWithCoupon: async ({ page, context }, use, testInfo) => {
        const userDetails = userAccounts[testInfo.parallelIndex];
        const authPage = new AuthenticationPage(page, context);
        const conversationsPage = new ConversationsPage(page, context);
        const settingsPage = new SettingsPage(page, context);
        const billingPage = new BillingPage(page, context);
        console.time('[Debug] openAuthPage');
        await page.routeFromHAR('cache/cache.har', {
            notFound: 'fallback',
            update: false
        });
        await authPage.visitSignUpPage('20%');
        await use({ authPage, conversationsPage, userDetails, settingsPage, billingPage });
        console.timeEnd('[Debug] openAuthPage');
    },
    start: async ({ page, context }, use, testInfo) => {
        const userDetails = userAccounts[testInfo.parallelIndex];
        const authPage = new AuthenticationPage(page, context);
        const conversationsPage = new ConversationsPage(page, context);
        const apiRequest = new ApiRequest(page)
        const contactsPage = new ContactsPage(page, context);
        const emailService = new EmailService(page);
        const membersPage = new MembersPage(page, context);
        const settingsPage = new SettingsPage(page, context);
        const inboxesPage = new InboxesPage(page, context);
        const billingPage = new BillingPage(page, context);
        const analyticsPage = new AnalyticsPage(page, context);
        const triggersPage = new TriggersPage(page, context);
        const broadcastsPage = new BroadcastsPage(page, context);
        const clientsPage = new ClientsPage(page, context);
        console.time('[Debug] openAuthPage');
        await page.routeFromHAR('cache/cache.har', {
            notFound: 'fallback',
            update: false
        });
        
        const token = await apiRequest.login(userDetails.email, userDetails.password);
        userDetails.token = token.token.access_token;
        await conversationsPage.oauthWithToken(userDetails.token);
        await conversationsPage.selectInbox(`${userDetails.firstName} ${userDetails.lastName}`);
        await conversationsPage.selectConversation(oldAccountPhone);
        
        const isDisabled = await conversationsPage.isDisabledInput();
        if(isDisabled) {
            const amountMessages = await conversationsPage.getMessagesAmount();
            await apiRequest.sendMessageRecipient(userDetails.businessNumber, 'START');
            await conversationsPage.waitNewMessage(amountMessages, 1);
        }
        const amountMessages = await conversationsPage.getMessagesAmount();
        await use({ 
            conversationsPage, 
            authPage, 
            contactsPage, 
            emailService, 
            apiRequest, 
            membersPage, 
            settingsPage, 
            userDetails,
            inboxesPage,
            billingPage,
            analyticsPage,
            triggersPage,
            broadcastsPage,
            amountMessages,
            clientsPage
        });
        console.timeEnd('[Debug] openAuthPage');
    },
    annuallyUpdateAccountSignIn: async ({ page, context }, use, testInfo) => {
        const conversationsPage = new ConversationsPage(page, context);
        const apiRequest = new ApiRequest(page);
        const settingsPage = new SettingsPage(page, context);
        const billingPage = new BillingPage(page, context);
        console.time('[Debug] openAuthPage');
        await page.routeFromHAR('cache/cache.har', {
            notFound: 'fallback',
            update: false
        });
        const userDetails = await apiRequest.createUserApi();
        await apiRequest.upgradePlan(userDetails.token, 'pro-yearly-90000');
        await conversationsPage.oauthWithToken(userDetails.token);
        await use({ conversationsPage, userDetails, settingsPage, billingPage });
        console.timeEnd('[Debug] openAuthPage');
    },
    newFreeAccountSignIn: async ({ page, context }, use, testInfo) => {
        const conversationsPage = new ConversationsPage(page, context);
        const apiRequest = new ApiRequest(page);
        const settingsPage = new SettingsPage(page, context);
        const billingPage = new BillingPage(page, context);
        console.time('[Debug] openAuthPage');
        await page.routeFromHAR('cache/cache.har', {
            notFound: 'fallback',
            update: false
        });
        const newUser = await apiRequest.createUserApi();
        await conversationsPage.oauthWithToken(newUser.token);
        await use({ conversationsPage, newUser, settingsPage, billingPage });
        console.timeEnd('[Debug] openAuthPage');
    },
    oldAccountSignIn: async ({ page, context }, use, testInfo) => {
        const userDetails = userAccounts[testInfo.parallelIndex];
        const apiRequest = new ApiRequest(page);
        const conversationsPage = new ConversationsPage(page, context);
        console.time('[Debug] openAuthPage');
        await page.routeFromHAR('cache/cache.har', {
            notFound: 'fallback',
            update: false
        });
        const token = await apiRequest.login(oldAccountEmail, oldAccountPass);
        await conversationsPage.oauthWithToken(token.token.access_token);
        await use({ userDetails, conversationsPage });
        console.timeEnd('[Debug] openAuthPage');
    },
    authPage: async ({ page, context }, use) => {
        await use(new AuthenticationPage(page, context));
    },
    conversationsPage: async ({ page, context }, use) => {
        await use(new ConversationsPage(page, context));
    },
    contactsPage: async ({ page, context }, use) => {
        await use(new ContactsPage(page, context));
    },
    userDetails: async ({}, use, testInfo) => {
        const userDetails = userAccounts[testInfo.parallelIndex];
        await use(userDetails);
    },
    emailService: async ({ page }, use) => {
        await use(new EmailService(page));
    },
    apiRequest: async ({page}, use) => {
        await use(new ApiRequest(page));
    },
    custom: async ({ page, context}, use) => {
        await use(new CustomCommands(page, context));
    },
    
    tagForTest: async ({ page, context }, use, testInfo) => {
        const userDetails = userAccounts[testInfo.parallelIndex];
        const testData = {
            newTag: `tagTest`,
        }
        const apiRequest = new ApiRequest(page);
        let token = await apiRequest.login(userDetails.email, userDetails.password);
        token = token.token.access_token;
        await apiRequest.deleteAllTags(token);
        await apiRequest.tags(token, testData.newTag);
        await use(testData);
        await apiRequest.deleteAllTags(token);
    },
    customFieldForTest: async ({ page, context }, use, testInfo) => {
        const userDetails = userAccounts[testInfo.parallelIndex];
        const testData = {
            newCustomFieldName: `QA Trig`,
            newCustomFieldValue: `qa tests`
        }
        const apiRequest = new ApiRequest(page);
        let token = await apiRequest.login(userDetails.email, userDetails.password);
        token = token.token.access_token;
        await apiRequest.deleteAllCustomFields(token);
        await apiRequest.addCustomField(token, {
            name: testData.newCustomFieldName,
            type: 'text',
            visible: false
        })
        await apiRequest.updateContactCustomField(token, oldAccountPhone, testData.newCustomFieldName, testData.newCustomFieldValue);
        await use(testData);
        await apiRequest.deleteAllCustomFields(token);
    },
    userBalance: async ({ page, context }, use, testInfo) => {
        const userDetails = userAccounts[testInfo.parallelIndex];
        const testData = {
            balance: 123,
        }
        const apiRequest = new ApiRequest(page);
        let token = await apiRequest.login(userDetails.email, userDetails.password);
        token = token.token.access_token;
        const balance = await apiRequest.getUserBalance(token);
        testData.balance = balance;
        await use(testData);
    },
    addFilesLiberty: async ({ page, context }, use, testInfo) => {
        const conversationsPage = new ConversationsPage(page, context);
        const userDetails = userAccounts[testInfo.parallelIndex];
        await conversationsPage.selectConversation(`${userDetails.firstName} ${userDetails.lastName}`)
        await conversationsPage.uploadAndVerifyFiles(['img', 'video']);
        await conversationsPage.selectConversation(oldAccountPhone);
        await use();
    },
});

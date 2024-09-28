import { test } from '../fixtures/fixtures';
import { Mutex } from 'async-mutex';
import { NewMember, RegistrationData } from '../types/Types';
import * as fs from 'fs';
import * as path from 'path';
import EmailService from '../services/EmailService';
let workersCount = process.env.WORKERS;
if(workersCount === undefined) {
    workersCount = '5';
}
const mutex = new Mutex();
const filePath = path.resolve(__dirname, '../variables/defaultUsers.json');

test.describe.parallel(`Create ${workersCount} accounts`, () => {

    for (let i = 0; i < +workersCount; i++) {
        test(`@START Create Account with worker ${i + 1}`, async ({ authPage, apiRequest, emailService }) => {
            test.setTimeout(400000);
            if(i === 0) {
                await fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
            }
            const newUser = await apiRequest.createUserApi();
            await apiRequest.sendMessageRecipient(newUser.businessNumber, 'qa test');
            const oauthNew = await apiRequest.login(newUser.email, newUser.password);
            newUser.token = oauthNew.token.access_token;
            newUser.member = await apiRequest.inviteNewMember(newUser.token, true) as NewMember;
            await apiRequest.upgradePlan(newUser.token, 'pro-monthly-5000');
            for(let k=0; k<20; k++) {
                let users: RegistrationData[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                if(i === 0 || users[i-1]) {
                    await mutex.runExclusive(async () => {
                        users[i] = newUser;
                        await fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
                    });
                    return;
                }
                await authPage.waitFunction(1000);
            }
        });
    }
});
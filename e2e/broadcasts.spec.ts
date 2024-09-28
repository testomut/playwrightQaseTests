import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';
const env = process.env.ENV;
const oldAccountPhone = process.env[`OLD_ACCOUNT_PHONE_${env}`] as string;

test.describe('Broadcasts', () => {
    test(qase(170, '@QATEST-170 Create and Send Broadcast: Send Now as Owner'), async ({ start, custom, customFieldForTest, userBalance}) => {
        const { userDetails, conversationsPage, broadcastsPage, amountMessages, apiRequest } = start;
        const { newCustomFieldName, newCustomFieldValue } = customFieldForTest;
        let { balance } = userBalance;
        const newBroadcast = `new Broadcast`;
        console.log(amountMessages)
        await custom.wrappedTestStep(`1. Select "Broadcasts" from the menu`, async () => {
            await broadcastsPage.openBroadcastsPage();
        });

        await custom.wrappedTestStep(`2. Click the "Create Broadcast" button`, async () => {
            await broadcastsPage.createBroadcast();
        });

        await custom.wrappedTestStep(`3. Populate all fields`, async () => {
            await broadcastsPage.uploadAndVerifyFiles(['img']);
            await broadcastsPage.fillNewTextBroadcast({
                name: newBroadcast,
                sendFrom: `${userDetails.firstName} ${userDetails.lastName}`,
                textMessage: [
                    {message: `broadcast test`},
                    {mergeField: `Phone Number`},
                    {mergeField: newCustomFieldName},
                    {emoji: `thumbs up sign`},
                ],
                contacts: [oldAccountPhone]
            });
        });

        await custom.wrappedTestStep(`4. Click "Send Broadcast" button`, async () => {
            await broadcastsPage.sendBroadcast();

            await broadcastsPage.verifyConfirmSendBroadcast({
                total: '1',
                skipped: '0',
                credits: '2'
            });
        });

        await custom.wrappedTestStep(`5. Click "Send Now" button`, async () => {
            await broadcastsPage.sendNow();

            await broadcastsPage.verifyBroadcastList([
                {
                    name: newBroadcast,
                    status: 'Sending',
                    total: '0',
                    delivered: '0',
                    replies: '0'
                }
            ]);
        });

        await custom.wrappedTestStep(`6. Go to "Conversations" page and select the conversation with contact from broadcast`, async () => {
            await apiRequest.waitBroadcastStatus(userDetails.token, newBroadcast, 'Finished');
            await broadcastsPage.openConversationPage();
            await conversationsPage.clearInputMessage();

            await conversationsPage.waitNewMessage(amountMessages, 2);
            await conversationsPage.verifyMediaFileInConversation('img');
            await conversationsPage.verifyMediaFileInConversation(`broadcast test${oldAccountPhone} ${newCustomFieldValue} 👍`);
            await conversationsPage.userIcon();
            
            await conversationsPage.verifyUserBalance(balance - 2);
        });
    });
});

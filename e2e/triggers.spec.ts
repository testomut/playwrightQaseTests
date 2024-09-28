import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';
const env = process.env.ENV;
const oldAccountPhone = process.env[`OLD_ACCOUNT_PHONE_${env}`] as string;

test.describe('Trigger', () => {
    test(qase(12, '@QATEST-12 Create and Send Custom Trigger'), async ({ start, custom, tagForTest, customFieldForTest, userBalance, addFilesLiberty}) => {
        const { userDetails, conversationsPage, triggersPage } = start;
        const { newTag } = tagForTest;
        const { newCustomFieldName, newCustomFieldValue } = customFieldForTest;
        let { balance } = userBalance;
        const newTrigger = `new Trigger`;
        await custom.wrappedTestStep(`1. Select "Triggers" from the menu`, async () => {
            await triggersPage.openTriggersPage();
        });

        await custom.wrappedTestStep(`2. Click the "New Trigger" button`, async () => {
            await triggersPage.createTrigger();
        });

        await custom.wrappedTestStep(`3. Populate all fields`, async () => {
            await triggersPage.fillNewTrigger({
                name: newTrigger,
                sendAs: `${userDetails.firstName} ${userDetails.lastName}`,
                tags: [newTag],
                textMessage: [
                    {message: `tags test`},
                    {mergeField: `Phone Number`},
                    {mergeField: newCustomFieldName},
                    {emoji: `emoji-mart-emoji`},
                    {url: `https://app.qase.io`},
                    {file: `video`},
                    {file: `img`},
                ]
            });
        });

        await custom.wrappedTestStep(`4. Click "Create Trigger" button`, async () => {
            await triggersPage.createNewTrigger();

            await triggersPage.verifyTriggersList([
                {
                    name: newTrigger,
                    sentBy: `${userDetails.firstName} ${userDetails.lastName}`,
                    total: '0',
                    success: '0',
                    replies: '0',
                    clicks: '0',
                    conversions: '0',
                    revenue: '$0',
                    status: true
                }
            ]);
        });

        await custom.wrappedTestStep(`5. Copy Webhook URL -> Open a new tab -> Paste the URL -> Add phone number after 'phone='`, async () => {
            await triggersPage.openWebhookUrlWithNumber(newTrigger, oldAccountPhone);

            await triggersPage.openConversationPage();
            await conversationsPage.selectConversation(oldAccountPhone);
            await conversationsPage.clearInputMessage();
            await conversationsPage.verifyMediaFileInConversation('video');
            await conversationsPage.verifyMediaFileInConversation('img');
            await conversationsPage.verifyMediaFileInConversation(`tags test ${oldAccountPhone} ${newCustomFieldValue} 👍`);
            await conversationsPage.openTags();
            await conversationsPage.verifyConversationTags([newTag]);
            await conversationsPage.userIcon();
            
            await conversationsPage.verifyUserBalance(balance - 2);
        });
    });
});

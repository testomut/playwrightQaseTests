import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';
let { ExportEmail } = require('../constants/emailMessages');


test.describe('Analytics', () => {
    test(qase(2038, '@QATEST-2038 Export Messages'), async ({ start, custom }) => {
        const { userDetails, analyticsPage, emailService } = start;
        
        await custom.wrappedTestStep(`1. Click on Analytics icon on the side bar`, async () => {
            await analyticsPage.openAnalyticsPage();
        });

        await custom.wrappedTestStep(`2. Open Messages page on Analytics`, async () => {
            await analyticsPage.openMessagesPage();
        });

        await custom.wrappedTestStep(`3. Click on 3-dots -> Export data`, async () => {
            await analyticsPage.messagesExportData();
        });

        await custom.wrappedTestStep(`4. Select a Format from a dropdown -> CSV / TXT format`, async () => {
            await analyticsPage.exportData('csv', false);
        });

        await custom.wrappedTestStep(`5. Click the "Export" button`, async () => {
            await analyticsPage.exportData();

            await analyticsPage.verifyExportFIle()
        });

        await custom.wrappedTestStep(`6. Click the link to download file`, async () => {
            const fileInfo = await analyticsPage.downloadExportFIle();
            
            await analyticsPage.verifyDownloadFile(fileInfo, 'csv');
        });

        await custom.wrappedTestStep(`6. Verify email`, async () => {
            await emailService.checkPartEmailAndUrlsInside(userDetails.email, ExportEmail.subject, ExportEmail.body);
        });
    });
});

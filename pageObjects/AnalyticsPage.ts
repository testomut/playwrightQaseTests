import { Page, expect, BrowserContext } from '@playwright/test';
import SettingsPage from './SettingsPage';
import { ExportFileType, ExportFileData } from '../types/Types';
const environmentUrl = process.env.ENVIRONMENT_URL as string;
import * as path from 'path';
import { promises as fs } from 'fs';

class AnalyticsPage extends SettingsPage {
    page: Page;

    // Selectors
    private openAnalyticsMessagesPageSelector: string = '[href="/analytics/messages"]';
    private messagesDropdownDotsSelector: string = '.dropdown-dots';
    private exportDataSelector: string = '.dropdown-item';
    private exportButtonSelector: string = '[type="submit"]';
    private selectFormatDropdownSelector: string = '.modal-card-body [type="select-one"]';
    private modalSuccessSelector: string = '.modal-alert-success';
    private downloadLinkSelector: string = '.modal-window-for-export-link';
    
    //Text fields
    private newInboxTitleText: string = 'New Inbox';
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async openAnalyticsPage(): Promise<void> {
        await this.customClick(this.openAnalyticsPageSelector);
        await this.waitSpinnerLoader();
    }

    async openMessagesPage(): Promise<void> {
        await this.customClick(this.openAnalyticsMessagesPageSelector);
        await this.waitSpinnerLoader();
    }

    async messagesExportData(): Promise<void> {
        await this.customClick(this.messagesDropdownDotsSelector);
        await this.customClick(this.exportDataSelector);
    }

    async exportData(fileType: ExportFileType | undefined = undefined, submit = true): Promise<void> {
        if(fileType) {
            await this.customClick(this.selectFormatDropdownSelector);
            await this.customClick(`[data-value="${fileType}"]`);
        }
        if(submit) {
            await this.customClick(this.exportButtonSelector);
        }
    }

    async verifyExportFIle(): Promise<void> {
        await this.page.waitForSelector(this.modalSuccessSelector);
    }

    async downloadExportFIle(): Promise<ExportFileData> {
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.customClick(this.downloadLinkSelector)
        ]);
        const filePath = `./downloads/${download.suggestedFilename()}`;
        await download.saveAs(filePath);
    
        let fileContent;
        if (await fs.stat(filePath)) {
            fileContent = await fs.readFile(filePath, 'utf8');
        }
        return {
            path: filePath,
            name: download.suggestedFilename(),
            content: fileContent 
        };
    }

    async verifyDownloadFile(fileInfo: ExportFileData, fileType:ExportFileType): Promise<void> {
        const fileStat = await fs.stat(fileInfo.path);
        expect(fileStat.isFile()).toBe(true);
        expect(fileStat.size).toBeGreaterThan(0);
        expect(fileInfo.name.endsWith(`.${fileType}`)).toBe(true);
        const fileContent = await fs.readFile(fileInfo.path, 'utf8');
        expect(fileContent.length).toBeGreaterThan(0);

        const lines = fileContent.split('\n');
        expect(lines.length).toBeGreaterThan(1);
        const expectedHeaders = [
            'Date',
            '"Total Inbound"',
            '"Total Outbound"',
            '"Outbound - Delivered"',
            '"Outbound - Undelivered"',
            '"Carrier Violations"',
            'Opted-out'
        ];
        const actualHeaders = lines[0].split(',');
    
        expect(actualHeaders).toEqual(expectedHeaders);
    
        if (lines.length > 1) {
            const dataLine = lines[1].split(',');
            expect(dataLine.length).toBe(expectedHeaders.length);
    
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            expect(dataLine[0]).toMatch(datePattern);
    
            for (let i = 1; i < dataLine.length; i++) {
                expect(parseInt(dataLine[i], 10)).not.toBeNaN();
            }
        }
    }
}

export default AnalyticsPage;

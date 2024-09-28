import { Page, expect, BrowserContext } from '@playwright/test';
import SettingsPage from './SettingsPage';
import { NewBroadcast, ConfirmSendBroadcast, BroadcastsTableList } from '../types/Types';
const environmentUrl = process.env.ENVIRONMENT_URL as string;
import * as path from 'path';
const videoPath = path.resolve(__dirname, '../files/test_video.mp4');
const audioPath = path.resolve(__dirname, '../files/test_audio.mp3');
const docxPath = path.resolve(__dirname, '../files/test_docx_file.docx');
const imagePath = path.resolve(__dirname, '../files/test_image.jpg');


class BroadcastsPage extends SettingsPage {
    page: Page;

    // Selectors
    
    private createBroadcastButtonSelector: string = '[aria-label="ButtonNewBroadcast"]';
    private sendBroadcastButtonSelector: string = '[aria-label="ButtonReviewSend_Text"]';
    private broadcastNameInputSelector: string = '[placeholder="Broadcast name"]';
    private sendAsDropdownSelector: string = '[aria-label="TypographySelectInbox"]';
    private sendAsInboxListSelector: string = '[aria-label="DropdownDropdownItem"]';
    private phoneInboxSelector: string = '[aria-label="DropdownList_Item"]';
    private contactsDropdownSelector: string = '[aria-label="TypographySelectContacts"]';
    private searchContactsDropdownSelector: string = '[aria-label="DropdownUndefined"]';
    private searchContactsInputSelector: string = '[placeholder="Search tag, segment or contact"]';
    private successSearchResultListSelector: string = '[aria-label="SearchContactItem"]';
    private selectContactButtonSelector: string = '[aria-label="ButtonSelectContact_Text"]';
    private openEmojiSelector: string = '[aria-label="IconButtonEmojiPicker"]';
    private openAttacheFilesSelector: string = '.messages-attach-files';
    private mediaLibraryImageSelector: string = '.library-image';
    private mediaLibraryVideoSelector: string = '.media-library-item.video';
    private addButtonMediaLibrarySelector: string = '.media-library-buttons .button.is-primary';
    private openMergeFieldsSelector: string = '[aria-label="DropdownMergeFieldsIconAction"]';
    private mergeFieldsListSelector: string = '[aria-label="Buttonundefined"]';
    private mergeFieldsSaveSelector: string = '.merge-fields-save-fallback-btn';
    private messageInputSelector: string = '[placeholder="Write your message..."]';
    private createLinkSelector: string = '[data-icon="link"]';
    private confirmSendBroadcastDataList: string = '[aria-label="TypographyEstimatedCredits"]';
    private confirmSendBroadcastValueSelector: string = '.ContactConfirm__value';

    private sendNowButtonSelector: string = '[aria-label="ButtonSend"]';
    private broadcastTableTotalSelector: string = '.MuiTableCell-root';
    private broadcastTableDeliveredSelector: string = '.MuiTableCell-root';
    private broadcastTableRepliesSelector: string = '.MuiTableCell-root';
    private broadcastTableClicksSelector: string = '.MuiTableCell-root';
    private broadcastTableConversationsSelector: string = '.MuiTableCell-root';
    private broadcastTableStatusSelector: string = '.MuiTableCell-root';
    private broadcastsTableList: string = '.MuiTableBody-root';
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async createBroadcast(): Promise<void> {
        await this.customClick(this.createBroadcastButtonSelector);
        await this.waitSpinnerLoader();
    }

    async fillNewTextBroadcast(broadcastData: NewBroadcast): Promise<void> {
        await this.customFill(this.broadcastNameInputSelector, broadcastData.name);
        for(let i = 0; broadcastData.textMessage.length>i; i++) {
            if(broadcastData.textMessage[i].emoji) {
                await this.customClick(this.openEmojiSelector);
                await this.customClick(`[aria-label="${broadcastData.textMessage[i].emoji}"]`);
            }
            if(broadcastData.textMessage[i].mergeField) {
                await this.customClick(this.openMergeFieldsSelector);
                const mergeField = await this.page.locator(this.mergeFieldsListSelector).getByText(broadcastData.textMessage[i].mergeField as string);
                await this.customClick(mergeField);
            }
            if(broadcastData.textMessage[i].message) {
                const message = broadcastData.textMessage[i].message as string;
                await this.customFill(this.messageInputSelector, message, {clear: false});
            }
        }

        await this.customClick(this.sendAsDropdownSelector);
        const inbox = await this.page.locator(this.sendAsInboxListSelector).getByText(broadcastData.sendFrom);
        await this.customClick(inbox);
        await this.customClick(this.phoneInboxSelector);
        for(let i = 0; broadcastData.contacts.length>i; i++) {
            await this.customClick(this.contactsDropdownSelector);
            await this.customClick(this.searchContactsDropdownSelector);
            await this.customFill(this.searchContactsInputSelector, broadcastData.contacts[i]);
            await this.waitSpinnerLoader();
            await this.customClick(this.successSearchResultListSelector);
            await this.customClick(this.selectContactButtonSelector);
        }
        
    }

    async sendBroadcast(): Promise<void> {
        await this.customClick(this.sendBroadcastButtonSelector);
        await this.page.waitForSelector(this.confirmSendBroadcastDataList);
    }

    async sendNow(): Promise<void> {
        await this.customClick(this.sendNowButtonSelector);
        await this.waitSpinnerLoader();
    }

    async verifyConfirmSendBroadcast(confirmInfo: ConfirmSendBroadcast): Promise<void> {
        const totalContacts = await this.page.locator(this.confirmSendBroadcastDataList).nth(1).textContent();
        const skippedContacts = await this.page.locator(this.confirmSendBroadcastDataList).nth(2).textContent();
        const estimatedCredits = await this.page.locator(this.confirmSendBroadcastDataList).nth(0).textContent();

        expect(totalContacts?.trim()).toBe(confirmInfo.total);
        expect(skippedContacts?.trim()).toBe(confirmInfo.skipped);
        expect(estimatedCredits?.trim()).toBe(confirmInfo.credits);
    }

    async verifyBroadcastList(broadcastList: BroadcastsTableList): Promise<void> {
        const broadcasts = await this.page.locator(this.broadcastsTableList);
        for(let i =0; broadcastList.length> i; i++) {
            const broadcast = await broadcasts.filter({hasText: broadcastList[i].name});
            console.log(await broadcast.textContent())
            const broadcastStatus = await broadcast.locator(this.broadcastTableStatusSelector).nth(3).textContent();
            const broadcastTotal = await broadcast.locator(this.broadcastTableTotalSelector).nth(5).textContent();
            const broadcastDelivered = await broadcast.locator(this.broadcastTableDeliveredSelector).nth(6).textContent();
            const broadcastReplies = await broadcast.locator(this.broadcastTableRepliesSelector).nth(7).textContent();
            const broadcastClicks = await broadcast.locator(this.broadcastTableClicksSelector).nth(8).textContent();
            const broadcastConversions = await broadcast.locator(this.broadcastTableConversationsSelector).nth(9).textContent();
            
            expect(broadcastList[i].status).toBe(broadcastStatus?.trim());
            expect(broadcastList[i].total).toBe(broadcastTotal?.trim());
            expect(broadcastList[i].delivered).toBe(broadcastDelivered?.trim());
            expect(broadcastList[i].replies).toBe(broadcastReplies?.trim());
            if(broadcastList[i].clicks) {
                expect(broadcastList[i].clicks).toBe(broadcastClicks?.trim());
            }
            if(broadcastList[i].conversions) {
                expect(broadcastList[i].conversions).toBe(broadcastConversions?.trim());
            }
        }
    }
}

export default BroadcastsPage;

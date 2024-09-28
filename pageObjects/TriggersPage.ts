import { Page, expect, BrowserContext } from '@playwright/test';
import SettingsPage from './SettingsPage';
import { NewTrigger, TriggerMessageTableList } from '../types/Types';

class TriggersPage extends SettingsPage {
    page: Page;

    // Selectors
    private createTriggerButtonSelector: string = '[href="/triggers/create"]';
    private createNewTriggerButtonSelector: string = '.button--submit';
    private triggerNameInputSelector: string = '[placeholder="Name"]';
    private integrationDropdownSelector: string = '#dropdown-integration_id .selectize-input';
    private integrationOptionListSelector: string = '[data-id="dropdown-integration_id"] .option';
    private sendAsDropdownSelector: string = '[placeholder="Send As"]';
    private sendAsInboxListSelector: string = '.inbox-option-info';
    private tagsInputSelector: string = '[placeholder="Type to select tags..."]';
    private tagsListSelector: string = '.selectize-contact-info';
    private openEmojiSelector: string = '.has-emoji';
    private openAttacheFilesSelector: string = '.messages-attach-files';
    private mediaLibraryImageSelector: string = '.library-image';
    private mediaLibraryVideoSelector: string = '.media-library-item.video';
    private addButtonMediaLibrarySelector: string = '.media-library-buttons .button.is-primary';
    private openMergeFieldsSelector: string = '.merge-fields';
    private mergeFieldsListSelector: string = '.dropdown-item--mergeFields';
    private mergeFieldsSaveSelector: string = '.merge-fields-save-fallback-btn';
    private messageInputSelector: string = '.textarea-with-attaches-wrapper textarea';
    private createLinkSelector: string = '[data-icon="link"]';
    private triggersTableList: string = 'tr[draggable="false"]';
    private triggerTableNameSelector: string = '[data-label="Name"] .triggersTableName__link';
    private triggerTableSentBySelector: string = '[data-label="Sent By"] .numberable-name';
    private triggerTableTotalSelector: string = '[data-label="Total"]';
    private triggerTableSuccessSelector: string = '[data-label="Success"]';
    private triggerTableRepliesSelector: string = '[data-label="Replies"]';
    private triggerTableClicksSelector: string = '[data-label="Clicks"]';
    private triggerTableConversationsSelector: string = '[data-label="Conversions"]';
    private triggerTableRevenueSelector: string = '[data-label="Revenue"]';
    private triggerTableStatusSelector: string = '[data-label="Status"]';
    private triggerTableStatusIsSwitchedSelector: string = '.vue-js-switch.toggled';
    private webhookButtonSelector: string = '.webhook-btn';
    private addedTagsListSelector: string = '.selectize-input .tag';
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async createTrigger(): Promise<void> {
        await this.customClick(this.createTriggerButtonSelector, {nth:0});
    }

    async createNewTrigger(): Promise<void> {
        await this.customClick(this.createNewTriggerButtonSelector);
        await this.waitModalAlertSuccess();
    }

    async openWebhookUrlWithNumber(triggerName: string, phone: string): Promise<void> {
        const triggers = await this.page.locator(this.triggersTableList);
        const trigger = await triggers.filter({hasText: triggerName});
        const triggerButton = await trigger.locator(this.webhookButtonSelector);
        const url = (await triggerButton.getAttribute('data-clipboard-text'))?.replace('phone=',`phone=${phone}`) as string;
        const response = await fetch(url);
        expect(response.status).toBe(200);
    }

    async verifyTriggersList(triggersList: TriggerMessageTableList): Promise<void> {
        const triggers = await this.page.locator(this.triggersTableList);
        for(let i =0; triggersList.length> i; i++) {
            const trigger = await triggers.filter({hasText: triggersList[i].name}); ///locator(this.triggerTableNameSelector).getByText(triggersList[i].name);
            console.log(await trigger.textContent())
            const triggerSentBy = await trigger.locator(this.triggerTableSentBySelector).textContent();
            const triggerTotal = await trigger.locator(this.triggerTableTotalSelector).textContent();
            const triggerSuccess = await trigger.locator(this.triggerTableSuccessSelector).textContent();
            const triggerReplies = await trigger.locator(this.triggerTableRepliesSelector).textContent();
            const triggerClicks = await trigger.locator(this.triggerTableClicksSelector).textContent();
            const triggerConversions = await trigger.locator(this.triggerTableConversationsSelector).textContent();
            const triggerRevenue = await trigger.locator(this.triggerTableRevenueSelector).textContent();
            const triggerStatus = await trigger.locator(this.triggerTableStatusSelector).locator(this.triggerTableStatusIsSwitchedSelector).count() === 1;

            expect(triggersList[i].sentBy).toBe(triggerSentBy?.trim());
            expect(triggersList[i].total).toBe(triggerTotal?.trim());
            expect(triggersList[i].success).toBe(triggerSuccess?.trim());
            expect(triggersList[i].replies).toBe(triggerReplies?.trim());
            expect(triggersList[i].clicks).toBe(triggerClicks?.trim());
            expect(triggersList[i].conversions).toBe(triggerConversions?.trim());
            expect(triggersList[i].revenue).toBe(triggerRevenue?.trim());
            expect(triggersList[i].status).toBe(triggerStatus);
        }
    }

    async fillNewTrigger(triggerData: NewTrigger): Promise<void> {
        
        await this.customFill(this.triggerNameInputSelector, triggerData.name);
        if(triggerData.Integration) {
            await this.customClick(this.integrationDropdownSelector);
            const integrationOption = await this.page.locator(this.integrationOptionListSelector).getByText(triggerData.Integration);
            await this.customClick(integrationOption);
        }
        await this.customClick(this.sendAsDropdownSelector);
        const inbox = await this.page.locator(this.sendAsInboxListSelector).getByText(triggerData.sendAs);
        await this.customClick(inbox);
        if(triggerData.tags) {
            for(let i=0;triggerData.tags.length>i; i++) {
                await this.page.locator(this.tagsInputSelector).click();
                const tag = await this.page.locator(this.tagsListSelector).getByText(triggerData.tags[i]);
                await this.customClick(tag);
                await this.customClick(this.messageInputSelector);
                await this.page.waitForSelector(this.addedTagsListSelector);
            }
        }
        if(triggerData.textMessage) {
            for(let i = 0; triggerData.textMessage.length>i; i++) {
                if(triggerData.textMessage[i].emoji) {
                    await this.customClick(this.openEmojiSelector);
                    await this.customClick(`[class="${triggerData.textMessage[i].emoji}"]`);
                }
                if(triggerData.textMessage[i].file) {
                    await this.customClick(this.openAttacheFilesSelector);
                    if(triggerData.textMessage[i].file === 'img') {
                        await this.customClick(this.mediaLibraryImageSelector);
                    } else {
                        await this.customClick(this.mediaLibraryVideoSelector);
                    }
                    await this.customClick(this.addButtonMediaLibrarySelector);
                }
                if(triggerData.textMessage[i].mergeField) {
                    await this.customClick(this.openMergeFieldsSelector);
                    const mergeField = await this.page.locator(this.mergeFieldsListSelector).getByText(triggerData.textMessage[i].mergeField as string);
                    await this.customClick(mergeField);
                    await this.customClick(this.mergeFieldsSaveSelector);
                }
                if(triggerData.textMessage[i].url) {
                    const url = triggerData.textMessage[i].url as string;
                    await this.customFill(this.messageInputSelector, url, {valueClear: false});
                    await this.customClick(this.createLinkSelector);
                }
                if(triggerData.textMessage[i].message) {
                    const message = triggerData.textMessage[i].message as string;
                    await this.customFill(this.messageInputSelector, message, {valueClear: false});
                }
            }
        }
    }
}

export default TriggersPage;

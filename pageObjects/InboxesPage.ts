import { Page, expect, BrowserContext } from '@playwright/test';
import SettingsPage from './SettingsPage';
import { InboxesList, NewInbox } from '../types/Types';

class InboxesPage extends SettingsPage {
    page: Page;

    // Selectors
    private allInboxesListSelector: string = '.inbox-table .flex-table-row';
    private allInboxesNameSelector: string = '.inboxes-name strong';
    private allInboxesOwnerSelector: string = '.inboxes-owner';
    private allInboxesMembersSelector: string = '.inboxes-members';
    private allInboxesNumberSelector: string = '.inboxes-number';
    private newInboxButtonSelector: string = '.button.is-success';
    private warningMessageSelector: string = '.is-warning .message-body';
    private newInboxTitleSelector: string = '.modal-card-title-wrap';
    private discountPriceSelector: string = '#prorated-amount-price';
    private discountPriceOpenSelector: string = `.v-tooltip-open`;
    private newInboxNameInputSelector: string = '[placeholder="Inbox Name"]';
    private chooseButtonsListSelector: string = '.toggleButtons__item';
    private phoneListSelector: string = '.radio-label';
    private createInboxButtonSelector: string = '.button--submit';
    
    //Text fields
    private newInboxTitleText: string = 'New Inbox';
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async verifyAllInboxes(inboxes: InboxesList): Promise<void> {
        const curInboxesCount = await this.page.locator(this.allInboxesListSelector).count();
        expect(curInboxesCount).toBe(inboxes.length);
        for(let i=0; i<curInboxesCount; i++) {
            const inboxItem = await this.page.locator(this.allInboxesListSelector).nth(i);
            const inboxName = await inboxItem.locator(this.allInboxesNameSelector).textContent();
            const inboxOwner = await inboxItem.locator(this.allInboxesOwnerSelector).textContent();
            const inboxNumber = await inboxItem.locator(this.allInboxesNumberSelector).textContent();
            expect(inboxName?.trim()).toBe(inboxes[i].name);
            expect(inboxOwner?.trim()).toBe(inboxes[i].owner);
            expect(inboxNumber?.trim()).toBe(inboxes[i].phone?.trim());
            if(inboxes[i].members) {
                const inboxMember = await inboxItem.locator(this.allInboxesMembersSelector).textContent();
                expect(inboxMember).toBe(inboxes[i].members);
            }
            
        }
    }

    async newInboxOpenVerify(): Promise<void> {
        await this.customClick(this.newInboxButtonSelector);
        await this.page.waitForSelector(this.warningMessageSelector);
        const newInboxTitle = await this.page.locator(this.newInboxTitleSelector).textContent();
        expect(newInboxTitle?.trim()).toBe(this.newInboxTitleText);
    }

    async priceTooltipeOpenVerify(): Promise<void> {
        await this.customClick(this.discountPriceSelector);
        await this.page.waitForSelector(this.discountPriceOpenSelector);
    }

    async createInbox(): Promise<void> {
        await this.customClick(this.createInboxButtonSelector);
        await this.waitSpinnerLoader();
        await this.waitModalAlertSuccess();
    }

    async newInboxFill(inboxData: NewInbox): Promise<string | undefined> {
        await this.customFill(this.newInboxNameInputSelector, inboxData.name);
        const numberTypeButton = await this.page.locator(this.chooseButtonsListSelector).getByText(inboxData.type);
        await this.customClick(numberTypeButton);
        if(inboxData.type === 'Toll-Free Number') {
            await this.customClick(this.phoneListSelector, {nth:0});
            return await this.page.locator(this.phoneListSelector).nth(0).textContent() as string;
        } 
    }
}

export default InboxesPage;

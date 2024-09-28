import { Page, BrowserContext } from '@playwright/test';
import BasePage from './BasePage';

class SettingsPage extends BasePage {
    page: Page;

    // Selectors
    private membersSelector: string = `[data-icon="users"]`;
    private inboxesSelector: string = `[href="/settings/organization/inboxes"]`;
    private billingSelector: string = `[href="/settings/billing/overview"]`;
    private complianceSelector: string = `[href="/settings/organization/compliance"]`;
    private activeTab: string = '.is-active';
    private modalAlertSuccess: string = '.modal-alert-success';
    private complianceRegistrationPopUpCancelButtonSelector: string = `.button--cancel`;
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async openSettingsPage(): Promise<void> {
        await this.customClick(this.userIconSelector);
        await this.customClick(this.settingsSelector);
        await this.clickIfElementPresent(this.complianceRegistrationPopUpCancelButtonSelector);
    }
   
    async openMembersPage(): Promise<void> {
        await this.openSettingsPage();
        await this.customClick(this.membersSelector);
    }

    async openInboxesPage(): Promise<void> {
        await this.openSettingsPage();
        await this.customClick(this.inboxesSelector);
    }

    async openBillingPage(): Promise<void> {
        await this.openSettingsPage();
        await this.customClick(this.billingSelector);
    }

    async waitModalAlertSuccess(): Promise<void> {
        const modal = await this.page.locator(this.modalAlertSuccess);
        await modal.waitFor();
        await modal.waitFor({ state: 'detached' });
    }

    async verifyComplianceActive(): Promise<void> {
        const modal = await this.page.locator(`${this.complianceSelector}${this.activeTab}`);
        await modal.waitFor();
    }
}

export default SettingsPage;

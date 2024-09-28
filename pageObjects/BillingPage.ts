import { Page, expect, BrowserContext } from '@playwright/test';
import SettingsPage from './SettingsPage';
import { PlanInfo, MessagesAmount, CreditsAmount, IfBalanceFallsBelow, PaymentMethodList, ExportFileData } from '../types/Types';
import { promises as fs } from 'fs';
import pdfParse from 'pdf-parse';

class BillingPage extends SettingsPage {
    page: Page;

    // Selectors
    private billingInformationSelector: string = '.usage-info';
    private paymentHistoryIdListSelector: string = '.payment-history-id';
    private upgradeButtonSelector: string = '.toolbox-item.button.is-success';
    private upgradePlanItemListSelector: string = '.upgradePlanItem';
    private upgradePlanItemPriceSelector: string = '.upgradePlanItem__price';
    private upgradePlanItemCountMessageSelector: string = '.upgradePlanItem__countMessage';
    private toggleButtonsListSelector: string = '.toggleButtons .button';
    private upgradeButtonsListSelector: string = '.upgradePlanItem__button';
    private submitButtonSelector: string = '.button--submit';
    private upgradePlaneSliderList: string = '[style="width: 20%;"]';
    private upgradePlaneCheckboxSelector: string = '.info .checkbox';
    private orderPlanNameSelector: string = '.upgradeTableTotal__item small';
    private orderPlanAmountSelector: string = '.upgradeTableTotal__item .has-text-right';
    private orderTotalAmountSelector: string = '.upgrade-plan__amount .has-text-right';
    private upgradeDropdownSelector: string = '.billing-button .dropdown';
    private upgradeTypeListSelector: string = '.is-active .dropdown-item';
    private modalCardTitleSelector: string = '.modal-card-title';
    private dropdownAmountPurchaseSelector: string = '#dropdown-amount .selectize-input';
    private seatsAmountInputSelector: string = '.modalManageSeats__input input';
    private numbersAmountInputSelector: string = '.modalManageNumbers__input input';
    private statsItemsListSelector: string = '.usage-stats .usage-stats-item span';
    private autoRechargeSettingsButtonSelector: string = '.auto-recharge-toggle .button';
    private autoRechargeOnSelector: string = '.vue-js-switch.toggled';
    private autoRechargeButtonSelector: string = '.vue-js-switch';
    private ifBalanceFallsBelowDropdownSelector: string = '#dropdown-threshold .selectize-input';
    private ifBalanceFallsBelowListDropdownSelector: string = '[data-id="dropdown-threshold"]';
    private rechargeMyAccountDropdownSelector: string = '#dropdown-amount .selectize-input';
    private rechargeMyAccountListDropdownSelector: string = '[data-id="dropdown-amount"]';
    private autoRechargeEnablesSelector: string = '.auto-recharge-toggle__enabled';
    private autoRechargeDisabledSelector: string = '.auto-recharge-toggle__disabled';
    private paymentMethodListSelector: string = '.form:has-text("Payment Methods") .flex-table-row';
    private paymentMethodCardNumberSelector: string = '.payment-method-info';
    private paymentMethodDateSelector: string = '.payment-method-expiration';
    private paymentMethodPrimarySelector: string = '.is-primary';
    private downloadLinkSelector: string = '[data-icon="download"]';

    // Text fields
    private modalTitleAddCreditText: string = 'Add Credits';
    private modalTitleManageSeatsText: string = 'Manage Seats';
    private modalTitleManageNumbersText: string = 'Manage Numbers';
    private modalTitleConfigureAutoRechargeText: string = 'Configure Auto Recharge';

    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async verifyPlan(planInfo: PlanInfo): Promise<void> {
        const billingInfo = await this.page.locator(this.billingInformationSelector).textContent();
        expect(billingInfo).toContain(planInfo.organization);
        expect(billingInfo).toContain(planInfo.plan);
        if(planInfo.downgrade) {
            expect(billingInfo).toContain(planInfo.downgrade);
        }
    }

    async getPaymentHistoryAmount(): Promise<number> {
        return await this.page.locator(this.paymentHistoryIdListSelector).count();
    }

    async verifyAutoRecharge(isRecharge: boolean): Promise<void> {
        if(isRecharge) {
            await this.page.waitForSelector(this.autoRechargeEnablesSelector);
        } else {
            await this.page.waitForSelector(this.autoRechargeDisabledSelector);
        }      
    }

    async paymentHistoryAmount(amount: number): Promise<void> {
        const paymentHistoryAmount = await this.page.locator(this.paymentHistoryIdListSelector).count();
        expect(paymentHistoryAmount).toBe(amount);
    }

    async upgrade(): Promise<void> {
        await this.customClick(this.upgradeButtonSelector);
    }

    async verifyUpgradePlan(priceInfo: string, creditsInfo: string): Promise<void> {
        const proPlan = await this.page.locator(this.upgradePlanItemListSelector).nth(0);
        const price = await proPlan.locator(this.upgradePlanItemPriceSelector).textContent();
        const countMessage = await proPlan.locator(this.upgradePlanItemCountMessageSelector).textContent();
        expect(price).toBe(priceInfo);
        expect(countMessage?.trim()).toBe(creditsInfo);
    }

    async annuallySwitch(): Promise<void> {
        await this.customClick(this.toggleButtonsListSelector, {nth:1});
    } 

    async upgradePlan(): Promise<void> {
        await this.customClick(this.upgradeButtonsListSelector, {nth:0});
        await this.customClick(this.submitButtonSelector);
        await this.waitSpinnerLoader();
        await this.waitModalAlertSuccess();
    } 

    async selectPlan(): Promise<void> {
        await this.customClick(this.submitButtonSelector);
        await this.customClick(this.upgradePlaneCheckboxSelector);
        await this.customClick(this.submitButtonSelector);
    } 

    async upgradeAndSubmitMyApplication(): Promise<void> {
        await this.customClick(this.submitButtonSelector);
        await this.waitSpinnerLoader();
    }

    async downloadLastReceipt(): Promise<ExportFileData> {
        const [download] = await Promise.all([
            this.page.waitForEvent('download'),
            this.customClick(this.downloadLinkSelector, {nth: 0})
        ]);
        const filePath = `./downloads/${download.suggestedFilename()}`;
        await download.saveAs(filePath);
    
        let fileContent;
        if (await fs.stat(filePath)) {
            const fileExtension = filePath.split('.').pop()?.toLowerCase();
    
            if (fileExtension === 'pdf') {
                const dataBuffer = await fs.readFile(filePath);
                const pdfData = await pdfParse(dataBuffer);
                fileContent = pdfData.text;
            } else {
                fileContent = await fs.readFile(filePath, 'utf8');
            }
        }
    
        return {
            path: filePath,
            name: download.suggestedFilename(),
            content: fileContent
        };
    }

    async verifyDownloadFile(content: string, verifyList:string[]): Promise<void> {
        for(let i =0; verifyList.length>i; i++) {
            expect(content .replace(/\s+/g, ' ').trim()).toContain(verifyList[i]);
        }
    }

    async verifyOrder(planName: string, planAmount: string, totalAmount: string, discount?: string, discountAmount?: string): Promise<void> {
        const orderPlanName = await this.page.locator(this.orderPlanNameSelector).nth(0).textContent();
        const orderPlanAmount = await this.page.locator(this.orderPlanAmountSelector).nth(0).textContent() as string;
        const orderTotalAmount = await this.page.locator(this.orderTotalAmountSelector).textContent();
        if(discount) {
            const orderDiscount = await this.page.locator(this.orderPlanNameSelector).nth(1).textContent();
            const orderDiscountAmount = await this.page.locator(this.orderPlanAmountSelector).nth(1).textContent();
            expect(orderDiscount?.trim()).toBe(discount);
            expect(orderDiscountAmount?.trim()).toBe(discountAmount);
        }

        expect(orderPlanName?.trim()).toBe(planName);
        expect(orderPlanAmount?.trim()).toBe(planAmount);
        expect(orderTotalAmount?.trim()).toBe(totalAmount);
    } 

    async openVerifyAddCredits(): Promise<void> {
        await this.customClick(this.upgradeDropdownSelector);
        const byCredits = await this.page.locator(this.upgradeTypeListSelector).getByText('Buy Credits');
        await this.customClick(byCredits);
        const modalTitle = await this.page.locator(this.modalCardTitleSelector).textContent();

        expect(modalTitle?.trim()).toBe(this.modalTitleAddCreditText);
    }

    async openVerifyManageSeats(): Promise<void> {
        await this.customClick(this.upgradeDropdownSelector);
        const byCredits = await this.page.locator(this.upgradeTypeListSelector).getByText('Manage Seats');
        await this.customClick(byCredits);
        const modalTitle = await this.page.locator(this.modalCardTitleSelector).textContent();

        expect(modalTitle?.trim()).toBe(this.modalTitleManageSeatsText);
    }

    async openVerifyManageNumbers(): Promise<void> {
        await this.customClick(this.upgradeDropdownSelector);
        const byCredits = await this.page.locator(this.upgradeTypeListSelector).getByText('Manage Numbers');
        await this.customClick(byCredits);
        const modalTitle = await this.page.locator(this.modalCardTitleSelector).textContent();

        expect(modalTitle?.trim()).toBe(this.modalTitleManageNumbersText);
    }

    async openVerifyConfigureAutoRecharge(): Promise<void> {
        await this.customClick(this.autoRechargeSettingsButtonSelector);
        const modalTitle = await this.page.locator(this.modalCardTitleSelector).textContent();

        expect(modalTitle?.trim()).toBe(this.modalTitleConfigureAutoRechargeText);
    }

    async autoRecharge(recharge: boolean): Promise<void> {
        const ifRechargeActive = await this.page.locator(this.autoRechargeOnSelector).count() === 1;
        if(recharge) {
            if(!ifRechargeActive) {
                await this.customClick(this.autoRechargeButtonSelector);
            }
        } else {
            if(ifRechargeActive) {
                await this.customClick(this.autoRechargeButtonSelector);
            }
        }
    }

    async ifBalanceFallsBelow(amount: IfBalanceFallsBelow): Promise<void> {
        await this.customClick(this.ifBalanceFallsBelowDropdownSelector);
        await this.customClick(`${this.ifBalanceFallsBelowListDropdownSelector} [data-value="${amount}"]`);
    }

    async verifyPaymentMethodsList(paymentList: PaymentMethodList): Promise<void> {
        const getPaymentList = await this.page.locator(this.paymentMethodListSelector);
        const getPaymentListCount = await this.page.locator(this.paymentMethodListSelector).count();
        expect(getPaymentListCount).toBe(paymentList.length);
        for(let i=0;paymentList.length> i; i++) {
            const cardNumber = await getPaymentList.nth(i).locator(this.paymentMethodCardNumberSelector).textContent();
            const date = await getPaymentList.nth(i).locator(this.paymentMethodDateSelector).textContent();
            const isPrimary = await getPaymentList.nth(i).locator(this.paymentMethodPrimarySelector).count() === 1;

            expect(cardNumber?.trim()).toBe(paymentList[i].cardNumber);
            expect(date?.trim()).toBe(paymentList[i].date);
            expect(isPrimary).toBe(paymentList[i].primary);
        }
    }
    
    async verifyIfBalanceFallsBelow(criteria: IfBalanceFallsBelow): Promise<void> {
        const balanceCriteria = await this.page.locator(this.ifBalanceFallsBelowDropdownSelector).textContent();
        expect(balanceCriteria?.trim()).toBe(`${criteria} credits`);
    }

    async rechargeMyAccount(amount: CreditsAmount): Promise<void> {
        await this.customClick(this.rechargeMyAccountDropdownSelector);
        await this.customClick(`${this.rechargeMyAccountListDropdownSelector} [data-value="${amount}"]`);
    }

    async configureAutoRechargeSave(): Promise<void> {
        await this.customClick(this.submitButtonSelector);
        await this.waitModalAlertSuccess();
    }

    async addCredits(amount: CreditsAmount): Promise<void> {
        await this.customClick(this.dropdownAmountPurchaseSelector);
        await this.customClick(`[data-value="${amount}"]`);
        await this.customClick(this.submitButtonSelector);
        await this.waitSpinnerLoader();
        await this.waitModalAlertSuccess();
    }

    async addSeats(amount: string): Promise<void> { 
        await this.customFill(this.seatsAmountInputSelector, amount);
        await this.customClick(this.submitButtonSelector);
        await this.waitSpinnerLoader();
        await this.waitModalAlertSuccess();
    }

    async addNumbers(amount: string): Promise<void> { 
        await this.customFill(this.numbersAmountInputSelector, amount);
        await this.customClick(this.submitButtonSelector);
        await this.waitSpinnerLoader();
        await this.waitModalAlertSuccess();
    }

    async getSeats(): Promise<string[] | undefined> { 
        const seatsContent = await this.page.locator(this.statsItemsListSelector).nth(1).textContent();
        return seatsContent?.split(' of ');
    }

    async getNumbers(): Promise<string[] | undefined> { 
        const numbersContent = await this.page.locator(this.statsItemsListSelector).nth(0).textContent();
        return numbersContent?.split(' of ');
    }

    async verifySeats(seats: string[], increase: string): Promise<void> { 
        const seatsContent = await this.getSeats() as string[];
        expect(seats.length).toBe(2);
        expect(+seatsContent[0]).toBe(+seats[0] + +increase);
        expect(+seatsContent[1]).toBe(+seats[1] + +increase);
    }

    async verifyNumbers(numbers: string[], increase: string): Promise<void> { 
        const numbersContent = await this.getNumbers() as string[];
        expect(numbers.length).toBe(2);
        expect(+numbersContent[0]).toBe(+numbers[0] + +increase);
        expect(+numbersContent[1]).toBe(+numbers[1] + +increase);
    }

    async changeMessageAmount(amount: MessagesAmount): Promise<void> {
        const box500and1k = await this.page.locator(this.upgradePlaneSliderList).nth(0).boundingBox();
        const box2500 = await this.page.locator(this.upgradePlaneSliderList).nth(1).boundingBox();
        const box5k = await this.page.locator(this.upgradePlaneSliderList).nth(2).boundingBox();
        const box7500 = await this.page.locator(this.upgradePlaneSliderList).nth(3).boundingBox();
        const box10k = await this.page.locator(this.upgradePlaneSliderList).nth(4).boundingBox();
        let box500Coordinates;
        let box1kCoordinates;
        let box2500Coordinates;
        let box5kCoordinates;
        let box7500Coordinates;
        let box10kCoordinates;
        if(box500and1k) {
            box500Coordinates = {x: box500and1k.x, y: box500and1k.y+box500and1k.height/2};
            box1kCoordinates = {x: box500and1k.x+box500and1k.width, y: box500and1k.y+box500and1k.height/2};
        }
        if(box2500) {
            box2500Coordinates = {x: box2500.x+box2500.width, y: box2500.y+box2500.height/2};
        }
        if(box5k) {
            box5kCoordinates = {x: box5k.x+box5k.width, y: box5k.y+box5k.height/2};
        }
        if(box7500) {
            box7500Coordinates = {x: box7500.x+box7500.width, y: box7500.y+box7500.height/2};
        }
        if(box10k) {
            box10kCoordinates = {x: box10k.x+box10k.width, y: box10k.y+box10k.height/2};
        }
        const coordinates = {
            '500': box500Coordinates,
            '1k': box1kCoordinates,
            '2.5k': box2500Coordinates,
            '5k': box5kCoordinates,
            '7.5k': box7500Coordinates,
            '10k+': box10kCoordinates,
            '6k': box500Coordinates,
            '12k': box1kCoordinates,
            '30k': box2500Coordinates,
            '60k': box5kCoordinates,
            '90k': box7500Coordinates,
            '120k+': box10kCoordinates
        }
        
        await this.page.mouse.click(coordinates[amount].x, coordinates[amount].y);
    } 
}

export default BillingPage;

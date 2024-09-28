import { Page, expect, BrowserContext } from '@playwright/test';
import BasePage from './BasePage';
import { MessagesAmount, SetConditions, ContactsList } from '../types/Types';
const environmentUrl = process.env.ENVIRONMENT_URL as string;
import * as path from 'path';
import { builtinModules } from 'module';
const videoPath = path.resolve(__dirname, '../files/test_video.mp4');
const audioPath = path.resolve(__dirname, '../files/test_audio.mp3');
const docxPath = path.resolve(__dirname, '../files/test_docx_file.docx');
const imagePath = path.resolve(__dirname, '../files/test_image.jpg');


class ClientsPage extends BasePage {
    page: Page;

    // Selectors
    private createOrganizationButtonSelector: string = '.is-success';
    private inviteInputSelector = '[placeholder="Enter email address or name"]';
    private nextButtonSelector: string = '.button--submit';
    private pricePlanTextSelector: string = '.upgradePlanItem__price';
    private countMessagePlanTextSelector: string = '.upgradePlanItem__countMessage';
    private plansTypeListSelector: string = '.toggleButtons__item';
    private upgradePlaneSliderList: string = '[style="width: 16.6667%;"]';
    private freeTrialVersionCheckboxSelector: string = `[type="checkbox"]`
    private orderPlanNameSelector: string = `.column.is-10`;
    private orderPlanAmountSelector: string = `.column.is-2`;
    private orderTotalAmountSelector: string = `.column.is-3`;
    private paymentMethodListSelector: string = `.buttons-group .button`;
    private pendingOrganizationInvitationsEmailListSelector: string = `.invite-email`;
    private invitationListSelector: string = `tbody tr`;
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }
   
    async createOrganizationButton(): Promise<void> {
        await this.customClick(this.createOrganizationButtonSelector);
    }

    async freeTrialVersion(): Promise<void> {
        await this.customClick(this.freeTrialVersionCheckboxSelector);
    }

    async endCreateOrganization(): Promise<void> {
        await this.customClick(this.nextButtonSelector);
        await this.waitSpinnerLoader();
    }

    async payUponSignup(): Promise<void> {
        const payUponSignupButton = await this.page.locator(this.paymentMethodListSelector).filter({hasText:'Pay Upon Signup'})
        await this.customClick(payUponSignupButton);
    }

    async verifyPendingOrganizationList(email: string): Promise<void> {
        const amountInvitation = await this.page.locator(this.pendingOrganizationInvitationsEmailListSelector).count();
        expect(amountInvitation).not.toBe(0);
        const lastInvitationEmail = await this.page.locator(this.pendingOrganizationInvitationsEmailListSelector).first().textContent();
        expect(lastInvitationEmail?.trim()).toBe(email);
    }

    async verifyOrder(planName: string, planAmount: string, totalAmount: string): Promise<void> {
        const orderPlanName = await this.page.locator(this.orderPlanNameSelector).textContent();
        const orderPlanAmount = await this.page.locator(this.orderPlanAmountSelector).textContent();
        const orderTotalAmount = await this.page.locator(this.orderTotalAmountSelector).textContent();
        expect(orderPlanName?.trim()).toBe(planName);
        expect(orderPlanAmount?.trim()).toBe(planAmount);
        expect(orderTotalAmount?.trim()).toBe(totalAmount);
    } 
    
    async nextButton(): Promise<void> {
        await this.customClick(this.nextButtonSelector);
    }
    async switchPlan(plan: 'Monthly' | 'Annually'): Promise<void> {
        const button = await this.page.locator(this.plansTypeListSelector).filter({hasText: plan});
        await this.customClick(button);
    }
    
    async InviteToOrganization(email: string): Promise<void> {
        await this.customFill(this.inviteInputSelector, email);
        await this.customClick(this.nextButtonSelector);
    }

    async verifyUpgradePlan(price: string, message: string): Promise<void> {
        const pricePlan = await this.page.locator(this.pricePlanTextSelector).first().textContent();
        const countMessagePlan = await this.page.locator(this.countMessagePlanTextSelector).first().textContent();

        expect(pricePlan?.trim()).toBe(price);
        expect(countMessagePlan?.trim()).toBe(message);
    } 

    async getInviteLink(email: string): Promise<string> {
        const pricePlan = await this.page.locator(this.invitationListSelector).filter({hasText: email});
        return await pricePlan.locator('button').getAttribute('data-clipboard-text') as string;
    }

    async changeMessageAmount(amount: MessagesAmount): Promise<void> {
        const box250and500 = await this.page.locator(this.upgradePlaneSliderList).nth(0).boundingBox();
        const box1k = await this.page.locator(this.upgradePlaneSliderList).nth(1).boundingBox();
        const box2500 = await this.page.locator(this.upgradePlaneSliderList).nth(2).boundingBox();
        const box5k = await this.page.locator(this.upgradePlaneSliderList).nth(3).boundingBox();
        const box7500 = await this.page.locator(this.upgradePlaneSliderList).nth(4).boundingBox();
        let box250Coordinates;
        let box500Coordinates;
        let box1kCoordinates;
        let box2500Coordinates;
        let box5kCoordinates;
        let box7500Coordinates;
        if(box250and500) {
            box250Coordinates = {x: box250and500.x, y: box250and500.y+box250and500.height/2};
            box500Coordinates = {x: box250and500.x+box250and500.width, y: box250and500.y+box250and500.height/2};
        }
        if(box1k) {
            box1kCoordinates = {x: box1k.x+box1k.width, y: box1k.y+box1k.height/2};
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
        
        const coordinates = {
            '250': box250Coordinates,
            '500': box500Coordinates,
            '1k': box1kCoordinates,
            '2.5k': box2500Coordinates,
            '5k': box5kCoordinates,
            '7.5k': box7500Coordinates,
            '3k': box250Coordinates,
            '6k': box500Coordinates,
            '12k': box1kCoordinates,
            '30k': box2500Coordinates,
            '60k': box5kCoordinates,
            '90k': box7500Coordinates,
        }
        
        await this.page.mouse.click(coordinates[amount].x, coordinates[amount].y);
    }
}

export default ClientsPage;

import { Page, expect, BrowserContext } from '@playwright/test';
import BasePage from './BasePage';
import { ConditionsType, SetConditions, ContactsList } from '../types/Types';
const environmentUrl = process.env.ENVIRONMENT_URL as string;
import * as path from 'path';
const videoPath = path.resolve(__dirname, '../files/test_video.mp4');
const audioPath = path.resolve(__dirname, '../files/test_audio.mp3');
const docxPath = path.resolve(__dirname, '../files/test_docx_file.docx');
const imagePath = path.resolve(__dirname, '../files/test_image.jpg');


class ContactsPage extends BasePage {
    page: Page;

    // Selectors
    private contactListSelector: string = '[aria-label="ContactItemRow"]';
    private sendMessageButtonListSelector = '[aria-label="IconButtonContactRowSendMessage_Default"]';
    private contactNameListSelector: string = '[aria-label="TypographyFormattedValue"]';
    private contactPhoneListSelector: string = '[aria-label="ContactRowCellNumber"]';
    private contactEmailListSelector: string = '[aria-label="ContactRowCellEmail"]';
    private showActionListSelector: string = '[aria-label="ContactItemRow"] [aria-label="IconButtonTrigger_Default"]';
    private filterButtonSelector: string = `[aria-label="IconButtonSearchElementFilter_Default"]`
    private filterPopUpSelector: string = `[aria-label="DropdownContent"]`;
    private filterConditionsFirstNameSelector: string = `[aria-label="DropdownFilterItemFirstName"]`;
    private filterConditionsPhoneSelector: string = `[aria-label="DropdownFilterItemNumber"]`;
    private filterConditionsLastNameSelector: string = `[aria-label="DropdownFilterItemLastName"]`;
    private filterConditionsEmailSelector: string = `[aria-label="DropdownFilterItemEmail"]`;
    private filterConditionsTagSelector: string = `[aria-label="DropdownFilterItemTag"]`;
    private filterConditionsAreaCodeSelector: string = `[aria-label="DropdownFilterItemAreaCode"]`;
    private filterConditionsStateCodeSelector: string = `[aria-label="DropdownFilterItemStateCode"]`;
    private filterParamContentSelector: string = `[aria-label="DropdownParamContent"]`;
    private filterTextContentSelector: string = `[aria-label="DropdownTextContent"]`;
    private filterTextContentInputSelector: string = `[aria-label="DropdownContentInput"]`;
    private filterRemoveButtonSelector: string = `[aria-label="IconButtonSearchElementRemove_Tooltip"]`;
    private filterAndOrButtonSelector: string = `[aria-label="DropdownAndOrContent"]`;
    private filterAndOrOptionsListSelector: string = `[aria-label="DropdownList_Item"]`;
    private filterRemoveGroupButtonSelector: string = `[aria-label="IconButtonFiltersRemoveGroup_Tooltip"]`;
    private createSegmentButtonSelector: string = `[aria-label="ButtonCreateSegment"]`;
    private newSegmentModalSelector: string = `[aria-label="Modal_NewSegment"]`;
    private newSegmentNameInputSelector: string = `[aria-label="NewSegmentModalInput"]`;
    private createNewSegmentButtonSelector: string = `[aria-label="DefaultModal_Actions"] [aria-label="ButtonCreate"]`;
    private segmentItemListSelector: string = `[aria-label="Tooltip"] [aria-label="TypographyTitle"]`; //TODO: not unicale selector

    //Text fields
    private userCredentials: string = 'John Doe';

    // Endpoints
    private contactsEndpoint: string = `${environmentUrl}/contacts`;
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }
   
    async openContactsPage(): Promise<void> {
        await this.customClick(this.openContactsPageSelector);
        await this.waitSpinnerLoader();
    }

    async openVerifyFilterPopUp(): Promise<void> {
        await this.customClick(this.filterButtonSelector);
        await this.page.waitForSelector(this.filterPopUpSelector);
    }

    async setCondition(conditionType: ConditionsType, condition: string): Promise<void> {
        const conditionsListSelector = {
            'firstName': this.filterConditionsFirstNameSelector,
            'lastName': this.filterConditionsLastNameSelector,
            'phone': this.filterConditionsPhoneSelector,
            'email': this.filterConditionsEmailSelector,
            'tags': this.filterConditionsTagSelector,
            'areaCode': this.filterConditionsAreaCodeSelector,
            'stateProvince': this.filterConditionsStateCodeSelector
        }
        await this.customClick(conditionsListSelector[conditionType]);
        const enterValue = await this.page.locator(this.filterTextContentSelector).last();
        await this.customClick(enterValue);
        await this.customFill(this.filterTextContentInputSelector, condition, {enter: true});
    }

    async setConditions(conditions: SetConditions) {
        for (let i=0;i< conditions.length;i++ ) {
            await this.setCondition(conditions[i].conditionType, conditions[i].condition);
            if(conditions[i].andOr) {
                await this.customClick(this.filterAndOrButtonSelector);
                const andOrOption = await this.page.locator(this.filterAndOrOptionsListSelector).getByText(conditions[i].andOr as string)
                await this.customClick(andOrOption);
            }
        }
    }

    async verifyConditions(elements: number, groups: number) {
        const elementsAmount = await this.page.locator(this.filterTextContentSelector).count();
        const groupsAmount = await this.page.locator(this.filterRemoveGroupButtonSelector).count();
        
        expect(elementsAmount).toBe(elements);
        expect(groupsAmount).toBe(groups);
    }

    async verifyContactsList(contacts: ContactsList) {
        for(let i=0; i<contacts.length; i++) {
            const contactName = await this.page.locator(this.contactNameListSelector).nth(i).innerText();
            const contactPhone = await this.page.locator(this.contactPhoneListSelector).nth(i).innerText();
            const contactEmail = await this.page.locator(this.contactEmailListSelector).nth(i).innerText();
            
            expect(contactName).toBe(contacts[i].name);
            expect(contactPhone.replace(/\D/g, '')).toBe(contacts[i].phone.replace(/\D/g, ''));
            expect(contactEmail).toBe(contacts[i].email);
        }

    }

    async verifySegmentList(segment: string, amount: string) {
        const segmentsAmount = await this.page.locator(this.segmentItemListSelector).count();
       
        expect(segmentsAmount-1).toBe(amount);
        for(let i=0; i<segmentsAmount; i++) {
            const foundSegment = await this.page.locator(this.segmentItemListSelector).nth(i).textContent();
            if(foundSegment === segment) {
                return;
            }
        }
        throw new Error(`[verifySegmentList] The segment: ${segment} not found`);
    }

    async clickCreateSegmentAndVerify() {
        await this.customClick(this.createSegmentButtonSelector);
        await this.page.waitForSelector(this.newSegmentModalSelector);
    }   

    async createNewSegment(name: string) {
        await this.customFill(this.newSegmentNameInputSelector, name);
        await this.customClick(this.createNewSegmentButtonSelector);
    }

    async sendMessageContactsList(number: string): Promise<void> {
        const contacts = await this.page.locator(this.contactListSelector);
        const contactCount = await contacts.count();
        for (let i = 0; i < contactCount; i++) {
            const contact = contacts.nth(i);
            const phoneElement = contact.locator(this.contactPhoneListSelector);
            const phoneNumber = (await phoneElement.innerText()).replace(/\D/g, '');
            console.log(phoneNumber, number)
            if (phoneNumber === number) {
                await this.customClick(phoneElement);
                await this.customClick(this.sendMessageButtonListSelector);
                return;
            }
        }
    
        console.error('Contact with number', number, 'not found'); 
    }
}

export default ContactsPage;

import { Page, expect, BrowserContext } from '@playwright/test';
import { RegistrationData, LastRegistrationPageData, LastRegistrationClientsPageData, ErrorMessagesType, MessageFormAlertType } from '../types/Types';
import * as fs from 'fs';
import * as path from 'path';
import BasePage from './BasePage';
const { NewUser } = require('../constants/userData.ts');
let newUser = NewUser();
const environmentUrl = process.env.ENVIRONMENT_URL as string;
const emailGmail = process.env.EMAIL_GMAIL as string;
const env = process.env.ENV;
const tokenENV = process.env[`TOKEN_${env}`];

class AuthenticationPage extends BasePage {
    // Selectors
    private emailInputSelector: string = '.email input';
    private passwordInputSelector: string = '.password input';
    private signInButtonSelector: string = '[type="submit"]';
    private loginPageSelector: string = '.auth-login';
    private signUpLinkSelector: string = '[href="/register?authv2"]';
    private emailSignupInputSelector: string = '[placeholder="Your email"]';
    private accountNameInputSelector: string = '[placeholder="Your account name"]';
    private continueButtonSelector: string = '.is-actions .is-primary';
    private titleSelector: string = '.registerTrial__info .registerTrial__title';
    private titleAlertSelector: string = '[aria-label="Alert_Title"]';
    private titleGetStartedModalSelector: string = '[aria-label="GetStartedModalContent_Title"]';
    private optionLabelSelector: string = '.option-label';
    private nextButtonSelector: string = '.registration-v2-actions .is-primary';
    private firstNameInputSelector: string = 'input[placeholder="Your first name"]';
    private lastNameInputSelector: string = 'input[placeholder="Your last name"]';
    private phoneNumberInputSelector: string = 'input[placeholder="Your mobile phone number"]';
    private newPasswordInputSelector: string = 'input[placeholder="Enter a password"]';
    private cardNumberInputSelector: string = 'input[name="cardnumber"]';
    private expDateInputSelector: string = 'input[name="exp-date"]';
    private cvcInputSelector: string = 'input[name="cvc"]';
    private zipInputSelector: string = 'input[name="postal"]';
    private step2CrmSelector: string = '.registration-v2-step2__wrapper';
    private step3SizeSelector: string = '.registration-v2-step3__wrapper';
    private step4LocationSelector: string = '.registration-v2-step4__wrapper';
    private step5EndSelector: string = '.registration-v2-step5__wrapper';
    private tollFreeNumberButtonSelector: string = '[data-testid="Tabs_tab__label"]:has-text("Toll-Free number")';
    private enterStateNameDropdawnSelector: string = '[aria-label="ButtonEnterAStateName"]';
    private enterAreaCodeDropdawnSelector: string = '[aria-label="ButtonEnterAnAreaCodeEG561"]';
    private emailInputAcceptInvitationClientsSelector: string = '[placeholder="E-Mail Address"]';
    private iframeSelector: string = 'iframe[name^="__privateStripeFrame"]';
    private createAccountButtonSelector: string = 'button:has-text("Create My Account")';
    private registerTrialNumbersNumbersListSelector: string = '[aria-label="InputRadiobox_Label"]';
    private dropdownListSelector: string = '[aria-label="DropdownList_Item"]';
    private areaUsCanadaListSelector: string = '[aria-label="MessagingRegionModalContent_Region"]';
    private getNextButtonSelector: string ='[aria-label="ButtonNext"]'; 
    private getTrialNumberSelector: string = '[aria-label="GetStartedModalContent_Number"]';
    private getTryQatestFirstButtonSelector: string = '[aria-label="ButtonTryQatestFirst"]';
    private tryQatestFirstButtonSelector: string = '.button--action';
    private acceptInvitationButtonSelector: string = '.is-actions button';
    private firstNameInputAcceptInvitationSelector: string = '[placeholder="First Name"]';
    private lastNameInputAcceptInvitationSelector: string = '[placeholder="Last Name"]';
    private phoneInputAcceptInvitationSelector: string = '[placeholder="(718) 737-1111"]';
    private phoneInputAcceptInvitationClientsSelector: string = '[placeholder="Phone Number"]';
    private passwordInputAcceptInvitationSelector: string = '[placeholder="Password"]';
    private confirmPasswordInputAcceptInvitationSelector: string = '[placeholder="Confirm Password"]';
    private checkBoxAcceptInvitationSelector: string = '.checkbox input';
    private tollFreeNumberTabSelector: string = '[aria-label="Tab_TollFreeNumber"]';
    private inputErrorMessageTextSelector: string = '.field .help';
    private getMessageFormAlertSelector: string = '.message-form-alert .message-body';
    private getMessageFormDangerSelector: string = '.has-text-danger';
    private getRegisterTrialMessageAlertSelector: string = '.registerTrial .message-body';
    private notSupportedCountryModalCardBodySelector: string = '.registration-v2__countries-modal .modal-card-body';
    private notSupportedCountryModalCardHeadSelector: string = '.registration-v2__countries-modal .modal-card-head';

    // Text fields
    private chooseCRMTitleTextField: string = 'Which CRM does your business use';
    private chooseCompanySizeTitleTextField: string = 'What is your company size?';
    private sendMessagesLocationTitleTextField: string = 'Where do you want to send messages?';
    private completeRegistrationTitleTextField: string = 'Start Your 14-Day Trial';
    private getYourBusinessNumberTitleTextField: string = 'Get your business number';
    private yourTrialNumberTitleTextField: string = 'Say hello to your trial number!';
    private emailErrorExistEmailText: string = 'This e-mail address has been taken. Please choose another one.'
    private emailErrorInvalidEmailText: string = 'Invalid email';
    private organizationErrorEmptyInputText: string = 'The organization name must be a string.';
    private passwordErrorSmallLengthText: string = 'Password must be at least 7 characters.';
    private phoneErrorSInvalidFormatText: string = 'Please enter a valid phone number';
    private expireDateMessageFormAlertText: string = `Your card's expiration year is in the past.`;
    private invalidCardMessageFormAlertText: string = `Your card number is invalid.`;
    private incompleteCardMessageFormAlertText: string = `Your card number is incomplete.`;
    private incompleteDateMessageFormAlertText: string = `Your card's expiration date is incomplete.`;
    private declinedCardMessageFormAlertText: string = `We were unable to process your card payment. Please check your card details or try using a different card.`;
    private registerTrialMessageAlertText: string = `🎉Coupon applied! Enjoy 20% off  the first month.`;
    private businessEmailAddressMessageAlertText: string = `Please enter your business email address. This form does not accept addresses from gmail.com.`;
    private notSupportedCountryModalCardHeadText: string = `Thank you for your interest in Qatest!`;
    private notSupportedCountryModalCardBodyText: string = `Qatest is coming soon to @country. We'll notify once we that happens. In the mean time, you can get a US or Canada number for your business.`;
    // Endpoints
    private authLoginEndpoint: string = `${environmentUrl}/auth/login`;
    private usersMeEndpoint: string = `https://api.dev.salesmessage.com/qa/int/v5/core/users/me`;
    
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async visitLoginPage(): Promise<void> {
        await this.page.goto(`${environmentUrl}/auth/login`, { waitUntil: 'load', timeout: 200000 });
        await this.clickIfElementPresent(this.bannerAcceptSelector, {hidden: true});
    }

    async visitSignUpAnyDomainPage(): Promise<void> {
        await this.page.goto(`${environmentUrl}/register?anydomain`, { waitUntil: 'load', timeout: 200000 });
        await this.clickIfElementPresent(this.bannerAcceptSelector, {hidden: true});
    }

    async visitSignUpPage(coupon?: '20%'): Promise<void> {
        if(coupon === '20%') {
            await this.page.goto(`${environmentUrl}/register?authv2&redirect=%2Fconversations&c=FIRST20OFF`, { waitUntil: 'load', timeout: 200000 });
        } else {
            await this.page.goto(`${environmentUrl}/register?authv2`, { waitUntil: 'load', timeout: 200000 });
        }
        await this.clickIfElementPresent(this.bannerAcceptSelector, {hidden: true});
    }

    async loginUser(userDetails: { email: string, password: string }) {
        await this.visitLoginPage();
        await this.authenticateUser({ 
            login: userDetails.email, 
            password: userDetails.password 
        });
        await this.waitOauthResponseLoad();
        const cookies = await this.page.context().cookies();
        return cookies.find(cookie => cookie.name === tokenENV)?.value as string;
    }

    async authenticateUser(credentials: { login: string, password: string }): Promise<void> {
        await this.customFill(this.emailInputSelector, credentials.login);
        await this.customFill(this.passwordInputSelector, credentials.password, {logs: false});
        await this.customClick(this.signInButtonSelector);
    }

    async clickSignUp(): Promise<void> {
        await this.customClick(this.signUpLinkSelector);
        await this.page.waitForSelector(this.emailSignupInputSelector, { state: 'visible', timeout: 60000 });
    }

    async verifyNotSupportedCountryModal(country: string): Promise<void> {
        
    }

    async verifyErrorMessageInput(message: ErrorMessagesType): Promise<void> {
        const messageType = {
            'exist email': this.emailErrorExistEmailText,
            'invalid format': this.emailErrorInvalidEmailText,
            'small password': this.passwordErrorSmallLengthText,
            'wrong phone': this.phoneErrorSInvalidFormatText,
            'empty email': this.emailErrorInvalidEmailText,
            'empty organization': this.organizationErrorEmptyInputText
            
        }
        const errorMessage = await this.page.locator(this.inputErrorMessageTextSelector).textContent();
        expect(errorMessage?.trim()).toBe(messageType[message]);
    }

    async verifyMessageFormAlertInput(message: MessageFormAlertType): Promise<void> {
        const messageType = {
            'expire date': this.expireDateMessageFormAlertText,
            'invalid card': this.invalidCardMessageFormAlertText,
            'declined card': this.declinedCardMessageFormAlertText,
            'business address': this.businessEmailAddressMessageAlertText,
            'incomplete card': this.incompleteCardMessageFormAlertText,
            'incomplete date': this.incompleteDateMessageFormAlertText
        }
        const alertMessage = await this.page.locator(this.getMessageFormAlertSelector, {hasText:messageType[message]}).or(this.page.locator(this.getMessageFormDangerSelector, {hasText:messageType[message]})).textContent();
        expect(alertMessage?.trim()).toBe(messageType[message]);
    }

    async enterEmailAndContinue(email?: string, verify = true): Promise<string> {
        let userEmail = emailGmail.replace('@', `${Date.now()}@`);
        if(email !== undefined) {
            userEmail = email;
        }
        await this.customFill(this.emailSignupInputSelector, userEmail);
        await this.customClick(this.continueButtonSelector);
        if(verify) {
            await this.page.waitForSelector(this.step2CrmSelector);
        }
        console.log(userEmail);
        return userEmail;
    }

    async verifyTitleChooseCrmPage(): Promise<void> {
        await this.verifyTitle(this.chooseCRMTitleTextField);
    }

    async verifyTitleCompanySizePage(): Promise<void> {
        await this.verifyTitle(this.chooseCompanySizeTitleTextField);
    }

    async verifyTitleSendMessagesLocationPage(): Promise<void> {
        await this.verifyTitle(this.sendMessagesLocationTitleTextField);
    }

    async verifyTitleCompleteRegistrationPage(coupon?: '20'): Promise<void> {
        await this.verifyTitle(this.completeRegistrationTitleTextField);
        if(coupon === '20') {
            const registerTrialMessage = await this.page.locator(this.getRegisterTrialMessageAlertSelector).textContent();
            expect(registerTrialMessage?.trim()).toBe(this.registerTrialMessageAlertText);
        }
    }

    async verifyTitleGetYourBusinessNumberPage(): Promise<void> {
        await this.page.waitForSelector(this.enterStateNameDropdawnSelector, { state: 'visible', timeout: 300000 });
        await this.verifyAlertTitle(this.getYourBusinessNumberTitleTextField);
    }

    async verifyTitleYourTrialNumberPage(): Promise<void> {
        await this.verifyGetStartedModalTitle(this.yourTrialNumberTitleTextField);
    }

    private async verifyTitle(expectedTitle: string): Promise<void> {
        const actualTitle = (await this.page.textContent(this.titleSelector))?.trim();
        expect(actualTitle).toBe(expectedTitle);
    }

    private async verifyAlertTitle(expectedTitle: string): Promise<void> {
        const actualTitle = (await this.page.textContent(this.titleAlertSelector))?.trim();
        expect(actualTitle).toBe(expectedTitle);
    }
    
    private async verifyGetStartedModalTitle(expectedTitle: string): Promise<void> {
        const actualTitle = (await this.page.textContent(this.titleGetStartedModalSelector))?.trim();
        expect(actualTitle).toBe(expectedTitle);
    }

    async selectCrmOptionAndContinue(crmOption: string): Promise<void> {
        await this.clickIfElementPresent(this.bannerAcceptSelector, {hidden: true});
        await this.customClick(this.optionLabelSelector, { hasText: crmOption });
        await this.customClick(this.nextButtonSelector);
        await this.page.waitForSelector(this.step3SizeSelector);
    }

    async selectCompanySizeOptionAndContinue(companySize: string): Promise<void> {
        await this.customClick(this.optionLabelSelector, { hasText: companySize });
        await this.customClick(this.nextButtonSelector);
        await this.page.waitForSelector(this.step4LocationSelector);
    }

    async selectSendMessagesLocationOptionAndContinue(location: string): Promise<void> {
        await this.customClick(this.optionLabelSelector, { hasText: location });
        await this.customClick(this.nextButtonSelector);
        await this.page.waitForSelector(this.step5EndSelector);
    }

    async selectBusinessNumberWithTollFreeAndContinue(): Promise<void> {
        await this.customClick(this.tollFreeNumberButtonSelector);
        const secondPhoneNumberElement = this.page.locator(this.registerTrialNumbersNumbersListSelector).nth(1);
        await this.customClick(secondPhoneNumberElement);
        await this.customClick(this.getNextButtonSelector);
        await this.page.waitForSelector(this.getTrialNumberSelector);
    }

    async selectBusinessNumberWithLocalContinue(): Promise<string> {
        await this.customClick(this.enterStateNameDropdawnSelector);
        const californiaState = this.page.locator(this.dropdownListSelector).filter({ hasText: 'CA - California' });
        await this.customClick(californiaState);
        await this.customClick(this.enterAreaCodeDropdawnSelector);
        const areaCode951Element = this.page.locator(this.dropdownListSelector).filter({ hasText: '951' });
        await this.customClick(areaCode951Element);
        const secondPhoneNumberElement = this.page.locator(this.registerTrialNumbersNumbersListSelector).nth(1);
        await this.customClick(secondPhoneNumberElement);
        const secondPhoneNumberElementText = (await secondPhoneNumberElement.innerText()).split('\n')[0];
        await this.customClick(this.getNextButtonSelector);
        const usOnlySelector = this.page.locator(this.areaUsCanadaListSelector).filter({ hasText: 'US only' });
        await this.customClick(usOnlySelector);
        await this.customClick(this.getNextButtonSelector);
        await this.page.waitForSelector(this.getTrialNumberSelector);
        return secondPhoneNumberElementText;
    }

    async selectBusinessNumberToolFreeContinue(): Promise<string> {
        await this.customClick(this.tollFreeNumberTabSelector);
        await this.waitSpinnerLoader();
        const secondPhoneNumberElement = this.page.locator(this.registerTrialNumbersNumbersListSelector).nth(1);
        await this.customClick(secondPhoneNumberElement);
        const secondPhoneNumberElementText = (await secondPhoneNumberElement.innerText()).split('\n')[0];
        await this.customClick(this.getNextButtonSelector);
        await this.page.waitForSelector(this.getTrialNumberSelector);
        return secondPhoneNumberElementText;
    }

    async copyTrialNumberAndContinue(): Promise<string> {
        await this.page.waitForSelector(this.getTrialNumberSelector);
        const getTrialNumber = await this.page.locator(this.getTrialNumberSelector);
        const spinnerLoader = await getTrialNumber.locator(this.spinnerLoaderSelector).first();
        await spinnerLoader.waitFor({ state: 'detached' });
        
        const phoneNumber = getTrialNumber.innerText();
        await this.customClick(this.getTryQatestFirstButtonSelector);
        return phoneNumber;
    }

    async completePersonalDetailsAndCreateAccount(details: RegistrationData): Promise<void> {
        await this.customFill(this.firstNameInputSelector, details.firstName);
        await this.customFill(this.lastNameInputSelector, details.lastName);
        await this.customFill(this.accountNameInputSelector, details.account)
        await this.customFill(this.phoneNumberInputSelector, details.phone);
        await this.customFill(this.newPasswordInputSelector, details.password);
        await this.fillCardNumber(details.cardNumber, details.exp_date, details.cvc, details.zip);
        await this.createAccount();
    }

    async createAccount(): Promise<void> {
        await this.customClick(this.createAccountButtonSelector);
        await this.waitSpinnerLoader();
    }
    
    async fillCardNumber(card: string, date: string, cvc: string, zip: string): Promise<void> {
        const cardNumberInputIframeSelector = this.page.frameLocator(this.iframeSelector).locator(this.cardNumberInputSelector);
        await this.customFill(cardNumberInputIframeSelector, card);
        if(zip !== '') {
            const zipInputIframeSelector = this.page.frameLocator(this.iframeSelector).locator(this.zipInputSelector);
            await this.customFill(zipInputIframeSelector, zip);
        }
        if(date !== '') {
            const expDateInputIframeSelector = this.page.frameLocator(this.iframeSelector).locator(this.expDateInputSelector);
            await this.customFill(expDateInputIframeSelector, date);
        }
        if(cvc !== '') {
            const cvcInputIframeSelector = this.page.frameLocator(this.iframeSelector).locator(this.cvcInputSelector);
            await this.customFill(cvcInputIframeSelector, cvc);
        }
    }

    async endRegistrationWithoutCompleteCompliance(): Promise<void> {
        await this.customClick(this.tryQatestFirstButtonSelector);
        await this.page.waitForSelector(this.tryQatestFirstButtonSelector, { state: 'detached', timeout: 60000 });
    }

    async createUser(userDetails?:RegistrationData, toolFree = false): Promise<RegistrationData> {
        if(userDetails) {
            newUser = userDetails;
        }
        let organizationId: any;

        const responseHandler = async (response) => {
            if (response.url().includes(this.usersMeEndpoint) && response.request().method() === 'GET') {
                
                if (response.ok()) {
                    const data = await response.json();
                    organizationId = data?.data?.organization?.id;
                    console.log('Intercepted data:', organizationId);
                    const filePath = path.resolve(__dirname, '../variables/end/qa.json');
                    let currentData: string[] = [];
                    if (fs.existsSync(filePath)) {
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        currentData = JSON.parse(fileContent);
                    }
                    if (organizationId && !currentData.includes(organizationId)) {
                        currentData.push(organizationId);
                        fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2));
                    }
                } else {
                    console.error('Failed to fetch data:', response.status(), response.statusText());
                }
            }
        };

        this.page.on('response', responseHandler);
        await this.clickSignUp();
        await this.enterEmailAndContinue(newUser.email);
        await this.verifyTitleChooseCrmPage();
        await this.selectCrmOptionAndContinue(newUser.crmOption);
        await this.verifyTitleCompanySizePage();
        await this.selectCompanySizeOptionAndContinue(newUser.companySize);
        await this.verifyTitleSendMessagesLocationPage();
        await this.selectSendMessagesLocationOptionAndContinue(newUser.location);
        await this.verifyTitleCompleteRegistrationPage();
        await this.completePersonalDetailsAndCreateAccount(newUser);
        await this.verifyTitleGetYourBusinessNumberPage();
        if(toolFree) {
            newUser.businessNumber = await this.selectBusinessNumberToolFreeContinue();
        } else {
            newUser.businessNumber = await this.selectBusinessNumberWithLocalContinue();
            
        }
        await this.verifyTitleYourTrialNumberPage();
        newUser.trialNumber = await this.copyTrialNumberAndContinue();
        this.page.off('response', responseHandler);
        const cookies = await this.page.context().cookies();
        newUser.token = cookies.find(cookie => cookie.name === tokenENV)?.value as string;
        return newUser;
    
    }

    async acceptInviteNewMember(userDetails?:LastRegistrationPageData): Promise<void> {
        let newMember = {
            firstName: "Qa",
            lastName: "test",
            phone: "1112222345",
            password: "123456789",
        }
        if(userDetails) {
            newMember = userDetails;
        }
        await this.customFill(this.firstNameInputAcceptInvitationSelector, newMember.firstName);
        await this.customFill(this.lastNameInputAcceptInvitationSelector, newMember.lastName);
        await this.customFill(this.phoneInputAcceptInvitationSelector, newMember.phone)
        await this.customFill(this.passwordInputAcceptInvitationSelector, newMember.password);
        await this.customFill(this.confirmPasswordInputAcceptInvitationSelector, newMember.password);
        await this.customClick(this.checkBoxAcceptInvitationSelector);
        await this.clickIfElementPresent(this.bannerAcceptSelector, {hidden: true});
        await this.customClick(this.acceptInvitationButtonSelector);
        await this.waitApplicationLoader();
    }

    async acceptInviteNewClient(email: string, userDetails?:LastRegistrationClientsPageData): Promise<void> {
        let newMember = {
            firstName: "qwerty",
            lastName: "qaqa",
            phone: "2025552345",
            account: `AutomationClientOrg${Date.now()}`,
            password: "123456789",
            cardNumber: "4242424242424242",
            exp_date: "0730",
            cvc: "424",
            zip: "42424",
        }
        if(userDetails) {
            newMember = userDetails;
        }
        await this.customFill(this.firstNameInputAcceptInvitationSelector, newMember.firstName);
        await this.customFill(this.lastNameInputAcceptInvitationSelector, newMember.lastName);
        await this.customFill(this.accountNameInputSelector, newMember.account);
        await this.customFill(this.phoneInputAcceptInvitationClientsSelector, newMember.phone)
        await this.customFill(this.passwordInputAcceptInvitationSelector, newMember.password);
        const cardNumberInputIframeSelector = this.page.frameLocator(this.iframeSelector).locator(this.cardNumberInputSelector);
        const expDateInputIframeSelector = this.page.frameLocator(this.iframeSelector).locator(this.expDateInputSelector);
        const cvcInputIframeSelector = this.page.frameLocator(this.iframeSelector).locator(this.cvcInputSelector);
        const zipInputIframeSelector = this.page.frameLocator(this.iframeSelector).locator(this.zipInputSelector);
        await this.customFill(cardNumberInputIframeSelector, newMember.cardNumber);
        await this.customFill(expDateInputIframeSelector, newMember.exp_date);
        await this.customFill(cvcInputIframeSelector, newMember.cvc);
        await this.customFill(zipInputIframeSelector, newMember.zip);
        await this.customClick(this.checkBoxAcceptInvitationSelector);
        const emailField = await this.page.locator(this.emailInputAcceptInvitationClientsSelector).inputValue();
        await this.clickIfElementPresent(this.bannerAcceptSelector, {hidden: true});
        await this.customClick(this.acceptInvitationButtonSelector, {nth: 0});
        
        expect(emailField).toBe(email);
        await this.waitSpinnerLoader();
        await this.waitApplicationLoader();
    }

    async verifyLogOutSuccess(): Promise<void> {
        await this.page.waitForSelector(this.loginPageSelector, { state: 'visible', timeout: 60000 });
        await expect(this.page).toHaveURL(this.authLoginEndpoint);
    }
}

export default AuthenticationPage;

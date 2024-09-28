import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';
const { SignUpEmail } = require('../constants/emailMessages');
const { Coupon20Month25 }= require('../constants/downloadRecipe.ts');
const { NewUser } = require('../constants/userData.ts');
let signUpEmail = SignUpEmail();

test.describe('Oauth Functionality', () => {
    test(qase(9659, '@QATEST-9659 Create Account (Local Number Registration)'), async ({ openAuthPage, emailService }) => {
        const { authPage, conversationsPage } = openAuthPage;
        const expectedInboxesList = ['All inboxes', 'John Doe', 'John Doe Trial'];
        const newUser = await authPage.createUser();
       
        await conversationsPage.verifyCompliancePageBeforeRegistration(expectedInboxesList);
        await emailService.checkEmail(newUser.email, signUpEmail);
    });

    test(qase(9634, '@QATEST-9634 Create Account (Select Toll-Free Number)'), async ({ openAuthPage, emailService }) => {
        const { authPage, conversationsPage } = openAuthPage;
        test.setTimeout(400000);
        const expectedInboxesList = ['All inboxes', 'John Doe', 'John Doe Trial'];
        const newUser = await authPage.createUser(undefined, true);
       
        await conversationsPage.verifyCompliancePageBeforeRegistration(expectedInboxesList);
        await emailService.checkEmail(newUser.email, signUpEmail);
    });

    test(qase(9628, '@QATEST-9628 Create Account (Email Address Already Exists)'), async ({ openAuthPage, custom }) => {
        const { authPage, userDetails } = openAuthPage;
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Enter email address that is already taken->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue(userDetails.email, false);

            await authPage.verifyErrorMessageInput('exist email');
        });
    });

    test(qase(9664, '@QATEST-9664 Create Account (Empty Email)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Enter email address that is already taken->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue('', false);

            await authPage.verifyErrorMessageInput('empty email');
        });
    });

    test(qase(9632, '@QATEST-9632 Create Account (Invalid Email)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Enter email address in wrong format -> Click "Continue" button.`, async () => {
            await authPage.enterEmailAndContinue(`qwerty2qatest.com`, false);

            await authPage.verifyErrorMessageInput('invalid format');
        });
        
    });

    test(qase(9631, '@QATEST-9631 Create Account (Invalid Password)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Populate valid email->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue();

            await authPage.verifyTitleChooseCrmPage();
            
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button->Select any team size->"Next" button->Select the supported country`, async () => {
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage();
        });

        await custom.wrappedTestStep(`4. Populate all fields correctly and enter password which is shorter than 7 characters.`, async () => {
            newUser.password = '111111'
            await authPage.completePersonalDetailsAndCreateAccount(newUser);

            await authPage.verifyErrorMessageInput('small password');
        });
        
    });

    test(qase(9663, '@QATEST-9663 Create Account (Empty Sign Up Form)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Populate valid email->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue();

            await authPage.verifyTitleChooseCrmPage();
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button->Select any team size->"Next" button->Select the supported country`, async () => {
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage();
        });

        await custom.wrappedTestStep(`4. Leave all fields empty → Click Create My Account button.`, async () => {
            await authPage.createAccount();

            await authPage.verifyErrorMessageInput('empty organization');
            await authPage.verifyMessageFormAlertInput('incomplete card');
        });
        
    });

    test(qase(9629, '@QATEST-9629 Create Account (Invalid Phone Number)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Populate valid email->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue();

            await authPage.verifyTitleChooseCrmPage();
            
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button->Select any team size->"Next" button->Select the supported country`, async () => {
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage();
        });

        await custom.wrappedTestStep(`4. Populate all fields correctly and enter invalid Phone Number`, async () => {
            newUser.phone = '111111'
            await authPage.completePersonalDetailsAndCreateAccount(newUser);

            await authPage.verifyErrorMessageInput('wrong phone');
        });
        
    });

    test(qase(9630, '@QATEST-9630 Create Account (Invalid Expiration Date)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Populate valid email->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue();

            await authPage.verifyTitleChooseCrmPage();
            
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button->Select any team size->"Next" button->Select the supported country`, async () => {
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage();
        });

        await custom.wrappedTestStep(`4. Populate all fields correctly and enter invalid Phone Number`, async () => {
            newUser.exp_date = '0823'
            await authPage.completePersonalDetailsAndCreateAccount(newUser);

            await authPage.verifyMessageFormAlertInput('expire date');
        });
        
    });

    test(qase(9661, '@QATEST-9661 Create Account (Empty Expiration Date)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Populate valid email->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue();

            await authPage.verifyTitleChooseCrmPage();
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button->Select any team size->"Next" button->Select the supported country`, async () => {
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage();
        });

        await custom.wrappedTestStep(`4. Populate all fields correctly and leave Credit Card date empty. -> Click "Create My Account" button.`, async () => {
            newUser.exp_date = '';
            await authPage.completePersonalDetailsAndCreateAccount(newUser);

            await authPage.verifyMessageFormAlertInput('incomplete date');
        });
    });

    test(qase(9660, '@QATEST-9660 Create Account (Empty Credit Card Number)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Populate valid email->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue();

            await authPage.verifyTitleChooseCrmPage();
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button->Select any team size->"Next" button->Select the supported country`, async () => {
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage();
        });

        await custom.wrappedTestStep(`4. Populate all fields correctly and enter invalid Phone Number`, async () => {
            newUser.exp_date = '';
            newUser.cvc = '';
            newUser.email = '';
            await authPage.completePersonalDetailsAndCreateAccount(newUser);

            await authPage.verifyMessageFormAlertInput('incomplete date');
        });
    });

    test(qase(9633, '@QATEST-9633 Create Account (Invalid Credit Card Number)'), async ({ openAuthPage, custom }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Populate valid email->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue();

            await authPage.verifyTitleChooseCrmPage();
            
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button->Select any team size->"Next" button->Select the supported country`, async () => {
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage();
        });

        await custom.wrappedTestStep(`4. Populate all fields correctly and enter invalid Phone Number`, async () => {
            newUser.cardNumber = '1111111111111111';
            newUser.zip = '';
            await authPage.completePersonalDetailsAndCreateAccount(newUser);

            await authPage.verifyMessageFormAlertInput('invalid card');
        });
        
    });

    test(qase(9658, '@QATEST-9658 Create Account (Insufficient Credits CC - Verification)'), async ({ openAuthPage, custom, emailService }) => {
        const { authPage, conversationsPage, settingsPage, billingPage } = openAuthPage;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });
        
        await custom.wrappedTestStep(`2. Populate valid email->Click"Continue" button.`, async () => {
            await authPage.enterEmailAndContinue(newUser.email);

            await authPage.verifyTitleChooseCrmPage();
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button->Select any team size->"Next" button->Select the supported country`, async () => {
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage();
        });

        await custom.wrappedTestStep(`4. Enter Invalid Credit Card number -> Click "Create My Account" button.`, async () => {
            newUser.cardNumber = '4000 0000 0000 0341';
            await authPage.completePersonalDetailsAndCreateAccount(newUser);

            await authPage.verifyMessageFormAlertInput('declined card');
        });

        await custom.wrappedTestStep(`5. Change the CC to valid one -> Click "Create My Account" button.`, async () => {
            await authPage.fillCardNumber('4242 4242 4242 4242', newUser.exp_date, newUser.cvc, newUser.zip);
            await authPage.createAccount();
            
            await authPage.verifyTitleGetYourBusinessNumberPage();
        });

        await custom.wrappedTestStep(`6. Select phone number.`, async () => {
            await authPage.selectBusinessNumberWithLocalContinue();
            
            await authPage.verifyTitleYourTrialNumberPage();
        });

        await custom.wrappedTestStep(`7. End registration`, async () => {
            const expectedInboxesList = ['All inboxes', 'John Doe', 'John Doe Trial'];
            await authPage.copyTrialNumberAndContinue();
            
            await conversationsPage.verifyCompliancePageBeforeRegistration(expectedInboxesList);
            await emailService.checkEmail(newUser.email, signUpEmail);
        });

        await custom.wrappedTestStep(`8. Verify billing section`, async () => {
            await settingsPage.openBillingPage();

            await billingPage.verifyPaymentMethodsList([
                {cardNumber: '********4242', date: 'Exp. 07 / 2030', primary: true},
                {cardNumber: '********0341', date: 'Exp. 07 / 2030', primary: false},
            ]);
        });
    });

    test(qase(9637, '@QATEST-9637 Create Account (with Stripe Coupon)'), async ({ signUpWithCoupon, custom, emailService }) => {
        const { authPage, conversationsPage, settingsPage, billingPage } = signUpWithCoupon;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Populate valid email->Click "Continue" button->Select CRM, Company Size, Country to send message`, async () => {
            await authPage.enterEmailAndContinue(newUser.email);
            await authPage.verifyTitleChooseCrmPage();
            await authPage.selectCrmOptionAndContinue("None");
            await authPage.verifyTitleCompanySizePage();
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");
            await authPage.verifyTitleSendMessagesLocationPage();
            await authPage.selectSendMessagesLocationOptionAndContinue("United States");
            await authPage.verifyTitleCompleteRegistrationPage('20');
        });
        
        await custom.wrappedTestStep(`2. Populate all fields with valid data->Click "Create My Account" button.`, async () => {
            await authPage.completePersonalDetailsAndCreateAccount(newUser);

            await authPage.verifyTitleGetYourBusinessNumberPage();
        });

        await custom.wrappedTestStep(`3. Select phone number.`, async () => {
            await authPage.selectBusinessNumberWithLocalContinue();
            
            await authPage.verifyTitleYourTrialNumberPage();
        });

        await custom.wrappedTestStep(`4. End registration`, async () => {
            const expectedInboxesList = ['All inboxes', 'John Doe', 'John Doe Trial'];
            await authPage.copyTrialNumberAndContinue();
            
            await conversationsPage.verifyCompliancePageBeforeRegistration(expectedInboxesList);
            await emailService.checkEmail(newUser.email, signUpEmail);
        });

        await custom.wrappedTestStep(`5. Verify billing section`, async () => {
            await settingsPage.openBillingPage();

            await billingPage.verifyPaymentMethodsList([
                {cardNumber: '********4242', date: 'Exp. 07 / 2030', primary: true}
            ]);
        });

        await custom.wrappedTestStep(`6. Click "Upgrade now"`, async () => {
            await billingPage.upgrade();

            await billingPage.verifyUpgradePlan('$25 /mo','500 credits per month');
        });

        await custom.wrappedTestStep(`7. Select plan and verify order`, async () => {
            await billingPage.selectPlan();

            await billingPage.verifyOrder('Pro - $25.00 / Monthly', '$25.00', '$20.00', 'Discount (-20%)', '-$5.00');
        });
        await custom.wrappedTestStep(`8. Upgrade the plan`, async () => {
            await billingPage.upgradeAndSubmitMyApplication();

            await settingsPage.verifyComplianceActive();
        });

        await custom.wrappedTestStep(`9. Open 'Billing Overview' section`, async () => {
            await settingsPage.openBillingPage();

            await billingPage.verifyPlan({
                organization: newUser.account,
                plan: 'Pro 500 (Monthly)'
            });
        });

        await custom.wrappedTestStep(`10. Download and Open a Receipt`, async () => {
            let coupon20Month25 =  Coupon20Month25();
            const fileInfo = await billingPage.downloadLastReceipt();
            coupon20Month25.push(`${newUser.firstName} ${newUser.lastName}`);
            coupon20Month25.push(newUser.email.replace('.com', ''));
            await billingPage.verifyDownloadFile(fileInfo.content, coupon20Month25);
        });
    });
  
    test(qase(9668, '@QATEST-9668 Create Account With Blocked Domain (Straight URL)'), async ({ openAuthPage, custom, apiRequest }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        newUser.email = newUser.email.replace('qatest', 'gmail');
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });

        await custom.wrappedTestStep(`2. In the registration page fill email with free domain (qweqweqwe@gmail.com for example) -> Click to "continue" button`, async () => {
            await authPage.enterEmailAndContinue(newUser.email, false);

            await authPage.verifyMessageFormAlertInput('business address');
        });

        await custom.wrappedTestStep(`3. Go to straight URL https://qatest.com/register?anydomain -> fill email with free domain (qweqweqwe@gmail.com for example) -> Click to "continue" button`, async () => {
            await authPage.visitSignUpAnyDomainPage();
            await authPage.enterEmailAndContinue(newUser.email);
            
            await authPage.verifyTitleChooseCrmPage();
        });
    });

    test(qase(9665, '@QATEST-9665 Create Account With Blocked Domain'), async ({ openAuthPage, custom, apiRequest }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        newUser.email = newUser.email.replace('qatest', 'gmail');
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });

        await custom.wrappedTestStep(`2. place email with free domain (qweqweqwe@gmail.com for example) -> Click to "continue" button`, async () => {
            await authPage.enterEmailAndContinue(newUser.email, false);

            await authPage.verifyMessageFormAlertInput('business address');
        });
    });

    test(qase(9657, '@QATEST-9657 Sign Up Flow (Back To The Left Step)'), async ({ openAuthPage, custom, apiRequest }) => {
        const { authPage } = openAuthPage;
        let newUser = NewUser();
        await custom.wrappedTestStep(`1. Click "Sign Up" button.`, async () => {
            await authPage.clickSignUp();
        });

        await custom.wrappedTestStep(`2. Enter an email address -> "Continue" button.`, async () => {
            await authPage.enterEmailAndContinue(newUser.email);

            await authPage.verifyTitleChooseCrmPage();
        });

        await custom.wrappedTestStep(`3. Select any integration from the list -> "Next" button.`, async () => {
            await authPage.selectCrmOptionAndContinue("None");

            await authPage.verifyTitleCompanySizePage();
        });

        await custom.wrappedTestStep(`4. Select any team size from the list -> "Next" button.`, async () => {
            await authPage.selectCompanySizeOptionAndContinue("2-10 employees");

            await authPage.verifyTitleSendMessagesLocationPage();
        });

        await custom.wrappedTestStep(`5. Close the web tab.`, async () => {
            await authPage.visitGooglePage();
        });

        await custom.wrappedTestStep(`6. Open Qatest again (qatest.com/register?authv2).`, async () => {
            await authPage.visitSignUpPage();

            await authPage.verifyTitleSendMessagesLocationPage();
        });
    });

    test(qase(9804, '@QATEST-9804 Successfully logs in with correct credentials'), async ({ openAuthPage, userDetails, apiRequest }) => {
        const { authPage, conversationsPage } = openAuthPage;
        await authPage.authenticateUser({
            login: userDetails.email,
            password: userDetails.password
        });
        
        await conversationsPage.verifyLoginSuccess();
    });
    
    test(qase(5722, '@QATEST-5722 Successfully log Out'), async ({ start }) => {
        const { conversationsPage, authPage } = start;
        await conversationsPage.userIcon();
        await conversationsPage.logOutUser();

        await authPage.verifyLogOutSuccess();
    });
});

import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';

let { InviteMemberEmail, SignUpEmail } = require('../constants/emailMessages');
let inviteMemberEmail = InviteMemberEmail();
let signUpEmail = SignUpEmail();
const emailGmail = process.env.EMAIL_GMAIL as string;
test.describe('Clients', () => {
    test(qase(193, '@QATEST-193 Invite Client / Pro Monthly + Trial (Pay Upon Signup)'), async ({ start, custom}) => {
        const { clientsPage, userDetails, emailService } = start;
        const emailInviteToOrganization = emailGmail.replace('@', `${Date.now()}@`);
        await emailService.markAllEmailsAsRead(emailInviteToOrganization);
        await custom.wrappedTestStep(`1. Click to "Clients" button`, async () => {
            await clientsPage.openClientsPage();
        });

        await custom.wrappedTestStep(`2. Click Create Organization`, async () => {
            await clientsPage.createOrganizationButton();
        });

        await custom.wrappedTestStep(`3. Inter email to input field for invite user and click "Next" button`, async () => {
            await clientsPage.InviteToOrganization(emailInviteToOrganization);

            await clientsPage.verifyUpgradePlan('$15 /mo*','3k Credits per year');
        });

        await custom.wrappedTestStep(`4. Select "Monthly" condition`, async () => {
            await clientsPage.switchPlan('Monthly');

            await clientsPage.verifyUpgradePlan('$15 /mo','250 Credits per month');
        });

        await custom.wrappedTestStep(`5. Select a plan by slider and Click to "14-day free trial version" and click to "Next" button`, async () => {
            await clientsPage.changeMessageAmount('1k'); 
            await clientsPage.verifyUpgradePlan('$49 /mo','1k Credits per month');
            await clientsPage.freeTrialVersion();
            await clientsPage.nextButton();

            await clientsPage.verifyOrder('Pro - $49.00 / Monthly', '$49.00', '$49.00');
        });

        await custom.wrappedTestStep(`6. Select Pay Upon Sign Up tab and Click Create Organization`, async () => {
            await clientsPage.payUponSignup();
            await clientsPage.endCreateOrganization();

            await clientsPage.verifyPendingOrganizationList(emailInviteToOrganization);
            const inviteUrl = await clientsPage.getInviteLink(emailInviteToOrganization);
            inviteMemberEmail.body = inviteMemberEmail.body
                .replace('@InviteMember', `${userDetails.firstName} ${userDetails.lastName}`)
                .replace('@Organization', userDetails.account)
                .replace('@InviteLink', inviteUrl)
                .replace('organization', 'agency');
                inviteMemberEmail.subject = inviteMemberEmail.subject
                .replace('@InviteMember', `${userDetails.firstName} ${userDetails.lastName}`)
                .replace('@Organization', userDetails.account)
            await emailService.checkEmail(emailInviteToOrganization, inviteMemberEmail);
        });
    });
    
    test(qase(1028, '@QATEST-1028 Accept Invite / Pro Monthly + Trial (Pay Upon Signup)'), async ({ start, custom}) => {
        const { authPage, userDetails, conversationsPage, apiRequest, emailService } = start;
        const emailInviteToOrganization = emailGmail.replace('@', `${Date.now()}@`);
        await emailService.markAllEmailsAsRead(emailInviteToOrganization);
        const url = (await apiRequest.sendAgencyInvites(userDetails.token, emailInviteToOrganization)).url;
        await conversationsPage.clearCashCookies();
        await conversationsPage.openUrl(url);
        await custom.wrappedTestStep(`1. Fill in all fields -> Agree to the terms -> Click the Activate Account button`, async () => {
            await authPage.acceptInviteNewClient(emailInviteToOrganization);
            
            await authPage.verifyTitleGetYourBusinessNumberPage();
        });

        await custom.wrappedTestStep(`2. Select a state -> Area code -> Select any number -> Next -> Select any country -> Next`, async () => {
            await authPage.selectBusinessNumberWithLocalContinue();
            
            await authPage.verifyTitleYourTrialNumberPage();
        });

        await custom.wrappedTestStep(`3. Click the 'Try Qatest first'`, async () => {
            await authPage.copyTrialNumberAndContinue();
            const expectedInboxesList = ['All inboxes', 'Stefan Staren', 'Stefan Staren Trial'];
            await conversationsPage.verifyCompliancePageBeforeRegistration(expectedInboxesList);
        });

        await custom.wrappedTestStep(`4. Go to Email and verify to invitation link`, async () => {
            inviteMemberEmail.body = inviteMemberEmail.body
                .replace('@InviteMember', `${userDetails.firstName} ${userDetails.lastName}`)
                .replace('@Organization', userDetails.account)
                .replace('@InviteLink', url)
                .replace('organization', 'agency');
                inviteMemberEmail.subject = inviteMemberEmail.subject
                .replace('@InviteMember', `${userDetails.firstName} ${userDetails.lastName}`)
                .replace('@Organization', userDetails.account)
            await emailService.checkEmail(emailInviteToOrganization, inviteMemberEmail);
            signUpEmail.subject = signUpEmail.subject
                .replace('John', 'Stefan');
            signUpEmail.body = signUpEmail.body
                .replace('John', 'Stefan');
            await emailService.checkEmail(emailInviteToOrganization, signUpEmail);
        });
    });
});

import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';
const { InviteMemberEmail } = require('../constants/emailMessages');
let inviteMemberEmail = InviteMemberEmail();
const emailGmail = process.env.EMAIL_GMAIL as string;
test.describe('Members', () => {
    test(qase(65, '@QATEST-65 Invite Member (Member)'), async ({ start, custom }) => {
        const { userDetails, membersPage, settingsPage } = start;
        const newMember = emailGmail.replace('@', `${Date.now()}@`);
        await settingsPage.openMembersPage();
        await custom.wrappedTestStep(`1. Select "Invite Member" button`, async () => {
           await membersPage.inviteMember();

           await membersPage.verifyInviteMember()
        });

        await custom.wrappedTestStep(`2. Enter the email address to Email input field and click to "Add members"`, async () => {
            await membersPage.addMember({
                role: 'Member',
                email: newMember,
                assignment: 'Existing',
                inbox: `${userDetails.firstName} ${userDetails.lastName}`
            });

            await membersPage.verifyAddedMembers([
                {
                    email: newMember,
                    role: 'Member',
                    assignment: 'Existing inbox',
                    inbox: `${userDetails.firstName} ${userDetails.lastName}`
                }
            ]);
        });

        await custom.wrappedTestStep(`3. Click the "Send Invitations" button`, async () => {
            await membersPage.sendInvitations();

            await membersPage.verifySuccessMessageInvite();
            await membersPage.verifyActiveMemberTable([
                {
                    name: `${userDetails.firstName} ${userDetails.lastName}`,
                    role: 'Owner',
                    email: `${userDetails.email}`
                },
                {
                    name: `${userDetails.member?.firstName} ${userDetails.member?.lastName}`,
                    role: 'Member',
                    email: `${userDetails.member?.email}`
                }
            ]);
            await membersPage.verifyPendingMemberTable([
                newMember
            ]);
        });
    });

    test(qase(802, '@QATEST-802 Accept Invite (New Inbox) (Local Number)'), async ({ start, custom }) => {
        const { userDetails, conversationsPage, apiRequest, authPage, emailService } = start;
        const inviteMember = await apiRequest.inviteNewMember(userDetails.token, false);
        await conversationsPage.clearCashCookies();
        await conversationsPage.openUrl(inviteMember.url as string);
        await custom.wrappedTestStep(`1. Fill in all fields (First Name, Last Name, Phone Number, Password, Confirm Password, Agreed terms) -> Accept Invite`, async () => {
           await authPage.acceptInviteNewMember();
        });

        await custom.wrappedTestStep(`2. Go to Email and verify to invitation link`, async () => {
            inviteMemberEmail.body = inviteMemberEmail.body
                .replace('@InviteMember', `${userDetails.firstName} ${userDetails.lastName}`)
                .replace('@Organization', userDetails.account)
                .replace('@InviteLink', inviteMember.url);
                inviteMemberEmail.subject = inviteMemberEmail.subject
                .replace('@InviteMember', `${userDetails.firstName} ${userDetails.lastName}`)
                .replace('@Organization', userDetails.account)
            await emailService.checkEmail(inviteMember.email, inviteMemberEmail);
        });
    });

    test(qase(1019, '@QATEST-1019 Create Inbox (Toll-Free Number)'), async ({ start, custom }) => {
        const { userDetails, settingsPage, inboxesPage, apiRequest } = start;
        const newInbox = `inbox-${Date.now()}`;
        let newInboxNumber;
        const user = await apiRequest.getUsersMe(userDetails.token);
        const numbersAmount = user.data.subscription.numbers.left;
        if(numbersAmount !== 0) {
            await apiRequest.deleteBlingNumbers(userDetails.token, numbersAmount);
        }
        await custom.wrappedTestStep(`1. Go to Setting -> Inboxes`, async () => {
            await settingsPage.openInboxesPage();

            await inboxesPage.verifyAllInboxes([{
                name: `${userDetails.firstName} ${userDetails.lastName}`,
                owner: `${userDetails.firstName} ${userDetails.lastName}`,
                phone: userDetails.businessNumber
            }]);
        });
        await custom.wrappedTestStep(`2. Click New Inbox`, async () => {
            await inboxesPage.newInboxOpenVerify();
        });
        await custom.wrappedTestStep(`3. Place all fields -> Choose Toll-Free Number`, async () => {
            newInboxNumber = await inboxesPage.newInboxFill({
                name: newInbox,
                type: `Toll-Free Number`
            });
        });
        await custom.wrappedTestStep(`4. Hover over a price`, async () => {
            await inboxesPage.priceTooltipeOpenVerify();
        });
        await custom.wrappedTestStep(`5. Create new inbox`, async () => {
            await inboxesPage.createInbox();

            await inboxesPage.verifyAllInboxes([
                {
                    name: `${userDetails.firstName} ${userDetails.lastName}`,
                    owner: `${userDetails.firstName} ${userDetails.lastName}`,
                    phone: userDetails.businessNumber
                },
                {
                    name: newInbox,
                    owner: `${userDetails.firstName} ${userDetails.lastName}`,
                    phone: newInboxNumber
                },
            ]);
        });
    });
});

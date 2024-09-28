import { Page, expect, BrowserContext } from '@playwright/test';
import SettingsPage from './SettingsPage';
import { InviteMember, AddedMembersList, ActiveMembersList } from '../types/Types';


class MembersPage extends SettingsPage {
    page: Page;

    // Selectors
    private inviteMembersButtonSelector: string = '.header-right .button';
    private pageTitleSelector: string = '.page-title';
    private roleDropdownSelector: string = '.members__role-input .selectize-input';
    private roleDropdownSelectSelector: string = '.members__role-input .selectize-dropdown-content';
    private assignmentDropdownSelector: string = '.members__columns .column.is-2 .selectize-input .item';
    private inboxDropdownSelector: string = '.members__columns .column.is-2 .selectize-input .item';
    private inboxDropdownListSelector: string = '.members__columns .column.is-2 .option';
    private addedEmailToInputSelector: string = '.tag';
    private emailInputSelector: string = '[placeholder="Enter e-mail address or name"]';
    private addMembersButtonSelector: string = '.is-success.button';
    private membersListSelector: string = '.tableMembers:not(.tableMembers--hideThead) [draggable="false"]';
    private memberEmailSelector: string = '.member-name-content';
    private memberRoleSelector: string = '#dropdown-role .item';
    private memberAssignmentSelector: string = '#dropdown-assignment .item';
    private memberInboxSelector: string = '#dropdown-team_id .item';
    private sendInvitationsButtonSelector: string = '.button.is-primary';
    private memberActiveTabSelector: string = '[href="/settings/organization/members/active"]';
    private memberPendingTabSelector: string = '[href="/settings/organization/members/pending"]';
    private activeMemberNameSelector: string = '.member-name-content strong';
    private activeMemberRoleSelector: string = '[data-label="Role"]';
    private activeMemberEmailSelector: string = '[data-label="Email"]';
    private pendingMemberEmailListSelector: string = '.tableMembers--hideThead [draggable="false"] .member-name-content span';
    private successMessageSelector: string = '.toast-message';
    
    //Text fields
    private pageTitleText: string = 'Invite Member';
    private successInviteMessageText: string = 'Member invited successfully!';
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async inviteMember(): Promise<void> {
        await this.customClick(this.inviteMembersButtonSelector);
        await this.waitSpinnerLoader();
    }

    async verifyInviteMember(): Promise<void> {
        const pageTitle = await this.page.locator(this.pageTitleSelector).textContent();
        expect(pageTitle?.trim()).toBe(this.pageTitleText);
    }

    async addMember(member: InviteMember): Promise<void> {
        const roles = {
            'Member': '[data-value="member"]',
            'Observer': '[data-value="view_only"]',
            'Manager': '[data-value="manager"]',
            'Admin': '[data-value="admin"]'
        }
        const assignments = {
            'New': '[data-value="new-inbox"]',
            'Existing': '[data-value="existing-inbox"]',
        }
        if(member.role) {
            await this.customClick(this.roleDropdownSelector);
            const role = await this.page.locator(this.roleDropdownSelectSelector).locator(roles[member.role]);
            await this.customClick(role);
        }
        await this.customFill(this.emailInputSelector, member.email, {enter: true});
        await this.page.locator(this.emailInputSelector).press('Enter');
        await this.page.waitForSelector(this.addedEmailToInputSelector);
        if(member.assignment) {
            await this.customClick(this.assignmentDropdownSelector, {nth: 0});
            const assignment = await this.page.locator(assignments[member.assignment]);
            await this.customClick(assignment);
            if(member.assignment === 'Existing' && member.inbox) {
                await this.customClick(this.inboxDropdownSelector, {nth: 1});
                const role = await this.page.locator(this.inboxDropdownListSelector).getByText(member.inbox);
                await this.customClick(role);
            }
        }
        await this.customClick(this.addMembersButtonSelector);
        await this.waitSpinnerLoader();
    }

    async verifyAddedMembers(members: AddedMembersList): Promise<void> {
        const membersAmount = await this.page.locator(this.membersListSelector).count();
        expect(membersAmount).toBe(members.length);
        for(let i=0; i<membersAmount; i++) {
            const memberEmail = await this.page.locator(this.membersListSelector).nth(i).locator(this.memberEmailSelector).textContent();
            const memberRole = await this.page.locator(this.membersListSelector).nth(i).locator(this.memberRoleSelector).textContent();
            const memberAssignment = await this.page.locator(this.membersListSelector).nth(i).locator(this.memberAssignmentSelector).textContent();
            let memberInbox;
            if(await this.page.locator(this.membersListSelector).nth(i).locator(this.memberInboxSelector).count() !== 0) {
                memberInbox = await this.page.locator(this.membersListSelector).nth(i).locator(this.memberInboxSelector).textContent();
            }
            
            expect(memberEmail).toBe(members[i].email);
            expect(memberRole?.trim()).toBe(members[i].role);
            expect(memberAssignment?.trim().replace(/\u00A0/g, ' ')).toBe(members[i].assignment);
            expect(memberInbox?.trim()).toBe(members[i].inbox);
        }
    }

    async sendInvitations(): Promise<void> {
        await this.customClick(this.sendInvitationsButtonSelector);
    }

    async verifySuccessMessageInvite(): Promise<void> {
        await this.page.waitForSelector(this.successMessageSelector);
        const message = await this.page.locator(this.successMessageSelector).textContent();
        expect(message?.trim()).toBe(this.successInviteMessageText);
    }

    async verifyActiveMemberTable(members: ActiveMembersList): Promise<void> {
        await this.customClick(this.memberActiveTabSelector);
        await this.page.waitForSelector(this.membersListSelector);
        const membersAmount = await this.page.locator(this.membersListSelector).count();
        expect(membersAmount).toBe(members.length);
        for(let i=0; i<membersAmount; i++) {
            const memberEmail = await this.page.locator(this.membersListSelector).nth(i).locator(this.activeMemberEmailSelector).textContent();
            const memberRole = await this.page.locator(this.membersListSelector).nth(i).locator(this.activeMemberRoleSelector).textContent();
            const memberName = await this.page.locator(this.membersListSelector).nth(i).locator(this.activeMemberNameSelector).textContent();
            
            expect(memberEmail).toBe(members[i].email);
            expect(memberRole?.trim().replace(/\u00A0/g, ' ')).toBe(members[i].role);
            expect(memberName?.trim()).toBe(members[i].name);
        }
    }

    async verifyPendingMemberTable(members: string[]): Promise<void> {
        await this.customClick(this.memberPendingTabSelector); 
        await this.page.waitForSelector(this.pendingMemberEmailListSelector);
        const membersAmount = await this.page.locator(this.pendingMemberEmailListSelector).count();
        expect(membersAmount).toBe(members.length);
        for(let i=0; i<membersAmount; i++) {
            const memberEmail = await this.page.locator(this.pendingMemberEmailListSelector).nth(i).textContent();
            
            expect(memberEmail).toBe(members[i]);
        }
    }
}

export default MembersPage;

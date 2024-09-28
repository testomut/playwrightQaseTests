import { Locator, Page, expect, BrowserContext } from '@playwright/test';
import BasePage from './BasePage';
import { ConversationData, InputMessage, InputWithVerify, ConversationDetails, GlobalSearchResult } from '../types/Types';
const environmentUrl = process.env.ENVIRONMENT_URL as string;
const env = process.env.ENV;
const tokenENV = process.env[`TOKEN_${env}`] as string;

class ConversationsPage extends BasePage {
    page: Page;
    // Selectors
    private conversationLayoutHeaderTitleSelector: string = '[aria-label="ActiveConversationNameContainerHeader"]';
    private conversationNameSelector: string = '[aria-label="ConversationHeaderNameContainerHeader"] [aria-label="TypographyTitle"]';
    private getNewMessageButtonSelector: string = '[aria-label="ButtonNewMessage"]';
    private getInboxListSelector: string = '[role="listitem"]';
    private getInboxNameSelector: string = '[aria-label="TypographyName"]';
    private getConversationsListSelector: string = '[aria-label="ConversationCard"]';
    private getInboxesListSelector: string = '[role="list"] [aria-label="TypographyName"]';
    private messageInputSelector: string = '[placeholder="Write a message..."]';
    private noteInputSelector: string = '[placeholder="Type @ to mention..."]'
    private messagelistSelector: string = '[data-name="message"]';
    private toggleMessageInput: string = '[aria-label="ButtonSms"]';
    private submitMessageButton: string = '[aria-label="IconButtonSubmitMessageButton"]';
    private tagsMembersDropdownSelector: string = '[aria-label="DropdownContent"]';
    private getSmsButtonSelector: string = '[aria-label="ButtonSms"]';
    private getNoteButtonSelector: string = '[aria-label="ButtonNote"]';
    private getNewConversationNewMessageButtonSelector: string = '[aria-label="GetNewConversationNewMessageButtonSelector"]';
    private getNewConversationToInputSelector: string = '[aria-label="GetNewConversationToInputSelector"]';
    private getAddNewContactButton: string = '[aria-label="DropdownHeaderList"]';
    private getToInputAddNewContactButton: string = '[aria-label="DropdownContent"] [aria-label="Icon_Content"]';
    private addTagsButtonSelector: string = '[aria-label="addTagsButtonSelector"]';
    private tagsSectionSelector: string = '[aria-label="TypographyAddTagToggleBlock"]';
    private tagsListSelector: string = '[aria-label="tagsListItem"]';
    private searchInputSelector: string = '[aria-label="TagsTextFieldSearchInputSelector"]';
    private addedTagsListSelector: string = '[aria-label="AddedTagsListItem"]';
    private createTagButtonSelector: string = '[aria-label="createTagsButtonSelector"]';
    private selectContactToInputSelector: string = '[aria-label="DropdownContent"] [aria-label="Avatar"]';
    private allertMessageSelector: string = '[aria-label="Alert_Desc"]';
    private contactThreDoteSelector: string = '[aria-label="DropdownContactActions"]';
    private messagesCountIndicator: string = '[aria-label="TypographyMessage"]';
    private optInStatusSelector: string = '[aria-label="OptInStatusSelector"] [aria-label="OptInStatusSelector"]';
    private optInStatusEnabledSelector: string = '[aria-label="Enabled"]';
    private optInStatusDisabledSelector: string = '[aria-label="Disabled"]';
    private inputMessageDisabledSelector: string = '[aria-label="MessageField_disabled"]';
    private addEmojiSelector: string = '[aria-label="IconButtonEmojiPicker"]';
    private threeDotsInputSelector: string = '[aria-label="MessageField"] [aria-label="DropdownActions"]'; 
    private threeDotsConversationSelector: string = '[aria-label="DropdownThreeDotsConversationSelector"]';
    private shortenUrlSelector: string = '[aria-label="ButtonShortenUrl"]';
    private shortenUrlInputSelector: string = '[placeholder="Enter your URL"]';
    private addUrlButtonSelector: string = '[aria-label="ButtonAddUrl"]';
    private mergeFieldsButtonSelector: string = '[aria-label="ButtonMergeFields"]';
    private mergeFieldsListSelector: string = '[aria-label="Buttonundefined"] [aria-label="TypographyLabel"]';
    private showActivityButtonSelector: string = `[aria-label="ButtonShowActivity"]`;
    private hideActivityButtonSelector: string = `[aria-label="ButtonHideActivity"]`;
    private openConversationDetailsSelector: string = `[aria-label="TypographyToggleBlock"]`; //TODO: not unicale selector
    private conversationDetailsInboxSelector: string = `[aria-label="TypographyConversationDetailsInboxSelector"]`;
    private conversationDetailsInboxPhoneSelector: string = `[aria-label="TypographyConversationDetailsInboxPhoneSelector"]`;
    private conversationDetailsAssigneeSelector: string = `[aria-label="DropdownConversationDetailsAssigneeSelector_Wrap"] [aria-label="TypographyName"]`;
    private assigneesListSelector: string = `[aria-label="AssigneeListSelector"] [aria-label="TypographyName"]`;
    private activityTextListSelector: string = `[aria-label="TypographyText"]`;
    private searchSelector: string = `[aria-label="DropdownConversationHeaderSearch"] input`;
    private openSearchButtonSelector: string = `[aria-label="IconButtonConversationMenuSearch_Default"]`;
    private searchContactsSelector: string = `[aria-label="SearchContactsSelector"]`;
    private searchTagsSelector: string = `[aria-label="SearchTagsSelector"]`;
    private searchInboxesSelector: string = `[aria-label="SearchInboxesSelector"]`;
    private searchAssigneesSelector: string = `[aria-label="searchAssigneesSelector"]`;
    private searchResultListSelector: string = `[aria-label="SearchContactItem"]`;
    private searchResultPhoneSelector: string = `[aria-label="TypographyPhoneInfo"]`;
    private searchResultNameSelector: string = `[aria-label="TypographyTitle"]`;
    private searchResultEmailSelector: string = `[aria-label="TypographyEmail"]`;


    //Text fields
    private userCredentials: string = 'John Doe';
    private userCredentialsTrial: string = 'John Doe Trial';

    // Endpoints
    private beforeTrySalesmsgfirstRegistrationEndpoint: string = `${environmentUrl}/conversations`;
    private addNewConversationEndpoint: string = `${environmentUrl}/conversations/0`;
     
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async verifyInboxesList(inboxesList: string[]): Promise<void> {
        const locators = await this.page.locator(this.getInboxesListSelector).all();
        const foundInboxes = locators.length;
        const expectedInboxes = inboxesList.length;
        expect(foundInboxes).toBeGreaterThanOrEqual(expectedInboxes);
        
        const currentInboxesList = await Promise.all(locators.map(async (locator) => {
            const textContent = await locator.textContent();
            return textContent ? textContent.trim() : null;
        }));

        const expected = expect.arrayContaining(inboxesList);
        expect(currentInboxesList).toEqual(expected);
    }

    async verifyCompliancePageBeforeRegistration(inboxesList: string[]): Promise<void> {
        await this.page.waitForSelector(this.getNewMessageButtonSelector);
        const firstConversationName = (await this.page.locator(this.getInboxListSelector).locator(this.getInboxNameSelector).nth(1).textContent())?.trim();
        const getHeader = (await this.page.locator(this.conversationLayoutHeaderTitleSelector).textContent())?.trim();
        // expect(firstConversationName).toBe(this.userCredentials);
        expect(getHeader).toBe(inboxesList[1]);
        await expect(this.page).toHaveURL(this.beforeTrySalesmsgfirstRegistrationEndpoint);
        await this.verifyInboxesList(inboxesList);
    }

    async verifyLoginSuccess(): Promise<string> {
        const spinnerLoader = await this.page.locator(this.spinnerLoaderSelector).nth(2);
        // await spinnerLoader.waitFor();
        await spinnerLoader.waitFor({ state: 'detached' });
        const firstConversationName = (await this.page.locator(this.getInboxListSelector).locator(this.getInboxNameSelector).nth(1).textContent())?.trim();
        const getHeader = (await this.page.locator(this.conversationLayoutHeaderTitleSelector).textContent())?.trim();
        expect(firstConversationName).toBe(this.userCredentials);
        // expect(getHeader).toBe(this.userCredentialsTrial);
        await expect(this.page).toHaveURL(new RegExp(`https://${env}.qatest.com/conversations/\\d+\\?onload=`));
        const cookies = await this.page.context().cookies();
        return cookies.find(cookie => cookie.name === tokenENV)?.value as string;
    }

    async selectConversation(conversation: string): Promise<void> {
        const getConversation = await this.page.locator(this.getConversationsListSelector).getByText(conversation);
        await this.customClick(getConversation);
        await this.waitSpinnerLoader();
    }

    async conversationActivity(show: boolean): Promise<void> {
        await this.customClick(this.threeDotsConversationSelector, {nth: 0});
        await this.page.locator(this.showActivityButtonSelector).or(this.page.locator(this.hideActivityButtonSelector));
        if(show) {
            const isActivityButtonPresent = await this.page.locator(this.showActivityButtonSelector).count()>0
            if(isActivityButtonPresent) {
                await this.customClick(this.showActivityButtonSelector);
            }
        } else {
            const isActivityButtonhide = await this.page.locator(this.hideActivityButtonSelector).count()>0
            if(isActivityButtonhide) {
                await this.customClick(this.hideActivityButtonSelector);
            }
        }
    }

    async conversationDetailsOpen(tab = 1): Promise<void> {
        await this.customClick(this.openConversationDetailsSelector, {nth: 0, tab: tab});
    }

    async assigneeListOpen(): Promise<void> {
        const conversationDetailsAssignee = await this.page.locator(this.conversationDetailsAssigneeSelector).last();
        await this.customClick(conversationDetailsAssignee);
    }

    async verifyAssigneeList(assigneeList: string[]): Promise<void> {
        const typographyNameListCount = await this.page.locator(this.assigneesListSelector).count();
        for(let i=0; i<assigneeList.length; i++) {
            const assignee = await this.page.locator(this.assigneesListSelector).nth(typographyNameListCount-1-i).textContent() as string;
            const isAssigneePresent = assigneeList.includes(assignee);
            console.log(assignee)
            expect(isAssigneePresent).toBeTruthy();
        }
    }
    
    async selectAssignee(assignee: string): Promise<void> {
        const searchedAssignee = await this.page.locator(this.assigneesListSelector).getByText(assignee);
        await this.customClick(searchedAssignee);
    }

    async verifyLastActivityMessage(message: string): Promise<void> {
        const lastActivityMessage = await this.page.locator(this.activityTextListSelector).last().textContent();
        expect(lastActivityMessage).toBe(message);
    }

    async verifyConversationDetails(details:ConversationDetails, tab = 1): Promise<void> {
        const pages = await this.context.pages();
        const targetPage = pages[tab-1];
        const currentConversationDetailsInbox = await targetPage.locator(this.conversationDetailsInboxSelector).textContent();
        const currentConversationDetailsInboxPhone = await targetPage.locator(this.conversationDetailsInboxPhoneSelector).textContent();
        const currentConversationDetailsAssignee = await targetPage.locator(this.conversationDetailsAssigneeSelector).textContent();
        expect(currentConversationDetailsInbox).toBe(details.inbox);
        expect(currentConversationDetailsInboxPhone).toBe(details.inboxPhone);
        expect(currentConversationDetailsAssignee).toBe(details.assignee);
    }

    async conversationSearch(search: string): Promise<void> {
        const isSearchOpen = await this.page.locator(this.searchSelector).count() > 0;
        if(!isSearchOpen) {
            await this.customClick(this.openSearchButtonSelector);
        }
        await this.customFill(this.searchSelector, search);
        await this.waitSpinnerLoader();
    }

    async foundSearchResultByPhone(sectionSelector: Locator, phone: string): Promise<Locator> {
        const elementsAmount = await sectionSelector.locator(this.searchResultListSelector).count()
        
        for(let i = 0; i< elementsAmount; i++) {
            const searchResultPhone = await sectionSelector.locator(this.searchResultListSelector).nth(i).locator(this.searchResultPhoneSelector).textContent();
            console.log(searchResultPhone?.replace(/\D/g, ''), phone);
            if(searchResultPhone?.replace(/\D/g, '') === phone) {
                return await sectionSelector.locator(this.searchResultListSelector).nth(i);
            }
        }
        throw new Error(`Phone number ${phone} not found`);
    }

    async verifySearchResult(searchResult: GlobalSearchResult): Promise<void> {
        const contactsSection = this.page.locator(this.searchContactsSelector);
        const tagsSection = this.page.locator(this.searchTagsSelector);
        const inboxesSection = this.page.locator(this.searchInboxesSelector);
        const assigneesSection = this.page.locator(this.searchAssigneesSelector);

        if(searchResult && searchResult.contacts) {
            const contactsAmount = await contactsSection.locator(this.searchResultListSelector).count();
            const verifySearchResultAmount = contactsAmount >= searchResult.contacts.length;
            expect(verifySearchResultAmount).toBeTruthy();
            for(let i = 0; i< searchResult.contacts.length; i++) {
                const searchResultSelector = await this.foundSearchResultByPhone(contactsSection, searchResult.contacts[i].phone);
                const searchResultName = await searchResultSelector.locator(this.searchResultNameSelector).textContent();
                const searchResultEmail = await searchResultSelector.locator(this.searchResultEmailSelector).textContent();
                expect(searchResultName).toBe(searchResult.contacts[i].name);
                expect(searchResultEmail).toBe(searchResult.contacts[i].email);
            }
        }
    }

    async selectInbox(inbox: string): Promise<void> {
        const getConversation = await this.page.locator(this.getInboxesListSelector).getByText(inbox, {exact:true});
        const selectedInbox = await this.page.locator(this.conversationLayoutHeaderTitleSelector).textContent();
        await this.customClick(getConversation);
        if(selectedInbox !== inbox) {
            await this.waitSpinnerLoader(2);
        }
    }

    async verifySelectedInbox(inbox: string): Promise<void> {
        const selectedInbox = await this.page.locator(this.conversationLayoutHeaderTitleSelector).textContent();
        expect(selectedInbox).toBe(inbox);
    }

    async verifyConversation(conversation: ConversationData): Promise<void> {

        if(conversation.input === 'SMS') {
            await this.page.waitForSelector(this.getSmsButtonSelector);
            
        } else {
            await this.page.waitForSelector(this.getNoteButtonSelector);
        }
        if(conversation.name) {
            const conversationName = await (await this.page.locator(this.conversationNameSelector).textContent())?.trim() as string ;
            console.log(conversationName, conversation.name)
            expect(conversationName.replace(/\D/g, '')).toBe(conversation.name.replace(/\D/g, ''));
        }
        
        if(conversation.lastMessage) {
            await this.verifyText(this.page.locator(this.messagelistSelector).locator('[aria-label="TypographyBody"]').last(), conversation.lastMessage)
        }
    }  

    async toggleSmsNotebutton(): Promise<void> {
        await this.customClick(this.toggleMessageInput);
    }

    async isDisabledInput(): Promise<boolean> {
        return ((await this.page.locator(this.inputMessageDisabledSelector).count()) !== 0);
    }


    async clearInputMessage(): Promise<void> {
        const messageInput = await this.page.locator(this.messageInputSelector);
            const noteInput = await this.page.locator(this.noteInputSelector);
        await this.customFill(messageInput.or(noteInput), '');
    }

    async submitMessage(message?: string | InputMessage, submit = true, clickAfterType = false): Promise<void> {
        await this.waitSpinnerLoader();
        const disabled = await this.isDisabledInput();
        expect(disabled).toBeFalsy();
        const messageInput = await this.page.locator(this.messageInputSelector);
        const noteInput = await this.page.locator(this.noteInputSelector);
        if(typeof message === 'string' || message?.message) {
            let inputMessage;
            if(typeof message === 'string') {
                inputMessage = message;
            } else {
                inputMessage = message.message;
            }
            await this.customFill(messageInput.or(noteInput), inputMessage, {clear: false});
            if(clickAfterType) {
                await this.customClick(messageInput.or(noteInput));
            }
        } else if(typeof message === 'object' && message.smile) {
            await this.customClick(this.addEmojiSelector);
            await this.customClick(`[aria-label="${message.smile}"]`);
        } else if(typeof message === 'object'  && message.url) {
            await this.customClick(this.threeDotsInputSelector);
            await this.customClick(this.shortenUrlSelector);
            await this.customFill(this.shortenUrlInputSelector, message.url);
            await this.customClick(this.addUrlButtonSelector);
        } else if(typeof message === 'object'  && message.mergeFields) {
            await this.customClick(this.threeDotsInputSelector);
            await this.customClick(this.mergeFieldsButtonSelector);
            await this.waitSpinnerLoader();
            const mergeFieldSelector = await this.page.locator(this.mergeFieldsListSelector).getByText(message.mergeFields);
            await this.customClick(mergeFieldSelector);
        }
        if(submit) {
            const messageCount = + (await this.page.locator(this.messagesCountIndicator).locator('span').first().textContent() as string);
            await this.userIcon();
            await this.verifyEnoughBalanceForMessage(messageCount);
            await this.customClick(messageInput.or(noteInput));
            await this.customClick(this.submitMessageButton);
        }
    }

    async typeAndVerifyCombineMessage(fragment: InputWithVerify[]): Promise<void> {
        for(let i=0; i< fragment.length; i++) {
            await this.submitMessage(fragment[i].input, false);
            await this.verifyMessageInputLogic(fragment[i].verify);
        }
    }

    async verifyMessageInputLogic(message: string, mambersList = false): Promise<void> {
        const messageInput = await this.page.locator(this.messageInputSelector);
        const noteInput = await this.page.locator(this.noteInputSelector);
        const textInputMessage = await messageInput.or(noteInput).innerText() as string;
        expect(textInputMessage.trim()).toContain(message.trim());
        if(mambersList) {
            const isVisible = await this.page.locator(this.tagsMembersDropdownSelector).isVisible();
            expect(isVisible).toBeTruthy();
        }
    }

    async selectMemberAsTagInMessageInput(mamber: string): Promise<void> {
        const getMamber = await this.page.locator(this.tagsMembersDropdownSelector).getByText(mamber);
        await this.customClick(getMamber);
    }

    async openTags(): Promise<void> {
        const openDropdown = await this.isElementPresent(this.addTagsButtonSelector, 500);
        const openDropdownWithTag = await this.isElementPresent(this.addedTagsListSelector, 500);
        
        if(!openDropdown || !openDropdownWithTag) {
            await this.customClick(this.tagsSectionSelector);
        }

    }

    async clickAddTag(): Promise<void> {
        await this.openTags()
        await this.customClick(this.addTagsButtonSelector);

    }

    async verifyTagList(tags?: string[]): Promise<void> {
        const tagsList = await this.page.$$eval(this.tagsListSelector, elements =>
            elements.map(element => element.textContent?.trim() || '')
        );
        if (tags) {
            expect(tagsList.length).toBe(tags.length);
            for (const tag of tags) {
              expect(tagsList).toContain(tag);
            }
        } else {
            expect(tagsList.length).toBe(0);
        }
    }

    async typeTagName(name: string): Promise<void> {
        await this.customFill(this.searchInputSelector, name);
    }

    async verifyAddTags(tags?: string[]): Promise<void> {
        const tagsList = await this.page.$$eval(this.addedTagsListSelector, elements =>
            elements.map(element => element.textContent?.trim() || '')
        );
        if (tags) {
            expect(tagsList.length).toBe(tags.length);
            for (const tag of tags) {
              expect(tagsList).toContain(tag);
            }
        } else {
            expect(tagsList.length).toBe(0);
        }
    }

    async clickCreateTagButton(): Promise<void> {
        await this.customClick(this.createTagButtonSelector);
        const spinnerLoader = await this.page.locator(this.spinnerLoaderSelector).first();
        await spinnerLoader.waitFor({ state: 'detached' });
    }

    async verifyConversationTags(tags?: string[]): Promise<void> {
        const tagsList = await this.page.$$eval(this.addedTagsListSelector, elements =>
            elements.map(element => element.textContent?.trim() || '')
        );
        if (tags) {
            expect(tagsList.length).toBe(tags.length);
            for (const tag of tags) {
              expect(tagsList).toContain(tag);
            }
        } else {
            expect(tagsList.length).toBe(0);
        }
    }

    async addNewContact(phone: string): Promise<void> {
        await this.customFill(this.getNewConversationToInputSelector, phone);
        if((await this.page.locator(this.getToInputAddNewContactButton).count()) !== 0) {
            await this.customClick(this.getToInputAddNewContactButton);
        } else {
            await this.customClick(this.selectContactToInputSelector);
        }
    }

    async addNewConversation(phone:string) {
        const conversationsList = await this.page.locator(this.getConversationsListSelector);
        const conversationsWithNumber = await conversationsList.locator(`text=${phone}`).count();
        if(conversationsWithNumber === 0) {
            await this.customClick(this.getAddNewContactButton);
            await this.customClick(this.getNewConversationNewMessageButtonSelector);
            await this.addNewContact(phone);
            await this.submitMessage('Qa test');
            await this.waitSpinnerLoader(2);
        } else {
            console.log('The phone number already present')
        }
    }
        
    async verifyOptedOut(blocked: boolean): Promise<void> {
        const isDisabledImput = (await this.page.locator(this.inputMessageDisabledSelector).count() !== 0);
        if(blocked) {
            const alertMessage = await this.page.locator(this.allertMessageSelector).first().textContent() as string;
            expect(alertMessage.trim()).toContain('This contact has unsubscribed and will not receive messages');
            expect(isDisabledImput).toBe(true);  
        } else {
            expect(isDisabledImput).toBe(false); 
        } 
    }

    async getMessagesAmount(): Promise<number> {
        await this.waitSpinnerLoader();
        await this.page.waitForLoadState();
        await this.page.locator(this.inputMessageDisabledSelector);
        const ifChatBotPresent = await this.page.locator('iframe[name="intercom-notifications-frame"]').count() === 1;
        if(ifChatBotPresent) {
            await this.page.evaluate(() => {
                const iframe = document.querySelector('iframe[name="intercom-notifications-frame"]');
                if (iframe) {
                    iframe.remove();
                }
            });
        }
        return await this.page.locator(this.messagelistSelector).count();
    }

    async waitNewMessage(beforeMessagesAmount: number, amount?: number): Promise<void> {
        let currentMessagesAmount;
        for(let i=0; i<10; i++) {
            currentMessagesAmount = await this.getMessagesAmount();
            console.log(currentMessagesAmount);
            if(amount) {
                if(currentMessagesAmount === beforeMessagesAmount+amount) {
                    return;
                } 
            } else {
                if(currentMessagesAmount !== beforeMessagesAmount) {
                    return;
                }
            } 
        }
        if(amount) {
            throw new Error(`Current messages in conversation: ${currentMessagesAmount} but should be: ${beforeMessagesAmount+amount}`);
        } else {
            throw new Error(`Current messages in conversation: ${currentMessagesAmount} but should be more than: ${beforeMessagesAmount}`);
        }
    }

    async contactOptInStatusOpen(): Promise<void> {
        await this.customClick(this.contactThreDoteSelector);
        await this.customClick(this.optInStatusSelector, {nth:0});
    }

    async verifyOptInStatus(status: {subscribe:boolean}): Promise<void> {
        if(status.subscribe) {
            await this.page.waitForSelector(this.optInStatusEnabledSelector);
        } else {
            await this.page.waitForSelector(this.optInStatusDisabledSelector);
        }
    }

    

    async verifyMediaFileInConversation(file: 'audio' | 'img' | 'video' | 'doc' | string): Promise<void> {
        const messageList = await this.page.locator(this.messagelistSelector);
        if(file === 'img' ||  file === 'video' || file === 'audio') {
            if(file === 'video') {
                file = 'img[aria-hidden="true"]';

            }
            const url = (await messageList.locator(file).last().getAttribute('src') as string).split('blob:').find(str => str.includes("https")) as string;
            const response = await this.page.request.get(url);
            const buffer = await response.body();
            expect(buffer.byteLength).not.toBe(0);
        } else if(file === 'doc') {
            const fileSize = await messageList.locator(`[aria-label="TypographyInfo"]`).last().innerText();
            expect(fileSize.replace(/KB/g, "")).not.toBe(0);
        } else {
            const message = await messageList.locator('[aria-label="TypographyBody"]').last().textContent() as string;
            expect(message).toContain(file);
        }
    }
}

export default ConversationsPage;

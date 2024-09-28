
import { expect } from '@playwright/test';
import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';
import { NewContact } from '../types/Types';
const env = process.env.ENV;
const oldAccountPhone = process.env[`OLD_ACCOUNT_PHONE_${env}`] as string;

// Messages constant
const resubscribeMessage = 'test text'
const messageWith2Segments = `test text 2`;
const messageAllType = `symbols '«´»¼½¾÷ǃᴊᴋᴍᴏᴀᴛᴜᴄᴅᴇᴘᴠᴡᴢ᷍ʹʺʻʼʽˆˈˊˋː˖˜ˮ˷˸ ɪʏʜʟ ​‚‛“”„‟ ›‼⁎⁏ ɢɴʀʙ〝〞̴̷̸̦̰̲͇̂̃̓̔ ‐–—―‗‘’•…‹⁃⁄⁠∕∣　、。꞊ꜰꜱ꞉﹚﹛﹜﹟﹪﹫︐︑︓︔︕︖﹐﹑﹒﹔﹖﹗﹙﹠﹡﹢﹣﹤﹥﹦﹨﹩﻿＊＋，－．／！：；＜＝＞？＂ＪＫＬＭＮＯ＃Ｚ［＼］＾＿＄％｛｜｝～＆＇（）０１２３４５６７８９＠ＡＢＣＤＥＦＧＨＩＰＱＲＳＴＵＶＷＸＹ｡､'`;
const expectedMessageAllType = `symbols '"'"1/41/23/4/!JKMOATUCDEPVWZ^'"'''^''':+~"~: IYHL''""""<!!*;GNRB""^~'',~_~//= ----_''-...>-//|,.=FS:){}#%@'':;!?,,.;?!(&*+-<>=\\$*+,-./!:;<=>?"JKLMNO#Z[\\]^_$%{|}~&'()0123456789@ABCDEFGHIPQRSTUVWXY.,'`

test.describe('Conversations ', () => {
    test(qase(7288, '@QATEST-7288 Tag Member)'), async ({ start }) => {
        const { conversationsPage, userDetails } = start;
        const conversationName = `${userDetails.firstName} ${userDetails.lastName}`;
        await test.step('1. Select any conversation', async () => {
            await conversationsPage.selectConversation(conversationName);
            await conversationsPage.verifyConversation({
                name:conversationName,
                input: 'SMS'
            });
        });
        await test.step('2. Toggle SMS/Note button above the text field at the conversation screen', async () => {
            await conversationsPage.toggleSmsNotebutton();
            await conversationsPage.verifyConversation({
                name:conversationName,
                input: 'Note'
            });
        });
        await test.step(`3. Type '@' and observe a members list`, async () => {
            await conversationsPage.submitMessage(`@`,  false, true);
            await conversationsPage.verifyMessageInputLogic(`@`, true);
        });
        await test.step(`4. Select a member who is in the inbox`, async () => {
            await conversationsPage.selectMemberAsTagInMessageInput(`${userDetails.member?.firstName} ${userDetails.member?.lastName}`);
            await conversationsPage.verifyMessageInputLogic(`${userDetails.member?.firstName} ${userDetails.member?.lastName}`);
        });
        await test.step(`5. Send a note`, async () => {
            await conversationsPage.submitMessage();
            await conversationsPage.verifyConversation({
                name:conversationName,
                input: 'Note',
                lastMessage: `${userDetails.member?.firstName} ${userDetails.member?.lastName}`
            });
        });
    });

    test(qase(10115, '@QATEST-10115 Reassign Conversation'), async ({ start }) => {
        const { conversationsPage, userDetails } = start;
        await test.step(`1. Select conversation on shared inbox from description and open "Conversation" section on the right side`, async () => {
            await conversationsPage.selectConversation(`(111) 222-555`);
            await conversationsPage.conversationActivity(true);
            await conversationsPage.conversationDetailsOpen();

            await conversationsPage.verifyConversationDetails({
                inbox: `${userDetails.firstName} ${userDetails.lastName}`,
                inboxPhone: userDetails.businessNumber,
                assignee: `${userDetails.firstName} ${userDetails.lastName}`
            });
        });
        await test.step('2. Click to the field opposite "Assignee" field', async () => {
            await conversationsPage.assigneeListOpen();

            await conversationsPage.verifyAssigneeList([
                `${userDetails.firstName} ${userDetails.lastName}`, 
                `${userDetails.member?.firstName} ${userDetails.member?.lastName}`
            ]);
        });
        await test.step(`3. Select different member than it already selected`, async () => {
            await conversationsPage.selectAssignee(`${userDetails.member?.firstName} ${userDetails.member?.lastName}`);

            await conversationsPage.verifyConversationDetails({
                inbox: `${userDetails.firstName} ${userDetails.lastName}`,
                inboxPhone: userDetails.businessNumber,
                assignee: `${userDetails.member?.firstName} ${userDetails.member?.lastName}`
            });
            await conversationsPage.verifyLastActivityMessage(`${userDetails.firstName} ${userDetails.lastName} reassigned the conversation to ${userDetails.member?.firstName} ${userDetails.member?.lastName}`)
        });
    });

    test(qase(8399, '@QATEST-8399 Create and Apply Tag'), async ({ start, custom }) => {
        const { conversationsPage, userDetails, apiRequest } = start;
        const newTag = `New Tag`
        await apiRequest.deleteAllTags(userDetails.token);
        await custom.wrappedTestStep('1. Click the "Add tag" button in contact info', async () => {
            await conversationsPage.clickAddTag();
            await conversationsPage.verifyAddTags();
        });
        await custom.wrappedTestStep('2. Type any name for new tag on in "Search" field', async () => {
            await conversationsPage.typeTagName(newTag);
            await conversationsPage.verifyTagList();
        });
        await custom.wrappedTestStep('3. Click the "+Create tag" button', async () => {
            await conversationsPage.clickCreateTagButton();
            await conversationsPage.verifyAddTags([newTag]);
        });
        await custom.wrappedTestStep('4. Close add tag section and verify added tegs', async () => {
            await conversationsPage.toggleSmsNotebutton();
            await conversationsPage.verifyConversationTags([newTag]);
        });
    });

    test(qase(7823, '@QATEST-7823 Opt-Out Local&Toll-Free (Hard)'), async ({ start, custom }) => {
        const { conversationsPage, userDetails, apiRequest } = start;
        await custom.wrappedTestStep('1. Open a conversation.', async () => {
            await conversationsPage.selectConversation(oldAccountPhone);
            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'SMS'
            });
        });
        await custom.wrappedTestStep('2. Receive stop-word from the contact.', async () => {
            const amountMessages = await conversationsPage.getMessagesAmount();
            await apiRequest.sendMessageRecipient(userDetails.businessNumber, 'STOP');
            await conversationsPage.waitNewMessage(amountMessages, 2);
            await conversationsPage.verifyOptedOut(true);
            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'SMS',
                lastMessage:'You have successfully been unsubscribed. You will not receive any more messages from this number. Reply START to resubscribe.'
            });
        });
        await custom.wrappedTestStep('3. Go to contact info -> 3-dots -> Opt-in Status.', async () => {
            await conversationsPage.contactOptInStatusOpen();
            
            await conversationsPage.verifyOptInStatus({subscribe:false});
        });
        await apiRequest.sendMessageRecipient(userDetails.businessNumber, 'START');
    });

    test(qase(7825, '@QATEST-7825 Opt-In Local&Toll-Free (Hard)'), async ({ start, custom }) => {
        const { conversationsPage, userDetails, apiRequest } = start;
        const amountMessages = await conversationsPage.getMessagesAmount();
        await apiRequest.sendMessageRecipient(userDetails.businessNumber, 'STOP');
        await conversationsPage.waitNewMessage(amountMessages, 2);
        await custom.wrappedTestStep('1. Open conversation with hard opt-out', async () => {

            await conversationsPage.selectConversation(oldAccountPhone);
            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'SMS'
            });
            await conversationsPage.verifyOptedOut(true);
        });
        await custom.wrappedTestStep('2. Receive start-word from the opt-outed contact.', async () => {
            const amountMessages = await conversationsPage.getMessagesAmount();
            await apiRequest.sendMessageRecipient(userDetails.businessNumber, 'START');
            await conversationsPage.waitNewMessage(amountMessages, 2);
            await conversationsPage.verifyOptedOut(false);
            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'SMS',
                lastMessage: resubscribeMessage
            });
        });
        await custom.wrappedTestStep('3. Go to contact info -> 3-dots -> Opt-in Status.', async () => {
            await conversationsPage.contactOptInStatusOpen();
            
            await conversationsPage.verifyOptInStatus({subscribe:true});
        });
    });

    test(qase(10306, '@QATEST-10306 Receive Message'), async ({ start, custom }) => {
        const { conversationsPage, userDetails, apiRequest, amountMessages } = start;
        await custom.wrappedTestStep(`1. Make incoming message to user's shared inbox from contact, conversation user focused on`, async () => {
            await apiRequest.sendMessageRecipient(userDetails.businessNumber, 'Test Messsage');
            await conversationsPage.waitNewMessage(amountMessages, 1);
            await conversationsPage.selectConversation(oldAccountPhone);

            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'SMS',
                lastMessage: 'Test Messsage'
            });
        });
    });

    test(qase(10309, `@QATEST-10309 Start Conversation From All Inboxes (Conversation Doesn't Exist In Any Shared Inbox)`), async ({ start, custom }) => {
        const { conversationsPage, userDetails, apiRequest, contactsPage } = start;
        const randomNumber = Math.floor(Math.random() * 9999) + 1;
        const phoneNumber = `202555${randomNumber.toString().padStart(4, '0')}`;
        const contact: NewContact = {
            phone: phoneNumber,
        }
        await apiRequest.createContact(userDetails.token, contact);
        const balance = await apiRequest.getUserBalance(userDetails.token);
        expect(balance).not.toBe(0);
        await conversationsPage.selectInbox(`All inboxes`);
        await contactsPage.openContactsPage();
        await custom.wrappedTestStep(`1. Find the contact from precondition and click to "Send message" button opposite the contact's name`, async () => {
            await contactsPage.sendMessageContactsList(phoneNumber);

            await conversationsPage.verifyConversation({
                input:'SMS'
            });
        });
        await custom.wrappedTestStep(`2. Type any message and click to "Send" button`, async () => {
            await conversationsPage.submitMessage('test from contacts');

            await conversationsPage.verifySelectedInbox(`${userDetails.firstName} ${userDetails.lastName}`);
            await conversationsPage.verifyConversation({
                name:phoneNumber,
                input:'SMS',
                lastMessage: 'test from contacts'
            });
            await conversationsPage.userIcon();
            await conversationsPage.verifyUserBalance(balance - 1);
        });
    });

    test(qase(9716, '@QATEST-9716 Send Message (All Type of Data)'), async ({ start, custom }) => {
        const { conversationsPage, userDetails, apiRequest } = start;
        let amountMessages;
        const balance = await apiRequest.getUserBalance(userDetails.token);
        expect(balance).not.toBe(0);
        await custom.wrappedTestStep(`1. Select one conversation. Type a message with symbols, merge fields, image, video, file, vcard, emoticon, short link, custom field`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['audio', 'img', 'video', 'doc']);
            await conversationsPage.typeAndVerifyCombineMessage([
                {input:{message:`test message`}, verify: `test message`},
                {input:{smile: 'smiling face with sunglasses'}, verify: `😎`},
                {input:{smile: 'thumbs up sign'}, verify: `👍`},
                {input:{message: messageAllType}, verify: messageAllType},
                {input:{url: 'https://translate.google.by/'}, verify: `qatest.com`},
                {input:{mergeFields: 'User First Name'}, verify: userDetails.firstName},
                {input:{mergeFields: 'User Last Name'}, verify: userDetails.lastName},
            ]);
            amountMessages = await conversationsPage.getMessagesAmount();
        });
        await custom.wrappedTestStep('2. Click the "Send" button', async () => {
            await conversationsPage.submitMessage();
            await apiRequest.waitUserBalance(userDetails.token, balance - 2);
            await conversationsPage.waitNewMessage(amountMessages, 4); 
            await conversationsPage.verifyMediaFileInConversation('video');
            await conversationsPage.verifyMediaFileInConversation('img');
            await conversationsPage.verifyMediaFileInConversation('audio');
            await conversationsPage.verifyMediaFileInConversation('doc');
            await conversationsPage.verifyMediaFileInConversation(expectedMessageAllType);
            await conversationsPage.verifyMediaFileInConversation(`test message😎👍`);
            await conversationsPage.verifyMediaFileInConversation('qatest.com');
            await conversationsPage.verifyMediaFileInConversation(userDetails.firstName);
            await conversationsPage.verifyMediaFileInConversation(userDetails.lastName);
            await conversationsPage.userIcon();
            
            await conversationsPage.verifyUserBalance(balance - 2);
            
            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'SMS'
            });
        });
    });

    test(qase(9737, '@QATEST-9737 Send Note'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep('1. Select any conversation ob shared inbox from precondition and click to "SMS"button on high left corner on input field', async () => {
            await conversationsPage.toggleSmsNotebutton();
            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'Note'
            });
        });
        await custom.wrappedTestStep('2. Type any text and click to "Send" button', async () => {
            await conversationsPage.submitMessage(`Test Note`);
            
            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'Note',
                lastMessage: 'Test Note'
            });
        });
    });

    test(qase(6918, '@QATEST-6918 Send Message with Some Segments'), async ({ start, custom }) => {
        const { conversationsPage, userDetails, apiRequest } = start;
        const amountMessages = await conversationsPage.getMessagesAmount();
        const balance = await apiRequest.getUserBalance(userDetails.token);
        expect(balance).not.toBe(0); // verify user balance
        await conversationsPage.userIcon();
        await conversationsPage.verifyUserBalance(balance);
        await custom.wrappedTestStep('1. Type a message that contains some segments (e.g. 2) and send the message', async () => {
            await conversationsPage.submitMessage(messageWith2Segments);
            await conversationsPage.waitNewMessage(amountMessages, 1);
            await conversationsPage.verifyConversation({
                name:oldAccountPhone,
                input: 'SMS',
                lastMessage: messageWith2Segments
            });
        });
        await custom.wrappedTestStep('2. Observe the number of credits in this organization again', async () => {
            await apiRequest.waitUserBalance(userDetails.token, balance - 2);
            await conversationsPage.userIcon();
            
            await conversationsPage.verifyUserBalance(balance - 2);
        });
    });

    test(qase(9767, '@QATEST-9767 Upload Image - JPG'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload Image - JPG`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['img']);
        }); 
    });

    test(qase(9769, '@QATEST-9769 Upload Image - GIF'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload Image - GIF`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['gif']);
        }); 
    });

    test(qase(9775, '@QATEST-9775 Upload Image - PDF'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload Image - PDF`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['pdf']);
        }); 
    });

    test(qase(5142, '@QATEST-5142 Upload Image (>30mb)'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload Image (>30mb)`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['big']);
        }); 
    });

    test(qase(9786, '@QATEST-9786 Upload File As Franchise Client'), async ({ openAuthPage, custom }) => {
        const { authPage, conversationsPage } = openAuthPage;
        await custom.wrappedTestStep(`1. Upload File As Franchise Client`, async () => {
            await authPage.authenticateUser({
                login: 'qa.qwerty+test@qaqa.com',
                password: '123456789'
            });

            await conversationsPage.uploadAndVerifyFiles(['img']);
        }); 
    });

    test(qase(9772, '@QATEST-9772 Upload Video - MP4'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload Video - MP4`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['video']);
        }); 
    });

    test(qase(9777, '@QATEST-9777 Upload File - DOCX'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload File - DOCX`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['docx']);
        }); 
    });

    test(qase(9776, '@QATEST-9776 Upload File - DOC'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload File - DOC`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['doc']);
        }); 
    });

    test(qase(9778, '@QATEST-9778 Upload File - XLS'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload File - XLS`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['xls']);
        }); 
    });

    test(qase(9779, '@QATEST-9779 Upload File - XLSX'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload File - XLSX`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['xlsx']);
        }); 
    });

    test(qase(9780, '@QATEST-9780 Upload File - CSV'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload File - CSV`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['csv']);
        }); 
    });

    test(qase(9768, '@QATEST-9768 Upload Image - PNG'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload Image - PNG`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['png']);
        }); 
    });

    test(qase(9773, '@QATEST-9773 Upload Image - MOV'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload Image - MOV`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['mov']);
        }); 
    });

    test(qase(6848, '@QATEST-6848 Upload Image - VCARD'), async ({ start, custom }) => {
        const { conversationsPage } = start;
        await custom.wrappedTestStep(`1. Upload Image - VCARD`, async () => {
            await conversationsPage.uploadAndVerifyFiles(['vcard']);
        }); 
    });
});

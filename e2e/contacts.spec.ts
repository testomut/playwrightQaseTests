
import { expect } from '@playwright/test';
import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';
const emailGmail = process.env.EMAIL_GMAIL as string;


test.describe('Contacts ', () => {
    test(qase(10307, '@QATEST-10307 Search a New Contact Immediately After Creating'), async ({ start, custom }) => {
        const { conversationsPage, userDetails, apiRequest } = start;
        const randomNumber = Math.floor(Math.random() * 9999) + 1;
        const phoneNumber = `202555${randomNumber.toString().padStart(4, '0')}`;
        const newContact = {
            phone: phoneNumber,
            firstName: `Kait${Date.now()}`,
            lastName: `Lambert${Date.now()}`,
            email: emailGmail.replace('@', `${Date.now()}@`)
        };
        await apiRequest.createContact(userDetails.token, newContact);
        await conversationsPage.waitFunction(5000);
        await custom.wrappedTestStep(`1. Click to "Search" button and type contact's phone number from precondition`, async () => {
            await conversationsPage.conversationSearch(newContact.phone);

            await conversationsPage.verifySearchResult({
                contacts: [
                    {
                        name: `${newContact.firstName} ${newContact.lastName}`,
                        phone: newContact.phone,
                        email: newContact.email
                    },
                ]
            });
        });

        await custom.wrappedTestStep(`2. Search the contact from Preconditions by Email`, async () => {
            await conversationsPage.conversationSearch(newContact.email);

            await conversationsPage.verifySearchResult({
                contacts: [
                    {
                        name: `${newContact.firstName} ${newContact.lastName}`,
                        phone: newContact.phone,
                        email: newContact.email
                    }
                ]
            });
        });

        await custom.wrappedTestStep(`3. Search the contact from Preconditions by First Name`, async () => {
            await conversationsPage.conversationSearch(newContact.firstName);

            await conversationsPage.verifySearchResult({
                contacts: [
                    {
                        name: `${newContact.firstName} ${newContact.lastName}`,
                        phone: newContact.phone,
                        email: newContact.email
                    }
                ]
            });
        });

        await custom.wrappedTestStep(`4. Search the contact from Preconditions by Last Name`, async () => {
            await conversationsPage.conversationSearch(newContact.lastName);

            await conversationsPage.verifySearchResult({
                contacts: [
                    {
                        name: `${newContact.firstName} ${newContact.lastName}`,
                        phone: newContact.phone,
                        email: newContact.email
                    }
                ]
            });
        });
    });

    test(qase(8718, '@QATEST-8718 Save Contact Filter (Segment)'), async ({ start, custom }) => {
        const { userDetails, apiRequest, contactsPage } = start;
        const randomNumber = Math.floor(Math.random() * 9999) + 1;
        const phoneNumber = `202555${randomNumber.toString().padStart(4, '0')}`;
        const newContact = {
            phone: phoneNumber,
            firstName: 'Kait_first',
            lastName: 'Lambert_last',
            email: emailGmail.replace('@', `${Date.now()}@`)
        };
        await apiRequest.createContact(userDetails.token, newContact);
        await contactsPage.openContactsPage();
        const segmentsAmount = (await apiRequest.getSegments(userDetails.token)).total;
        await custom.wrappedTestStep(`1. Click to filter button`, async () => {
            await contactsPage.openVerifyFilterPopUp();
        });
        await custom.wrappedTestStep(`2. Select any condition and customize it`, async () => {
            await contactsPage.setConditions([
                {conditionType: 'firstName', condition: newContact.firstName, andOr: 'And'},
                {conditionType: 'phone', condition: newContact.phone}
            ])

            await contactsPage.verifyConditions(2,1)
        });
        await custom.wrappedTestStep(`3. Click to "Create segment" button`, async () => {
            await contactsPage.clickCreateSegmentAndVerify();
        });
        await custom.wrappedTestStep(`4. Enter the name to input field and click "Create" button`, async () => {
            const segmentName = `Segment - ${Date.now()}`
            await contactsPage.createNewSegment(segmentName);

            await contactsPage.verifySegmentList(segmentName, segmentsAmount+1);
            await contactsPage.verifyContactsList([
                {
                    name: `${newContact.firstName} ${newContact.lastName}`, 
                    phone: newContact.phone,
                    email: newContact.email
                }
            ]);
        });
    });
});

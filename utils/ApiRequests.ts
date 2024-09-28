import { Page, request, APIRequestContext } from '@playwright/test';
import { NewMember, NewContact, RegistrationData, PlanType, NewCustomField } from '../types/Types';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';
import { url } from 'inspector';
const tokenPath = path.resolve(__dirname, '../variables/token.json');
const token = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));
const environmentUrl = process.env.ENVIRONMENT_URL as string;
const oldAccountEmail = process.env.OLD_ACCOUNT_EMAIL as string;
const oldAccountPass = process.env.OLD_ACCOUNT_PASS as string;
const emailGmail = process.env.EMAIL_GMAIL as string;
const env = process.env.ENV;

class ApiPage {
    private page: Page;
    private apiContext: APIRequestContext | undefined;

    constructor(page: Page) {
        this.page = page;
    }

    private async initializeApiContext(): Promise<void> {
        if (!this.apiContext) {
            this.apiContext = await request.newContext();
        }
    }

    async getTeams(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/teams`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:getTeams]Failed to fetch teams: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async getTags(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/tags`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:getTags]Failed to fetch teams: ${response.status()} ${response.statusText()}`);
        }
    }

    async getMessagesSheduled(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/messages/scheduled`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:getMessages]Failed to fetch teams: ${response.status()} ${response.statusText()}`);
        }
    }

    async getUserBalance(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            const organization = JSON.parse(responseBody.toString('utf-8')).data.organization;
            console.log('API', organization.account_balance, organization.account_credits, organization.trial_credits)
            return organization.account_balance + organization.account_credits;
        } else {
            throw new Error(`[API:getUserBalance]Failed to fetch user balance: ${response.status()} ${response.statusText()}`);
        }
    }

    async getUsersMe(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/int/v5/core/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:getUsersMe]Failed to get Users Me: ${response.status()} ${response.statusText()}`);
        }
    }

    async getMessages(token: string, conversation: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/messages/${conversation}?limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            const messages = JSON.parse(responseBody.toString('utf-8'));
            console.log(messages);
            return ;
        } else {
            throw new Error(`[API:getUserBalance]Failed to fetch user balance: ${response.status()} ${response.statusText()}`);
        }
    }

    async getSegments(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/organization/segments/search?page=1&per_page=10'`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            const segments = JSON.parse(responseBody.toString('utf-8'));
            return segments;
        } else {
            throw new Error(`[API:getUserBalance]Failed to fetch user balance: ${response.status()} ${response.statusText()}`);
        }
    }

    async waitUserBalance(token: string, expectedBalance: number): Promise<any> {
        let balance;
        for (let i = 0; i < 10; i++) {
            balance = await this.getUserBalance(token);
            if (balance === expectedBalance) {
                return;
            }
            await this.page.waitForTimeout(1000);
        }
        throw new Error(`[API:waitUserBalance]The balance not updated. Current balance: ${balance}, but should be ${expectedBalance}`);
    }

    async deleteTag(token: string, tagId: number): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.delete(`https://api.dev.qatest.com/${env}/pub/v2.1/tags/${tagId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:deleteTag]Failed to delete tag: ${response.status()} ${response.statusText()}`);
        }
    }

    async register(newUser:RegistrationData): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/auth/register`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                "multiorganization_registration":false,
                "crm_id":0,
                "google_id":"",
                "first_name": newUser.firstName,
                "last_name": newUser.lastName,
                "organization_name": newUser.account,
                "number": newUser.phone,
                "email": newUser.email,
                "password": newUser.password,
                "terms":true,
                "smsCode":"",
                "country":"US",
                "city":"",
                "region":"",
                "lead_source":"",
                "ga_source":"",
                "ga_medium":"",
                "ga_term":"",
                "ga_content":"",
                "ga_campaign":"",
                "ga_referurl":"",
                "ga_ip":"",
                "utm_campaign":"",
                "utm_content":"",
                "utm_medium":"",
                "utm_source":"",
                "token":"tok_threeDSecureOptional",
                "plan":"",
                "coupon":"",
                "noCardTest":false,
                "timezone":"Europe/Warsaw",
                "new_billing":true,
                "answer_country":"US",
                "answer_team_size":"Just me",
                "answer_integration":"HubSpot",
                "number_vendor_key":""},
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:register]Failed registration: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
                `);
        }
    }

    async numbersSearch(token: string): Promise<any> {
        const searchData = {
            "country":"US",
            "state":"CA",
            "search":"951",
            "toll_free":"0"
        }
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/numbers/search`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: searchData,
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:numbersSearch]Failed to search numbers: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async numbers(token: string, number: string): Promise<any> {
        const searchData = {
            "country":"US",
            "state":"CA",
            "search":"951",
            "toll_free":"0"
        }
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/numbers`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                number: number
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:numbers]Failed to set business number: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async numbersPft(token: string, number: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/numbers/pft`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                "pft_number": number
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:numbersPft]Failed to set trial number: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async getFromPool(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/int/v5/core/numbers/get-from-pool?limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            const segments = JSON.parse(responseBody.toString('utf-8'));
            return segments;
        } else {
            throw new Error(`[API:getFromPool]Failed to get trial number: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async createUserApi(): Promise<RegistrationData> {
        const newUser = {
            email: emailGmail.replace('@', `${Date.now()}@`),
            crmOption: "None",
            companySize: "2-10 employees",
            location: "United States",
            firstName: "John",
            lastName: "Doe",
            account: `AutomationOrg${Date.now()}`,
            phone: "2025551234",
            businessNumber: "",
            trialNumber: "",
            password: "1111111",
            cardNumber: "4242424242424242",
            exp_date: "0730",
            cvc: "424",
            zip: "42424",
            token: '',
            created: true,
            member: undefined,
            contact: undefined
        }
        const user = await this.register(newUser);
        newUser.token = user.token.access_token;
        const numbers = await this.numbersSearch(newUser.token);
        newUser.businessNumber = numbers[0].formatted;
        await this.numbers(user.token.access_token, numbers[0].number);
        const trialNumber = await this.getFromPool(newUser.token);
        newUser.trialNumber = trialNumber[0].formatted_number;
        await this.numbersPft(newUser.token, trialNumber[0].formatted_number);
        return newUser;
    }

    async getContacts(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/contacts?length=10&page=1`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            const segments = JSON.parse(responseBody.toString('utf-8'));
            return segments;
        } else {
            throw new Error(`[API:getContacts]Failed to get Contacts: ${response.status()} ${response.statusText()}`);
        }
    }

    async uploadAttachment(token: string, filePath: string): Promise<any> {
        await this.initializeApiContext();
    
        const fileExtension = path.extname(filePath).toLowerCase();
        let mimeType: string;
    
        switch (fileExtension) {
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.mp4':
                mimeType = 'video/mp4';
                break;
            default:
                throw new Error(`[API:uploadAttachment] Unsupported file type: ${fileExtension}`);
        }
    
        const formData = new FormData();
        formData.append('number_of_files', '0');
        formData.append('files[]', fs.createReadStream(filePath), {
            contentType: mimeType,
            filename: path.basename(filePath)
        });

        const headers = {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        };
    
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/pub/v2.1/attachments/upload`, {
            headers: headers,
            data: formData
        });
    
        if (response.ok()) {
            const responseBody = await response.body();
            const segments = JSON.parse(responseBody.toString('utf-8'));
            return segments;
        } else {
            throw new Error(`[API:uploadAttachment] Failed to upload Attachment: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
                `);
        }
    }

    async createContact(token: string, contact: NewContact): Promise<any> {
        await this.initializeApiContext();
        let first_name = '';
        let last_name = '';
        let email = '';
        if(contact.firstName) {
            first_name = `&first_name=${contact.firstName}`;
        }
        if(contact.lastName) {
            last_name = `&last_name=${contact.lastName}`;
        }
        if(contact.email) {
            email = `&email=${contact.email.replace('+','%2B').replace('@','%40')}`;
        }
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/pub/v2.1/contacts?number=${contact.phone}${first_name}${last_name}${email}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:createContact]Failed to create Contact: ${response.status()} ${response.statusText()}`);
        }
    }

    async updateContactCustomField(token: string, contactPhone: string, customFieldName: string, value: string): Promise<any> {
        
        await this.initializeApiContext();
        const contactsList = await this.getContacts(token);
        const customFieldsList = await this.getCustomFields(token);
        const contactId = contactsList.data.find(contact => contact.formatted_number === contactPhone).id;
        const customKey = customFieldsList.data.find(customField => customField.name === customFieldName).key;
        const valueInput = value.replace(' ','%20');
       
        const response = await this.apiContext!.put(`https://api.dev.qatest.com/${env}/pub/v2.1/contacts/${contactId}/custom-fields?custom_field_key=${customKey}&value=${valueInput}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:updateContactCustomField]Failed to update Contact Custom Field: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
                `);
        }
    }

    async deleteAllTags(token: string): Promise<any> {
        await this.initializeApiContext();
        const tags = await this.getTags(token);
        if(tags.data.length !== 0) {
            for (const tag of tags.data) {
                await this.deleteTag(token, tag.id);
            }
        }
    }

    async deleteBlingNumbers(token: string, amount = 1): Promise<any> {
       
        await this.initializeApiContext();
        const response = await this.apiContext!.delete(`https://api.dev.qatest.com/${env}/int/v5/billing/numbers?delete_numbers_count=${amount}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:deleteBlingNumbers]Failed to delete Bling Numbers: ${response.status()} ${response.statusText()}`);
        }
    }

    async tags(token: string, label: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/tags`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                label: label
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:tags]Failed to create a new tag: ${response.status()} ${response.statusText()}`);
        }
    }

    async sendMessage(token: string, teamId: number, phoneNumber: string, message: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/pub/v2.1/messages`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                number: phoneNumber,
                message: message,
                team_id: teamId
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:sendMessage]Failed to send message: ${response.status()} ${response.statusText()}`);
        }
    }
    
    async sendInvites(token: string, email: string, teamId: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/organization/invites`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                items: [{
                    email: email,
                    permissions: {
                        broadcasts: true, 
                        triggers: true, 
                        reportingAndAnalytics: true, 
                        dataAndSecurity: true, 
                        inbox: true,
                        billing: true,
                        contactAccess: "can_access_all",
                        members: true
                    },
                    role: "member",
                    team_id: `${teamId}`,
                    use_organization_settings: true
                }]
            },
        });

        if (response.ok()) {
            console.log({
                email: email,
                permissions: {
                    broadcasts: true, 
                    triggers: true, 
                    reportingAndAnalytics: true, 
                    dataAndSecurity: true, 
                    inbox: true,
                    billing: true,
                    contactAccess: "can_access_all",
                    members: true
                },
                role: "member",
                team_id: `${teamId}`,
                use_organization_settings: true
            })
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:sendInvites]Failed to send invites: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async sendAgencyInvites(token: string, email: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/agency/invites`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: {
                "integration_teams":[],
                "email":email,
                "plan":"pro-monthly-1000",
                "pay_now":false,
                "trial":true,
                "name":"",
                "card_token":"",
                "card":"",
                "interval":"monthly",
                "payment_method":"null"
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:sendAgencyInvites]Failed to send invites: ${response.status()} ${response.statusText()} ${await response.body()}`);
        }
    }

    async acceptInvites(member: NewMember, invitationId: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/auth/register/accept`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                email: member.email,
                first_name: member.firstName,
                ga_campaign: "",
                ga_content: "",
                ga_ip: "",
                ga_medium: "",
                ga_referurl: "",
                ga_source: "",
                ga_term: "",
                invitation_id: invitationId,
                last_name: member.lastName,
                lead_source: "",
                number: member.phone,
                password: member.password,
                password_confirmation: member.password,
                terms: true
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();;
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:acceptInvites]Failed to accept invites: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async login(email: string, pass: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/2fa/auth/login`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                "email": email,
                "password": pass,
                "remember": false
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();;
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:login]Failed to login: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async upgradePlan(token: string, planType: PlanType): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/billing/upgrade/plan`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: {
                plan: planType
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();;
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:upgradePlan]Failed to upgrade plan: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async inviteNewMember(token: string, accept = true): Promise<NewMember> {
        let member = {
            email: emailGmail.replace('@', `${Date.now()}@`),
            firstName: 'Oliver', 
            lastName: 'Twist', 
            phone: `(202) 555-5555`, 
            password: '1111111',
            url: undefined
        };
        const teams = await this.getTeams(token);
        
        const teamId = teams.find( team => team.name === 'John Doe').id;
        const invitations = await this.sendInvites(token, member.email, teamId);
        const invite = invitations[0];
        if(accept) {
            await this.acceptInvites(member, invite.id);
            return member;
        } else {
            member.url = invite.url
            return member;
        }
        
    }

    async addCustomField(token: string, customField: NewCustomField): Promise<any> {
       
        await this.initializeApiContext();
        console.log(customField)
        const response = await this.apiContext!.post(`https://api.dev.qatest.com/${env}/int/v5/core/custom-fields/field`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            data: customField,
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:addCustomField]Failed to add Custom Field: ${response.status()} ${response.statusText()}`);
        }
    }

    async deleteCustomField(token: string, customFieldId: string): Promise<any> {
       
        await this.initializeApiContext();
        const response = await this.apiContext!.delete(`https://api.dev.qatest.com/${env}/int/v5/core/custom-fields/field/${customFieldId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:deleteCustomField]Failed to delete Custom Field: ${response.status()} ${response.statusText()}`);
        }
    }

    async getCustomFields(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/custom-fields/fields`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:getCustomFields] Failed to get Custom Fields: ${response.status()} ${response.statusText()}`);
        }
    }

    async getBroadcasts(token: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/broadcasts?page=1&length=10`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            return JSON.parse(responseBody.toString('utf-8'));
        } else {
            throw new Error(`[API:getBroadcasts] Failed to get Broadcasts: ${response.status()} ${response.statusText()}`);
        }
    }

    async waitBroadcastStatus(token: string, broadcastName: string, status: string): Promise<any> {
        const statuses = {
            'In progress': 'in_progress',
            'Finished': 'sent'
        }
        for (let i = 0; i < 120; i++) {
            const broadcastsList = await this.getBroadcasts(token);
            const searchBroadcast = broadcastsList.data.find(broadcast => broadcast.name === broadcastName);
            if(!searchBroadcast) {
                throw new Error(`[API:waitBroadcastStatus]The broadcast: ${broadcastName}, not found`);
            }
            if (searchBroadcast.status === statuses[status]) {
                return;
            }
            await this.page.waitForTimeout(1000);
        }
        throw new Error(`[API:waitBroadcastStatus]The broadcast: ${broadcastName}, with status ${status} not found`);
    }

    async deleteAllCustomFields(token: string): Promise<any> {
        await this.initializeApiContext();
        const customFields = (await this.getCustomFields(token)).data.filter(customField => customField.id);
        if(customFields.length !== 0) {
            for (const customField of customFields) {
                await this.deleteCustomField(token, customField.id);
            }
        }
    }

    async sendMessageRecipient(phoneNumber: string, message: string): Promise<void> {
        const oauthOld = await this.login(oldAccountEmail, oldAccountPass);
        await this.sendMessage(oauthOld.token.access_token, 100017437, phoneNumber, message);
    }

    async getMembers(token: string, conversation: string): Promise<any> {
        await this.initializeApiContext();
        const response = await this.apiContext!.get(`https://api.dev.qatest.com/${env}/pub/v2.1/messages/${conversation}?limit=10`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });

        if (response.ok()) {
            const responseBody = await response.body();
            const messages = JSON.parse(responseBody.toString('utf-8'));
            console.log(messages);
            return ;
        } else {
            throw new Error(`[API:getUserBalance]Failed to fetch user balance: 
                ${response.status()} 
                ${response.statusText()}
                ${await response.body()}
            `);
        }
    }

    async closeApiContext(): Promise<void> {
        if (this.apiContext) {
            await this.apiContext.dispose();
        }
    }
}

export default ApiPage;

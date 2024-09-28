import { Readable } from "stream";

// types/Types.ts
export interface RegistrationData { 
    email: string,
    crmOption: string,
    companySize: string,
    location: string,
    firstName: string, 
    lastName: string,
    account: string,
    phone: string, 
    businessNumber: string,
    trialNumber: string,
    password: string, 
    cardNumber: string,
    exp_date: string,
    cvc: string,
    zip: string,
    token: string,
    created: boolean,
    member?: NewMember | undefined,
    contact?: NewContact | undefined
}

export interface newUserDetails { 
    email: string,
    businessNumber: string,
    trialNumber: string,
    password: string,
}

export interface ConversationDetails { 
    inbox: string,
    inboxPhone: string,
    assignee: string
}

export interface LastRegistrationPageData { 
    firstName: string, 
    lastName: string, 
    phone: string, 
    password: string, 
    cardNumber?: string,
    exp_date?: string,
    cvc?: string,
    zip?: string,
}

export interface LastRegistrationClientsPageData {
    account: string,
    firstName: string, 
    lastName: string, 
    phone: string, 
    password: string, 
    cardNumber: string,
    exp_date: string,
    cvc: string,
    zip: string,
}

export interface EmailCheckData { 
    from: string,
    replyTo: string,
    body: string,
}

export interface ConversationData { 
    name?: string,
    input: string,
    lastMessage?: string,
}

export interface EmailData extends EmailCheckData {
    subject: string,
}

export interface InputMessage {
    smile?: string,
    url?: string,
    mergeFields?: string,
    message?:string
}

export interface NewMember {
    email: string,
    firstName: string, 
    lastName: string, 
    phone: string, 
    password: string,
    url?: string
}

export interface NewContact {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone: string;
}

export interface ContactInfo {
    email: string;
    name: string;
    phone: string;
}

export interface InboxItem {
    name: string;
    owner: string;
    phone: string;
    members?: string;
}

export interface GlobalSearchResult {
    contacts?: Array<ContactInfo>;
    tags?: Array<ContactInfo>;
    inboxes?: Array<ContactInfo>;
    assignees?: Array<ContactInfo>;
}

export interface InputWithVerify {
    input: InputMessage;
    verify: string;
}

export interface PlanInfo {
    organization: string;
    plan: string;
    downgrade?: string;
}

export interface NewInbox {
    name: string;
    type: 'Local Number' | 'Toll-Free Number';
}

export interface SetCondition {
    conditionType: ConditionsType;
    condition: string;
    andOr?: 'And' | 'Or'
}

export interface InviteMember {
    role?: MemberRole,
    email: string,
    assignment?: string,
    inbox?:string
}

export interface ActiveMember {
    name: string,
    email: string,
    role: MemberRole | 'Owner'
}

export interface ExportFileData {
    path: string,
    name: string,
    content: string
}

export interface TriggerBroadcastMessage {
    message?: string,
    mergeField?: string,
    emoji?: string,
    url?: string,
    file?: 'video' | 'img'
}

export interface NewCustomField {
    name: string,
    type: 'text' | 'url' | 'number' | 'date',
    visible: boolean,
}

export interface TriggerMessageTable {
    name: string,
    sentBy: string,
    total: string,
    success: string,
    replies: string,
    clicks: string,
    conversions: string,
    revenue: string,
    status: boolean
}

export interface BroadcastsTable {
    name: string,
    total: string,
    delivered: string,
    replies: string,
    clicks?: string,
    conversions?: string,
    status: string
}

export interface ConfirmSendBroadcast {
    total: string,
    skipped: string,
    credits: string
}

export interface NewTrigger {
    name: string,
    Integration?: 'Custom' | 'HubSpot' | 'Salesforce' | 'ActiveCampaign' | 'Keep',
    sendAs: string,
    tags?: string[],
    textMessage: Array<TriggerBroadcastMessage>
}

export interface NewBroadcast {
    name: string,
    sendFrom: string,
    contacts: string[],
    textMessage: Array<TriggerBroadcastMessage>
}

export interface PaymentMethod {
    cardNumber: string,
    date: string,
    primary:boolean
}

type MemberRole = 'Member' | 'Observer' | 'Manager' | 'Admin'
type MediaType = 'audio' | 'img' | 'video' | 'doc' | 'png' | 'docx' | 'xls' | 'xlsx' | 'csv' | 'mov' | 'vcard' | 'gif' | 'pdf' | 'big';
export type ConditionsType = 'firstName' | 'lastName' | 'phone' | 'email' | 'tags' | 'areaCode' | 'stateProvince';
export type ErrorMessagesType = 'exist email' | 'invalid format' | 'small password' | 'wrong phone' | 'empty email' | 'empty organization';
export type MessageFormAlertType = 'expire date' | 'invalid card' | 'declined card' | 'business address' | 'incomplete card' | 'incomplete date';
export type ExportFileType = 'csv' | 'txt';
export type CreditsAmount = 1000 | 2000 | 3000 | 4000 | 10000 | 20000 | 40000 | 60000 | 80000 | 100000;
export type IfBalanceFallsBelow = 100 | 200 | 400 | 600 | 1000 | 2000 | 3000 | 4000 | 5000 | 10000 | 20000 | 30000 | 40000;
export type MessagesAmount = '250' | '500' | '1k' | '2.5k' | '5k' | '7.5k' | '10k+' | '3k' | '6k' | '12k' | '30k' | '60k' | '90k' | '120k+';

export type PlanType = 'pro-monthly-500' | 'pro-monthly-1000' | 'pro-monthly-2500' | 'pro-monthly-5000' | 'pro-monthly-7500' | 'pro-yearly-6000' | 'pro-yearly-12000' | 'pro-yearly-30000' | 'pro-yearly-60000' | 'pro-yearly-90000'
export interface SetConditions extends Array<SetCondition> {}
export interface ContactsList extends Array<ContactInfo> {}
export interface MediaArray extends Array<MediaType> {}
export interface AddedMembersList extends Array<InviteMember> {}
export interface ActiveMembersList extends Array<ActiveMember> {}
export interface InboxesList extends Array<InboxItem> {}
export interface TriggerMessageTableList extends Array<TriggerMessageTable> {}
export interface BroadcastsTableList extends Array<BroadcastsTable> {}
export interface PaymentMethodList extends Array<PaymentMethod> {}
import { Page, expect } from '@playwright/test';
import { EmailData, EmailCheckData } from '../types/Types';
import * as imaps from 'imap-simple';
import { simpleParser } from 'mailparser';

class EmailService  {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async getEmail(subject: string, to: string): Promise<EmailCheckData | undefined> {
        const config = {
            imap: {
                user: process.env.EMAIL_GMAIL,
                password: process.env.EMAIL_GMAIL_PASS,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 300000,
                ignoreHTTPSErrors: true
            }
        };
    
        const connection = await imaps.connect({
            imap: {
                ...config.imap,
                tlsOptions: {
                    rejectUnauthorized: false
                }
            }
        });

        await connection.openBox('INBOX');

        const searchCriteria = ['UNSEEN', ['HEADER', 'SUBJECT', subject], ['TO', to]];
        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: true
        };

        const results = await connection.search(searchCriteria, fetchOptions);

        if (results.length > 0) {
            const parts = results[0].parts;

            const fullBody = parts.find((part: any) => part.which === '').body;
            const parsed = await simpleParser(fullBody);

            console.log(`Found email with subject: ${subject} and to: ${to}`);

            const emailFrom = parsed.from.value.map(addr => addr.address).join(', ');
            const emailReplyTo = parsed.replyTo ? parsed.replyTo.value.map(addr => addr.address).join(', ') : 'N/A';
            const emailBody = parsed.text;
            
            const emailData: EmailCheckData = {
                from: emailFrom,
                replyTo: emailReplyTo,
                body: emailBody,
            };
            
            await connection.end();
            return emailData;
        } else {
            await connection.end();
            return;
        }
    }

    async markAllEmailsAsRead(to: string): Promise<void> {
        const config = {
            imap: {
                user: process.env.EMAIL_GMAIL,
                password: process.env.EMAIL_GMAIL_PASS,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                authTimeout: 300000,
                ignoreHTTPSErrors: true
            }
        };
    
        const connection = await imaps.connect({
            imap: {
                ...config.imap,
                tlsOptions: {
                    rejectUnauthorized: false
                }
            }
        });
    
        await connection.openBox('INBOX');
    
        const searchCriteria = ['UNSEEN', ['TO', to]];
    
        const fetchOptions = {
            bodies: ['HEADER'],
            markSeen: true 
        };
    
        await connection.search(searchCriteria, fetchOptions);
    
        await connection.end();
    }

    async checkEmail(to: string, expectedEmailData: EmailData, timeout = 15): Promise<void> {
        let emailData;
        console.log(expectedEmailData.subject, to)
        for(let i = 0; i<timeout; i++) {
            emailData = (await this.getEmail(expectedEmailData.subject, to)) as EmailCheckData;
            if(!emailData) {
                await this.page.waitForTimeout(5000);
            } else {
                expect(emailData.from).toBe(expectedEmailData.from);
                expect(emailData.body.replace(/\s+/g, ' ').trim()).toBe(expectedEmailData.body.replace(/\s+/g, ' ').trim()); 
                return;
            }
        }
        if(!emailData) {
            throw new Error(`No email found with subject: ${expectedEmailData.subject}`);
        }
        
    }

    async checkPartEmailAndUrlsInside(to: string, subject: string, searchText: string[], timeout = 15): Promise<void> {
        let emailData;
        
        for(let i = 0; i<timeout; i++) {
            emailData = (await this.getEmail(subject, to)) as EmailCheckData;
            if(!emailData) {
                await this.page.waitForTimeout(5000);
            } else {
                for(let i = 0; i< searchText.length; i++) {
                    expect(emailData.body.replace(/\s+/g, ' ').trim()).toContain(searchText[i].replace(/\s+/g, ' ').trim());
                }

                const linksArray = emailData.body.replace(/\s+/g, ' ').trim().replace(/\[|\]|\(|\)/g, ' ').split(' ').filter(part => part.includes('https://'));
                for (const link of linksArray) {
                    const response = await fetch(link);
                    expect(response.status).toBe(200);
                }
                return;
            }
        }
        if(!emailData) {
            throw new Error(`No email found with subject: ${subject}`);
        }
        
    }
}

export default EmailService;

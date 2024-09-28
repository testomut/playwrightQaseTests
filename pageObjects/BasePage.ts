import { Page, expect, BrowserContext } from '@playwright/test';
import { MediaArray } from '../types/Types';
import CustomCommands from '../utils/CustomCommands';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
const environmentUrl = process.env.ENVIRONMENT_URL as string;
const env = process.env.ENV;
const tokenENV = process.env[`TOKEN_${env}`] as string;

const filePath = path.resolve(__dirname, '../constants/testData.json');
const videoPath = path.resolve(__dirname, '../files/test_video.mp4');
const audioPath = path.resolve(__dirname, '../files/test_audio.mp3');
const docxPath = path.resolve(__dirname, '../files/test_docx_file.docx');
const imagePath = path.resolve(__dirname, '../files/test_image.jpg');

const imagePathPng = path.resolve(__dirname, '../files/test_image.png');
const docPath = path.resolve(__dirname, '../files/test_doc_file.doc');
const xlsPath = path.resolve(__dirname, '../files/test_xls_file.xls');
const xlsxPath = path.resolve(__dirname, '../files/test_excel.xlsx');
const csvPath = path.resolve(__dirname, '../files/test_csv_file.csv');
const movPath = path.resolve(__dirname, '../files/test_video_mov.mov');
const vcardPath = path.resolve(__dirname, '../files/test_vcard.vcf');
const gifPath = path.resolve(__dirname, '../files/test_gif.gif');
const pdfPath = path.resolve(__dirname, '../files/test_pdf_file.pdf');
const bigPath = path.resolve(__dirname, '../files/test_image_more_30.tif');

dotenv.config();

class BasePage extends CustomCommands {

    // Selectors
    public userIconSelector: string = '[aria-label="DropdownMainDropdown"] [aria-label="Avatar_Name"]';
    public userBalance: string = '[aria-label="TypographyFormattedAccountCredits"]';
    public openContactsPageSelector: string = '[aria-label="NavLink_Contacts"]';
    public openAnalyticsPageSelector: string = '[href="/analytics"]';
    public settingsSelector: string = `[aria-label="TypographySettings"]`;
    public bannerAcceptSelector: string = '[data-tid="banner-accept"]';
    public applicationLoaderSelector: string = '.app-loader';
    protected appLoaderBarsSelector: string = '.app-loader-bars';
    protected switchV2ButtonSelector: string = '.switchDesignV2';
    protected spinnerLoaderSelector: string = '.MuiCircularProgress-circle';
    protected upgradeNowModalButtonSelector: string = '[aria-label="ButtonUpgradeNow"]';
    private openTriggersPageSelector: string = '[href="/triggers"]';
    private openBroadcastsPageSelector: string = '[href="/broadcasts"]';
    private openConversationsPageSelector: string = '[aria-label="NavLink_Conversations"]';
    private uploadFilesSelector: string = 'input[type="file"]';
    private addMediaSelector: string = '[aria-label="IconButtonMediaActionAddMedia_Default"]';
    private addedMediaFilesListSelector: string = '[aria-label="MessageField"] [aria-label="AttachmentCard"]';
    private openClientsPageSelector: string = '[href="/clients"]';
    private uploadAlertMessageSelector: string = '[aria-label="Alert_Desc"]';
    
    
    // Endpoints
    protected authEndpoint: string = `https://api.dev.qatest.com/${env}/int/v5/core/broadcasting/auth?connection=soketi`;
    
    // Text fields
    private logOutButtonTextField: string = 'Log out';
    private trySalesmsg2ButtonTextField: string = 'Try Qa test 2.0';
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        this.page = page;
        this.context = context;
    }

    async userIcon(): Promise<void> {
        await this.customClick(this.userIconSelector);
    }

    async openUrl(url: string): Promise<void> {
        await this.page.goto(url);
    }

    async visitGooglePage(): Promise<void> {
        await this.page.goto(`https://www.google.com/`, { waitUntil: 'load', timeout: 200000 });
    }
    async openConversationPage(): Promise<void> {
        await this.customClick(this.openConversationsPageSelector);
        await this.waitSpinnerLoader();
    }

    async openTriggersPage(): Promise<void> {
        await this.customClick(this.openTriggersPageSelector);
        await this.waitSpinnerLoader();
    }

    async openClientsPage(): Promise<void> {
        await this.customClick(this.openClientsPageSelector);
        await this.waitSpinnerLoader();
    }

    async openBroadcastsPage(): Promise<void> {
        await this.customClick(this.openBroadcastsPageSelector);
        await this.waitSpinnerLoader();
    }

    async verifyUserBalance(balance: number): Promise<void> {
        const currentBalance = + ((await this.page.locator(this.userBalance).textContent())?.replace(',','') as string);
        console.log(await this.page.locator(this.userBalance).textContent())
        expect(currentBalance).toBe(balance);
    }

    async verifyEnoughBalanceForMessage(messagesEqual: number): Promise<void> {
        const currentBalance = + ((await this.page.locator(this.userBalance).textContent())?.replace(',','') as string);
        if(currentBalance- messagesEqual <= 0) {
            throw new Error(`User can't send message. Current balance: ${currentBalance} credits but the user try to send ${messagesEqual} messages`);
        }
    }

    async logOutUser(): Promise<void> {
        await this.customClick(this.logOutButtonTextField, { selectorType: 'byText'});
    }

    async switchOnSecondVersion(): Promise<void> {
        await this.customClick(this.trySalesmsg2ButtonTextField, { selectorType: 'byText'});
    }

    async waitOauthResponseLoad(): Promise<void> {
        await Promise.all([
            this.page.waitForResponse(response => 
                response.url().includes(this.authEndpoint) &&
                response.status() === 200
            ),
            this.page.waitForRequest(request => 
                request.url().includes(this.authEndpoint)
            )
        ]);
        await this.clickIfElementPresent(this.switchV2ButtonSelector);
    }

    getUserDetails = () => {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    };

    setUserDetails = (details: any) => {
        const data = JSON.stringify(details, null, 2);
        fs.writeFileSync(filePath, data, 'utf-8');
    };

    async waitFunction(timeout: number) {
        await this.page.waitForTimeout(timeout);
    }

    async waitSpinnerLoader(nth = 0) {
        await this.page.waitForTimeout(2000);
        const spinnerLoader = await this.page.locator(this.spinnerLoaderSelector).nth(nth);
        await spinnerLoader.waitFor({ state: 'detached' });
    }

    async waitApplicationLoader() {
        await this.page.waitForTimeout(2000);
        const applicationLoader = await this.page.locator(this.applicationLoaderSelector);
        await applicationLoader.waitFor({ state: 'detached' });
    }

    async reload() {
        await this.page.reload();
        await this.waitApplicationLoader();
        await this.waitSpinnerLoader();
    }

    async oauthWithToken(token: string) {
        await this.context.addCookies([{
            name: tokenENV,
            value: token,
            domain: '.api.dev.qatest.com',
            path: `/${env}`,
            httpOnly: true, 
            secure: true,
        }]);
        
        await this.page.goto(`${environmentUrl}/conversations`);
        await this.waitApplicationLoader();
        await this.waitSpinnerLoader();
        
        await this.clickIfElementPresent(this.bannerAcceptSelector, {hidden: true});
    }

    async upgradeNowModal() {
        await this.customClick(this.upgradeNowModalButtonSelector);
    }

    async pause() {
        await this.page.pause();
    }

    async uploadFile(patch: string): Promise<void> {
        await this.customClick(this.addMediaSelector);
        const uploadFile = await this.page.locator(this.uploadFilesSelector).first();
        await uploadFile.setInputFiles(patch);
        await this.waitSpinnerLoader();
    }

    async uploadAndVerifyFiles(files: MediaArray): Promise<void> {
        for(let i=0; i<files.length; i++) {
            let patch = imagePath;
            let file: 'audio' | 'img' | 'video' | 'doc' | 'error' = 'img';
            if(files[i] === 'audio') {
                patch = audioPath;
                file = 'audio';
            } else if(files[i] === 'video') {
                patch = videoPath;
                file = 'video';
            } else if(files[i] === 'mov') {
                patch = movPath;
                file = 'video';
            } else if(files[i] === 'doc') {
                patch = docPath;
                file = 'doc';
            } else if(files[i] === 'docx') {
                patch = docxPath;
                file = 'doc';
            } else if(files[i] === 'xls') {
                patch = xlsPath;
                file = 'doc';
            } else if(files[i] === 'xlsx') {
                patch = xlsxPath;
                file = 'doc';
            } else if(files[i] === 'pdf') {
                patch = pdfPath;
                file = 'doc';
            } else if(files[i] === 'vcard') {
                patch = vcardPath;
                file = 'doc';
            } else if(files[i] === 'csv') {
                patch = csvPath;
                file = 'doc';
            } else if(files[i] === 'png') {
                patch = imagePathPng;
                file = 'img';
            } else if(files[i] === 'gif') {
                patch = gifPath;
                file = 'img';
            } else if(files[i] === 'big') {
                patch = bigPath;
                file = 'error';
            }
            await this.uploadFile(patch);
            await this.verifyMediaFileInput(file);
        }
    }

    async verifyMediaFileInput(file: 'audio' | 'img' | 'video' | 'doc' | 'error'): Promise<void> {
        console.log(file);
        const mediaFile = await this.page.locator(this.addedMediaFilesListSelector);
        if(file !== 'doc') {
            if(file !== 'error') {
                const url = (await mediaFile.locator(file).getAttribute('src',{timeout:10000}) as string).split('blob:').find(str => str.includes("https")) as string;
                const response = await this.page.request.get(url);
                const buffer = await response.body();
                expect(buffer.byteLength).not.toBe(0);
            } else {
                const message = await this.page.locator(this.uploadAlertMessageSelector).textContent();
                expect(message?.trim()).toBe('The file is too large. It must not exceed 30 MB')
            }
        } else {
            const fileSize = await mediaFile.locator(`[aria-label="TypographyInfo"]`).innerText();
            expect(fileSize.replace(/KB/g, "")).not.toBe(0);
        }
    }
}

export default BasePage;

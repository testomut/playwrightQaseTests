import { Page, Locator, test, expect, BrowserContext  } from '@playwright/test';
import { ClickAndLocatorOptions, LocatorCustomOptions, FillCustomOptions } from '../types/commands';

class CustomCommands {
    protected page: Page;
    protected context: BrowserContext;
    constructor(page: Page, context: BrowserContext) {
        this.page = page;
        this.context = context;

        // Handling pop-ups
        this.page.on('dialog', async dialog => {
            await dialog.accept();
        });
    }

    async customSelector(selector: string | Locator, options?: LocatorCustomOptions): Promise<Locator> {
        let nthLocator = 0;
        let tab = 1;
        
        if(options && options.nth) {
            nthLocator = options.nth;
        }
        if(options && options.tab) {
            tab = options.tab;
        }
        const pages = await this.context.pages();
        const targetPage = pages[tab-1];
        if(typeof selector === 'string') {
            if(options && options.selectorType && options.selectorType === 'byText') {
                return await targetPage.getByText(selector) as Locator;
            } else {
                return await targetPage.locator(selector, options).nth(nthLocator) as Locator;
            }
        }

        return selector;
    }

    async customClick(selector: string | Locator, options?: ClickAndLocatorOptions) {
        let tab = 1;
        if(options && options.tab) {
            tab = options.tab;
        }
        const pages = await this.context.pages();
        const targetPage = pages[tab-1];
        const locator = await this.customSelector(selector, options);
        await locator.waitFor({ state: 'visible', timeout: options?.timeout || 120000 });
        
        console.log(`User actions: Clicking on the element: "${(await locator.textContent())?.trim()}"`);
        await targetPage.waitForLoadState('load');
        await locator.click({trial:true});
        await locator.click({
            button: options?.button || 'left',
            clickCount: options?.clickCount || 1,
            delay: options?.delay || 0,
            force: options?.force || false,
            modifiers: options?.modifiers,
            noWaitAfter: options?.noWaitAfter || false,
            position: options?.position,
            trial: options?.trial || false
        });
        if(options?.hidden) {
            await locator.waitFor({ state: 'hidden', timeout: options?.timeout || 120000 });
        }
    }
    
    async customFill(selector: string | Locator, value: string, options?: FillCustomOptions) {
        let logs = true;
        let oldTextInput = '';
        let inputValue = value;
        if(options?.logs === false) {
            logs = options?.logs;
            inputValue = '*********';
        }
        const locator = await this.customSelector(selector, options);
        await locator.waitFor({ state: 'visible', timeout: options?.timeout || 120000 });
        console.log(`User actions: Typing ${inputValue} to "${(await locator.getAttribute('placeholder'))?.trim()}" input`);
        oldTextInput = await locator.textContent() as string;
        if(options && options.valueClear === false) {
            oldTextInput = await locator.inputValue() as string;
        }
        if(options && (options.clear === false || options.valueClear === false)) {
            await locator.fill(`${oldTextInput} ${value}`);
        } else {
            await locator.fill(value);
        }
        if(options && options.enter === true) {
            await locator.press('Enter');
        }
    }

    async isElementPresent(selector: string, timer = 2000): Promise<boolean> {
        try {
            await this.page.waitForSelector(selector, { state: 'attached', timeout: timer });
            return true;
        } catch {
            return false;
        }
    }

    async clickIfElementPresent(selector: string, options?: ClickAndLocatorOptions) {
        if(await this.isElementPresent(selector)) {
            const ifChatBotPresent = await this.page.locator('iframe[name="intercom-notifications-frame"]').count() === 1;
            if(ifChatBotPresent) {
                await this.page.evaluate(() => {
                    const iframe = document.querySelector('iframe[name="intercom-notifications-frame"]');
                    if (iframe) {
                        iframe.remove();
                    }
                });
            }
            await this.customClick(selector, options);
        } else {
            console.log(`User actions: Element with selector ${selector} was not found. The click will be missed.`);
        }
    }

    async wrappedTestStep(stepName: string, stepFunction: () => Promise<void>): Promise<void> {
        console.time(`[STEP] ${stepName}`);
        await test.step(stepName, stepFunction);
        console.timeEnd(`[STEP] ${stepName}`);
    }

    async verifyText(selector: string | Locator, text: string) {
        const locator = await this.customSelector(selector);
        const currentText = (await locator.innerText())
            .replace(/\s+/g, ' ')
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .trim();
        const expectedText = text
            .replace(/\s+/g, ' ')
            .replace(/[“”]/g, '"')
            .replace(/[‘’]/g, "'")
            .trim();
        console.log(currentText)
        console.log(expectedText)
        expect(currentText).toContain(expectedText);
    }

    async clearCashCookies() {
        await this.page.evaluate(() => localStorage.clear());
        await this.context.clearCookies();
        await this.page.waitForTimeout(1000);
    }
}

export default CustomCommands;

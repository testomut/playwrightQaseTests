import { Locator } from '@playwright/test';

    interface ClickOptions {
        button?: 'left' | 'right' | 'middle';
        clickCount?: number;
        delay?: number;
        force?: boolean;
        modifiers?: Array<'Alt' | 'Control' | 'ControlOrMeta' | 'Meta' | 'Shift'>;
        noWaitAfter?: boolean;
        position?: { x: number; y: number };
        timeout?: number;
        trial?: boolean;
    }
    
    interface LocatorOptions {
        has?: Locator;
        hasText?: string | RegExp;
        hasNotText?: string | RegExp;
        hasNot?: Locator;
        hasAttribute?: { name: string, value: string | RegExp };
    }

    interface FillOptions {
        timeout?: number;
        noWaitAfter?: boolean;
        force?: boolean;
        strict?: boolean;
      }
    
    interface CustomOptions {
        selectorType?: 'byLocator' | 'byText' ;
        nth?: number;
        logs?: boolean;
        hidden?: boolean;
        clear?: boolean;
        valueClear?: boolean;
        enter?: boolean;
        tab?: number;
    }
  
    export interface ClickAndLocatorOptions extends ClickOptions, LocatorOptions, CustomOptions {}
    export interface LocatorCustomOptions extends LocatorOptions, CustomOptions {}
    export interface FillCustomOptions extends FillOptions, LocatorOptions, CustomOptions {}

import { expect } from '@playwright/test';
import { test } from '../fixtures/fixtures';
import { qase } from 'playwright-qase-reporter';


test.describe('Billing', () => {
    test(qase(1343, '@QATEST-1343 Upgrade Plan (Monthly to Annual)'), async ({ start, custom }) => {
        const { settingsPage, billingPage, userDetails } = start;
        qase.title('Upgrade Plan (Monthly to Annual)');
        await custom.wrappedTestStep(`1. Open 'Billing Overview' section`, async () => {
            await settingsPage.openBillingPage();

            await billingPage.verifyPlan({
                organization: userDetails.account,
                plan: 'Pro 5000 (Monthly)'
            });
        });
        await custom.wrappedTestStep(`2. Select "Upgrade" button`, async () => {
            await billingPage.upgrade();

            await billingPage.verifyUpgradePlan('$179 /mo','5k credits per month');
        });
        await custom.wrappedTestStep(`3. Select the Annual tab`, async () => {
            await billingPage.annuallySwitch();

            await billingPage.verifyUpgradePlan('$151 /mo*','60k credits per year');
        });
        await custom.wrappedTestStep(`4. Upgrade the plan`, async () => {
            await billingPage.upgradePlan();

            await billingPage.verifyPlan({
                organization: userDetails.account,
                plan: 'Pro 60000 (Annual)'
            });
        });
    });

    test(qase(70, '@QATEST-70 Upgrade Plan (Trial - Banner) -> Without Toll Free Compliance Flow'), async ({ newFreeAccountSignIn, custom }) => {
        const { conversationsPage, settingsPage, billingPage, newUser } = newFreeAccountSignIn;
        await custom.wrappedTestStep(`1. Observe the banner "Your trial will expire in 14 days. Upgrade now" -> Click "Upgrade now"`, async () => {
            await conversationsPage.upgradeNowModal();

            await billingPage.verifyPlan({
                organization: newUser.account,
                plan: 'Trial (Monthly)'
            });
        });
        await custom.wrappedTestStep(`2. Observe the banner "Your trial will expire in 14 days. Upgrade now" -> Click "Upgrade now"`, async () => {
            await billingPage.upgrade();

            await billingPage.verifyUpgradePlan('$25 /mo','500 credits per month');
        });
        await custom.wrappedTestStep(`3. Select messages amount"`, async () => {
            await billingPage.changeMessageAmount('2.5k');

            await billingPage.verifyUpgradePlan('$99 /mo','2.5k credits per month');
        });
        await custom.wrappedTestStep(`4. Select plan and verify order`, async () => {
            await billingPage.selectPlan();

            await billingPage.verifyOrder('Pro - $99.00 / Monthly', '$99.00', '$99.00');
        });
        await custom.wrappedTestStep(`5. Upgrade the plan`, async () => {
            await billingPage.upgradeAndSubmitMyApplication();

            await settingsPage.verifyComplianceActive();
        });
        await custom.wrappedTestStep(`6. Open 'Billing Overview' section`, async () => {
            await settingsPage.openBillingPage();

            await billingPage.verifyPlan({
                organization: newUser.account,
                plan: 'Pro 2500 (Monthly)'
            });
        });
    });

    test(qase(1500, '@QATEST-1500 Downgrade Plan (Annual to Annual) Schedule'), async ({ annuallyUpdateAccountSignIn, custom }) => {
        const { userDetails, settingsPage, billingPage } = annuallyUpdateAccountSignIn;
        await custom.wrappedTestStep(`1. Open 'Billing Overview' section`, async () => {
            await settingsPage.openBillingPage();

            await billingPage.verifyPlan({
                organization: userDetails.account,
                plan: 'Pro 90000 (Annual)'
            });
        });
        await custom.wrappedTestStep(`2. Select "Upgrade" button`, async () => {
            await billingPage.upgrade();

            await billingPage.verifyUpgradePlan('$210 /mo*','90k credits per year');
        });
        await custom.wrappedTestStep(`3. Select credits less than was`, async () => {
            await billingPage.changeMessageAmount('12k');

            await billingPage.verifyUpgradePlan('$42 /mo*','12k credits per year');
        });
        await custom.wrappedTestStep(`4. Downgrade the plan`, async () => {
            await billingPage.upgradePlan();

            await billingPage.verifyPlan({
                organization: userDetails.account,
                plan: 'Pro 90000 (Annual)',
                downgrade: '(Downgrade to Pro 12000 (Annual)'
            });
        });
    });

    test(qase(1486, '@QATEST-1486 Buy Credits (Primary Card)'), async ({ start, custom }) => {
        const { userDetails, settingsPage, billingPage, apiRequest } = start;
        await settingsPage.openBillingPage();
        const balance = await apiRequest.getUserBalance(userDetails.token);
        const historyAmount = await billingPage.getPaymentHistoryAmount();
        await custom.wrappedTestStep(`1. Click the arrow next to Upgrade -> Buy credits`, async () => {
            await billingPage.openVerifyAddCredits();
        });
        await custom.wrappedTestStep(`2. Select amount to purchase -> Click the "Add Message Credits"`, async () => {
            await billingPage.addCredits(10000);
        });
        await custom.wrappedTestStep(`3. Refresh the page -> Observe the last payment and credit balance`, async () => {
            await billingPage.reload();
            
            await billingPage.paymentHistoryAmount(historyAmount+1);
            await billingPage.userIcon();
            await billingPage.verifyUserBalance(balance + 10000);
        });
    });

    test(qase(1644, '@QATEST-1644 Add Free Slots of Seat'), async ({ start, custom }) => {
        const { settingsPage, billingPage } = start;
        await settingsPage.openBillingPage();
        const historyAmount = await billingPage.getPaymentHistoryAmount();
        const seatsContent = await billingPage.getSeats() as string[];
        await custom.wrappedTestStep(`1. Click the arrow next to Upgrade -> Manage Seats`, async () => {
            await billingPage.openVerifyManageSeats();
        });
        await custom.wrappedTestStep(`2. Add 1 free slot of seat -> Click the "Confirm Purchase"`, async () => {
            await billingPage.addSeats('1');
        });
        await custom.wrappedTestStep(`3. Refresh the page -> Observe the last payment and Seats Remaining`, async () => {
            await billingPage.reload();
            
            await billingPage.paymentHistoryAmount(historyAmount+1);
            await billingPage.verifySeats(seatsContent, '1');
        });
    });

    test(qase(2098, '@QATEST-2098 Add Free Slots of Numbers'), async ({ start, custom }) => {
        const { settingsPage, billingPage } = start;
        await settingsPage.openBillingPage();
        const historyAmount = await billingPage.getPaymentHistoryAmount();
        const numbersContent = await billingPage.getNumbers() as string[];
        await custom.wrappedTestStep(`1. Click the arrow next to Upgrade -> Manage Numbers`, async () => {
            await billingPage.openVerifyManageNumbers();
        });
        await custom.wrappedTestStep(`2. Add 1 free slot of numbers -> Click the "Confirm Purchase"`, async () => {
            await billingPage.addNumbers('1');
        });
        await custom.wrappedTestStep(`3. Refresh the page -> Observe the last payment and numbers Remaining`, async () => {
            await billingPage.reload();
            
            await billingPage.paymentHistoryAmount(historyAmount+1);
            await billingPage.verifyNumbers(numbersContent, '1');
        });
    });

    test(qase(1954, '@QATEST-1954 Enable Auto Recharge (User Has 1 CC)'), async ({ start, custom }) => {
        const { settingsPage, billingPage } = start;
        await settingsPage.openBillingPage();
        await custom.wrappedTestStep(`1. Click on the Auto Recharge Settings button`, async () => {
            await billingPage.openVerifyConfigureAutoRecharge();
        });
        await custom.wrappedTestStep(`2. Toggle Auto Recharge on`, async () => {
            await billingPage.autoRecharge(true);
        });
        await custom.wrappedTestStep(`3. Observe credits amount in “If Balance Falls Below” drop-down list`, async () => {
            await billingPage.ifBalanceFallsBelow(600);
            
            await billingPage.verifyIfBalanceFallsBelow(600);
        });
        await custom.wrappedTestStep(`4. Select credits quantity and Auto Recharge payment method -> Click Save`, async () => {
            await billingPage.rechargeMyAccount(2000);
            await billingPage.configureAutoRechargeSave();

            await billingPage.verifyAutoRecharge(true);
        });
    });
});

const emailGmail = process.env.EMAIL_GMAIL as string;
const NewUser = () => ({
    email: emailGmail.replace('@', `${Date.now()}@`),
    crmOption: "None",
    companySize: "2-10 employees",
    location: "United States",
    firstName: "qa",
    lastName: "test",
    account: `AutomationOrg${Date.now()}`,
    phone: "2025551234",
    businessNumber: "",
    trialNumber: "",
    password: "123456789",
    cardNumber: "4242424242424242",
    exp_date: "0730",
    cvc: "424",
    zip: "42424",
    token: '',
    created: true,
    member: undefined,
    contact: undefined
});

module.exports = {
    NewUser
};
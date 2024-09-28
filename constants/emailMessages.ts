const SignUpEmail = () => ({
    subject: `You're in Qa - Plus, a quick question...`, 
    from: 'ceo@qatest.com',
    body: `
    Hi Qa,

    I really appreciate you joining us at Qatest and I know you'll love it when you see how easy it is to start having meaningful conversations with your leads and customers through simple little text messages.

    Before I had the idea for Qatest, I kept hearing the same problem from our customers at Call Loop...

    "We're calling people, but no one is returning our calls. We're sending emails, yet getting minimal replies. But like magic, when we send text messages, we get responses, setup appointments, qualify leads, and generate sales."

    And I'm excited to help you get amazing results too.

    If you wouldn't mind, I'd love it if you answered one quick question…

    Why did you sign up for Qatest?

    I'm asking because knowing what made you sign up is really helpful for us in making sure that we're delivering on what our users want. Just hit "reply" and let me know.
    `,
});

const InviteMemberEmail = () => ({
    subject: `@InviteMember invited you to @Organization on Qatest`, 
    from: 'noreply@qateest.com',
    body: `
    Hi,

You have been invited to join the @Organization organization on Qatest. Please click the link below to accept the invitation.

@InviteLink

If you don't want to accept the invitation please ignore this email. Your account will not be created until you the access the link above and set your password.
    `,
});

const ExportEmail = {
    subject: `Your export has been delivered`, 
    from: 'noreply@qatest.com',
    body: [
        'Hi , Your export has been delivered Download:',
        `Cheers, Qatest If you're having trouble clicking the \"Download\" button, copy and paste the URL below into your web browser:`,
        `2024 Qatest. All rights reserved.`
    ]
    ,
};

module.exports = {
    SignUpEmail,
    InviteMemberEmail,
    ExportEmail
};
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
    }
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to,
        subject,
        text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
};

module.exports = { sendEmail };

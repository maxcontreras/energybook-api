const nodemailer = require('nodemailer');
const mustache = require('mustache');
const fs = require('fs');



let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

module.exports = {
    sendMail(templatePath, templateVars, { to, subject }) {
        let template, html;
        try {
            template = fs.readFileSync(templatePath).toString();
            html = mustache.render(template, templateVars);
        } catch (e) {
            console.log("Error:", e);
            return Promise.reject();
        }
        const mailOptions = {
            from: `"Energybook" <${process.env.MAIL_USER}>`,
            to, subject, html
        };

        return transporter.sendMail(mailOptions)
    },
}
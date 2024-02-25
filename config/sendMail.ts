import nodemailer from "nodemailer";
import { smtpHost, smtpPort, smtpPassword, smtpService, smtpMail } from "../secret";
import ejs from "ejs";
import path from "path";

interface EmailOptions {
    email: string,
    subject: string,
    template: string,
    data: { [key: string]: any }
}

const sendMail = async (options: EmailOptions): Promise<void> => {
    const transporter = nodemailer.createTransport({
        service: smtpService,
        auth: {
            user: smtpMail,
            pass: smtpPassword,
        },
        host: smtpHost,
        port: parseInt(smtpPort || "465"),
        secure: true,
    });

    const { email, subject, template, data } = options;
    const templetaPath = path.join(__dirname, `../mails/${template}`)

    try {
        const html: string = await ejs.renderFile(templetaPath, data);

        const mailOptions = {
            from: smtpMail,
            to: email,
            subject,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        // console.log(info, "info");

    } catch (error) {
        console.error("Error occured while sending email", error);
        throw error;
    }
}

export default sendMail;

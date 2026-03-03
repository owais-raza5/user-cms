import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendPasswordResetEmail(to: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Password Reset Request",
        html: `<p>Click <a href="${link}">here</a> to reset your password`
    })
}

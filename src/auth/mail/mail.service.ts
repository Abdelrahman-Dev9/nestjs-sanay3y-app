import nodemailer from 'nodemailer';
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'abdoelnagar198@gmail.com',
    pass: 'jfci aots hxxs qvpe', // not your real password!
  },
});

export const sendResetCode = async (to: string, code: string) => {
  await transporter.sendMail({
    from: 'Auth App',
    to,
    subject: 'Password Reset Code',
    text: `Your reset code is: ${code}`,
  });
};

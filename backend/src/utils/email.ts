import nodemailer from 'nodemailer';
import { AppError } from '../middlewares/errorHandler';

// メール送信設定
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@teaching-practice.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new AppError('メールの送信に失敗しました', 500);
  }
};

// 教育者への新規連絡通知メール
export const sendNewContactNotification = async (
  educatorEmail: string,
  educatorName: string,
  practiceTitle: string,
  parentName: string,
  message: string
): Promise<void> => {
  const subject = `【新着連絡】${practiceTitle}に関するお問い合わせ`;
  
  const html = `
    <h2>新しい連絡が届きました</h2>
    <p>${educatorName}様</p>
    <p>「${practiceTitle}」に関して、${parentName}様からお問い合わせがありました。</p>
    
    <h3>メッセージ内容：</h3>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
    
    <p style="margin-top: 20px;">
      管理画面から詳細を確認し、返信してください。<br>
      <a href="${process.env.FRONTEND_URL}/admin/contacts">管理画面へ</a>
    </p>
    
    <hr style="margin-top: 30px;">
    <p style="font-size: 12px; color: #666;">
      このメールは授業実践紹介プラットフォームから自動送信されています。
    </p>
  `;

  const text = `
新しい連絡が届きました

${educatorName}様

「${practiceTitle}」に関して、${parentName}様からお問い合わせがありました。

メッセージ内容：
${message}

管理画面から詳細を確認し、返信してください。
${process.env.FRONTEND_URL}/admin/contacts

---
このメールは授業実践紹介プラットフォームから自動送信されています。
  `;

  await sendEmail({
    to: educatorEmail,
    subject,
    text,
    html,
  });
};
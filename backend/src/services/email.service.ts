import nodemailer from 'nodemailer';
import { config } from '../config/app.config';
import logger from '../utils/logger'; // Assuming you have a logger utility

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure, // true for 465, false for other ports
      auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass,
      },
    });

    // Verify connection configuration (optional, good for startup check)
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('Email transporter verification failed:', error);
      } else {
        logger.info('Email transporter is ready to send messages');
        // For Ethereal, log the preview URL if available
        if (config.email.host === 'smtp.ethereal.email') {
            logger.info('Using Ethereal Email for testing');
        }
      }
    });
  }

  async sendMail({ to, subject, text, html }: MailOptions): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: config.email.from,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      if (config.email.host === 'smtp.ethereal.email') {
        logger.info('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      logger.error('Error sending email:', error);
      // Consider re-throwing or handling the error appropriately
      throw new Error('Failed to send email');
    }
  }

  // Updated invitation email with better formatting and branding
  async sendInvitationEmail(to: string, invitationLink: string, inviterName: string, workspaceName: string): Promise<void> {
    const subject = `You're invited to join ${workspaceName} on KarmaBhumi!`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4f46e5; padding: 20px; text-align: center; }
          .header h1 { color: white; margin: 0; }
          .content { padding: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 24px; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Team Invitation</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>${inviterName}</strong> has invited you to collaborate on the <strong>${workspaceName}</strong> workspace in KarmaBhumi.</p>
            <p>Join this workspace to collaborate on projects, track tasks, and work together efficiently.</p>
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">Accept Invitation</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; font-size: 14px;">${invitationLink}</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} KarmaBhumi. All rights reserved.</p>
            <p>This is an automated email, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Hello,

${inviterName} has invited you to collaborate on the ${workspaceName} workspace in KarmaBhumi.

Join this workspace to collaborate on projects, track tasks, and work together efficiently.

Accept the invitation: ${invitationLink}

If you didn't expect this invitation, you can safely ignore this email.

© ${new Date().getFullYear()} KarmaBhumi. All rights reserved.
    `;

    await this.sendMail({
      to,
      subject,
      html,
      text,
    });
  }
}

// Export a singleton instance
export const emailService = new EmailService();

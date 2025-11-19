/**
 * Email Service for sending notifications
 * 
 * This is a basic implementation that logs emails to console.
 * In production, replace with actual email service (SendGrid, AWS SES, etc.)
 */

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  /**
   * Send an email (currently logs to console, upgrade to real service in production)
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    console.log('\n========== EMAIL NOTIFICATION ==========');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('--- TEXT VERSION ---');
    console.log(options.text);
    if (options.html) {
      console.log('\n--- HTML VERSION ---');
      console.log(options.html);
    }
    console.log('========================================\n');
    
    // In production, replace with actual email service:
    // await sendgrid.send({ ... })
    // await ses.sendEmail({ ... })
  }

  /**
   * Send an organization invitation email
   */
  async sendInvitationEmail(params: {
    email: string;
    organizationName: string;
    inviterName: string;
    role: string;
    token: string;
    expiresAt: Date;
  }): Promise<void> {
    const { email, organizationName, inviterName, role, token, expiresAt } = params;
    
    // Construct base URL - matches password reset pattern
    const baseUrl = process.env.REPL_SLUG 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` 
      : 'http://localhost:5000';
    const acceptUrl = `${baseUrl}/accept-invitation/${token}`;
    const expiryDate = new Date(expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const subject = `You've been invited to join ${organizationName} on RiskFixer`;
    
    const text = `
Hello,

${inviterName} has invited you to join ${organizationName} as a ${role}.

To accept this invitation, visit the following link:
${acceptUrl}

This invitation will expire on ${expiryDate}.

If you don't have a RiskFixer account yet, you can sign up and then use this link to join the organization.

Thanks,
The RiskFixer Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Organization Invitation</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
      <p style="text-align: center;">
        <a href="${acceptUrl}" class="button">Accept Invitation</a>
      </p>
      <p><small>Or copy and paste this link into your browser:<br>${acceptUrl}</small></p>
      <p><strong>Note:</strong> This invitation will expire on ${expiryDate}.</p>
      <p>If you don't have a RiskFixer account yet, you can sign up and then use this link to join the organization.</p>
    </div>
    <div class="footer">
      <p>Thanks,<br>The RiskFixer Team</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    await this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }
}

export const emailService = new EmailService();

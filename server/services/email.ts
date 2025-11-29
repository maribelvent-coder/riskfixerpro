/**
 * Email service for sending organization invitations
 * Currently uses console.log for development - replace with actual email provider later
 */

export async function sendInvitationEmail(email: string, token: string): Promise<boolean> {
  try {
    // Build the invitation URL - matches frontend AcceptInvitation page route
    const baseUrl = process.env.REPL_SLUG 
      ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER || ''}.repl.co`
      : 'http://localhost:5000';
    
    const inviteUrl = `${baseUrl}/accept-invitation/${token}`;
    
    // Development: Log the invitation instead of sending email
    console.log('='.repeat(60));
    console.log('ORGANIZATION INVITATION EMAIL');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Subject: You've been invited to join an organization`);
    console.log('');
    console.log('Message:');
    console.log('You have been invited to join an organization on RiskFixer.');
    console.log('');
    console.log('Click the link below to accept the invitation and create your account:');
    console.log(inviteUrl);
    console.log('');
    console.log('This invitation expires in 7 days.');
    console.log('='.repeat(60));
    
    return true;
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return false;
  }
}

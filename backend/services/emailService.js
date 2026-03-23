const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Email when someone applies to a job
const sendApplicationNotification = async (recruiterEmail, recruiterName, jobTitle, candidateName, candidateEmail) => {
  try {
    await resend.emails.send({
      from: 'WorkHena <onboarding@resend.dev>',
      to: recruiterEmail,
      subject: `New Application for ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">New Job Application Received! 🎉</h2>
          <p>Hi ${recruiterName},</p>
          <p>You have received a new application for your job posting:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">${jobTitle}</h3>
            <p><strong>Candidate:</strong> ${candidateName}</p>
            <p><strong>Email:</strong> ${candidateEmail}</p>
          </div>
          <p>Log in to your WorkHena dashboard to review the application and respond to the candidate.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Application
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    });
    console.log('✅ Application notification email sent to recruiter');
  } catch (error) {
    console.error('❌ Error sending application notification:', error);
  }
};

// Email when application status changes
const sendStatusUpdateNotification = async (candidateEmail, candidateName, jobTitle, companyName, status) => {
  const statusMessages = {
    'reviewed': 'has been reviewed by the hiring team',
    'accepted': 'has been accepted! Congratulations! 🎉',
    'rejected': 'status has been updated'
  };

  const statusColors = {
    'reviewed': '#3B82F6',
    'accepted': '#10B981',
    'rejected': '#6B7280'
  };

  try {
    await resend.emails.send({
      from: 'WorkHena <onboarding@resend.dev>',
      to: candidateEmail,
      subject: `Application Update: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${statusColors[status]};">Application Status Update</h2>
          <p>Hi ${candidateName},</p>
          <p>Your application for the following position ${statusMessages[status] || 'has been updated'}:</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1F2937;">${jobTitle}</h3>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColors[status]}; font-weight: bold;">${status.toUpperCase()}</span></p>
          </div>
          ${status === 'accepted' ?
          '<p>🎉 <strong>Congratulations!</strong> The hiring team will contact you soon with next steps.</p>' :
          '<p>You can view more details in your WorkHena dashboard.</p>'
        }
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Dashboard
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    });
    console.log('✅ Status update email sent to candidate');
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
  }
};

// Email when admin deletes a job
const sendJobDeletionNotification = async (recruiterEmail, recruiterName, jobTitle, companyName, reason) => {
  try {
    await resend.emails.send({
      from: 'WorkHena <onboarding@resend.dev>',
      to: recruiterEmail,
      subject: `Job Posting Removed: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Job Posting Removed</h2>
          <p>Hi ${recruiterName},</p>
          <p>We're writing to inform you that your job posting has been removed from WorkHena:</p>
          <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <h3 style="margin-top: 0; color: #1F2937;">${jobTitle}</h3>
            <p><strong>Company:</strong> ${companyName}</p>
          </div>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason for removal:</strong></p>
            <p style="margin: 10px 0 0 0; color: #4B5563;">${reason}</p>
          </div>
          <p>If you believe this was done in error or have questions, please contact our support team.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    });
    console.log('✅ Job deletion notification sent to recruiter');
  } catch (error) {
    console.error('❌ Error sending job deletion notification:', error);
  }
};

// Email when admin deletes a user account
const sendAccountDeletionNotification = async (userEmail, userName, reason) => {
  try {
    await resend.emails.send({
      from: 'WorkHena <onboarding@resend.dev>',
      to: userEmail,
      subject: 'WorkHena Account Termination Notice',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Account Termination Notice</h2>
          <p>Hi ${userName},</p>
          <p>We're writing to inform you that your WorkHena account has been terminated by our administration team.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason for termination:</strong></p>
            <p style="margin: 10px 0 0 0; color: #4B5563;">${reason}</p>
          </div>
          <p>Your account and all associated data have been removed from our platform.</p>
          <p>If you believe this was done in error or have questions about this decision, please contact our support team.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    });
    console.log('✅ Account deletion notification sent to user');
  } catch (error) {
    console.error('❌ Error sending account deletion notification:', error);
  }
};

// ============================================
// PASSWORD RESET EMAIL
// ============================================
const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    await resend.emails.send({
      from: 'WorkHena <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Reset Your WorkHena Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Reset Your Password 🔐</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your WorkHena password. Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          <div style="background-color: #FEF3C7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="margin: 0; color: #92400E;">⚠️ This link will expire in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
          </div>
          <p style="color: #6B7280; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #3B82F6; font-size: 13px; word-break: break-all;">${resetUrl}</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    });
    console.log('✅ Password reset email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
  }
};

module.exports = {
  sendApplicationNotification,
  sendStatusUpdateNotification,
  sendJobDeletionNotification,
  sendAccountDeletionNotification,
  sendPasswordResetEmail
};
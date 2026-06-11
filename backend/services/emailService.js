const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const sendEmail = async (payload, successMessage) => {
  const result = await resend.emails.send(payload);

  if (result.error) {
    throw new Error(result.error.message || 'Failed to send email');
  }

  console.log(successMessage, result.data?.id ? `(${result.data.id})` : '');
  return result;
};

// ============================================
// APPLICATION NOTIFICATION
// ============================================
const sendApplicationNotification = async (recruiterEmail, recruiterName, jobTitle, candidateName, candidateEmail) => {
  try {
    await sendEmail({
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
          <p>Log in to your WorkHena dashboard to review the application.</p>
          <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Application
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    }, '✅ Application notification email sent to recruiter');
  } catch (error) {
    console.error('❌ Error sending application notification:', error);
    throw error;
  }
};

// ============================================
// STATUS UPDATE NOTIFICATION
// ============================================
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
    await sendEmail({
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
          '<p>🎉 <strong>Congratulations!</strong> The hiring team will contact you soon.</p>' :
          '<p>You can view more details in your WorkHena dashboard.</p>'
        }
          <a href="${FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            View Dashboard
          </a>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    }, '✅ Status update email sent to candidate');
  } catch (error) {
    console.error('❌ Error sending status update email:', error);
    throw error;
  }
};

// ============================================
// JOB DELETION NOTIFICATION
// ============================================
const sendJobDeletionNotification = async (recruiterEmail, recruiterName, jobTitle, companyName, reason) => {
  try {
    await sendEmail({
      from: 'WorkHena <onboarding@resend.dev>',
      to: recruiterEmail,
      subject: `Job Posting Removed: ${jobTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Job Posting Removed</h2>
          <p>Hi ${recruiterName},</p>
          <p>Your job posting has been removed from WorkHena:</p>
          <div style="background-color: #FEE2E2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
            <h3 style="margin-top: 0; color: #1F2937;">${jobTitle}</h3>
            <p><strong>Company:</strong> ${companyName}</p>
          </div>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong></p>
            <p style="margin: 10px 0 0 0; color: #4B5563;">${reason}</p>
          </div>
          <p>If you believe this was done in error, please contact our support team.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    }, '✅ Job deletion notification sent to recruiter');
  } catch (error) {
    console.error('❌ Error sending job deletion notification:', error);
    throw error;
  }
};

// ============================================
// ACCOUNT DELETION NOTIFICATION
// ============================================
const sendAccountDeletionNotification = async (userEmail, userName, reason) => {
  try {
    await sendEmail({
      from: 'WorkHena <onboarding@resend.dev>',
      to: userEmail,
      subject: 'WorkHena Account Termination Notice',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EF4444;">Account Termination Notice</h2>
          <p>Hi ${userName},</p>
          <p>Your WorkHena account has been terminated by our administration team.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong></p>
            <p style="margin: 10px 0 0 0; color: #4B5563;">${reason}</p>
          </div>
          <p>If you believe this was done in error, please contact our support team.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    }, '✅ Account deletion notification sent to user');
  } catch (error) {
    console.error('❌ Error sending account deletion notification:', error);
    throw error;
  }
};

// ============================================
// PASSWORD RESET EMAIL
// ============================================
const sendPasswordResetEmail = async (userEmail, userName, resetUrl) => {
  try {
    await sendEmail({
      from: 'WorkHena <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Reset Your WorkHena Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Reset Your Password 🔐</h2>
          <p>Hi ${userName},</p>
          <p>We received a request to reset your WorkHena password. Click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          <div style="background-color: #FEF3C7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p style="margin: 0; color: #92400E;">⚠️ This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
          </div>
          <p style="color: #6B7280; font-size: 14px;">If the button doesn't work, copy this link: <span style="color: #3B82F6; word-break: break-all;">${resetUrl}</span></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    }, `✅ Password reset email sent to: ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw error;
  }
};

// ============================================
// EMAIL VERIFICATION
// ============================================
const sendVerificationEmail = async (userEmail, userName, verifyUrl) => {
  try {
    await sendEmail({
      from: 'WorkHena <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Verify Your WorkHena Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Verify Your Email ✉️</h2>
          <p>Hi ${userName}, welcome to WorkHena!</p>
          <p>Please verify your email address to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="display: inline-block; background-color: #10B981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
              Verify My Email
            </a>
          </div>
          <div style="background-color: #F0FDF4; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
            <p style="margin: 0; color: #166534;">⏰ This link expires in <strong>24 hours</strong>.</p>
          </div>
          <p style="color: #6B7280; font-size: 14px;">If the button doesn't work, copy this link: <span style="color: #10B981; word-break: break-all;">${verifyUrl}</span></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">WorkHena - Connecting talent with opportunity</p>
        </div>
      `
    }, `✅ Verification email sent to: ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw error;
  }
};

module.exports = {
  sendApplicationNotification,
  sendStatusUpdateNotification,
  sendJobDeletionNotification,
  sendAccountDeletionNotification,
  sendPasswordResetEmail,
  sendVerificationEmail
};
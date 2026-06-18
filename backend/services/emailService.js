const nodemailer = require("nodemailer");

/**
 * 📧 Sakina Email Service
 * Sends emergency alerts to the user's configured emergency contact email.
 * Falls back to console logging if SMTP is not configured.
 */

let transporter = null;
let smtpReady = false;

/**
 * Initialize the SMTP transporter.
 * Uses environment variables if available, otherwise falls back to Ethereal test account.
 */
const initTransporter = async () => {
  if (transporter) return;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    // Use real SMTP configuration
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT) || 587,
      secure: parseInt(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    smtpReady = true;
    console.log("📧 Email Service: Using configured SMTP server");
  } else {
    // Create an Ethereal test account for development
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      smtpReady = true;
      console.log("📧 Email Service: Using Ethereal test account (dev mode)");
      console.log(`   Test inbox: https://ethereal.email/login`);
      console.log(`   User: ${testAccount.user}`);
    } catch (err) {
      console.warn("📧 Email Service: Could not create test account. Emails will be logged to console only.");
      smtpReady = false;
    }
  }
};

// Initialize on first load
initTransporter();

/**
 * Send an emergency distress alert email to the user's emergency contact.
 * @param {Object} user - The user document (must have emergencyContact.email)
 * @param {string} messageText - The message that triggered the alert
 */
const sendDistressAlertEmail = async (user, messageText) => {
  const emergencyEmail = user?.emergencyContact?.email;
  if (!emergencyEmail) {
    console.log("📧 Distress alert: No emergency email configured, skipping.");
    return;
  }

  const userName = user.name || "A Sakina user";
  const subject = `🚨 Sakina Alert: ${userName} may need immediate support`;

  const htmlBody = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7f9fb; padding: 40px; border-radius: 24px;">
      <div style="background: #091426; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: #00adef; font-size: 24px; margin: 0; letter-spacing: 2px;">⚠️ SAKINA SAFETY ALERT</h1>
      </div>
      
      <div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb;">
        <p style="color: #091426; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          Hello,
        </p>
        <p style="color: #091426; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          You are receiving this alert because <strong>${userName}</strong> has registered you as their emergency contact on the Sakina mental health platform.
        </p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #dc2626; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">⚠️ Distress Signal Detected</p>
          <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.5;">
            A message was flagged by our safety system that may indicate ${userName} is in emotional distress or at risk.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          <strong>What you can do:</strong>
        </p>
        <ul style="color: #6b7280; font-size: 14px; line-height: 2; padding-left: 20px;">
          <li>Reach out to ${userName} directly — a call or message can make a big difference</li>
          <li>Listen without judgment and let them know you care</li>
          <li>If you believe they are in immediate danger, contact emergency services</li>
        </ul>
      </div>
      
      <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 24px; letter-spacing: 1px;">
        This is an automated safety alert from Sakina Mental Health Platform.
      </p>
    </div>
  `;

  const textBody = `SAKINA SAFETY ALERT\n\nYou are receiving this alert because ${userName} has registered you as their emergency contact on the Sakina mental health platform.\n\nA message was flagged by our safety system that may indicate ${userName} is in emotional distress or at risk.\n\nPlease reach out to ${userName} directly. A call or message can make a big difference.\nIf you believe they are in immediate danger, contact emergency services.\n\n— Sakina Mental Health Platform`;

  await sendEmail(emergencyEmail, subject, textBody, htmlBody);
};

/**
 * Send a high-risk alert email to the user's emergency contact.
 * @param {Object} user - The user document
 * @param {number} riskScore - The computed risk score (0-100)
 */
const sendHighRiskAlertEmail = async (user, riskScore) => {
  const emergencyEmail = user?.emergencyContact?.email;
  if (!emergencyEmail) {
    console.log("📧 High-risk alert: No emergency email configured, skipping.");
    return;
  }

  const userName = user.name || "A Sakina user";
  const subject = `🔴 Sakina Alert: ${userName}'s risk level has elevated to High`;

  const htmlBody = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7f9fb; padding: 40px; border-radius: 24px;">
      <div style="background: #091426; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <h1 style="color: #f43f5e; font-size: 24px; margin: 0; letter-spacing: 2px;">🔴 HIGH RISK ALERT</h1>
      </div>
      
      <div style="background: white; border-radius: 20px; padding: 32px; border: 1px solid #e5e7eb;">
        <p style="color: #091426; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          Hello,
        </p>
        <p style="color: #091426; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
          You are receiving this alert because <strong>${userName}</strong> has registered you as their emergency contact on the Sakina mental health platform.
        </p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <p style="color: #dc2626; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">🔴 Risk Level: HIGH (${riskScore}/100)</p>
          <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.5;">
            Based on mood patterns, journal entries, and behavioral data, ${userName}'s overall mental health risk assessment has been elevated to <strong>High Risk</strong>.
          </p>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          <strong>What you can do:</strong>
        </p>
        <ul style="color: #6b7280; font-size: 14px; line-height: 2; padding-left: 20px;">
          <li>Check in on ${userName} — sometimes knowing someone cares is enough</li>
          <li>Encourage them to speak with a mental health professional</li>
          <li>If you believe they are in immediate danger, contact emergency services</li>
        </ul>
      </div>
      
      <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 24px; letter-spacing: 1px;">
        This is an automated safety alert from Sakina Mental Health Platform.
      </p>
    </div>
  `;

  const textBody = `SAKINA HIGH RISK ALERT\n\nYou are receiving this alert because ${userName} has registered you as their emergency contact.\n\nRisk Level: HIGH (${riskScore}/100)\nBased on mood patterns, journal entries, and behavioral data, ${userName}'s mental health risk has been elevated to High Risk.\n\nPlease check in on ${userName} and encourage them to speak with a mental health professional.\nIf you believe they are in immediate danger, contact emergency services.\n\n— Sakina Mental Health Platform`;

  await sendEmail(emergencyEmail, subject, textBody, htmlBody);
};

/**
 * Core email sending function.
 */
const sendEmail = async (to, subject, text, html) => {
  // Always log to console for visibility
  console.log(`\n📧 ══════════════════════════════════════════════════`);
  console.log(`📧  EMERGENCY EMAIL ALERT`);
  console.log(`📧  To:      ${to}`);
  console.log(`📧  Subject: ${subject}`);
  console.log(`📧 ══════════════════════════════════════════════════\n`);

  if (!transporter || !smtpReady) {
    // Re-attempt initialization
    await initTransporter();
  }

  if (transporter && smtpReady) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Sakina Safety System" <safety@sakina.app>',
        to,
        subject,
        text,
        html,
      });

      console.log(`📧 Email sent successfully! Message ID: ${info.messageId}`);

      // If using Ethereal, log the preview URL
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`📧 Preview URL: ${previewUrl}`);
      }
    } catch (err) {
      console.error(`📧 Failed to send email to ${to}:`, err.message);
    }
  } else {
    console.log(`📧 [SIMULATED] Email would have been sent to ${to}`);
    console.log(`📧 [SIMULATED] Subject: ${subject}`);
    console.log(`📧 [SIMULATED] Body:\n${text}\n`);
  }
};

module.exports = {
  sendDistressAlertEmail,
  sendHighRiskAlertEmail,
};

// utils.js
const nodemailer = require("nodemailer");
const config = require("./config");
const crypto = require("crypto");

// ─── Email Transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: config.SMTP_SERVER,
  port: config.SMTP_PORT,
  secure: false,
  auth: {
    user: config.EMAIL_SENDER,
    pass: config.EMAIL_PASSWORD
  },
  tls: { rejectUnauthorized: false }
});

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const BRAND = {
  name:       "MedTrust AI",
  product:    "EMS Access Control",
  primary:    "#0052CC",
  dark:       "#003D99",
  accent:     "#00B8D9",
  success:    "#006644",
  successBg:  "#E3FCEF",
  danger:     "#BF2600",
  dangerBg:   "#FFEBE6",
  warning:    "#FF8B00",
  warningBg:  "#FFFAE6",
  neutral:    "#172B4D",
  muted:      "#6B778C",
  border:     "#DFE1E6",
  bg:         "#F4F5F7",
  white:      "#FFFFFF",
  year:       new Date().getFullYear(),
};

// ─── Shared CSS (inlined) ─────────────────────────────────────────────────────
const CSS = `
  /* Reset */
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${BRAND.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  table { border-collapse: collapse; }
  img { border: 0; display: block; }
  a { color: ${BRAND.primary}; text-decoration: none; }

  /* Wrapper */
  .email-outer { width: 100%; background: ${BRAND.bg}; padding: 40px 16px; }
  .email-wrap  { max-width: 600px; margin: 0 auto; }

  /* Pre-header */
  .preheader { display: none; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: transparent; }

  /* Header */
  .email-header {
    background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.dark} 60%, #001F6B 100%);
    border-radius: 12px 12px 0 0;
    padding: 40px 48px 36px;
    text-align: center;
    position: relative;
  }
  .email-header .logo-wrap { margin-bottom: 20px; }
  .email-header .logo-icon {
    display: inline-block;
    width: 56px; height: 56px;
    background: rgba(255,255,255,0.15);
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 14px;
    line-height: 56px;
    font-size: 26px;
    backdrop-filter: blur(4px);
  }
  .email-header h1 {
    color: #fff;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.3px;
    margin-bottom: 6px;
  }
  .email-header .sub {
    color: rgba(255,255,255,0.72);
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.3px;
  }

  /* Status Badge Strip */
  .status-strip {
    text-align: center;
    padding: 18px 48px;
    background: ${BRAND.white};
    border-bottom: 1px solid ${BRAND.border};
  }
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 20px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  }
  .badge-success { background: ${BRAND.successBg}; color: ${BRAND.success}; border: 1.5px solid #79F2C0; }
  .badge-danger  { background: ${BRAND.dangerBg};  color: ${BRAND.danger};  border: 1.5px solid #FFB898; }
  .badge-warning { background: ${BRAND.warningBg}; color: ${BRAND.warning}; border: 1.5px solid #FFD97D; }
  .badge-info    { background: #DEEBFF; color: ${BRAND.primary}; border: 1.5px solid #B3D4FF; }

  /* Body */
  .email-body { background: ${BRAND.white}; padding: 36px 48px; }
  .greeting { font-size: 17px; font-weight: 600; color: ${BRAND.neutral}; margin-bottom: 12px; }
  .intro { font-size: 15px; color: #42526E; line-height: 1.7; margin-bottom: 24px; }

  /* OTP Box */
  .otp-container {
    margin: 28px 0;
    background: linear-gradient(135deg, #F0F4FF 0%, #E8F0FF 100%);
    border: 1.5px dashed ${BRAND.primary};
    border-radius: 12px;
    padding: 28px;
    text-align: center;
  }
  .otp-label { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: ${BRAND.muted}; text-transform: uppercase; margin-bottom: 12px; }
  .otp-code  { font-size: 48px; font-weight: 800; color: ${BRAND.primary}; letter-spacing: 12px; font-variant-numeric: tabular-nums; line-height: 1; }
  .otp-meta  { margin-top: 14px; display: flex; justify-content: center; align-items: center; gap: 6px; font-size: 13px; color: ${BRAND.muted}; }
  .otp-dot   { width: 5px; height: 5px; background: ${BRAND.border}; border-radius: 50%; display: inline-block; }

  /* Info Panel */
  .info-panel {
    background: #F7F8FC;
    border: 1px solid ${BRAND.border};
    border-radius: 10px;
    overflow: hidden;
    margin: 24px 0;
  }
  .info-panel-header {
    background: #EBECF0;
    padding: 10px 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${BRAND.muted};
  }
  .info-row {
    display: flex;
    align-items: flex-start;
    padding: 12px 20px;
    border-bottom: 1px solid ${BRAND.border};
    gap: 12px;
    font-size: 14px;
  }
  .info-row:last-child { border-bottom: none; }
  .info-key   { color: ${BRAND.muted}; font-weight: 500; min-width: 130px; flex-shrink: 0; padding-top: 1px; }
  .info-val   { color: ${BRAND.neutral}; font-weight: 600; word-break: break-word; flex: 1; }

  /* Notice Boxes */
  .notice {
    display: flex;
    gap: 14px;
    padding: 16px 20px;
    border-radius: 8px;
    margin: 20px 0;
    align-items: flex-start;
    font-size: 13.5px;
    line-height: 1.6;
  }
  .notice-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .notice-security { background: #FFFAE6; border: 1px solid #FFE380; color: #6B4900; }
  .notice-info     { background: #DEEBFF; border: 1px solid #B3D4FF; color: #0747A6; }
  .notice-alert    { background: #FFEBE6; border: 1px solid #FF8F73; color: #6B0000; }
  .notice-success  { background: ${BRAND.successBg}; border: 1px solid #79F2C0; color: #006644; }

  /* Divider */
  .divider { border: none; border-top: 1px solid ${BRAND.border}; margin: 28px 0; }

  /* CTA Button */
  .cta-wrap { text-align: center; margin: 28px 0; }
  .cta-btn {
    display: inline-block;
    background: linear-gradient(135deg, ${BRAND.primary}, ${BRAND.dark});
    color: #fff !important;
    text-decoration: none;
    padding: 14px 36px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.2px;
    box-shadow: 0 4px 14px rgba(0,82,204,0.35);
  }

  /* Timestamp */
  .timestamp { text-align: right; font-size: 12px; color: ${BRAND.muted}; margin-top: 8px; font-style: italic; }

  /* Footer */
  .email-footer {
    background: #F4F5F7;
    border-top: 1px solid ${BRAND.border};
    border-radius: 0 0 12px 12px;
    padding: 28px 48px;
  }
  .footer-logo { text-align: center; margin-bottom: 14px; }
  .footer-logo span { font-size: 15px; font-weight: 700; color: ${BRAND.muted}; letter-spacing: -0.2px; }
  .footer-links { text-align: center; margin-bottom: 16px; }
  .footer-links a { font-size: 12px; color: ${BRAND.muted}; margin: 0 10px; text-decoration: none; border-bottom: 1px solid ${BRAND.border}; }
  .footer-text { text-align: center; font-size: 11.5px; color: #97A0AF; line-height: 1.7; }
  .footer-text strong { color: ${BRAND.muted}; }

  /* Responsive */
  @media only screen and (max-width: 600px) {
    .email-header { padding: 32px 24px 28px; }
    .email-body   { padding: 28px 24px; }
    .email-footer { padding: 24px; }
    .status-strip { padding: 14px 24px; }
    .otp-code     { font-size: 36px; letter-spacing: 8px; }
    .info-row     { flex-direction: column; gap: 4px; }
    .info-key     { min-width: auto; }
  }
`;

// ─── Helper: IST Timestamp ────────────────────────────────────────────────────
function istTime() {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true
  }) + " IST";
}

// ─── Shell Builder ────────────────────────────────────────────────────────────
function buildEmail({ preheader, headerIcon, headerTitle, headerSub, statusBadge, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>${headerTitle} — ${BRAND.product}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="email-outer">
    <div class="email-wrap">

      <!-- Pre-header -->
      <div class="preheader">${preheader}</div>

      <!-- Header -->
      <div class="email-header">
        <div class="logo-wrap">
          <div class="logo-icon">${headerIcon}</div>
        </div>
        <h1>${headerTitle}</h1>
        <p class="sub">${headerSub}</p>
      </div>

      ${statusBadge ? `
      <!-- Status Strip -->
      <div class="status-strip">
        ${statusBadge}
      </div>` : ""}

      <!-- Body -->
      <div class="email-body">
        ${body}
        <p class="timestamp">📅 Generated: ${istTime()}</p>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <div class="footer-logo">
          <span>🏥 ${BRAND.name} &nbsp;·&nbsp; ${BRAND.product}</span>
        </div>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Help & Support</a>
          <a href="#">Unsubscribe</a>
        </div>
        <p class="footer-text">
          This is an automated system notification from <strong>${BRAND.product}</strong>.<br/>
          Please do not reply to this email. For support, contact your system administrator.<br/>
          &copy; ${BRAND.year} ${BRAND.name}. All rights reserved. &nbsp;|&nbsp;
          Protected under HIPAA &amp; healthcare data privacy regulations.
        </p>
      </div>

    </div>
  </div>
</body>
</html>`;
}

// ─── Info Row Helper ──────────────────────────────────────────────────────────
function infoRow(key, value, icon = "") {
  return `<div class="info-row">
    <span class="info-key">${icon} ${key}</span>
    <span class="info-val">${value || "—"}</span>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. OTP Email
// ═══════════════════════════════════════════════════════════════════════════════
async function sendOtpEmail(email, otp) {
  try {
    const html = buildEmail({
      preheader: `Your secure login code is ${otp}. Valid for 10 minutes. Do not share it with anyone.`,
      headerIcon: "🔐",
      headerTitle: "Secure Login Verification",
      headerSub:   `${BRAND.product} — One-Time Password`,
      statusBadge: `<span class="badge badge-info">🔑 Authentication Required</span>`,
      body: `
        <p class="greeting">Hello,</p>
        <p class="intro">
          A login attempt was made for your account on <strong>${BRAND.product}</strong>.
          Use the one-time password below to complete your authentication. This code is valid for
          <strong>10 minutes</strong> and can only be used once.
        </p>

        <div class="otp-container">
          <p class="otp-label">Your One-Time Password</p>
          <div class="otp-code">${otp}</div>
          <p class="otp-meta">
            <span>⏱ Expires in 10 minutes</span>
            <span class="otp-dot"></span>
            <span>Single use only</span>
            <span class="otp-dot"></span>
            <span>Do not share</span>
          </p>
        </div>

        <div class="notice notice-security">
          <span class="notice-icon">⚠️</span>
          <div>
            <strong>Security Notice:</strong> Our team will <u>never</u> ask you for this code.
            If you did not attempt to log in, please ignore this email and consider changing your
            account email immediately. Unauthorized access attempts should be reported to your
            system administrator.
          </div>
        </div>

        <div class="info-panel">
          <div class="info-panel-header">Session Details</div>
          ${infoRow("Recipient", email, "📧")}
          ${infoRow("Valid Until", new Date(Date.now() + 10 * 60000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST", "⏰")}
          ${infoRow("System", BRAND.product, "🏥")}
        </div>
      `
    });

    await transporter.sendMail({
      from:    `"${BRAND.name}" <${config.EMAIL_SENDER}>`,
      to:      email,
      subject: `🔐 ${otp} is your ${BRAND.name} login code`,
      html
    });

    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (err) {
    console.error("❌ OTP email failed:", err.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Welcome Email
// ═══════════════════════════════════════════════════════════════════════════════
async function sendWelcomeEmail(email, name, role) {
  try {
    const roleLabels = { doctor: "👨‍⚕️ Doctor", nurse: "👩‍⚕️ Nurse", patient: "🧑 Patient" };
    const roleLabel  = roleLabels[role] || role;

    const html = buildEmail({
      preheader: `Welcome to ${BRAND.name}, ${name}! Your account is now active and ready to use.`,
      headerIcon: "🎉",
      headerTitle: `Welcome, ${name}!`,
      headerSub:   `Your account is now active on ${BRAND.product}`,
      statusBadge: `<span class="badge badge-success">✅ Account Activated</span>`,
      body: `
        <p class="greeting">Dear ${name},</p>
        <p class="intro">
          Welcome to <strong>${BRAND.name}</strong>! Your account has been successfully created and
          is ready to use. You now have secure access to the <strong>${BRAND.product}</strong> platform.
        </p>

        <div class="info-panel">
          <div class="info-panel-header">Your Account Information</div>
          ${infoRow("Full Name", name, "👤")}
          ${infoRow("Email Address", email, "📧")}
          ${infoRow("Assigned Role", roleLabel, "🏷️")}
          ${infoRow("Account Status", '<span style="color:#006644;font-weight:700;">Active ✅</span>', "🔓")}
          ${infoRow("Registration Date", istTime(), "📅")}
        </div>

        <div class="notice notice-info">
          <span class="notice-icon">🔑</span>
          <div>
            <strong>How to Log In:</strong> Every login is secured with a One-Time Password (OTP)
            sent to this email. Keep this email account secure — it is your authentication gateway.
          </div>
        </div>

        <hr class="divider"/>

        <p style="font-size:14px; color:#42526E; line-height:1.7;">
          <strong>What you can do next:</strong>
        </p>
        <ul style="font-size:14px; color:#42526E; line-height:2; padding-left:20px; margin-top:8px;">
          <li>Log into the EMS dashboard using your email &amp; OTP</li>
          <li>Submit access requests for patient records</li>
          <li>View and manage your assigned records</li>
          <li>Track your access history in the audit log</li>
        </ul>

        <div class="notice notice-security" style="margin-top:24px;">
          <span class="notice-icon">🛡️</span>
          <div>
            <strong>Security Reminder:</strong> Your account activity is monitored and logged
            in compliance with HIPAA and healthcare data protection regulations.
            Only access records that are relevant to your clinical duties.
          </div>
        </div>
      `
    });

    await transporter.sendMail({
      from:    `"${BRAND.name}" <${config.EMAIL_SENDER}>`,
      to:      email,
      subject: `🎉 Welcome to ${BRAND.name}, ${name}!`,
      html
    });

    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (err) {
    console.error("❌ Welcome email failed:", err.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Access Approved Email
// ═══════════════════════════════════════════════════════════════════════════════
async function sendAccessApprovedEmail(email, name, patientId, accessType, approvedBy) {
  try {
    const html = buildEmail({
      preheader: `Great news! Your access request for patient ${patientId} has been approved.`,
      headerIcon: "✅",
      headerTitle: "Access Request Approved",
      headerSub:   "Your patient record access has been granted",
      statusBadge: `<span class="badge badge-success">✅ Approved</span>`,
      body: `
        <p class="greeting">Dear ${name || email},</p>
        <p class="intro">
          We are pleased to inform you that your request to access patient records on
          <strong>${BRAND.product}</strong> has been <strong>reviewed and approved</strong>.
          You may now access the record through your dashboard.
        </p>

        <div class="info-panel">
          <div class="info-panel-header">Access Grant Details</div>
          ${infoRow("Patient ID", patientId, "🏥")}
          ${infoRow("Access Type", accessType || "Standard Access", "🔑")}
          ${infoRow("Approved By", approvedBy, "✔️")}
          ${infoRow("Granted To", email, "📧")}
          ${infoRow("Effective From", istTime(), "📅")}
          ${infoRow("Expires", new Date(Date.now() + 30 * 24 * 3600000).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "long", year: "numeric" }), "⏳")}
        </div>

        <div class="notice notice-success">
          <span class="notice-icon">🎯</span>
          <div>
            <strong>Access is now active.</strong> You can find the patient's record in your
            dashboard under <em>"Assigned Patients"</em>. Your access window is 30 days from today.
          </div>
        </div>

        <div class="notice notice-security">
          <span class="notice-icon">⚠️</span>
          <div>
            <strong>Compliance Notice:</strong> All access to patient records is <strong>audited,
            encrypted, and logged</strong>. Unauthorized sharing or misuse of patient data is a
            violation of HIPAA and applicable healthcare privacy laws and may result in
            disciplinary action.
          </div>
        </div>
      `
    });

    await transporter.sendMail({
      from:    `"${BRAND.name}" <${config.EMAIL_SENDER}>`,
      to:      email,
      subject: `✅ Access Approved — Patient ${patientId} | ${BRAND.name}`,
      html
    });

    console.log(`✅ Access approved email sent to ${email}`);
    return true;
  } catch (err) {
    console.error("❌ Access approved email failed:", err.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Access Denied Email
// ═══════════════════════════════════════════════════════════════════════════════
async function sendAccessDeniedEmail(email, name, patientId, denialReason, deniedBy) {
  try {
    const html = buildEmail({
      preheader: `Your access request for patient ${patientId} was not approved. See details inside.`,
      headerIcon: "🚫",
      headerTitle: "Access Request Denied",
      headerSub:   "Your patient record access request was not approved",
      statusBadge: `<span class="badge badge-danger">❌ Denied</span>`,
      body: `
        <p class="greeting">Dear ${name || email},</p>
        <p class="intro">
          We regret to inform you that your request to access patient records on
          <strong>${BRAND.product}</strong> has been <strong>reviewed and denied</strong>
          by the authorized administrator. Please review the details below.
        </p>

        <div class="info-panel">
          <div class="info-panel-header">Request Decision Details</div>
          ${infoRow("Patient ID", patientId, "🏥")}
          ${infoRow("Decision", '<span style="color:#BF2600;font-weight:700;">Denied ❌</span>', "📋")}
          ${infoRow("Reviewed By", deniedBy, "👤")}
          ${infoRow("Reason Given", denialReason || "No reason provided by administrator", "📝")}
          ${infoRow("Decision Date", istTime(), "📅")}
        </div>

        <div class="notice notice-alert">
          <span class="notice-icon">ℹ️</span>
          <div>
            <strong>What can you do?</strong> If you believe this decision was made in error,
            or if you have an urgent clinical need for this access, please:
            <ul style="margin-top:8px; padding-left:16px; line-height:2;">
              <li>Contact your department supervisor or system administrator</li>
              <li>Submit a new access request with a more detailed clinical justification</li>
              <li>Escalate via your organization's healthcare access governance process</li>
            </ul>
          </div>
        </div>

        <div class="notice notice-security">
          <span class="notice-icon">🛡️</span>
          <div>
            <strong>Privacy Notice:</strong> This decision was made to protect patient privacy and
            ensure compliance with healthcare data access policies. All review decisions are
            logged for audit purposes.
          </div>
        </div>
      `
    });

    await transporter.sendMail({
      from:    `"${BRAND.name}" <${config.EMAIL_SENDER}>`,
      to:      email,
      subject: `❌ Access Denied — Patient ${patientId} | ${BRAND.name}`,
      html
    });

    console.log(`✅ Access denied email sent to ${email}`);
    return true;
  } catch (err) {
    console.error("❌ Access denied email failed:", err.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Emergency Access Alert Email (to Admin)
// ═══════════════════════════════════════════════════════════════════════════════
async function sendEmergencyAccessAlert(adminEmail, grantedBy, patientId, reason) {
  try {
    const html = buildEmail({
      preheader: `ALERT: Emergency access for patient ${patientId} was auto-granted by ${grantedBy}. Immediate review required.`,
      headerIcon: "🚨",
      headerTitle: "Emergency Access Alert",
      headerSub:   `Immediate administrator review required — ${BRAND.product}`,
      statusBadge: `<span class="badge badge-warning">⚡ Emergency Override Active</span>`,
      body: `
        <p class="greeting">Dear Administrator,</p>
        <p class="intro">
          An <strong>emergency access override</strong> has been activated on
          <strong>${BRAND.product}</strong>. This access was auto-granted and bypasses the
          standard approval workflow. <strong>Immediate review and audit is required.</strong>
        </p>

        <div class="info-panel">
          <div class="info-panel-header">🚨 Emergency Access Record</div>
          ${infoRow("Access Type", '<span style="color:#FF8B00;font-weight:700;">Emergency Override ⚡</span>', "🔓")}
          ${infoRow("Initiated By", grantedBy, "👤")}
          ${infoRow("Patient ID", patientId, "🏥")}
          ${infoRow("Clinical Reason", reason, "📋")}
          ${infoRow("Auto-Granted At", istTime(), "⏰")}
          ${infoRow("Access Expires", new Date(Date.now() + 24 * 3600000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST", "⏳")}
          ${infoRow("Access Duration", "24 hours", "🕐")}
        </div>

        <div class="notice notice-alert">
          <span class="notice-icon">🚨</span>
          <div>
            <strong>Action Required:</strong> Please log in to the Admin Dashboard immediately to:
            <ul style="margin-top:8px; padding-left:16px; line-height:2;">
              <li>Review the clinical justification for this emergency access</li>
              <li>Verify the identity and authorization of the clinician</li>
              <li>Confirm or revoke this access as appropriate</li>
              <li>Document your review decision in the audit log</li>
            </ul>
          </div>
        </div>

        <div class="notice notice-security">
          <span class="notice-icon">⚖️</span>
          <div>
            <strong>Regulatory Compliance:</strong> Emergency access events are subject to
            mandatory post-access audit under HIPAA "break-glass" access policies.
            Failure to review within 24 hours may constitute a compliance violation.
          </div>
        </div>

        <div class="cta-wrap">
          <a href="#" class="cta-btn">🔍 Open Admin Dashboard</a>
        </div>
      `
    });

    await transporter.sendMail({
      from:    `"${BRAND.name} Alerts" <${config.EMAIL_SENDER}>`,
      to:      adminEmail,
      subject: `🚨 URGENT: Emergency Access Activated — Patient ${patientId} | ${BRAND.name}`,
      html
    });

    console.log(`✅ Emergency alert sent to ${adminEmail}`);
    return true;
  } catch (err) {
    console.error("❌ Emergency alert email failed:", err.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. New Access Request Notification (to Admin)
// ═══════════════════════════════════════════════════════════════════════════════
async function sendNewAccessRequestNotification(adminEmail, requesterName, requesterEmail, patientId, reason) {
  try {
    const html = buildEmail({
      preheader: `New access request submitted by ${requesterName} for patient ${patientId}. Your review is required.`,
      headerIcon: "📋",
      headerTitle: "New Access Request",
      headerSub:   `A clinician is requesting access to a patient record — ${BRAND.product}`,
      statusBadge: `<span class="badge badge-info">📋 Pending Your Review</span>`,
      body: `
        <p class="greeting">Dear Administrator,</p>
        <p class="intro">
          A new <strong>patient record access request</strong> has been submitted on
          <strong>${BRAND.product}</strong> and is awaiting your review and decision.
          Please log in to approve or deny this request.
        </p>

        <div class="info-panel">
          <div class="info-panel-header">Request Details</div>
          ${infoRow("Requested By", requesterName || "—", "👤")}
          ${infoRow("Requester Email", requesterEmail, "📧")}
          ${infoRow("Patient ID", patientId, "🏥")}
          ${infoRow("Clinical Reason", reason || "No reason provided", "📝")}
          ${infoRow("Submitted At", istTime(), "📅")}
          ${infoRow("Status", '<span style="color:#0052CC;font-weight:700;">Pending Review ⏳</span>', "🔄")}
        </div>

        <div class="notice notice-info">
          <span class="notice-icon">📌</span>
          <div>
            <strong>Action Required:</strong> Please review this access request promptly.
            The requester is waiting for your decision. Requests should be reviewed within
            <strong>24 hours</strong> per standard access governance policy.
          </div>
        </div>

        <div class="cta-wrap">
          <a href="#" class="cta-btn">⚖️ Review Access Request</a>
        </div>

        <div class="notice notice-security">
          <span class="notice-icon">🛡️</span>
          <div>
            <strong>Responsibility Notice:</strong> As the reviewing administrator, you are
            responsible for ensuring this access aligns with the principle of minimum necessary
            access and the patient's care requirements under applicable privacy regulations.
          </div>
        </div>
      `
    });

    await transporter.sendMail({
      from:    `"${BRAND.name}" <${config.EMAIL_SENDER}>`,
      to:      adminEmail,
      subject: `📋 New Access Request from ${requesterName} — Patient ${patientId} | ${BRAND.name}`,
      html
    });

    console.log(`✅ Access request notification sent to ${adminEmail}`);
    return true;
  } catch (err) {
    console.error("❌ Access request notification failed:", err.message);
    return false;
  }
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/** Generate cryptographically secure numeric-only OTP */
function generateOTP(length = 6) {
  const max   = Math.pow(10, length);
  const min   = Math.pow(10, length - 1);
  const range = max - min;
  const randomBytes  = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  return String(min + (randomNumber % range));
}

/** Hash password */
async function hashPassword(password) {
  const bcrypt = require("bcryptjs");
  const salt   = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

/** Compare password */
async function comparePassword(password, hash) {
  const bcrypt = require("bcryptjs");
  return await bcrypt.compare(password, hash);
}

/** Generate JWT token */
function generateToken(payload, expiresIn = "24h") {
  const jwt = require("jsonwebtoken");
  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", { expiresIn });
}

/** Verify JWT token */
function verifyToken(token) {
  const jwt = require("jsonwebtoken");
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch {
    return null;
  }
}

/** Validate email format */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Log access event */
async function logAccessEvent(db, userId, action, details = {}) {
  try {
    await db.collection("access_logs").add({
      userId, action, details,
      timestamp: new Date(),
      ip: details.ip || "unknown"
    });
  } catch (err) {
    console.error("❌ Failed to log access event:", err.message);
  }
}

module.exports = {
  sendOtpEmail,
  sendWelcomeEmail,
  sendAccessApprovedEmail,
  sendAccessDeniedEmail,
  sendEmergencyAccessAlert,
  sendNewAccessRequestNotification,
  generateOTP,
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  isValidEmail,
  logAccessEvent
};

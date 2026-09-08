import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp, fullName) => {
  const senderEmail = process.env.SENDER_EMAIL || process.env.EMAIL_USER || "noreply.unify194@gmail.com";
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #007bff; margin: 0;">🚢 Unify</h1>
      </div>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0 0 10px 0;">Welcome to Unify, ${fullName}!</h2>
        <p style="margin: 0; opacity: 0.9;">Your language learning journey starts here</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <p style="margin: 0 0 20px 0; color: #333; font-size: 16px;">
          Please verify your email address by entering this verification code:
        </p>
        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 2px dashed #007bff; display: inline-block;">
          <h1 style="color: #007bff; font-size: 36px; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
            ${otp}
          </h1>
        </div>
        <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
          ⏰ This code will expire in <strong>10 minutes</strong>
        </p>
      </div>

      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>Security tip:</strong> Never share this code with anyone. Unify will never ask for your verification code.
        </p>
      </div>

      <div style="text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
        <p style="margin: 0 0 10px 0;">
          If you didn't create an account with Unify, please ignore this email.
        </p>
        <p style="margin: 0;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </div>
  `;

  // 1. Try Brevo HTTP REST API (Port 443 - Guaranteed to work on Render free tier)
  if (brevoApiKey) {
    try {
      console.log("🔄 Sending OTP via Brevo HTTP API...");
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: "Unify Team", email: senderEmail },
          to: [{ email: email }],
          subject: "Verify Your Unify Account - OTP",
          htmlContent: htmlContent
        })
      });

      const resData = await response.json();
      if (response.ok) {
        console.log(`✅ OTP email sent successfully via Brevo HTTP API to ${email}`);
        console.log(`Message ID: ${resData.messageId}`);
        return resData;
      } else {
        console.error("❌ Brevo HTTP API Error:", resData);
      }
    } catch (apiError) {
      console.error("❌ Brevo HTTP API Connection Error:", apiError.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP if HTTP API is not configured or failed
  console.log("🔄 Fallback to Nodemailer SMTP...");
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER || process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"Unify Team" <${senderEmail}>`,
    to: email,
    subject: "Verify Your Unify Account - OTP",
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    console.log(`Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending OTP email via Nodemailer:", error.message);
    throw new Error("Failed to send OTP email");
  }
};

// Test connection function
export const testEmailConnection = async () => {
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.EMAIL_PASS;
  if (!brevoApiKey) {
    console.error("❌ No API/SMTP key provided in environment variables!");
    return false;
  }
  try {
    console.log("🔄 Testing Brevo API Connection...");
    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey
      }
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Connected to Brevo Account: ${data.email}`);
      return true;
    } else {
      console.error("❌ Brevo API Key invalid:", data);
      return false;
    }
  } catch (err) {
    console.error("❌ Brevo test connection failed:", err.message);
    return false;
  }
};

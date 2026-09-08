import nodemailer from "nodemailer";

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
  },
  pool: true,
  maxConnections: 1,
  rateDelta: 20000,
  rateLimit: 5,
});

export const sendOTPEmail = async (email, otp, fullName) => {
  const senderEmail = process.env.SENDER_EMAIL || "noreply.unify194@gmail.com";
  const mailOptions = {
    from: `"Unify Team" <${senderEmail}>`,
    to: email,
    subject: "Verify Your Unify Account - OTP",
    html: `
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
    `,
    text: `
      Welcome to Unify, ${fullName}!
      
      Please verify your email address by entering this verification code: ${otp}
      
      This code will expire in 10 minutes.
      
      If you didn't create an account with Unify, please ignore this email.
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    console.log(`Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.message);
    
    // More detailed error logging
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.response) {
      console.error("SMTP response:", error.response);
    }
    
    throw new Error("Failed to send OTP email");
  }
};

// Test connection function
export const testEmailConnection = async () => {
  try {
    console.log("🔄 Testing email connection...");
    await transporter.verify();
    console.log("✅ Email connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Email connection failed:", error.message);
    console.error("Full error:", error);
    return false;
  }
};

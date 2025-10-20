export function generateVerificationOtpEmailTemplate(otpCode) {
  return `
  <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 25px;
    border-radius: 12px;
    background: linear-gradient(135deg, #74ebd5 0%, #9face6 100%);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    color: #333;
  ">
    <h2 style="
      text-align: center;
      color: #fff;
      font-size: 28px;
      margin-bottom: 10px;
      letter-spacing: 1px;
    ">
      Reset Your Password 
    </h2>

    <p style="
      font-size: 16px;
      color: #f9f9f9;
      text-align: center;
      margin-top: 0;
    ">
      We received a request to reset your password. Use the verification code below:
    </p>

    <div style="
      text-align: center;
      margin: 25px 0;
    ">
      <span style="
        display: inline-block;
        font-size: 26px;
        font-weight: bold;
        letter-spacing: 3px;
        color: #4a4a4a;
        padding: 12px 30px;
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      ">
        ${otpCode}
      </span>
    </div>

    <p style="
      font-size: 15px;
      color: #f3f3f3;
      text-align: center;
      margin-bottom: 15px;
    ">
      This code is valid for <strong>15 minutes</strong>. Do not share it with anyone for your security.
    </p>

    <footer style="
      margin-top: 30px;
      text-align: center;
      font-size: 13px;
      color: #f0f0f0;
    ">
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p style="margin-top: 10px; color: #e2e2e2;">
        — IIITDM Kurnool Library Team 
      </p>
    </footer>
  </div>
  `;
}

export const generateFirstTimeLoginEmailTemplate = (userName) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome - Change Your Password</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            position: relative;
        }
        
        .email-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
        }
        
        .header {
            padding: 50px 40px 30px;
            text-align: center;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            color: white;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .title {
            font-size: 28px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #64748b;
            font-weight: 400;
        }
        
        .content {
            padding: 40px;
        }
        
        .greeting {
            font-size: 18px;
            color: #334155;
            margin-bottom: 24px;
            font-weight: 500;
        }
        
        .message {
            font-size: 16px;
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 16px;
            margin: 32px 0;
            text-align: center;
        }
        
        .highlight-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .highlight-text {
            font-size: 16px;
            opacity: 0.9;
            line-height: 1.5;
        }
        
        .security-notice {
            background: #fef3cd;
            border: 1px solid #fde68a;
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
        }
        
        .security-text {
            font-size: 14px;
            color: #92400e;
            line-height: 1.5;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-title {
            font-size: 16px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 4px;
        }
        
        .footer-subtitle {
            font-size: 16px;
            color: #667eea;
            font-weight: 500;
            margin-bottom: 16px;
        }
        
        .footer-note {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.4;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 30px 24px;
            }
            
            .title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">BW</div>
            <h1 class="title">Welcome to BookWorm!</h1>
            <p class="subtitle">Your library management system</p>
        </div>
        
        <div class="content">
            <p class="greeting">Hello ${userName}! 👋</p>
            
            <p class="message">
                Congratulations on your successful first login to the IIITDM Kurnool Library Management System! 
                We're excited to have you join our community of readers and learners.
            </p>
            
            <div class="highlight-box">
                <h2 class="highlight-title">🔐 Security First</h2>
                <p class="highlight-text">
                    For your security and privacy, we strongly recommend changing your default password 
                    to something unique and personal. This helps protect your account from unauthorized access.
                </p>
            </div>
            
            <p class="message">
                You can change your password anytime by going to your profile settings in the application. 
                We recommend choosing a strong password that includes a mix of letters, numbers, and special characters.
            </p>
            
            <div class="security-notice">
                <p class="security-text">
                    <strong>Security Tip:</strong> Never share your password with anyone. Our library team will never ask for your password via email or phone.
                </p>
            </div>
            
            <p class="message">
                If you have any questions or need assistance, please don't hesitate to contact our library staff. 
                We're here to help you make the most of your library experience!
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-title">Happy Reading!</p>
            <p class="footer-subtitle">The IIITDM Kurnool Library Team</p>
            <p class="footer-note">
                This is an automated message from the Library Management System.<br>
                Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>`;
};

export const generateForgotPasswordEmailTemplate = (resetPasswordUrl) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 560px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            position: relative;
        }
        
        .email-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c);
        }
        
        .header {
            padding: 50px 40px 30px;
            text-align: center;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            color: white;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .title {
            font-size: 28px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #64748b;
            font-weight: 400;
        }
        
        .content {
            padding: 40px;
        }
        
        .greeting {
            font-size: 18px;
            color: #334155;
            margin-bottom: 24px;
            font-weight: 500;
        }
        
        .message {
            font-size: 16px;
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            padding: 16px 32px;
            border-radius: 12px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            letter-spacing: 0.5px;
        }
        
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
        }
        
        .warning {
            background: #fef3cd;
            border: 1px solid #fde68a;
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
        }
        
        .warning-text {
            font-size: 14px;
            color: #92400e;
            line-height: 1.5;
        }
        
        .url-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
        }
        
        .url-label {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 8px;
        }
        
        .url-text {
            font-size: 14px;
            color: #3b82f6;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .footer-title {
            font-size: 16px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 4px;
        }
        
        .footer-subtitle {
            font-size: 16px;
            color: #667eea;
            font-weight: 500;
            margin-bottom: 16px;
        }
        
        .footer-note {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.4;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 30px 24px;
            }
            
            .title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">BW</div>
            <h1 class="title">Password Reset</h1>
            <p class="subtitle">Secure your account in just one click</p>
        </div>
        
        <div class="content">
            <p class="greeting">Hello there! 👋</p>
            
            <p class="message">
                We received a request to reset your password for your BookWorm account. 
                Click the button below to create a new password and get back to your reading journey.
            </p>
            
            <div class="button-container">
                <a href="${resetPasswordUrl}" class="reset-button">
                    Reset My Password
                </a>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>Security Notice:</strong> If you didn't request this password reset, you can safely ignore this email. 
                    This link will automatically expire in 10 minutes for your security.
                </p>
            </div>
            
            <div class="url-section">
                <p class="url-label">Having trouble with the button? Copy and paste this link:</p>
                <p class="url-text">${resetPasswordUrl}</p>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-title">Happy Reading!</p>
            <p class="footer-subtitle">The BookWorm Team</p>
            <p class="footer-note">
                This is an automated message from BookWorm.<br>
                Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>`;
};
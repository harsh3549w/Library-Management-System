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
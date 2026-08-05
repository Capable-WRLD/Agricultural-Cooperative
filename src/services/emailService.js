import emailjs from "@emailjs/browser";

// EmailJS configuration
const SERVICE_ID = "service_pepy8n2";
const TEMPLATE_ID = "template_az59vco";
const PUBLIC_KEY = "mxzsgZIW32Qfy4ns8";

/**
 * Send verification email with OTP
 * @param {string} toEmail
 * @param {string} toName
 * @param {string} otp
 */
export const sendVerificationEmail = async (toEmail, toName, otp) => {
  try {
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      otp: otp,
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );

    console.log("Verification email sent:", response);

    return {
      success: true,
      response,
    };
  } catch (error) {
    console.error("Failed to send email:", error);

    return {
      success: false,
      error,
    };
  }
};
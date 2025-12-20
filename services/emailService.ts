
import emailjs from 'emailjs-com';

/**
 * 📧 EMAILJS CONFIGURATION
 * 
 * SERVICE ID: 'service_pyktx9i'
 * PUBLIC KEY: '8puBY-a7DdJmzRY9V'
 * TEMPLATE ID: 'template_wzwkq45'
 * 
 * 🛠️ DASHBOARD SETUP (CRITICAL):
 * 1. Go to your EmailJS Template (template_wzwkq45)
 * 2. In the "To Email" field, put: {{to_email}}
 * 3. In the Email Body/Subject, put: {{otp_code}}
 */

const EMAILJS_SERVICE_ID = 'service_pyktx9i'; 
const EMAILJS_PUBLIC_KEY = '8puBY-a7DdJmzRY9V'; 
const EMAILJS_TEMPLATE_ID = 'template_wzwkq45'; 

export const sendOtpEmail = async (toEmail: string, userName: string, otp: string): Promise<{success: boolean, error?: string}> => {
  const cleanEmail = toEmail.trim();
  if (!cleanEmail) {
    return { success: false, error: "Recipient email address is missing." };
  }

  try {
    const templateParams = {
      to_email: cleanEmail,
      to_name: userName,
      otp_code: otp,         // Use {{otp_code}} in your EmailJS template body
      otp: otp,              // Fallback
      code: otp,             // Fallback
      project_name: 'NoteNexus'
    };

    console.log(`Sending OTP [${otp}] to ${cleanEmail} using template ${EMAILJS_TEMPLATE_ID}...`);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (response.status === 200) {
      console.log("OTP Email successfully sent!");
      return { success: true };
    } else {
      return { success: false, error: `Provider error: ${response.text}` };
    }
  } catch (error: any) {
    console.error("Email Service Error:", error);
    return { 
      success: false, 
      error: error?.text || error?.message || "Check your EmailJS account configuration." 
    };
  }
};

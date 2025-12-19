
import emailjs from 'emailjs-com';

/**
 * 📧 EMAILJS CONFIGURATION
 * Service ID: service_pyktx9i (Provided by User)
 * Public Key: 8puBY-a7DdJmzRY9V (Provided by User)
 * 
 * To make real emails work:
 * 1. Ensure you have an Email Template with ID 'template_otp' in your EmailJS dashboard.
 * 2. Your template must contain {{otp_code}} and {{to_name}} variables.
 */

const EMAILJS_SERVICE_ID = 'service_pyktx9i'; 
const EMAILJS_TEMPLATE_ID = 'template_otp';   
const EMAILJS_PUBLIC_KEY = '8puBY-a7DdJmzRY9V'; 

export const sendOtpEmail = async (toEmail: string, userName: string, otp: string): Promise<{success: boolean, simulated: boolean}> => {
  // Security: The 'otp' variable is never logged to the console or stored in the browser state except for comparison.
  
  try {
    const templateParams = {
      to_email: toEmail,
      to_name: userName,
      otp_code: otp, // Passed securely to the EmailJS API
      project_name: 'NoteNexus'
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { success: response.status === 200, simulated: false };
  } catch (error) {
    // Fail silently or with a generic error to prevent leaking context in production logs
    console.error("Critical: Email delivery service encountered an error. Verify EmailJS Template ID 'template_otp' exists.");
    return { success: false, simulated: false };
  }
};

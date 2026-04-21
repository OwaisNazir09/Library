import dotenv from 'dotenv';
import sendEmail from './src/utils/emailService.js';

dotenv.config();

const testEmail = async () => {
  console.log('--- Email Test Script ---');
  console.log('Target:', 'blinkbitlabs@gmail.com');
  console.log('Host:', process.env.EMAIL_HOST);
  console.log('User:', process.env.EMAIL_USERNAME);
  
  try {
    const result = await sendEmail({
      email: 'blinkbitlabs@gmail.com',
      subject: 'Welib SMTP Test',
      message: 'This is a test email from your Library Management System using Brevo SMTP.',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #044343;">SMTP Test Successful!</h1>
          <p>Your Brevo SMTP configuration is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `
    });
    console.log('Success!', result.messageId);
  } catch (error) {
    console.error('Test Failed:', error.message);
    if (error.response) console.error('Response:', error.response);
  }
};

testEmail();

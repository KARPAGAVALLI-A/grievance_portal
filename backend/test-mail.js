require('dotenv').config();
const nodemailer = require('nodemailer');

const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
const pass = (process.env.EMAIL_APP_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS || '').replace(/\s+/g, '');
const adminEmail = (process.env.ADMIN_EMAIL || user).split(',')[0].trim();

console.log('--------------------------------------------------');
console.log('Testing Email Configuration for:', user);
console.log('Target Test Recipient:', adminEmail);
console.log('App Password Character Length:', pass.length, '(Expected: 16)');
console.log('--------------------------------------------------');

if (!user || !pass) {
  console.error('ERROR: SMTP_USER or SMTP_PASS is missing in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass,
  },
});

async function runTest() {
  console.log('1. Connecting to Gmail SMTP server (smtp.gmail.com)...');
  try {
    await transporter.verify();
    console.log('✅ Google SMTP Authentication SUCCESSFUL!');
  } catch (authError) {
    console.error('❌ Google SMTP Authentication FAILED:');
    console.error('   ' + authError.message);
    console.log('\nEXPLANATION:');
    console.log('Google returned "535-5.7.8 BadCredentials".');
    console.log('This means the password in backend/.env is NOT valid on Google servers.');
    console.log('You must generate a new 16-character Google App Password:');
    console.log('1. Open: https://myaccount.google.com/apppasswords');
    console.log('2. Log in with: ' + user);
    console.log('3. Name: "Grievance Portal" -> Click Create');
    console.log('4. Copy the new 16-character password into backend/.env:');
    console.log('   SMTP_PASS=your-new-16-character-password');
    return;
  }

  console.log('\n2. Sending test email to:', adminEmail);
  try {
    const info = await transporter.sendMail({
      from: `NEC Grievance Portal <${user}>`,
      to: adminEmail,
      subject: 'NEC Grievance Portal — Test Email Verification',
      text: 'This is a test email to confirm that your Gmail App Password and Nodemailer configuration are working correctly!',
    });
    console.log('✅ Email successfully sent! Message ID:', info.messageId);
    console.log('👉 Please check your Gmail Inbox (or Spam/Promotions folder) for:', adminEmail);
  } catch (sendError) {
    console.error('❌ Failed to send email:', sendError.message);
  }
}

runTest();

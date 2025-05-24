#!/usr/bin/env node

const nodemailer = require('nodemailer');

async function main() {
  // Generate test SMTP service account from ethereal.email
  const testAccount = await nodemailer.createTestAccount();

  console.log('Ethereal Email Credentials:');
  console.log('EMAIL_HOST=smtp.ethereal.email');
  console.log('EMAIL_PORT=587');
  console.log('EMAIL_SECURE=false');
  console.log(`EMAIL_USER=${testAccount.user}`);
  console.log(`EMAIL_PASS=${testAccount.pass}`);
  console.log(`Preview URL: ${nodemailer.getTestMessageUrl(null)}`);
  console.log('\nAdd these to your .env file to test emails');
}

main().catch(console.error);
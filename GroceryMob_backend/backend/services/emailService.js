/**
 * emailService.js
 * ───────────────────────────────────────────────────────────────
 * Stub email service for NearMart backend.
 *
 * TODO: Integrate a real email provider such as:
 *   - Nodemailer + Gmail/SMTP
 *   - SendGrid (npm install @sendgrid/mail)
 *   - AWS SES
 *
 * Usage example (once implemented):
 *   const { sendWelcomeEmail } = require('../services/emailService');
 *   await sendWelcomeEmail(user.email, user.name);
 */

/**
 * Send a welcome email after user registration.
 * @param {string} to - Recipient email address
 * @param {string} name - Recipient's name
 */
const sendWelcomeEmail = async (to, name) => {
  // TODO: Replace with real implementation
  console.log(`[EmailService] Welcome email queued for ${name} <${to}>`);
};

/**
 * Send a password reset link email.
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Plain-text reset token
 * @param {string} frontendUrl - Base URL for the reset link
 */
const sendPasswordResetEmail = async (to, resetToken, frontendUrl) => {
  const resetLink = `${frontendUrl}/reset-password/${resetToken}`;
  // TODO: Replace with real implementation
  console.log(`[EmailService] Password reset email queued for <${to}>`);
  console.log(`[EmailService] Reset link: ${resetLink}`);
};

/**
 * Send an order confirmation email.
 * @param {string} to - Recipient email address
 * @param {object} order - Order document
 */
const sendOrderConfirmationEmail = async (to, order) => {
  // TODO: Replace with real implementation
  console.log(`[EmailService] Order confirmation queued for <${to}>, order #${order.orderNumber}`);
};

/**
 * Send an order status update email.
 * @param {string} to - Recipient email address
 * @param {object} order - Order document with updated status
 */
const sendOrderStatusEmail = async (to, order) => {
  // TODO: Replace with real implementation
  console.log(`[EmailService] Order status update queued for <${to}>, status: ${order.orderStatus}`);
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
};

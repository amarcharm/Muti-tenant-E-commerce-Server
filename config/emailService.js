const nodemailer = require('nodemailer');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on server start
transporter.verify((error) => {
  if (error) {
    console.log('Email service error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

// ─── Email Templates ────────────────────────────────────────────

// Order confirmation email sent to customer
const sendOrderConfirmation = async ({ toEmail, customerName, orderId, items, totalAmount, deliveryAddress }) => {
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a3d; color: #ccc;">
        ${item.productId?.name || 'Product'}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a3d; color: #ccc; text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #2a2a3d; color: #ccc; text-align:right;">
        ₹${item.price * item.quantity}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="background:#0f0e1a; padding:40px 20px; font-family:Arial,sans-serif;">
      <div style="max-width:560px; margin:0 auto; background:#1a1830; border-radius:16px; overflow:hidden;">

        <!-- Header -->
        <div style="background:#4f46e5; padding:28px 32px;">
          <h1 style="color:#fff; margin:0; font-size:22px; font-weight:700;">ShopHub</h1>
          <p style="color:rgba(255,255,255,0.7); margin:6px 0 0; font-size:14px;">Order Confirmation</p>
        </div>

        <!-- Body -->
        <div style="padding:32px;">
          <p style="color:#fff; font-size:16px; margin:0 0 8px;">Hi ${customerName},</p>
          <p style="color:#aaa; font-size:14px; margin:0 0 24px; line-height:1.6;">
            Your order has been placed successfully! We will notify you when it ships.
          </p>

          <!-- Order ID -->
          <div style="background:#0f0e1a; border-radius:10px; padding:14px 18px; margin-bottom:24px;">
            <p style="color:#aaa; font-size:12px; margin:0 0 4px;">Order ID</p>
            <p style="color:#818cf8; font-size:13px; font-family:monospace; margin:0;">${orderId}</p>
          </div>

          <!-- Items table -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
            <thead>
              <tr>
                <th style="padding:10px; text-align:left; color:#aaa; font-size:12px; border-bottom:1px solid #2a2a3d;">Item</th>
                <th style="padding:10px; text-align:center; color:#aaa; font-size:12px; border-bottom:1px solid #2a2a3d;">Qty</th>
                <th style="padding:10px; text-align:right; color:#aaa; font-size:12px; border-bottom:1px solid #2a2a3d;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- Total -->
          <div style="text-align:right; margin-bottom:24px;">
            <p style="color:#aaa; font-size:13px; margin:0 0 4px;">Total amount</p>
            <p style="color:#fff; font-size:20px; font-weight:700; margin:0;">₹${totalAmount}</p>
          </div>

          <!-- Delivery address -->
          <div style="background:#0f0e1a; border-radius:10px; padding:14px 18px;">
            <p style="color:#aaa; font-size:12px; margin:0 0 8px;">Delivery address</p>
            <p style="color:#fff; font-size:14px; margin:0;">${deliveryAddress.fullName}</p>
            <p style="color:#aaa; font-size:13px; margin:4px 0 0;">
              ${deliveryAddress.street}, ${deliveryAddress.city},
              ${deliveryAddress.state} — ${deliveryAddress.pincode}
            </p>
            <p style="color:#aaa; font-size:13px; margin:4px 0 0;">📞 ${deliveryAddress.phone}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:20px 32px; border-top:1px solid #2a2a3d;">
          <p style="color:#555; font-size:12px; margin:0; text-align:center;">
            Thank you for shopping with ShopHub · © 2025 ShopHub
          </p>
        </div>

      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"ShopHub" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: `Order Confirmed — ₹${totalAmount} · ShopHub`,
    html,
  });
};

// Status update email sent to customer when vendor updates order
const sendStatusUpdate = async ({ toEmail, customerName, orderId, status }) => {
  const STATUS_MESSAGES = {
    processing: { emoji: '⚙️', text: 'Your order is being processed.',    color: '#3b82f6' },
    shipped:    { emoji: '🚚', text: 'Your order has been shipped!',        color: '#6366f1' },
    delivered:  { emoji: '✅', text: 'Your order has been delivered!',      color: '#22c55e' },
    cancelled:  { emoji: '❌', text: 'Your order has been cancelled.',      color: '#ef4444' },
  };

  const info = STATUS_MESSAGES[status] || {
    emoji: '📦', text: `Your order status has been updated to ${status}.`, color: '#4f46e5',
  };

  const html = `
    <div style="background:#0f0e1a; padding:40px 20px; font-family:Arial,sans-serif;">
      <div style="max-width:560px; margin:0 auto; background:#1a1830; border-radius:16px; overflow:hidden;">

        <div style="background:${info.color}; padding:28px 32px;">
          <h1 style="color:#fff; margin:0; font-size:22px; font-weight:700;">ShopHub</h1>
          <p style="color:rgba(255,255,255,0.7); margin:6px 0 0; font-size:14px;">Order Update</p>
        </div>

        <div style="padding:32px; text-align:center;">
          <div style="font-size:48px; margin-bottom:16px;">${info.emoji}</div>
          <h2 style="color:#fff; font-size:20px; margin:0 0 12px; font-weight:700; text-transform:capitalize;">
            ${status}
          </h2>
          <p style="color:#aaa; font-size:14px; margin:0 0 24px; line-height:1.6;">
            Hi ${customerName}, ${info.text}
          </p>
          <div style="background:#0f0e1a; border-radius:10px; padding:14px 18px; display:inline-block;">
            <p style="color:#aaa; font-size:12px; margin:0 0 4px;">Order ID</p>
            <p style="color:#818cf8; font-size:13px; font-family:monospace; margin:0;">${orderId}</p>
          </div>
        </div>

        <div style="padding:20px 32px; border-top:1px solid #2a2a3d;">
          <p style="color:#555; font-size:12px; margin:0; text-align:center;">
            Thank you for shopping with ShopHub · © 2025 ShopHub
          </p>
        </div>

      </div>
    </div>
  `;

  await transporter.sendMail({
    from:    `"ShopHub" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: `Order ${status.charAt(0).toUpperCase() + status.slice(1)} · ShopHub`,
    html,
  });
};

module.exports = { sendOrderConfirmation, sendStatusUpdate };
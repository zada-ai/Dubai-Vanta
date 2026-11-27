import nodemailer from 'nodemailer';

export function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER || '';
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

export function buildOrderHtml({ orderId, customerName, customerEmail, customerPhone, shippingAddress, items, totalAmount, paymentMethod, isForAdmin }) {
  const itemList = Array.isArray(items) ? items : [];
  const itemsHtml = itemList.map((item, idx) => `
    <tr style="border-bottom: 1px solid #f1ece4;">
      <td style="padding: 12px 8px; font-size: 14px; color: #1e293b;">
        <strong>${item.name || 'Product'}</strong>
        ${item.selectedColor ? `<br><span style="font-size: 11px; color: #64748b;">Color: ${item.selectedColor}</span>` : ''}
        ${item.selectedSize ? `<span style="font-size: 11px; color: #64748b; margin-left: 8px;">Size: ${item.selectedSize}</span>` : ''}
      </td>
      <td style="padding: 12px 8px; font-size: 14px; color: #1e293b; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px 8px; font-size: 14px; color: #1e293b; text-align: right; font-weight: bold;">AED ${Number(item.price || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${isForAdmin ? 'New Order Alert' : 'Order Confirmation'}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5f1; margin: 0; padding: 24px; color: #35152F;">
    <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(53,21,47,0.08); border: 1px solid #e7ded2;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #35152F 0%, #A83E68 50%, #D9A441 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 2px;">VANTA DUBAI</h1>
        <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.95;">
          ${isForAdmin ? '🛍️ New Customer Order Received' : '✨ Thank you for your order!'}
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 28px 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f7f5f1; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #A83E68;">Order Reference</span>
            <h2 style="margin: 2px 0 0 0; font-size: 18px; color: #35152F; font-family: monospace;">#${orderId}</h2>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #fdf6ec; color: #D9A441; border: 1px solid #D9A441; font-size: 12px; font-weight: bold;">
              💵 ${paymentMethod || 'Cash on Delivery'}
            </span>
          </div>
        </div>

        <!-- Customer & Shipping Box -->
        <div style="background: #fbf9f6; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #eee7dd;">
          <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #A83E68;">
            ${isForAdmin ? 'Customer Details' : 'Delivery Address'}
          </h3>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${customerName || 'Customer'}</p>
          ${customerPhone ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${customerPhone}</p>` : ''}
          ${customerEmail ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${customerEmail}</p>` : ''}
          <p style="margin: 4px 0; font-size: 14px;"><strong>Address:</strong> ${shippingAddress || 'Dubai, United Arab Emirates'}</p>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="border-bottom: 2px solid #35152F; text-align: left;">
              <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #35152F;">Item</th>
              <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #35152F; text-align: center;">Qty</th>
              <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #35152F; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Total Box -->
        <div style="border-top: 2px solid #35152F; padding-top: 14px; text-align: right;">
          <p style="margin: 0; font-size: 13px; color: #64748b;">Grand Total</p>
          <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: 900; color: #35152F;">AED ${Number(totalAmount || 0).toFixed(2)}</p>
        </div>

        ${!isForAdmin ? `
          <div style="margin-top: 24px; padding: 16px; border-radius: 12px; background: #faf5ea; border-left: 4px solid #D9A441;">
            <p style="margin: 0; font-size: 13px; color: #5a4214; line-height: 1.5;">
              <strong>Cash on Delivery (COD):</strong> Please keep the exact amount <strong>AED ${Number(totalAmount || 0).toFixed(2)}</strong> ready for our courier driver upon delivery. Our rider will contact you via WhatsApp/call before delivery.
            </p>
          </div>
        ` : `
          <div style="margin-top: 24px; text-align: center;">
            <a href="https://forestgreen-bison-920236.hostingersite.com/admin/orders" style="display: inline-block; background: #35152F; color: #D9A441; padding: 12px 24px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 14px;">
              View in Admin Dashboard &rarr;
            </a>
          </div>
        `}
      </div>

      <!-- Footer -->
      <div style="background: #f7f5f1; border-top: 1px solid #eee7dd; padding: 18px 24px; text-align: center; font-size: 12px; color: #887b6e;">
        <p style="margin: 0;">Vanta Dubai • Premium Shopping Delivered Across UAE</p>
        <p style="margin: 4px 0 0 0;">Need help? WhatsApp us or reply to this email.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export async function sendOrderEmails(orderData) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[Mailer] SMTP credentials not fully configured in .env. Skipping email dispatch.');
    return false;
  }

  const senderEmail = process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SMTP_USER || 'sohaibmehmood0067@gmail.com';
  const customerEmail = orderData.customerEmail;

  // 1. Send Admin Notification Email
  try {
    const adminHtml = buildOrderHtml({ ...orderData, isForAdmin: true });
    await transporter.sendMail({
      from: `"Vanta Dubai Orders" <${senderEmail}>`,
      to: adminEmail,
      subject: `🛍️ New Order Received: #${orderData.orderId} (AED ${Number(orderData.totalAmount || 0).toFixed(2)})`,
      html: adminHtml
    });
    console.log(`[Mailer] Admin order notification sent to ${adminEmail}`);
  } catch (err) {
    console.error('[Mailer] Failed to send admin email:', err.message);
  }

  // 2. Send Customer Order Confirmation Email (if valid email provided)
  if (customerEmail && customerEmail.includes('@') && !customerEmail.includes('example.com')) {
    try {
      const custHtml = buildOrderHtml({ ...orderData, isForAdmin: false });
      await transporter.sendMail({
        from: `"Vanta Dubai" <${senderEmail}>`,
        to: customerEmail,
        subject: `✨ Your Vanta Dubai Order is Confirmed: #${orderData.orderId}`,
        html: custHtml
      });
      console.log(`[Mailer] Customer order confirmation sent to ${customerEmail}`);
    } catch (err) {
      console.error('[Mailer] Failed to send customer email:', err.message);
    }
  }

  return true;
}

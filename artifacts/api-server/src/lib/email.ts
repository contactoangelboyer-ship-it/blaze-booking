import { Resend } from "resend";
import { logger } from "./logger";
import type { Reservation } from "@workspace/db";

const COMPANY_EMAIL = "blazelicarservice@gmail.com";
const COMPANY_NAME = "Blaze Long Island Car Services";
const COMPANY_PHONE = "631-374-6154";
const COMPANY_WEBSITE = "blazelicarservicesllc.com";
const FROM_ADDRESS = "reservations@blazelicarservicesllc.com";

const resend = new Resend(process.env.RESEND_API_KEY ?? "placeholder_not_configured");

function formatServiceType(type: string): string {
  const map: Record<string, string> = {
    airport_transfer: "Airport Transfer",
    point_to_point: "Point-to-Point",
    hourly: "Hourly / As Directed",
    corporate: "Corporate",
    special_event: "Special Event",
  };
  return map[type] ?? type;
}

function formatVehicle(type: string): string {
  return type === "suv" ? "Lincoln Navigator (Luxury SUV)" : "Lincoln Continental (Luxury Sedan)";
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr) return timeStr;
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${String(m).padStart(2, "0")} ${period}`;
}

function buildInvoiceHtml(reservation: Reservation): string {
  const total = Number(reservation.estimatedFare);
  const gratuity = total / 1.20 * 0.20;
  const baseRate = total - gratuity;
  const issuedDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const quoteNumber = `BLZ-${String(reservation.id).padStart(5, "0")}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:640px;margin:24px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1);">

  <!-- Header -->
  <div style="background:#0a0a0a;padding:32px 40px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <h1 style="color:#e63946;margin:0;font-size:30px;letter-spacing:4px;font-weight:900;">BLAZE</h1>
      <p style="color:#888;margin:3px 0 0;font-size:10px;letter-spacing:4px;text-transform:uppercase;">Long Island Car Services</p>
    </div>
    <div style="text-align:right;">
      <p style="color:#e63946;margin:0;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Service Quote</p>
      <p style="color:#fff;margin:4px 0 0;font-size:22px;font-weight:800;">${quoteNumber}</p>
    </div>
  </div>

  <!-- Status Banner -->
  <div style="background:#e63946;padding:10px 40px;text-align:center;">
    <p style="margin:0;color:#fff;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
      ✓ &nbsp; Reservation Received — Pending Confirmation
    </p>
  </div>

  <div style="padding:36px 40px;">

    <!-- Bill To / Quote Info -->
    <table style="width:100%;margin-bottom:32px;border-collapse:collapse;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <p style="margin:0 0 6px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Bill To</p>
          <p style="margin:0;font-size:16px;font-weight:700;color:#111;">${reservation.firstName} ${reservation.lastName}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#555;">${reservation.email}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#555;">${reservation.phone}</p>
        </td>
        <td style="vertical-align:top;text-align:right;width:50%;">
          <p style="margin:0 0 6px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Quote Details</p>
          <p style="margin:0;font-size:13px;color:#555;"><span style="color:#888;">Date Issued:</span> ${issuedDate}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#555;"><span style="color:#888;">Pickup Date:</span> ${formatDate(reservation.pickupDate)}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#555;"><span style="color:#888;">Pickup Time:</span> ${formatTime(reservation.pickupTime)}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#555;"><span style="color:#888;">Status:</span> <span style="color:#e63946;font-weight:700;">Pending</span></p>
        </td>
      </tr>
    </table>

    <!-- Divider -->
    <div style="border-top:2px solid #e63946;margin-bottom:24px;"></div>

    <!-- Service Details Table -->
    <p style="margin:0 0 12px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Service Details</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#0a0a0a;">
          <th style="padding:10px 12px;text-align:left;font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Description</th>
          <th style="padding:10px 12px;text-align:right;font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Detail</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Service Type</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;">${formatServiceType(reservation.serviceType)}</td>
        </tr>
        <tr style="background:#fafafa;border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Vehicle</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;">${formatVehicle(reservation.vehicleType)}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Pickup Location</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;max-width:200px;">${reservation.pickupAddress}</td>
        </tr>
        <tr style="background:#fafafa;border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Dropoff Location</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;max-width:200px;">${reservation.dropoffAddress || "As Directed"}</td>
        </tr>
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Passengers</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;">${reservation.passengers}</td>
        </tr>
        ${reservation.luggage ? `
        <tr style="background:#fafafa;border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Luggage</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;">${reservation.luggage} bag(s)</td>
        </tr>` : ""}
        ${reservation.hours ? `
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Duration</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;">${reservation.hours} hours</td>
        </tr>` : ""}
        ${reservation.flightNumber ? `
        <tr style="background:#fafafa;border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Flight Number</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;">${reservation.flightNumber}</td>
        </tr>` : ""}
        ${reservation.specialRequests ? `
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 12px;font-size:13px;color:#555;">Special Requests</td>
          <td style="padding:10px 12px;font-size:13px;color:#111;text-align:right;font-weight:600;font-style:italic;">${reservation.specialRequests}</td>
        </tr>` : ""}
      </tbody>
    </table>

    <!-- Fare Breakdown -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
      <tr>
        <td style="padding:8px 12px;font-size:13px;color:#666;">Base Rate</td>
        <td style="padding:8px 12px;font-size:13px;color:#111;text-align:right;">$${baseRate.toFixed(2)}</td>
      </tr>
      <tr style="background:#fafafa;">
        <td style="padding:8px 12px;font-size:13px;color:#666;">Gratuity (20%)</td>
        <td style="padding:8px 12px;font-size:13px;color:#111;text-align:right;">$${gratuity.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:6px 12px;font-size:11px;color:#aaa;" colspan="2">* Tolls, parking and additional stops not included</td>
      </tr>
      <tr style="border-top:2px solid #0a0a0a;">
        <td style="padding:14px 12px;font-size:15px;font-weight:800;color:#0a0a0a;text-transform:uppercase;letter-spacing:1px;">Estimated Total</td>
        <td style="padding:14px 12px;font-size:24px;font-weight:900;color:#e63946;text-align:right;">$${total.toFixed(2)}</td>
      </tr>
    </table>

    <!-- Payment Methods -->
    <div style="background:#f8f8f8;border:1px solid #eee;border-radius:6px;padding:20px 24px;margin-bottom:28px;">
      <p style="margin:0 0 14px;font-size:10px;color:#999;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Accepted Payment Methods</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:50%;vertical-align:top;padding-right:12px;">
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:6px;padding:14px 16px;text-align:center;">
              <p style="margin:0;font-size:22px;">💵</p>
              <p style="margin:6px 0 0;font-size:14px;font-weight:700;color:#111;">Cash</p>
              <p style="margin:4px 0 0;font-size:11px;color:#888;">Pay your driver directly</p>
            </div>
          </td>
          <td style="width:50%;vertical-align:top;padding-left:12px;">
            <div style="background:#fff;border:1px solid #e0e0e0;border-radius:6px;padding:14px 16px;text-align:center;">
              <p style="margin:0;font-size:22px;">💳</p>
              <p style="margin:6px 0 0;font-size:14px;font-weight:700;color:#111;">Credit / Debit Card</p>
              <p style="margin:4px 0 0;font-size:11px;color:#888;">All major cards accepted</p>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Notes -->
    <div style="background:#fff8f0;border-left:4px solid #e63946;padding:14px 18px;border-radius:0 6px 6px 0;margin-bottom:28px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#111;">Important Notes</p>
      <ul style="margin:0;padding-left:18px;font-size:12px;color:#555;line-height:1.7;">
        <li>This is an estimated quote. Final fare may vary based on actual distance and time.</li>
        <li>Our team will contact you to confirm your reservation details.</li>
        <li>Please provide your flight number for airport pickups — we monitor flight status.</li>
        <li>Cancellations must be made at least 4 hours before scheduled pickup.</li>
      </ul>
    </div>

    <!-- Contact -->
    <div style="text-align:center;padding:20px 0;border-top:1px solid #f0f0f0;">
      <p style="margin:0 0 8px;font-size:13px;color:#555;">Questions about your reservation?</p>
      <p style="margin:0;">
        <a href="tel:6313746154" style="color:#e63946;font-weight:700;font-size:15px;text-decoration:none;">${COMPANY_PHONE}</a>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <a href="mailto:${COMPANY_EMAIL}" style="color:#e63946;font-size:13px;text-decoration:none;">${COMPANY_EMAIL}</a>
      </p>
    </div>

  </div>

  <!-- Footer -->
  <div style="background:#0a0a0a;padding:20px 40px;text-align:center;">
    <p style="color:#444;margin:0;font-size:11px;letter-spacing:1px;">LUXURY · COMFORT · RELIABILITY</p>
    <p style="color:#333;margin:6px 0 0;font-size:11px;">${COMPANY_NAME} &nbsp;·&nbsp; ${COMPANY_WEBSITE}</p>
    <p style="color:#333;margin:4px 0 0;font-size:10px;">Long Island, New York</p>
  </div>

</div>
</body>
</html>
  `;
}

export async function sendClientConfirmationEmail(reservation: Reservation): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set — skipping client email");
    return;
  }
  const quoteNumber = `BLZ-${String(reservation.id).padStart(5, "0")}`;
  try {
    const result = await resend.emails.send({
      from: `${COMPANY_NAME} <${FROM_ADDRESS}>`,
      to: reservation.email,
      replyTo: COMPANY_EMAIL,
      subject: `Your Service Quote ${quoteNumber} — Blaze Long Island Car Services`,
      html: buildInvoiceHtml(reservation),
    });
    logger.info({ reservationId: reservation.id, email: reservation.email, emailId: result.data?.id }, "✅ Client quote/invoice email sent");
  } catch (err) {
    logger.error({ err, reservationId: reservation.id, email: reservation.email }, "❌ Failed to send client quote email");
    throw err;
  }
}

export async function sendOperatorNotificationEmail(reservation: Reservation): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set — skipping operator email");
    return;
  }
  const quoteNumber = `BLZ-${String(reservation.id).padStart(5, "0")}`;
  const total = Number(reservation.estimatedFare);

  try {
    const result = await resend.emails.send({
      from: `Blaze Reservations <${FROM_ADDRESS}>`,
      to: COMPANY_EMAIL,
      replyTo: reservation.email,
      subject: `🚗 NEW BOOKING ${quoteNumber} — ${reservation.firstName} ${reservation.lastName} — ${reservation.pickupDate}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<div style="max-width:600px;margin:24px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1);">

  <div style="background:#0a0a0a;padding:24px 32px;">
    <h1 style="color:#e63946;margin:0;font-size:22px;letter-spacing:2px;">🚗 NEW RESERVATION</h1>
    <p style="color:#888;margin:4px 0 0;font-size:11px;letter-spacing:3px;">BLAZE LONG ISLAND CAR SERVICES</p>
  </div>

  <div style="background:#e63946;padding:12px 32px;text-align:center;">
    <p style="margin:0;color:#fff;font-size:14px;font-weight:700;">
      ${quoteNumber} &nbsp;·&nbsp; ${formatDate(reservation.pickupDate)} at ${formatTime(reservation.pickupTime)} &nbsp;·&nbsp; $${total.toFixed(2)}
    </p>
  </div>

  <div style="padding:28px 32px;">

    <!-- Client Info -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f9f9f9;border-radius:6px;overflow:hidden;">
      <tr><td colspan="2" style="padding:10px 14px;background:#0a0a0a;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Client</td></tr>
      <tr><td style="padding:9px 14px;font-size:13px;color:#888;width:35%;">Name</td><td style="padding:9px 14px;font-size:13px;font-weight:700;color:#111;">${reservation.firstName} ${reservation.lastName}</td></tr>
      <tr style="background:#fff;"><td style="padding:9px 14px;font-size:13px;color:#888;">Phone</td><td style="padding:9px 14px;font-size:13px;"><a href="tel:${reservation.phone}" style="color:#e63946;font-weight:700;text-decoration:none;">${reservation.phone}</a></td></tr>
      <tr><td style="padding:9px 14px;font-size:13px;color:#888;">Email</td><td style="padding:9px 14px;font-size:13px;"><a href="mailto:${reservation.email}" style="color:#e63946;text-decoration:none;">${reservation.email}</a></td></tr>
    </table>

    <!-- Trip Info -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;background:#f9f9f9;border-radius:6px;overflow:hidden;">
      <tr><td colspan="2" style="padding:10px 14px;background:#0a0a0a;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Trip</td></tr>
      <tr><td style="padding:9px 14px;font-size:13px;color:#888;width:35%;">Service</td><td style="padding:9px 14px;font-size:13px;font-weight:600;color:#111;">${formatServiceType(reservation.serviceType)}</td></tr>
      <tr style="background:#fff;"><td style="padding:9px 14px;font-size:13px;color:#888;">Vehicle</td><td style="padding:9px 14px;font-size:13px;font-weight:600;color:#111;">${formatVehicle(reservation.vehicleType)}</td></tr>
      <tr><td style="padding:9px 14px;font-size:13px;color:#888;">Pickup</td><td style="padding:9px 14px;font-size:13px;font-weight:600;color:#111;">${reservation.pickupAddress}</td></tr>
      <tr style="background:#fff;"><td style="padding:9px 14px;font-size:13px;color:#888;">Dropoff</td><td style="padding:9px 14px;font-size:13px;font-weight:600;color:#111;">${reservation.dropoffAddress || "As Directed"}</td></tr>
      <tr><td style="padding:9px 14px;font-size:13px;color:#888;">Passengers</td><td style="padding:9px 14px;font-size:13px;color:#111;">${reservation.passengers} pax &nbsp;·&nbsp; ${reservation.luggage ?? 0} bags</td></tr>
      ${reservation.flightNumber ? `<tr style="background:#fff;"><td style="padding:9px 14px;font-size:13px;color:#888;">Flight #</td><td style="padding:9px 14px;font-size:13px;font-weight:700;color:#e63946;">${reservation.flightNumber}</td></tr>` : ""}
      ${reservation.hours ? `<tr><td style="padding:9px 14px;font-size:13px;color:#888;">Duration</td><td style="padding:9px 14px;font-size:13px;color:#111;">${reservation.hours} hours</td></tr>` : ""}
      ${reservation.specialRequests ? `<tr style="background:#fff;"><td style="padding:9px 14px;font-size:13px;color:#888;">Notes</td><td style="padding:9px 14px;font-size:13px;font-style:italic;color:#555;">${reservation.specialRequests}</td></tr>` : ""}
    </table>

    <!-- Total -->
    <div style="background:#0a0a0a;border-radius:6px;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <span style="color:#aaa;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Estimated Fare</span>
      <span style="color:#e63946;font-size:26px;font-weight:900;">$${total.toFixed(2)}</span>
    </div>

    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:12px 16px;font-size:12px;color:#166534;">
      ✅ Reservation saved to database. <a href="https://${process.env.REPLIT_DOMAINS}/admin" style="color:#166534;font-weight:700;">Open Admin Panel →</a>
    </div>
  </div>

  <div style="background:#0a0a0a;padding:16px 32px;text-align:center;">
    <p style="color:#333;margin:0;font-size:11px;">${COMPANY_NAME} · Long Island, New York</p>
  </div>

</div>
</body>
</html>
      `,
    });
    logger.info({ reservationId: reservation.id, emailId: result.data?.id }, "✅ Operator notification sent to Gmail");
  } catch (err) {
    logger.error({ err, reservationId: reservation.id }, "❌ Failed to send operator notification email");
    throw err;
  }
}

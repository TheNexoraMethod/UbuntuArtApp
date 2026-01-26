// Email template utilities for Ubuntu Art Village

// Base email wrapper for consistent styling
function createEmailWrapper(content, title = "Ubuntu Art Village") {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #F0F9F4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 600;">Ubuntu Art Village</h1>
            <p style="color: #E5F7EC; margin: 8px 0 0 0; font-size: 16px;">Artist Community & Coastal Retreat</p>
          </div>

          <!-- Content -->
          ${content}

          <!-- Footer -->
          <div style="background-color: #F9FAFB; padding: 20px 30px; text-align: center; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
              © 2024 Ubuntu Art Village. All rights reserved.
            </p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #9CA3AF;">
              Bwejuu, Zanzibar, Tanzania
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Calculate nights between dates
function calculateNights(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// 1. BOOKING CONFIRMATION EMAIL
export function createBookingConfirmationEmail(booking, residency) {
  const nights = calculateNights(booking.start_date, booking.end_date);

  const content = `
    <div style="padding: 40px 30px;">
      <h2 style="color: #166534; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Booking Confirmed! 🎉</h2>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Dear ${booking.guest_full_name || "Guest"},
      </p>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Your booking at Ubuntu Art Village has been confirmed! We're excited to welcome you to our coastal paradise in Zanzibar.
      </p>

      <!-- Booking Details Card -->
      <div style="background-color: #F0F9F4; border: 2px solid #22C55E; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Your Booking Details</h3>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Booking ID:</strong>
          <span style="color: #6B7280;"> #${booking.id}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Guest Name:</strong>
          <span style="color: #6B7280;"> ${booking.guest_full_name}</span>
        </div>

        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Email:</strong>
          <span style="color: #6B7280;"> ${booking.guest_email}</span>
        </div>

        ${
          booking.guest_phone
            ? `
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Phone:</strong>
          <span style="color: #6B7280;"> ${booking.guest_phone}</span>
        </div>
        `
            : ""
        }
        
        <div style="border-top: 1px solid #D1FAE5; margin: 16px 0; padding-top: 16px;">
          <strong style="color: #374151;">Room:</strong>
          <span style="color: #6B7280;"> ${residency.title}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Check-in:</strong>
          <span style="color: #6B7280;"> ${formatDate(booking.start_date)} at 3:00 PM</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Check-out:</strong>
          <span style="color: #6B7280;"> ${formatDate(booking.end_date)} at 12:00 PM (Noon)</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Duration:</strong>
          <span style="color: #6B7280;"> ${nights} night${nights > 1 ? "s" : ""}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Number of Guests:</strong>
          <span style="color: #6B7280;"> ${booking.number_of_guests || 1}</span>
        </div>
        
        ${
          booking.arrival_time
            ? `
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Arrival Time:</strong>
          <span style="color: #6B7280;"> ${booking.arrival_time}</span>
        </div>
        `
            : ""
        }
        
        <div style="border-top: 1px solid #D1FAE5; margin: 16px 0; padding-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #166534; font-size: 18px;">Total Amount:</strong>
            <strong style="color: #F59E0B; font-size: 20px;">$${Number(booking.total_price).toFixed(2)}</strong>
          </div>
          <div style="margin-top: 8px;">
            <span style="color: #22C55E; font-size: 14px;">✓ Breakfast included</span>
          </div>
        </div>
      </div>

      <!-- Important Information -->
      <div style="border-left: 4px solid #F59E0B; background-color: #FEF3C7; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #92400E; font-size: 16px;">Location & Contact</h4>
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>Address:</strong> Bwejuu, Zanzibar, Tanzania<br>
          <strong>Check-in:</strong> 3:00 PM (15:00)<br>
          <strong>Check-out:</strong> 12:00 PM (Noon)<br>
          <strong>Questions?</strong> Reply to this email
        </p>
      </div>

      <p style="margin: 20px 0; font-size: 16px;">
        We look forward to hosting you and making your stay memorable!
      </p>

      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6B7280;">
        Warmly,<br>
        <strong>The Ubuntu Art Village Team</strong>
      </p>
    </div>
  `;

  const textContent = `
Ubuntu Art Village - Booking Confirmation

Dear ${booking.guest_full_name || "Guest"},

Your booking at Ubuntu Art Village has been confirmed!

BOOKING DETAILS
Booking ID: #${booking.id}
Guest Name: ${booking.guest_full_name}
Email: ${booking.guest_email}
${booking.guest_phone ? `Phone: ${booking.guest_phone}` : ""}

Room: ${residency.title}
Check-in: ${formatDate(booking.start_date)} at 3:00 PM
Check-out: ${formatDate(booking.end_date)} at 12:00 PM (Noon)
Duration: ${nights} night${nights > 1 ? "s" : ""}
Number of Guests: ${booking.number_of_guests || 1}
${booking.arrival_time ? `Arrival Time: ${booking.arrival_time}` : ""}

Total Amount: $${Number(booking.total_price).toFixed(2)}
✓ Breakfast included

LOCATION & CONTACT
Address: Bwejuu, Zanzibar, Tanzania
Check-in: 3:00 PM (15:00)
Check-out: 12:00 PM (Noon)
Questions? Reply to this email

We look forward to hosting you!

Warmly,
The Ubuntu Art Village Team
  `;

  return {
    subject: `Booking Confirmed - ${residency.title} | Ubuntu Art Village`,
    html: createEmailWrapper(content, "Booking Confirmed - Ubuntu Art Village"),
    text: textContent,
  };
}

// 2. ARTIST APPLICATION RECEIVED EMAIL
export function createApplicationReceivedEmail(application) {
  const content = `
    <div style="padding: 40px 30px;">
      <h2 style="color: #166534; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Application Received! 🎨</h2>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Dear ${application.user_name || "Artist"},
      </p>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Thank you for applying to the Ubuntu Art Village Artist Residency Programme! We have successfully received your application.
      </p>

      <!-- Application Details -->
      <div style="background-color: #F0F9F4; border: 2px solid #22C55E; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Application Summary</h3>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Application ID:</strong>
          <span style="color: #6B7280;"> #${application.id}</span>
        </div>

        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Name:</strong>
          <span style="color: #6B7280;"> ${application.user_name}</span>
        </div>

        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Email:</strong>
          <span style="color: #6B7280;"> ${application.user_email}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Submitted:</strong>
          <span style="color: #6B7280;"> ${formatDate(application.submitted_at)}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Status:</strong>
          <span style="color: #6B7280;"> Under Review</span>
        </div>
      </div>

      <!-- What Happens Next -->
      <div style="border-left: 4px solid #F59E0B; background-color: #FEF3C7; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #92400E; font-size: 16px;">What Happens Next?</h4>
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          1. Our selection committee will review your application<br>
          2. We'll evaluate your portfolio and artistic vision<br>
          3. You'll receive our decision within 2-4 weeks<br>
          4. If selected, we'll coordinate your residency dates
        </p>
      </div>

      <p style="margin: 20px 0; font-size: 16px;">
        If you have any questions, please feel free to reply to this email.
      </p>

      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6B7280;">
        Thank you for your interest!<br>
        <strong>The Ubuntu Art Village Team</strong>
      </p>
    </div>
  `;

  const textContent = `
Ubuntu Art Village - Application Received

Dear ${application.user_name || "Artist"},

Thank you for applying to the Ubuntu Art Village Artist Residency Programme!

APPLICATION SUMMARY
Application ID: #${application.id}
Name: ${application.user_name}
Email: ${application.user_email}
Submitted: ${formatDate(application.submitted_at)}
Status: Under Review

WHAT HAPPENS NEXT?
1. Our selection committee will review your application
2. We'll evaluate your portfolio and artistic vision
3. You'll receive our decision within 2-4 weeks
4. If selected, we'll coordinate your residency dates

If you have any questions, please reply to this email.

Thank you for your interest!
The Ubuntu Art Village Team
  `;

  return {
    subject: `Application Received - #${application.id} | Ubuntu Art Village`,
    html: createEmailWrapper(
      content,
      "Application Received - Ubuntu Art Village",
    ),
    text: textContent,
  };
}

// 3. APPLICATION APPROVED/REJECTED EMAIL
export function createApplicationStatusEmail(application, status, notes = "") {
  const isApproved = status === "approved";
  const statusColor = isApproved ? "#22C55E" : "#EF4444";
  const statusText = isApproved ? "Approved" : "Update";

  const content = `
    <div style="padding: 40px 30px;">
      <h2 style="color: ${statusColor}; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
        Application ${statusText} ${isApproved ? "🎉" : ""}
      </h2>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Dear ${application.user_name || "Artist"},
      </p>
      
      ${
        isApproved
          ? `
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Congratulations! We are thrilled to inform you that your application for the Ubuntu Art Village Artist Residency Programme has been <strong style="color: #22C55E;">approved</strong>!
        </p>
      `
          : `
        <p style="margin: 0 0 20px 0; font-size: 16px;">
          Thank you for your interest in the Ubuntu Art Village Artist Residency Programme. After careful consideration, we regret to inform you that we are unable to offer you a place at this time.
        </p>
      `
      }

      <div style="background-color: ${isApproved ? "#F0F9F4" : "#FEF2F2"}; border: 2px solid ${statusColor}; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: ${statusColor}; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Application Details</h3>
        
        <div style="margin-bottom: 12px;">
          <strong>Application ID:</strong> #${application.id}
        </div>

        <div style="margin-bottom: 12px;">
          <strong>Applicant:</strong> ${application.user_name}
        </div>

        <div style="margin-bottom: 12px;">
          <strong>Email:</strong> ${application.user_email}
        </div>

        <div style="margin-bottom: 12px;">
          <strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${status.toUpperCase()}</span>
        </div>
        ${
          notes
            ? `
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid ${isApproved ? "#D1FAE5" : "#FEE2E2"};">
          <strong>Message from our team:</strong>
          <p style="margin: 8px 0 0 0; color: #374151;">${notes}</p>
        </div>
        `
            : ""
        }
      </div>

      ${
        isApproved
          ? `
        <div style="border-left: 4px solid #F59E0B; background-color: #FEF3C7; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <h4 style="margin: 0 0 8px 0; color: #92400E; font-size: 16px;">Next Steps</h4>
          <p style="margin: 0; font-size: 14px; color: #92400E;">
            1. Our team will contact you within 3-5 business days<br>
            2. We'll discuss residency dates and arrangements<br>
            3. You'll receive detailed arrival information<br>
            4. We'll coordinate your accommodation and studio setup
          </p>
        </div>

        <p style="margin: 20px 0; font-size: 16px;">
          We are excited to welcome you to Ubuntu Art Village and support your creative journey!
        </p>
      `
          : `
        <p style="margin: 20px 0; font-size: 16px;">
          We received an exceptional number of applications this cycle. While we cannot accommodate everyone, we encourage you to apply again in the future.
        </p>
      `
      }

      <p style="margin: 20px 0; font-size: 16px;">
        If you have any questions, please don't hesitate to reply to this email.
      </p>

      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6B7280;">
        ${isApproved ? "Warmly," : "Best regards,"}<br>
        <strong>The Ubuntu Art Village Team</strong>
      </p>
    </div>
  `;

  const textContent = `
Ubuntu Art Village - Application ${statusText}

Dear ${application.user_name || "Artist"},

${
  isApproved
    ? `Congratulations! Your application for the Ubuntu Art Village Artist Residency Programme has been APPROVED!`
    : `Thank you for your interest in the Ubuntu Art Village Artist Residency Programme. After careful consideration, we are unable to offer you a place at this time.`
}

APPLICATION DETAILS
Application ID: #${application.id}
Applicant: ${application.user_name}
Email: ${application.user_email}
Status: ${status.toUpperCase()}

${notes ? `Message from our team:\n${notes}\n` : ""}

${
  isApproved
    ? `
NEXT STEPS
1. Our team will contact you within 3-5 business days
2. We'll discuss residency dates and arrangements
3. You'll receive detailed arrival information
4. We'll coordinate your accommodation and studio setup

We are excited to welcome you to Ubuntu Art Village!
`
    : `
We received an exceptional number of applications this cycle. We encourage you to apply again in the future.
`
}

If you have any questions, please reply to this email.

${isApproved ? "Warmly," : "Best regards,"}
The Ubuntu Art Village Team
  `;

  return {
    subject: isApproved
      ? `🎉 Application Approved - Ubuntu Art Village`
      : `Application Update - Ubuntu Art Village`,
    html: createEmailWrapper(
      content,
      `Application ${statusText} - Ubuntu Art Village`,
    ),
    text: textContent,
  };
}

// 4. EMAIL VERIFICATION EMAIL
export function createEmailVerificationEmail(
  userName,
  verificationLink,
  email,
) {
  const content = `
    <div style="padding: 40px 30px;">
      <h2 style="color: #166534; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Verify Your Email Address 📧</h2>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Hello ${userName || "there"},
      </p>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Welcome to Ubuntu Art Village! Please verify your email address to complete your account setup.
      </p>

      <!-- Verification Details -->
      <div style="background-color: #F0F9F4; border: 2px solid #22C55E; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Account Details</h3>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Name:</strong>
          <span style="color: #6B7280;"> ${userName || "Not provided"}</span>
        </div>
        
        <div style="margin-bottom: 12px;">
          <strong style="color: #374151;">Email:</strong>
          <span style="color: #6B7280;"> ${email}</span>
        </div>
      </div>

      <!-- Verify Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" 
           style="display: inline-block; background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: #FFFFFF; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Verify Email Address
        </a>
      </div>

      <div style="border-left: 4px solid #F59E0B; background-color: #FEF3C7; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>Link expires in 24 hours.</strong><br>
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>

      <p style="margin: 20px 0; font-size: 14px; color: #6B7280; line-height: 22px;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="${verificationLink}" style="color: #22C55E; word-break: break-all;">${verificationLink}</a>
      </p>

      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6B7280;">
        Welcome to our community!<br>
        <strong>The Ubuntu Art Village Team</strong>
      </p>
    </div>
  `;

  const textContent = `
Ubuntu Art Village - Verify Your Email

Hello ${userName || "there"},

Welcome to Ubuntu Art Village! Please verify your email address to complete your account setup.

ACCOUNT DETAILS
Name: ${userName || "Not provided"}
Email: ${email}

VERIFY YOUR EMAIL
Click the link below to verify your email address:
${verificationLink}

This link expires in 24 hours.
If you didn't create this account, you can safely ignore this email.

Welcome to our community!
The Ubuntu Art Village Team
  `;

  return {
    subject: "Verify Your Email - Ubuntu Art Village",
    html: createEmailWrapper(
      content,
      "Email Verification - Ubuntu Art Village",
    ),
    text: textContent,
  };
}

// 5. CONTACT FORM RESPONSE EMAIL
export function createContactFormResponseEmail(enquiry, responseMessage) {
  const content = `
    <div style="padding: 40px 30px;">
      <h2 style="color: #166534; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Response to Your Enquiry 💬</h2>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Dear ${enquiry.name},
      </p>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        Thank you for contacting Ubuntu Art Village. We're happy to respond to your enquiry.
      </p>

      <!-- Original Enquiry -->
      <div style="background-color: #F9FAFB; border-left: 4px solid #D1D5DB; border-radius: 4px; padding: 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 12px 0; color: #6B7280; font-size: 14px; text-transform: uppercase;">Your Original Message</h4>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
          <strong>Subject:</strong> ${enquiry.subject || "General Enquiry"}
        </p>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">
          <strong>Sent:</strong> ${formatDate(enquiry.created_at)}
        </p>
        <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap;">${enquiry.message}</p>
      </div>

      <!-- Response -->
      <div style="background-color: #F0F9F4; border: 2px solid #22C55E; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Our Response</h3>
        <p style="margin: 0; font-size: 16px; color: #374151; line-height: 24px; white-space: pre-wrap;">${responseMessage}</p>
      </div>

      <!-- Contact Info -->
      <div style="border-left: 4px solid #F59E0B; background-color: #FEF3C7; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #92400E; font-size: 16px;">Need More Help?</h4>
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>Reply to this email</strong> to continue the conversation<br>
          <strong>Visit us:</strong> Bwejuu, Zanzibar, Tanzania<br>
          <strong>Email:</strong> ${enquiry.email}
        </p>
      </div>

      <p style="margin: 20px 0; font-size: 16px;">
        We're always here to help and answer any questions you may have!
      </p>

      <p style="margin: 20px 0 0 0; font-size: 14px; color: #6B7280;">
        Warmly,<br>
        <strong>The Ubuntu Art Village Team</strong>
      </p>
    </div>
  `;

  const textContent = `
Ubuntu Art Village - Response to Your Enquiry

Dear ${enquiry.name},

Thank you for contacting Ubuntu Art Village. We're happy to respond to your enquiry.

YOUR ORIGINAL MESSAGE
Subject: ${enquiry.subject || "General Enquiry"}
Sent: ${formatDate(enquiry.created_at)}

${enquiry.message}

---

OUR RESPONSE

${responseMessage}

---

NEED MORE HELP?
Reply to this email to continue the conversation
Visit us: Bwejuu, Zanzibar, Tanzania
Email: ${enquiry.email}

We're always here to help!

Warmly,
The Ubuntu Art Village Team
  `;

  return {
    subject: `Re: ${enquiry.subject || "Your Enquiry"} - Ubuntu Art Village`,
    html: createEmailWrapper(
      content,
      "Response to Your Enquiry - Ubuntu Art Village",
    ),
    text: textContent,
  };
}

// Admin Notification for New Booking
export function createAdminBookingNotificationEmail(
  booking,
  residency,
  userEmail,
) {
  const nights = calculateNights(booking.start_date, booking.end_date);
  const roomType =
    residency.room_type === "standard_double"
      ? "Standard Double Room"
      : "Spacious Studio";

  const content = `
    <div style="padding: 40px 30px;">
      <h2 style="color: #166534; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Booking Received 📅</h2>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        A new ${booking.booking_type === "artist" ? "artist residency" : "guest"} booking has been submitted.
      </p>

      <div style="background-color: #F0F9F4; border: 2px solid #22C55E; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Booking Information</h3>
        
        <div style="margin-bottom: 12px;">
          <strong>Booking ID:</strong> #${booking.id}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Guest Name:</strong> ${booking.guest_full_name}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Email:</strong> ${booking.guest_email || userEmail}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Phone:</strong> ${booking.guest_phone || "Not provided"}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Room Type:</strong> ${roomType}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Check-in:</strong> ${formatDate(booking.start_date)}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Check-out:</strong> ${formatDate(booking.end_date)}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Nights:</strong> ${nights}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Guests:</strong> ${booking.number_of_guests}
        </div>
        ${booking.arrival_time ? `<div style="margin-bottom: 12px;"><strong>Arrival Time:</strong> ${booking.arrival_time}</div>` : ""}
        <div style="margin-bottom: 12px;">
          <strong>Booking Type:</strong> ${booking.booking_type === "artist" ? "Artist Residency" : "Guest Booking"}
        </div>
        ${booking.artist_type ? `<div style="margin-bottom: 12px;"><strong>Artist Type:</strong> ${booking.artist_type}</div>` : ""}
        <div style="border-top: 1px solid #D1FAE5; margin-top: 16px; padding-top: 16px;">
          <strong style="color: #F59E0B; font-size: 18px;">Total: $${Number(booking.total_price).toFixed(2)}</strong>
        </div>
        <div style="margin-top: 12px;">
          <strong>Payment Status:</strong> <span style="color: ${booking.payment_status === "paid" ? "#22C55E" : "#F59E0B"};">${booking.payment_status}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL}/admin/booking-dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View in Dashboard
        </a>
      </div>
    </div>
  `;

  const textContent = `
Ubuntu Art Village - New Booking

A new ${booking.booking_type === "artist" ? "artist residency" : "guest"} booking has been received.

BOOKING INFORMATION
Booking ID: #${booking.id}
Guest Name: ${booking.guest_full_name}
Email: ${booking.guest_email || userEmail}
Phone: ${booking.guest_phone || "Not provided"}
Room Type: ${roomType}
Check-in: ${formatDate(booking.start_date)}
Check-out: ${formatDate(booking.end_date)}
Nights: ${nights}
Guests: ${booking.number_of_guests}
${booking.arrival_time ? `Arrival Time: ${booking.arrival_time}` : ""}
Booking Type: ${booking.booking_type === "artist" ? "Artist Residency" : "Guest Booking"}
${booking.artist_type ? `Artist Type: ${booking.artist_type}` : ""}

Total: $${Number(booking.total_price).toFixed(2)}
Payment Status: ${booking.payment_status}

View in dashboard: ${process.env.APP_URL}/admin/booking-dashboard
  `;

  return {
    html: createEmailWrapper(content, "New Booking - Admin Notification"),
    text: textContent,
  };
}

// Admin Notification for New Application
export function createAdminApplicationNotificationEmail(application) {
  const content = `
    <div style="padding: 40px 30px;">
      <h2 style="color: #166534; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">New Artist Application 🎨</h2>
      
      <p style="margin: 0 0 20px 0; font-size: 16px;">
        A new artist residency application has been submitted and is awaiting review.
      </p>

      <div style="background-color: #F0F9F4; border: 2px solid #22C55E; border-radius: 12px; padding: 24px; margin: 30px 0;">
        <h3 style="color: #166534; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Applicant Information</h3>
        
        <div style="margin-bottom: 12px;">
          <strong>Application ID:</strong> #${application.id}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Name:</strong> ${application.user_name}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Email:</strong> ${application.user_email}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Submitted:</strong> ${formatDate(application.submitted_at)}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Application Type:</strong> ${application.application_type === "artist_residency" ? "Artist Residency" : application.application_type}
        </div>
      </div>

      <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #92400E;">
          <strong>Action Required:</strong> Please review this application in the admin dashboard and update the status accordingly.
        </p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL}/admin/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #FFFFFF; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Review Application
        </a>
      </div>
    </div>
  `;

  const textContent = `
Ubuntu Art Village - New Artist Application

A new artist residency application has been submitted and is awaiting review.

APPLICANT INFORMATION
Application ID: #${application.id}
Name: ${application.user_name}
Email: ${application.user_email}
Submitted: ${formatDate(application.submitted_at)}
Application Type: ${application.application_type === "artist_residency" ? "Artist Residency" : application.application_type}

ACTION REQUIRED: Please review this application in the admin dashboard.

Review application: ${process.env.APP_URL}/admin/dashboard
  `;

  return {
    html: createEmailWrapper(content, "New Application - Admin Notification"),
    text: textContent,
  };
}

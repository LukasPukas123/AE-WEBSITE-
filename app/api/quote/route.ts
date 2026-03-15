import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface QuoteFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  service?: string;
  message?: string;
  website?: string; // honeypot field
}

export async function POST(request: NextRequest) {
  try {
    const body: QuoteFormData = await request.json();

    // Honeypot check - if this field has a value, it's likely a bot
    if (body.website) {
      // Return success to not alert the bot, but don't actually send email
      return NextResponse.json({ success: true });
    }

    // Server-side validation for required fields
    const errors: string[] = [];

    if (!body.firstName || body.firstName.trim().length === 0) {
      errors.push("First name is required");
    }

    if (!body.lastName || body.lastName.trim().length === 0) {
      errors.push("Last name is required");
    }

    if (!body.email || body.email.trim().length === 0) {
      errors.push("Email address is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      errors.push("Please enter a valid email address");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: errors.join(", ") },
        { status: 400 }
      );
    }

    // Check environment variables
    const toEmail = process.env.QUOTE_TO_EMAIL;
    const fromEmail = process.env.QUOTE_FROM_EMAIL;

    if (!toEmail || !fromEmail) {
      console.error("Missing email environment variables");
      return NextResponse.json(
        { success: false, error: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    // Build email content
    const serviceMap: Record<string, string> = {
      "ai-receptionist": "AI Receptionist",
      "web-design": "Web Design",
      both: "Both Services",
      other: "Other / General Inquiry",
    };

    const serviceName = body.service ? serviceMap[body.service] || body.service : "Not specified";

    const emailHtml = `
      <h2>New Quote Request from Automate Effect</h2>
      <hr />
      <p><strong>Name:</strong> ${body.firstName.trim()} ${body.lastName.trim()}</p>
      <p><strong>Email:</strong> ${body.email.trim()}</p>
      <p><strong>Phone:</strong> ${body.phone?.trim() || "Not provided"}</p>
      <p><strong>Service Interested In:</strong> ${serviceName}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${body.message?.trim() || "No message provided"}</p>
    `;

    const emailText = `
New Quote Request from Automate Effect
---------------------------------------
Name: ${body.firstName.trim()} ${body.lastName.trim()}
Email: ${body.email.trim()}
Phone: ${body.phone?.trim() || "Not provided"}
Service Interested In: ${serviceName}
---------------------------------------
Message:
${body.message?.trim() || "No message provided"}
    `;

    // Send email via Resend
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: `Quote Request: ${body.firstName.trim()} ${body.lastName.trim()} - ${serviceName}`,
      html: emailHtml,
      text: emailText,
      replyTo: body.email.trim(),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to send your message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Quote form error:", err);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

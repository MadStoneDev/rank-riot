import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Lazily initialized Resend client
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

// Contact form submission data
interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Map subject value to readable text
function getSubjectText(subject: string): string {
  const subjects: Record<string, string> = {
    support: "Technical Support",
    billing: "Billing Question",
    sales: "Sales Inquiry",
    feedback: "Feature Request / Feedback",
    other: "Other",
  };
  return subjects[subject] || "General Inquiry";
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { firstName, lastName, email, subject, message } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: "Message must be less than 5000 characters" },
        { status: 400 }
      );
    }

    const subjectText = getSubjectText(subject);
    const fullName = `${firstName} ${lastName}`;

    // Send email via Resend
    const { data, error } = await getResendClient().emails.send({
      from: "RankRiot <noreply@rankriot.app>",
      to: ["hello@rankriot.app"],
      replyTo: email,
      subject: `[Contact Form] ${subjectText} - ${fullName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #171717; margin-bottom: 24px;">New Contact Form Submission</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0;"><strong>Name:</strong> ${fullName}</p>
            <p style="margin: 0 0 12px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin: 0;"><strong>Subject:</strong> ${subjectText}</p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e5e5; padding: 20px; border-radius: 8px;">
            <h3 style="color: #171717; margin-top: 0;">Message:</h3>
            <p style="color: #525252; white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>

          <p style="color: #a3a3a3; font-size: 12px; margin-top: 24px;">
            This message was sent from the RankRiot contact form.
          </p>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${fullName}
Email: ${email}
Subject: ${subjectText}

Message:
${message}

---
This message was sent from the RankRiot contact form.
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

"use server";

const RESEND_URL = "https://api.resend.com/emails";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const FROM = "EduChina Pro <noreply@educhinapro.com>";

type SmartScorePayload = {
  type: "smartscore";
  email: string;
  phone: string;
  answers: {
    degreeLevel: string;
    gpa: string;
    field: string;
    scholarship: string;
    budget: string;
    chineseLevel: string;
  };
  score: number;
  tier: string;
};

type ConsultationPayload = {
  type: "consultation";
  name: string;
  phone: string;
  email: string;
  studyLevel: string;
  message: string;
};

type AlertPayload = SmartScorePayload | ConsultationPayload;

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY not set");
    return false;
  }

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });

  const data = await res.json();
  return data.success === true;
}

function buildSmartScoreEmail(payload: SmartScorePayload): string {
  return `
New SmartScore Lead
====================

Contact Info:
  Email: ${payload.email}
  Phone: ${payload.phone}

SmartScore Result:
  Overall Score: ${payload.score}/100
  Tier: ${payload.tier}

Questionnaire Answers:
  Degree Level: ${payload.answers.degreeLevel}
  GPA Range: ${payload.answers.gpa}
  Field of Study: ${payload.answers.field}
  Scholarship Preference: ${payload.answers.scholarship}
  Annual Budget: ${payload.answers.budget}
  Chinese Level: ${payload.answers.chineseLevel}

---
This is an automated lead alert from EduChinaPro.
`.trim();
}

function buildConsultationEmail(payload: ConsultationPayload): string {
  return `
New Consultation Request
=========================

Contact Info:
  Name: ${payload.name}
  Email: ${payload.email}
  Phone: ${payload.phone}

Details:
  Intended Study Level: ${payload.studyLevel || "Not specified"}
  Message: ${payload.message || "No message provided"}

---
This is an automated lead alert from EduChinaPro.
`.trim();
}

export async function sendInternalAlert(
  payload: AlertPayload,
  turnstileToken: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const valid = await verifyTurnstile(turnstileToken);
    if (!valid) {
      return { success: false, error: "CAPTCHA verification failed" };
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.INTERNAL_ALERT_TO;

    if (!apiKey || !to) {
      console.error("Missing RESEND_API_KEY or INTERNAL_ALERT_TO");
      return { success: false, error: "Server configuration error" };
    }

    const subject =
      payload.type === "smartscore"
        ? `New SmartScore Lead — Score: ${payload.score}/100`
        : `New Consultation Request — ${payload.name}`;

    const text =
      payload.type === "smartscore"
        ? buildSmartScoreEmail(payload)
        : buildConsultationEmail(payload);

    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: to.split(",").map((e) => e.trim()),
        subject,
        text,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      console.error("Resend failed:", body);
      return { success: false, error: "Failed to send email" };
    }

    return { success: true };
  } catch (err) {
    console.error("Internal alert error:", err);
    return { success: false, error: "Unexpected error" };
  }
}

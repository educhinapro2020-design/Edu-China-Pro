// @ts-nocheck
/**
 * This file is maintained for version control and is intended to run in the Supabase Edge Functions environment.
 * Also check the timestamp to know when the file was last updated
 *
 * @author Nikesh
 * @date 2026-03-01 - first release
 */

import { createClient } from "jsr:@supabase/supabase-js@2";

const SPARROW_TOKEN = Deno.env.get("SPARROW_TOKEN")!;
const SPARROW_FROM = "InfoAlert";
const SPARROW_URL = "http://api.sparrowsms.com/v2/sms/";
const DASHBOARD_URL = "https://educhinapro.com/dashboard";

const SMS_WORTHY_STATUSES = new Set([
  "action_required",
  "approved",
  "offer_letter",
  "applied_to_university",
  "admission_success",
  "application_fee_paid",
  "ecp_fee_paid",
  "jw_form_received",
  "visa_docs_ready",
]);

const SMS_MESSAGES: Record<string, string> = {
  action_required: `EduChinaPro: Your application requires changes. Please log in to review and complete the necessary steps. ${DASHBOARD_URL}`,
  approved: `EduChinaPro: Our team has approved your application. Please log in for the next steps. ${DASHBOARD_URL}`,
  offer_letter: `EduChinaPro: Your offer letter is ready. Please log in to view and download your offer letter. ${DASHBOARD_URL}`,
  applied_to_university: `EduChinaPro: We have submitted your application to the university. Please log in for details. ${DASHBOARD_URL}`,
  admission_success: `EduChinaPro: Congratulations! Your admission was successful. Please log in for the next steps. ${DASHBOARD_URL}`,
  application_fee_paid: `EduChinaPro: Your application fee payment has been confirmed. We will proceed with your application.`,
  ecp_fee_paid: `EduChinaPro: Service fee payment has been confirmed. We will proceed with your application.`,
  jw_form_received: `EduChinaPro: Congratulations! Your JW Form has been received. Please log in for details. ${DASHBOARD_URL}`,
  visa_docs_ready: `EduChinaPro: Congratulations! Your visa documents are ready. Please log in for details. ${DASHBOARD_URL}`,
};

/**
 * Sanitize a Nepali phone number to 10-digit format.
 * Handles: +977XXXXXXXXXX, 977XXXXXXXXXX, 0XXXXXXXXX, XXXXXXXXXX
 */
function sanitizePhone(raw: string): string | null {
  let phone = raw.replace(/\s+/g, "").replace(/-/g, "");

  if (phone.startsWith("+977")) phone = phone.slice(4);
  else if (phone.startsWith("977")) phone = phone.slice(3);
  else if (phone.startsWith("0")) phone = phone.slice(1);

  if (!/^\d{10}$/.test(phone)) return null;
  if (!phone.startsWith("98") && !phone.startsWith("97")) return null;

  return phone;
}

Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();
    const notification = payload.record;

    if (!notification) {
      return new Response("No record in payload", { status: 400 });
    }

    const { type, user_id, link } = notification;

    if (type !== "status_changed") {
      return new Response("Not status_changed, skipping", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const appId = link?.split("/").pop();
    if (!appId) {
      return new Response("No application ID in link", { status: 200 });
    }

    const { data: app, error: appError } = await supabase
      .from("applications")
      .select("status")
      .eq("id", appId)
      .single();

    if (appError || !app) {
      console.error("Failed to fetch application:", appError);
      return new Response("Application not found", { status: 200 });
    }

    if (!SMS_WORTHY_STATUSES.has(app.status)) {
      return new Response(`Status "${app.status}" not SMS-worthy, skipping`, {
        status: 200,
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("phone_number")
      .eq("id", user_id)
      .single();

    if (profileError || !profile?.phone_number) {
      console.warn("No phone number for user:", user_id);
      return new Response("No phone number, skipping", { status: 200 });
    }

    const phone = sanitizePhone(profile.phone_number);
    if (!phone) {
      console.warn("Invalid phone number format for user:", user_id);
      return new Response("Invalid phone number format, skipping", {
        status: 200,
      });
    }

    const form = new FormData();
    form.append("token", SPARROW_TOKEN);
    form.append("from", SPARROW_FROM);
    form.append("to", phone);
    form.append("text", SMS_MESSAGES[app.status]);

    const sparrowRes = await fetch(SPARROW_URL, { method: "POST", body: form });
    const sparrowBody = await sparrowRes.json();

    if (!sparrowRes.ok || sparrowBody.response_code !== 200) {
      console.error("Sparrow SMS failed:", sparrowBody);
      return new Response("SMS failed", { status: 200 });
    }

    console.log(`SMS sent to ${phone} for status "${app.status}"`);
    return new Response("SMS sent", { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal error", { status: 200 });
  }
});

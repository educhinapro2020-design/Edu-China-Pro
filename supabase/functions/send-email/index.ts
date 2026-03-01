// @ts-nocheck
/**
 * This file is maintained for version control and is intended to run in the Supabase Edge Functions environment.
 *
 * @author Nikesh
 * @date 2026-03-01 - first release
 */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const RESEND_URL = "https://api.resend.com/emails";
const FROM = "EduChina Pro <noreply@educhinapro.com>";
const TEMPLATE_ID = "educhinapro-application-status-change-email";

const SMS_WORTHY_STATUSES = new Set([
  "action_required",
  "approved",
  "offer_letter",
  "admission_success",
  "application_fee_paid",
  "ecp_fee_paid",
  "jw_form_received",
  "visa_docs_ready",
  "applied_to_university",
]);

const STATUS_MESSAGES: Record<string, string> = {
  action_required:
    "Your application requires changes. Please log in to review and complete the necessary steps to proceed.",
  approved:
    "Our team has approved your application after review. Please log in to view the next steps.",
  offer_letter:
    "Your offer letter is now ready. Please log in to view and download your official offer letter.",
  admission_success:
    "Congratulations! Your admission was successful. Please log in to view the next steps.",
  application_fee_paid:
    "Your application fee payment has been confirmed. We will now proceed with submitting your application.",
  ecp_fee_paid:
    "Your ECP fee payment has been confirmed. We will now proceed with the next steps of your application.",
  jw_form_received:
    "Congratulations!Your JW Form has been received and is being processed. Please log in to stay updated on your application.",
  visa_docs_ready:
    "Congratulations! Your visa documents are ready. Please log in to review and download your visa documents.",
  applied_to_university:
    "We have submitted your application to the university. We will keep you updated on the progress.",
};

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

    const { createClient } = await import("jsr:@supabase/supabase-js@2");

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
      return new Response(`Status "${app.status}" not email-worthy, skipping`, {
        status: 200,
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("first_name")
      .eq("id", user_id)
      .single();

    if (profileError) {
      console.warn("Failed to fetch profile:", profileError);
    }

    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(user_id);

    if (authError || !authUser?.user?.email) {
      console.warn("No email for user:", user_id);
      return new Response("No email, skipping", { status: 200 });
    }

    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM,
        to: authUser.user.email,
        subject: "Your Application Status Has Been Updated",
        template: {
          id: TEMPLATE_ID,
          variables: {
            first_name: profile?.first_name ?? "Student",
            status_message: STATUS_MESSAGES[app.status],
            dashboard_url: `https://educhinapro.com${link}`,
          },
        },
      }),
    });

    const resBody = await res.json();

    if (!res.ok) {
      console.error("Resend failed:", resBody);
      return new Response("Email failed", { status: 200 });
    }

    console.log(
      `Email sent to ${authUser.user.email} for status "${app.status}"`,
    );
    return new Response("Email sent", { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal error", { status: 200 });
  }
});

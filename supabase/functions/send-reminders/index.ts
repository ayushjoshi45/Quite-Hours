import { createClient } from "@supabase/supabase-js";
// import nodemailer from "nodemailer";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const transporter = nodemailer.createTransport({
  service: "gmail", // or another SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler() {
  try {
    const now = new Date();
    const in10Min = new Date(now.getTime() + 10 * 60000);

    const { data: quietHours, error } = await supabase
      .from("quiet_hours")
      .select("id, user_id, start_time")
      .eq("email_sent", false)
      .lte("start_time", in10Min.toISOString())
      .gte("start_time", now.toISOString());

    if (error) throw error;

    for (const qh of quietHours) {
      const { data: userData } = await supabase
        .from("auth.users")
        .select("email")
        .eq("id", qh.user_id)
        .single();

      if (!userData?.email) continue;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: userData.email,
        subject: "Quiet Hour Reminder ⏰",
        text: `Reminder: Your quiet hour starts at ${new Date(qh.start_time).toLocaleString()}`,
      });

      await supabase
        .from("quiet_hours")
        .update({ email_sent: true })
        .eq("id", qh.id);
    }

    console.log("Reminders sent successfully!");
  } catch (err) {
    console.error("Error sending reminders:", err);
  }
}

handler();

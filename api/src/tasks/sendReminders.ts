import { supabase } from "../lib/db";
import { sendMail } from "../lib/mailer";

export async function sendRemindersTask() {
    // 1) récupérer les reminders à envoyer maintenant
    const nowISO = new Date().toISOString();
    const { data: reminders, error } = await supabase
        .from("reminders")
        .select("id, send_at, appointment:appointments(id, title, starts_at, org_id, customer:customers(email, full_name))")
        .eq("status", "pending")
        .lte("send_at", nowISO)
        .order("send_at", { ascending: true })
        .limit(100);

    if (error) throw new Error(error.message);
    if (!reminders || reminders.length === 0) return { processed: 0 };

    let sent = 0, failed = 0;

    for (const r of reminders as any[]) {
        const appt = r.appointment;
        const customer = appt?.customer;
        const to = customer?.email as string | undefined;

        try {
            if (!to) {
                // pas d'email -> on marque skipped/failed léger
                await supabase.from("reminders").update({ status: "failed", last_error: "no customer email" }).eq("id", r.id);
                failed++;
                continue;
            }

            const starts = new Date(appt.starts_at).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
            const subject = `Rappel RDV – ${appt.title} (${starts})`;
            const html = `
        <div style="font-family:system-ui,Segoe UI,Arial">
          <h2>Rappel de rendez-vous</h2>
          <p>Bonjour${customer.full_name ? " " + customer.full_name : ""},</p>
          <p>Votre rendez-vous <b>${appt.title}</b> est prévu le <b>${starts}</b>.</p>
          <p>Si vous ne pouvez pas venir, merci de répondre à ce mail.</p>
          <hr/>
          <small>RendezPro – rappels automatiques</small>
        </div>`;

            await sendMail({ to, subject, html });

            await supabase.from("reminders").update({ status: "sent", last_error: null }).eq("id", r.id);
            sent++;
        } catch (e: any) {
            await supabase.from("reminders").update({ status: "failed", last_error: String(e?.message || e) }).eq("id", r.id);
            failed++;
        }
    }

    return { processed: reminders.length, sent, failed };
}
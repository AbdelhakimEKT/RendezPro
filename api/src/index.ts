import "dotenv/config"; // charge les variables depuis .env
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { requireOrg } from "./middlewares/org";
import { customersRouter } from "./routes/customers";
import { appointmentsRouter } from "./routes/appointments";
import { sendRemindersTask } from "./tasks/sendReminders";




const app = express();

app.use(cors());
app.use(express.json());

// Routes publiques
app.get("/", (_req, res) => res.send("API OK 🚀"));

// ✅ /health simple qui répond tout de suite
app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/health", healthRouter); // garde /health/env et /health/db si tu veux

// À partir d'ici, org obligatoire
app.use(requireOrg);
app.use("/customers", customersRouter);
app.use("/appointments", appointmentsRouter);

app.post("/tasks/send-reminders", async (req, res) => {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token || token !== process.env.REMINDER_WEBHOOK_TOKEN) {
        return res.status(403).json({ error: "Forbidden" });
    }
    try {
        const result = await sendRemindersTask();
        res.json({ ok: true, ...result });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 API running on http://localhost:${port}`);
});



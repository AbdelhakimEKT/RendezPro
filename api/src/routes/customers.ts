import { Router } from "express";
import { z } from "zod";
import { supabase } from "../lib/db";
import type { Customer } from "../types";

export const customersRouter = Router();

const createCustomerSchema = z.object({
    full_name: z.string().min(1).max(200),
    phone: z.string().min(3).max(30).optional().nullable(),
    email: z.string().email().optional().nullable(),
    notes: z.string().max(2000).optional().nullable(),
});

const updateCustomerSchema = createCustomerSchema.partial();

// Liste paginée
customersRouter.get("/", async (req, res) => {
    const orgId = (req as any).orgId as string;
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? "20"), 10)));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
        .from("customers")
        .select("*", { count: "exact" })
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ page, pageSize, total: count ?? 0, data: data as Customer[] });
});

// Création
customersRouter.post("/", async (req, res) => {
    const orgId = (req as any).orgId as string;
    const parsed = createCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
    }

    const payload = { ...parsed.data, org_id: orgId };
    const { data, error } = await supabase.from("customers").insert(payload).select().single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data as Customer);
});

// Mise à jour
customersRouter.patch("/:id", async (req, res) => {
    const orgId = (req as any).orgId as string;
    const { id } = req.params;
    const parsed = updateCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", details: parsed.error.format() });
    }

    const { data, error } = await supabase
        .from("customers")
        .update(parsed.data)
        .eq("id", id)
        .eq("org_id", orgId)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data as Customer);
});

// Suppression
customersRouter.delete("/:id", async (req, res) => {
    const orgId = (req as any).orgId as string;
    const { id } = req.params;
    const { error } = await supabase.from("customers").delete().eq("id", id).eq("org_id", orgId);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).send();
});
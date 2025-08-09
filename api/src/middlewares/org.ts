import { Request, Response, NextFunction } from "express";

export function requireOrg(req: Request, res: Response, next: NextFunction) {
    const orgId = req.header("x-org-id");
    if (!orgId) {
        return res.status(400).json({ error: "Missing x-org-id header" });
    }
    // on l’accroche à req pour les routes
    (req as any).orgId = orgId;
    next();
}
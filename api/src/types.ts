export type UUID = string;

export interface Organization {
    id: UUID;
    name: string;
    created_at: string;
}

export interface Customer {
    id: UUID;
    org_id: UUID;
    full_name: string;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
    created_at: string;
}

export interface Appointment {
    id: UUID;
    org_id: UUID;
    customer_id: UUID | null;
    title: string;
    starts_at: string;  // ISO
    ends_at: string;    // ISO
    status: "scheduled" | "confirmed" | "cancelled";
    notes?: string | null;
    created_by?: UUID | null;
    created_at: string;
}

export interface Reminder {
    id: UUID;
    appointment_id: UUID;
    channel: "email" | "sms";
    send_at: string; // ISO
    status: "pending" | "sent" | "failed";
    last_error?: string | null;
    created_at: string;
}
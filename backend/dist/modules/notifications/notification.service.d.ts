export declare const notify: (userId: number, msg: string, type?: string, company_id?: number) => Promise<{
    message: string;
}>;
export declare const listNotifications: () => Promise<{
    created_at: Date;
    id: number;
    company_id: number | null;
    user_id: number | null;
    type: string | null;
    message: string | null;
    reference_id: number | null;
    reference_type: string | null;
    is_read: boolean;
}[]>;
//# sourceMappingURL=notification.service.d.ts.map
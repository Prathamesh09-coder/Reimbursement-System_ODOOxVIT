export declare const signup: (data: {
    name: string;
    email: string;
    password: string;
    country?: string;
    companyName?: string;
}) => Promise<{
    user: {
        name: string | null;
        email: string;
        password_hash: string | null;
        must_change_password: boolean;
        is_active: boolean;
        created_at: Date;
        id: number;
        company_id: number;
        role_id: number;
        manager_id: number | null;
    };
    company: {
        name: string;
        is_active: boolean;
        created_at: Date;
        id: number;
        country: string | null;
        currency: string | null;
    };
}>;
export declare const forgotPassword: (email: string) => Promise<{
    message: string;
}>;
export declare const login: (data: {
    email: string;
    password: string;
}) => Promise<{
    id: number;
    email: string;
    name: string | null;
    role: string;
    company_id: number;
}>;
//# sourceMappingURL=auth.service.d.ts.map
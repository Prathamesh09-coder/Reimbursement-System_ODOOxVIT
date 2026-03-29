type CreateUserInput = {
    name: string;
    email: string;
    role?: "ADMIN" | "MANAGER" | "EMPLOYEE" | "FINANCE" | "DIRECTOR";
    manager_id?: number;
    password?: string;
    is_active?: boolean;
};
type AdminContext = {
    company_id: number;
};
export declare const createUser: (data: CreateUserInput, admin: AdminContext) => Promise<{
    role: {
        name: string;
        id: number;
    };
} & {
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
}>;
export declare const listUsers: () => Promise<{
    name: string | null;
    email: string;
    role: {
        name: string;
    };
    id: number;
    company_id: number;
}[]>;
export {};
//# sourceMappingURL=user.service.d.ts.map
export declare const createExpense: (data: any, user: any) => Promise<{
    created_at: Date;
    id: number;
    company_id: number;
    currency: string | null;
    workflow_id: number | null;
    amount: import("@prisma/client/runtime/library").Decimal | null;
    converted_amount: import("@prisma/client/runtime/library").Decimal | null;
    description: string | null;
    paid_by: string | null;
    expense_date: Date | null;
    receipt_url: string | null;
    remarks: string | null;
    status: string;
    current_step: number;
    employee_id: number;
    category_id: number | null;
}>;
export declare const submitExpense: (expenseId: number, userId?: number) => Promise<{
    message: string;
}>;
export declare const listExpenses: () => Promise<{
    created_at: Date;
    id: number;
    company_id: number;
    currency: string | null;
    workflow_id: number | null;
    amount: import("@prisma/client/runtime/library").Decimal | null;
    converted_amount: import("@prisma/client/runtime/library").Decimal | null;
    description: string | null;
    paid_by: string | null;
    expense_date: Date | null;
    receipt_url: string | null;
    remarks: string | null;
    status: string;
    current_step: number;
    employee_id: number;
    category_id: number | null;
}[]>;
export declare const getExpenseById: (id: number) => Promise<({
    approvals: {
        id: number;
        role_id: number | null;
        status: string | null;
        comment: string | null;
        expense_id: number;
        step_order: number | null;
        approver_id: number | null;
        action_time: Date | null;
    }[];
    items: {
        id: number;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        expense_id: number | null;
        item_name: string | null;
    }[];
} & {
    created_at: Date;
    id: number;
    company_id: number;
    currency: string | null;
    workflow_id: number | null;
    amount: import("@prisma/client/runtime/library").Decimal | null;
    converted_amount: import("@prisma/client/runtime/library").Decimal | null;
    description: string | null;
    paid_by: string | null;
    expense_date: Date | null;
    receipt_url: string | null;
    remarks: string | null;
    status: string;
    current_step: number;
    employee_id: number;
    category_id: number | null;
}) | null>;
export declare const updateExpenseStatus: (id: number, status: string) => Promise<{
    created_at: Date;
    id: number;
    company_id: number;
    currency: string | null;
    workflow_id: number | null;
    amount: import("@prisma/client/runtime/library").Decimal | null;
    converted_amount: import("@prisma/client/runtime/library").Decimal | null;
    description: string | null;
    paid_by: string | null;
    expense_date: Date | null;
    receipt_url: string | null;
    remarks: string | null;
    status: string;
    current_step: number;
    employee_id: number;
    category_id: number | null;
}>;
//# sourceMappingURL=expense.service.d.ts.map
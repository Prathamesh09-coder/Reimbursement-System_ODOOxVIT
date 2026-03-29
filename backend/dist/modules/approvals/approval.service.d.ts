export declare const approve: (expenseId: number, approverId?: number, remarks?: string) => Promise<{
    message: string;
    expense: {
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
    };
    ruleMatch: {
        shouldApprove: boolean;
        reason: string;
        nextStep?: never;
    } | {
        shouldApprove: boolean;
        reason: string;
        nextStep: number;
    } | null;
    autoApproved: boolean;
}>;
export declare const reject: (expenseId: number, approverId?: number, remarks?: string) => Promise<{
    message: string;
    expense: {
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
    };
}>;
//# sourceMappingURL=approval.service.d.ts.map
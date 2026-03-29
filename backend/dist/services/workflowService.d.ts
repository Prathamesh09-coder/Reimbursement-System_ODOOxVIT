export declare const assignManager: (employeeId: number, managerId: number) => Promise<{
    role: {
        name: string;
        id: number;
    };
    manager: {
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
    } | null;
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
export declare const getTeamMembers: (managerId: number) => Promise<({
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
})[]>;
export declare const getManagerHierarchy: (employeeId: number) => Promise<({
    manager: {
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
    } | null;
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
}) | null>;
export declare const createWorkflow: (data: {
    company_id: number;
    name: string;
    steps: Array<{
        step_order: number;
        role_id?: number;
        user_id?: number;
        is_required?: boolean;
    }>;
    rule?: {
        min_approval_percentage?: number;
        is_sequential?: boolean;
        special_approver_id?: number;
    };
}) => Promise<{
    workflow: {
        name: string | null;
        created_at: Date;
        id: number;
        company_id: number;
    };
    steps: {
        id: number;
        role_id: number | null;
        user_id: number | null;
        workflow_id: number;
        step_order: number;
        is_required: boolean;
    }[];
    rule: {
        id: number;
        workflow_id: number | null;
        min_approval_percentage: number | null;
        is_sequential: boolean | null;
        special_approver_id: number | null;
    } | null;
}>;
export declare const getWorkflow: (workflowId: number) => Promise<({
    steps: ({
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
        } | null;
        role: {
            name: string;
            id: number;
        } | null;
    } & {
        id: number;
        role_id: number | null;
        user_id: number | null;
        workflow_id: number;
        step_order: number;
        is_required: boolean;
    })[];
    rules: {
        id: number;
        workflow_id: number | null;
        min_approval_percentage: number | null;
        is_sequential: boolean | null;
        special_approver_id: number | null;
    }[];
} & {
    name: string | null;
    created_at: Date;
    id: number;
    company_id: number;
}) | null>;
export declare const updateWorkflowRule: (ruleId: number, data: any) => Promise<{
    workflow: ({
        steps: {
            id: number;
            role_id: number | null;
            user_id: number | null;
            workflow_id: number;
            step_order: number;
            is_required: boolean;
        }[];
    } & {
        name: string | null;
        created_at: Date;
        id: number;
        company_id: number;
    }) | null;
} & {
    id: number;
    workflow_id: number | null;
    min_approval_percentage: number | null;
    is_sequential: boolean | null;
    special_approver_id: number | null;
}>;
export declare const checkApprovalRules: (expenseId: number, workflowId: number) => Promise<{
    shouldApprove: boolean;
    reason: string;
    nextStep?: never;
} | {
    shouldApprove: boolean;
    reason: string;
    nextStep: number;
}>;
export declare const moveToNextApprover: (expenseId: number, workflowId: number) => Promise<{
    nextApproverId: null;
    reason: string;
    nextStepOrder?: never;
    nextStep?: never;
} | {
    nextStepOrder: number;
    nextStep: {
        id: number;
        role_id: number | null;
        user_id: number | null;
        workflow_id: number;
        step_order: number;
        is_required: boolean;
    };
    nextApproverId: number | null;
    reason?: never;
}>;
export declare const getApprovalStatus: (expenseId: number) => Promise<{
    approvals: ({
        role: {
            name: string;
            id: number;
        } | null;
        approver: ({
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
        }) | null;
    } & {
        id: number;
        role_id: number | null;
        status: string | null;
        comment: string | null;
        expense_id: number;
        step_order: number | null;
        approver_id: number | null;
        action_time: Date | null;
    })[];
    stats: {
        total: number;
        approved: number;
        rejected: number;
        pending: number;
    };
    approvalPercentage: number;
}>;
//# sourceMappingURL=workflowService.d.ts.map
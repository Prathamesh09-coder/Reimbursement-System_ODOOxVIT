export interface Expense {
  id: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  paidBy: string;
  remarks?: string;
  receipt?: string;
  submittedBy: string;
  approvalHistory: ApprovalStep[];
}

export interface ApprovalStep {
  approver: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  comment?: string;
  timestamp?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  manager: string;
  avatar?: string;
}

export interface WorkflowStep {
  id: string;
  order: number;
  approverType: "role" | "specific";
  approverValue: string;
  mode: "sequential" | "parallel";
  minApprovalPercent: number;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

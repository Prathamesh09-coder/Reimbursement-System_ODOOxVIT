const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: { message?: string };
};

export type BackendUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  company_id: number;
  company_name?: string;
  currency?: string;
};

export type AuthPayload = {
  token: string;
  user: BackendUser;
};

export type ExpenseCategory = {
  id: number;
  name: string;
  company_id: number | null;
};

export type Expense = {
  id: number;
  description: string | null;
  amount: number | string | null;
  currency: string | null;
  converted_amount: number | string | null;
  status: string;
  expense_date: string | null;
  paid_by: string | null;
  remarks: string | null;
  category_id: number | null;
  employee_id: number;
  created_at: string;
  category?: { id: number; name: string } | null;
  employee?: { id: number; name: string | null; email: string; role?: { name: string } };
  approvals?: Array<{
    id: number;
    status: string | null;
    comment: string | null;
    action_time: string | null;
    step_order: number | null;
    approver?: { id: number; name: string | null; email: string; role?: { name: string } } | null;
    role?: { id: number; name: string } | null;
  }>;
};

export type NotificationRecord = {
  id: number;
  message: string | null;
  type: string | null;
  is_read: boolean;
  created_at: string;
};

export type Workflow = {
  id: number;
  name: string | null;
  company_id: number;
  steps: Array<{
    id: number;
    step_order: number;
    role_id: number | null;
    user_id: number | null;
    is_required: boolean;
    role?: { id: number; name: string } | null;
    user?: { id: number; name: string | null; email: string } | null;
  }>;
  rules: Array<{
    id: number;
    min_approval_percentage: number | null;
    is_sequential: boolean | null;
    special_approver_id: number | null;
  }>;
  metadata?: {
    approval_rule?: string;
  };
};

export type Role = { id: number; name: string };

export type UserRecord = {
  id: number;
  name: string | null;
  email: string;
  role: { name: string };
  manager?: { id: number; name: string | null } | null;
};

const authHeaders = (token?: string) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(token),
      ...(options.headers || {}),
    },
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || `Request failed with ${response.status}`);
  }

  return payload.data;
}

export const api = {
  baseUrl: API_BASE_URL,

  signup: (input: { name: string; email: string; password: string; country: string; companyName: string }) =>
    request<AuthPayload>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  login: (input: { email: string; password: string }) =>
    request<AuthPayload>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  me: (token: string) => request<BackendUser>("/api/auth/me", { method: "GET" }, token),

  listExpenses: (token: string) => request<Expense[]>("/api/expenses", { method: "GET" }, token),
  getExpense: (token: string, id: string | number) => request<Expense>(`/api/expenses/${id}`, { method: "GET" }, token),
  createExpense: (
    token: string,
    input: {
      description: string;
      category_id: number | null;
      expense_date: string;
      paid_by: string;
      amount: number;
      currency: string;
      remarks: string;
      receipt_url?: string | null;
    }
  ) =>
    request<Expense>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(input),
    }, token),
  submitExpense: (token: string, id: number) =>
    request<{ message: string }>(`/api/expenses/${id}/submit`, { method: "POST" }, token),

  listCategories: (token: string) => request<ExpenseCategory[]>("/api/expenses/categories", { method: "GET" }, token),
  createCategory: (token: string, name: string) =>
    request<ExpenseCategory>("/api/expenses/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }, token),

  listApprovals: (token: string) => request<Expense[]>("/api/approvals", { method: "GET" }, token),
  approveExpense: (token: string, expenseId: number, remarks: string) =>
    request(`/api/approvals/${expenseId}/approve`, {
      method: "POST",
      body: JSON.stringify({ remarks }),
    }, token),
  rejectExpense: (token: string, expenseId: number, remarks: string) =>
    request(`/api/approvals/${expenseId}/reject`, {
      method: "POST",
      body: JSON.stringify({ remarks }),
    }, token),

  listUsers: (token: string) => request<UserRecord[]>("/api/users", { method: "GET" }, token),
  listRoles: (token: string) => request<Role[]>("/api/users/roles", { method: "GET" }, token),
  createUser: (
    token: string,
    input: { name: string; email: string; role: string; manager_id?: number; password?: string }
  ) => request<UserRecord>("/api/users", { method: "POST", body: JSON.stringify(input) }, token),
  sendPasswordToUser: (token: string, userId: number) =>
    request<{ message: string; delivery?: { accepted?: boolean; messageId?: number; messageUUID?: string; simulated?: boolean }; simulatedTempPassword?: string }>(`/api/users/${userId}/send-password`, { method: "POST" }, token),
  updateUserRole: (token: string, userId: number, role: string) =>
    request<UserRecord>(`/api/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }, token),

  assignManager: (token: string, employeeId: number, managerId: number) =>
    request(`/api/workflows/managers/assign`, {
      method: "POST",
      body: JSON.stringify({ employeeId, managerId }),
    }, token),

  listWorkflows: (token: string) => request<Workflow[]>("/api/workflows", { method: "GET" }, token),
  createWorkflow: (
    token: string,
    input: {
      name: string;
      steps: Array<{ step_order: number; role_id?: number; user_id?: number; is_required?: boolean }>;
      rule?: { min_approval_percentage?: number; is_sequential?: boolean; special_approver_id?: number };
    }
  ) => request<Workflow>("/api/workflows", { method: "POST", body: JSON.stringify(input) }, token),

  listNotifications: (token: string) => request<NotificationRecord[]>("/api/notifications", { method: "GET" }, token),
  markNotificationRead: (token: string, id: number) =>
    request(`/api/notifications/${id}/read`, { method: "PATCH" }, token),
  markAllNotificationsRead: (token: string) =>
    request(`/api/notifications/read-all`, { method: "PATCH" }, token),
};

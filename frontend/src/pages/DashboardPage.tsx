import React, { useEffect, useMemo, useState } from "react";
import SummaryCard from "@/components/SummaryCard";
import StatusBadge from "@/components/StatusBadge";
import { Receipt, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Expense } from "@/lib/api";
import { formatMoney, normalizeStatus } from "@/lib/domain";

const DashboardPage = () => {
  const { token, user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const rows = await api.listExpenses(token);
      setExpenses(rows);
    };

    void load();
  }, [token]);

  const total = useMemo(
    () => expenses.reduce((sum, expense) => sum + Number(expense.converted_amount || expense.amount || 0), 0),
    [expenses]
  );

  const pending = expenses.filter((e) => normalizeStatus(e.status) === "pending").length;
  const approved = expenses.filter((e) => normalizeStatus(e.status) === "approved").length;
  const rejected = expenses.filter((e) => normalizeStatus(e.status) === "rejected").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your reimbursement activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Expenses" value={formatMoney(total, user?.currency)} icon={Receipt} variant="primary" trend="Converted to company currency" />
        <SummaryCard title="Pending Approvals" value={pending} icon={Clock} variant="warning" />
        <SummaryCard title="Approved" value={approved} icon={CheckCircle} variant="success" />
        <SummaryCard title="Rejected" value={rejected} icon={XCircle} variant="destructive" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{expense.description || "Untitled expense"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    #{expense.id} · {expense.category?.name || "Uncategorized"} · {expense.expense_date?.slice(0, 10) || "-"}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-semibold">{formatMoney(expense.converted_amount || expense.amount, user?.currency || expense.currency)}</span>
                  <StatusBadge status={normalizeStatus(expense.status)} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

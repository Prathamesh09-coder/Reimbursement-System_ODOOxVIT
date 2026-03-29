import React from "react";
import SummaryCard from "@/components/SummaryCard";
import StatusBadge from "@/components/StatusBadge";
import { MOCK_EXPENSES } from "@/data/mockData";
import { Receipt, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardPage = () => {
  const total = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const pending = MOCK_EXPENSES.filter((e) => e.status === "pending").length;
  const approved = MOCK_EXPENSES.filter((e) => e.status === "approved").length;
  const rejected = MOCK_EXPENSES.filter((e) => e.status === "rejected").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your reimbursement activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Total Expenses" value={`$${total.toLocaleString()}`} icon={Receipt} variant="primary" trend="+12% from last month" />
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
            {MOCK_EXPENSES.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {expense.id} · {expense.category} · {expense.date}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-semibold">${expense.amount.toFixed(2)}</span>
                  <StatusBadge status={expense.status} />
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

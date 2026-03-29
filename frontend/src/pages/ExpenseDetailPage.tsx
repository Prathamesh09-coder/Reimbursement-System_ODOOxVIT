import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Expense } from "@/lib/api";
import { formatMoney, normalizeStatus } from "@/lib/domain";

const ExpenseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [expense, setExpense] = useState<Expense | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token || !id) return;
      const details = await api.getExpense(token, id);
      setExpense(details);
    };

    void load();
  }, [id, token]);

  if (!expense) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Expense not found</p>
        <Button variant="link" onClick={() => navigate("/expenses")}>Back to expenses</Button>
      </div>
    );
  }

  const stepIcon = (status: string) => {
    if (normalizeStatus(status) === "approved") return <CheckCircle className="h-5 w-5 text-success" />;
    if (normalizeStatus(status) === "rejected") return <XCircle className="h-5 w-5 text-destructive" />;
    return <Clock className="h-5 w-5 text-warning" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{expense.description}</h1>
          <p className="text-muted-foreground text-sm">#{expense.id}</p>
        </div>
        <StatusBadge status={normalizeStatus(expense.status)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Category", expense.category?.name || "Uncategorized"],
              ["Date", expense.expense_date?.slice(0, 10) || "-"],
              ["Amount", formatMoney(expense.converted_amount || expense.amount, user?.currency || expense.currency)],
              ["Paid By", expense.paid_by || "-"],
              ["Submitted By", expense.employee?.name || expense.employee?.email || "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            {expense.remarks && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Remarks</p>
                <p className="text-sm">{expense.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Approval Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(expense.approvals || []).map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {stepIcon(step.status || "")}
                    {i < (expense.approvals || []).length - 1 && (
                      <div className="w-px h-full bg-border mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{step.approver?.name || step.approver?.email || "System"}</p>
                    <p className="text-xs text-muted-foreground">{step.approver?.role?.name || step.role?.name || "-"}</p>
                    {step.comment && <p className="text-sm mt-1">{step.comment}</p>}
                    {step.action_time && <p className="text-xs text-muted-foreground mt-0.5">{new Date(step.action_time).toLocaleString()}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpenseDetailPage;

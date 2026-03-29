import React, { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Expense } from "@/lib/api";
import { formatMoney, normalizeStatus } from "@/lib/domain";

const ApprovalsPage = () => {
  const isMobile = useIsMobile();
  const { token, user } = useAuth();
  const [pendingExpenses, setPendingExpenses] = useState<Expense[]>([]);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const loadApprovals = async () => {
    if (!token) return;
    try {
      const rows = await api.listApprovals(token);
      setPendingExpenses(rows.filter((expense) => normalizeStatus(expense.status) === "pending"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load approvals");
    }
  };

  useEffect(() => {
    void loadApprovals();
  }, [token]);

  const handleApprove = async (id: number) => {
    if (!token) return;
    try {
      await api.approveExpense(token, id, "Approved");
      toast.success(`Expense #${id} approved`);
      await loadApprovals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Approval failed");
    }
  };

  const handleReject = async () => {
    if (!token || !rejectModal) return;
    try {
      await api.rejectExpense(token, Number(rejectModal), comment || "Rejected");
      toast.error(`Expense #${rejectModal} rejected`);
      await loadApprovals();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Rejection failed");
    }

    setRejectModal(null);
    setComment("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
        <p className="text-muted-foreground text-sm mt-1">Review and manage pending expense approvals</p>
      </div>

      {pendingExpenses.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No pending approvals</CardContent></Card>
      ) : isMobile ? (
        <div className="space-y-3">
          {pendingExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{expense.employee?.name || expense.employee?.email}</p>
                    <p className="text-xs text-muted-foreground">{expense.description || "Untitled"} · {expense.category?.name || "Uncategorized"}</p>
                  </div>
                  <span className="text-sm font-bold">{formatMoney(expense.converted_amount || expense.amount, user?.currency || expense.currency)}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" className="flex-1" onClick={() => handleApprove(expense.id)}>
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => setRejectModal(String(expense.id))}>
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <p className="text-sm font-medium">{expense.employee?.name || expense.employee?.email}</p>
                      <p className="text-xs text-muted-foreground">{expense.description || "Untitled"}</p>
                    </td>
                    <td className="p-3 text-sm">{expense.category?.name || "Uncategorized"}</td>
                    <td className="p-3 text-sm font-semibold text-right">{formatMoney(expense.converted_amount || expense.amount, user?.currency || expense.currency)}</td>
                    <td className="p-3"><StatusBadge status={normalizeStatus(expense.status)} /></td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="success" onClick={() => handleApprove(expense.id)}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectModal(String(expense.id))}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Expense</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Reason for rejection</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalsPage;

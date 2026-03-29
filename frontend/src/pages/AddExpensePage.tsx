import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, PAYMENT_METHODS } from "@/data/mockData";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api, type ExpenseCategory } from "@/lib/api";

const AddExpensePage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: "", categoryId: "", date: "", paidBy: "", amount: "", currency: user?.currency || "INR", remarks: "", receiptUrl: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  useEffect(() => {
    const loadCategories = async () => {
      if (!token) return;
      try {
        const rows = await api.listCategories(token);
        setCategories(rows);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load categories");
      }
    };

    void loadCategories();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;
    if (!form.description || !form.date || !form.paidBy || !form.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createExpense(token, {
        description: form.description,
        category_id: form.categoryId ? Number(form.categoryId) : null,
        expense_date: form.date,
        paid_by: form.paidBy,
        amount: Number(form.amount),
        currency: form.currency,
        remarks: form.remarks,
        receipt_url: form.receiptUrl || null,
      });

      await api.submitExpense(token, created.id);
      toast.success("Expense submitted successfully");
      navigate("/expenses");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Expense</h1>
          <p className="text-muted-foreground text-sm">Submit a new expense claim</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Brief description of expense" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select onValueChange={(v) => update("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Expense Date</Label>
                <Input id="date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Paid By</Label>
                <Select onValueChange={(v) => update("paidBy", v)}>
                  <SelectTrigger><SelectValue placeholder="Payment method" /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input type="number" placeholder="0.00" value={form.amount} onChange={(e) => update("amount", e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" value={form.remarks} onChange={(e) => update("remarks", e.target.value)} placeholder="Any additional notes" rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Upload Receipt</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Paste receipt URL (cloud/local public link)</p>
                <Input
                  className="mt-3"
                  placeholder="https://.../receipt.jpg"
                  value={form.receiptUrl}
                  onChange={(e) => update("receiptUrl", e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit Expense"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpensePage;

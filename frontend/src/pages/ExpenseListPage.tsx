import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Expense } from "@/lib/api";
import { formatMoney, normalizeStatus } from "@/lib/domain";

const ExpenseListPage = () => {
  const isMobile = useIsMobile();
  const { token, user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const rows = await api.listExpenses(token);
      setExpenses(rows);
    };

    void load();
  }, [token]);

  const filtered = useMemo(
    () =>
      expenses.filter((expense) => {
        const status = normalizeStatus(expense.status);
        if (statusFilter !== "all" && status !== statusFilter) return false;
        const text = `${expense.description || ""} ${expense.category?.name || ""}`.toLowerCase();
        if (search && !text.includes(search.toLowerCase())) return false;
        return true;
      }),
    [expenses, search, statusFilter]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track your expense claims</p>
        </div>
        <Link to="/expenses/new">
          <Button><Plus className="h-4 w-4" /> Add Expense</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {filtered.map((expense) => (
            <Link key={expense.id} to={`/expenses/${expense.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{expense.description || "Untitled expense"}</p>
                      <p className="text-xs text-muted-foreground">{expense.category?.name || "Uncategorized"} · {expense.expense_date?.slice(0, 10) || "-"}</p>
                    </div>
                    <StatusBadge status={normalizeStatus(expense.status)} />
                  </div>
                  <p className="text-lg font-bold">{formatMoney(expense.converted_amount || expense.amount, user?.currency || expense.currency)}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((expense) => (
                  <tr key={expense.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link to={`/expenses/${expense.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {expense.description || "Untitled expense"}
                      </Link>
                      <p className="text-xs text-muted-foreground">#{expense.id}</p>
                    </td>
                    <td className="p-3 text-sm">{expense.category?.name || "Uncategorized"}</td>
                    <td className="p-3 text-sm text-muted-foreground">{expense.expense_date?.slice(0, 10) || "-"}</td>
                    <td className="p-3 text-sm font-semibold text-right">{formatMoney(expense.converted_amount || expense.amount, user?.currency || expense.currency)}</td>
                    <td className="p-3"><StatusBadge status={normalizeStatus(expense.status)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">No expenses found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExpenseListPage;

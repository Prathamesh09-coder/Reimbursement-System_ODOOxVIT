import React, { useState } from "react";
import { Link } from "react-router-dom";
import { MOCK_EXPENSES } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const ExpenseListPage = () => {
  const isMobile = useIsMobile();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_EXPENSES.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          {filtered.map((e) => (
            <Link key={e.id} to={`/expenses/${e.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm">{e.description}</p>
                      <p className="text-xs text-muted-foreground">{e.category} · {e.date}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="text-lg font-bold">${e.amount.toFixed(2)}</p>
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
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Link to={`/expenses/${e.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                        {e.description}
                      </Link>
                      <p className="text-xs text-muted-foreground">{e.id}</p>
                    </td>
                    <td className="p-3 text-sm">{e.category}</td>
                    <td className="p-3 text-sm text-muted-foreground">{e.date}</td>
                    <td className="p-3 text-sm font-semibold text-right">${e.amount.toFixed(2)}</td>
                    <td className="p-3"><StatusBadge status={e.status} /></td>
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

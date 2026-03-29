import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Role, type UserRecord } from "@/lib/api";

const UsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingPasswordFor, setSendingPasswordFor] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "EMPLOYEE", managerId: "" });

  const managers = useMemo(
    () => users.filter((user) => ["MANAGER", "ADMIN", "DIRECTOR"].includes(user.role.name)),
    [users]
  );

  const loadData = async () => {
    if (!token) return;
    const [userRows, roleRows] = await Promise.all([api.listUsers(token), api.listRoles(token)]);
    setUsers(userRows);
    setRoles(roleRows);
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!form.name || !form.email || !form.role) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const created = await api.createUser(token, {
        name: form.name,
        email: form.email,
        role: form.role,
      });

      if (form.managerId) {
        await api.assignManager(token, created.id, Number(form.managerId));
      }

      toast.success("User created successfully");
      toast.info("Click Send Password for the user to email a random temporary password");
      setForm({ name: "", email: "", role: "EMPLOYEE", managerId: "" });
      setShowAdd(false);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    if (!token) return;
    try {
      await api.updateUserRole(token, userId, role);
      toast.success("Role updated");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Role update failed");
    }
  };

  const handleSendPassword = async (userId: number) => {
    if (!token) return;
    setSendingPasswordFor(userId);
    try {
      const result = await api.sendPasswordToUser(token, userId);
      if (result.simulatedTempPassword) {
        toast.success(`Simulation password: ${result.simulatedTempPassword}`);
        toast.info("Password is also saved in backend password_tokens table (TEMP_PASSWORD_SIMULATION)");
        return;
      }

      if (result.delivery?.messageId) {
        toast.success(`Temporary password sent. MessageID: ${result.delivery.messageId}`);
      } else {
        toast.success("Temporary password sent to user email");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send password");
    } finally {
      setSendingPasswordFor(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage team members and roles</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add User</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Manager</th>
                <th className="p-3 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                        {(u.name || u.email).split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden sm:table-cell">{u.email}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{u.role.name}</Badge>
                      <Select defaultValue={u.role.name} onValueChange={(value) => handleRoleChange(u.id, value)}>
                        <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground hidden md:table-cell">{u.manager?.name || "-"}</td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendPassword(u.id)}
                      disabled={sendingPasswordFor === u.id}
                    >
                      <Send className="h-3.5 w-3.5" /> {sendingPasswordFor === u.id ? "Sending..." : "Send Password"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Full name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="user@company.com" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((role) => <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Manager</Label>
              <Select value={form.managerId} onValueChange={(value) => setForm((prev) => ({ ...prev, managerId: value }))}>
                <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={String(manager.id)}>{manager.name || manager.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}><Send className="h-4 w-4" /> {saving ? "Saving..." : "Create User"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;

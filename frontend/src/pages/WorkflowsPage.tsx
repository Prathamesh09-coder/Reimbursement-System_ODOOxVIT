import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, GitBranch, ArrowDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { api, type Role, type UserRecord, type Workflow } from "@/lib/api";

const WorkflowsPage = () => {
  const { token } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [includeManagerApprover, setIncludeManagerApprover] = useState(true);
  const [isSequential, setIsSequential] = useState(true);
  const [minApprovalPercent, setMinApprovalPercent] = useState(100);
  const [specialApproverId, setSpecialApproverId] = useState("");
  const [steps, setSteps] = useState([
    { order: 1, approverType: "role" as const, roleId: "", userId: "", isRequired: true },
  ]);

  const loadData = async () => {
    if (!token) return;
    const [workflowRows, roleRows, userRows] = await Promise.all([
      api.listWorkflows(token),
      api.listRoles(token),
      api.listUsers(token),
    ]);
    setWorkflows(workflowRows);
    setRoles(roleRows);
    setUsers(userRows);
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { order: prev.length + 1, approverType: "role", roleId: "", userId: "", isRequired: true },
    ]);
  };

  const removeStep = (i: number) => {
    setSteps((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!workflowName.trim() || !steps.length) {
      toast.error("Workflow name and at least one step are required");
      return;
    }

    const payloadSteps = steps.map((step) => ({
      step_order: step.order,
      role_id: step.approverType === "role" ? Number(step.roleId || 0) || undefined : undefined,
      user_id: step.approverType === "specific" ? Number(step.userId || 0) || undefined : undefined,
      is_required: step.isRequired,
    }));

    let finalSteps = payloadSteps;
    if (includeManagerApprover) {
      const managerRole = roles.find((role) => role.name === "MANAGER");
      if (!managerRole) {
        toast.error("MANAGER role not found");
        return;
      }

      const hasManagerStep = payloadSteps.some((step) => step.role_id === managerRole.id);
      if (!hasManagerStep) {
        finalSteps = [
          { step_order: 1, role_id: managerRole.id, is_required: true },
          ...payloadSteps.map((step, idx) => ({ ...step, step_order: idx + 2 })),
        ];
      }
    }

    try {
      await api.createWorkflow(token, {
        name: workflowName,
        steps: finalSteps,
        rule: {
          is_sequential: isSequential,
          min_approval_percentage: minApprovalPercent,
          special_approver_id: specialApproverId ? Number(specialApproverId) : undefined,
        },
      });

      toast.success("Workflow created successfully");
      setShowCreate(false);
      setWorkflowName("");
      setSteps([{ order: 1, approverType: "role", roleId: "", userId: "", isRequired: true }]);
      setIncludeManagerApprover(true);
      setIsSequential(true);
      setMinApprovalPercent(100);
      setSpecialApproverId("");
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Workflow creation failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure approval workflows</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create Workflow</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((wf) => (
          <Card key={wf.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{wf.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {wf.steps.map((step, i) => (
                <div key={step.id}>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                      {step.step_order}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.user?.name || step.user?.email || step.role?.name || "Approver"}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {step.user_id ? "specific" : "role"} · {wf.rules?.[0]?.is_sequential ? "sequential" : "parallel"}
                        {wf.rules?.[0]?.min_approval_percentage ? ` · ${wf.rules[0].min_approval_percentage}% required` : ""}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">{wf.rules?.[0]?.is_sequential ? "sequential" : "parallel"}</Badge>
                  </div>
                  {i < wf.steps.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create Workflow</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Workflow Name</Label>
              <Input placeholder="e.g. Standard Approval" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} />
            </div>

            <div className="space-y-3">
              <Label>Steps</Label>
              {steps.map((step, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Step {step.order}</span>
                    {steps.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeStep(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Approver Type</Label>
                      <Select
                        value={step.approverType}
                        onValueChange={(value: "role" | "specific") =>
                          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, approverType: value } : s)))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="role">Role-based</SelectItem>
                          <SelectItem value="specific">Specific User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Approver</Label>
                      {step.approverType === "role" ? (
                        <Select
                          value={step.roleId}
                          onValueChange={(value) =>
                            setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, roleId: value } : s)))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select
                          value={step.userId}
                          onValueChange={(value) =>
                            setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, userId: value } : s)))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select user" /></SelectTrigger>
                          <SelectContent>
                            {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name || u.email}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={step.isRequired}
                        onCheckedChange={(checked) =>
                          setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, isRequired: checked } : s)))
                        }
                      />
                      <Label className="text-xs">Step is required</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Step Order #{step.order}</Label>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-3.5 w-3.5" /> Add Step
              </Button>

              <div className="p-3 border rounded-lg space-y-3">
                <Label className="text-sm">Approval Rule</Label>
                <div className="flex items-center gap-2">
                  <Switch checked={includeManagerApprover} onCheckedChange={setIncludeManagerApprover} />
                  <Label className="text-xs">Is manager approver (step 1)</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={isSequential} onCheckedChange={setIsSequential} />
                  <Label className="text-xs">Sequential flow</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Min Approval %</Label>
                    <Input type="number" min={1} max={100} value={minApprovalPercent} onChange={(e) => setMinApprovalPercent(Number(e.target.value || 100))} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Special Approver</Label>
                    <Select value={specialApproverId} onValueChange={setSpecialApproverId}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.name || u.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit">Create Workflow</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowsPage;

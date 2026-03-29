import React, { useState } from "react";
import { MOCK_WORKFLOWS } from "@/data/mockData";
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

const WorkflowsPage = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [steps, setSteps] = useState([
    { order: 1, approverType: "role" as const, approverValue: "", mode: "sequential" as const, minApprovalPercent: 100 },
  ]);

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      { order: prev.length + 1, approverType: "role", approverValue: "", mode: "sequential", minApprovalPercent: 100 },
    ]);
  };

  const removeStep = (i: number) => {
    setSteps((prev) => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Workflow created successfully!");
    setShowCreate(false);
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
        {MOCK_WORKFLOWS.map((wf) => (
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
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.approverValue}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {step.approverType} · {step.mode}
                        {step.mode === "parallel" && ` · ${step.minApprovalPercent}% required`}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize">{step.mode}</Badge>
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
              <Input placeholder="e.g. Standard Approval" />
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
                      <Select defaultValue={step.approverType}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="role">Role-based</SelectItem>
                          <SelectItem value="specific">Specific User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Approver</Label>
                      <Input className="h-8 text-xs" placeholder="Manager / User name" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch />
                      <Label className="text-xs">Parallel approval</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Min %</Label>
                      <Input type="number" className="h-8 w-16 text-xs" defaultValue={100} />
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addStep}>
                <Plus className="h-3.5 w-3.5" /> Add Step
              </Button>
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

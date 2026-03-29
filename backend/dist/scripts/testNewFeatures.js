"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BASE_URL = "http://localhost:5000/api";
async function testNewFeatures() {
    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║  🧪 TESTING NEW IMPLEMENTED FEATURES 🧪                       ║");
    console.log("║     Manager Relationships & Approval Workflows                ║");
    console.log("╚════════════════════════════════════════════════════════════════╝");
    console.log("\n");
    const results = [];
    // ============ SETUP: Create test users ============
    console.log("📋 SETUP: Creating test users");
    console.log("─".repeat(64));
    let adminId = 1;
    let managerId = 0;
    let employeeId = 0;
    try {
        // Create a manager
        const managerRes = await axios_1.default.post(`${BASE_URL}/users`, {
            email: `manager${Date.now()}@test.com`,
            password: "Manager@123",
            name: "Test Manager",
            role: "MANAGER",
            company_id: 1,
        });
        managerId = managerRes.data.data.id;
        console.log(`✅ Manager created: ID ${managerId}`);
        // Create an employee
        const empRes = await axios_1.default.post(`${BASE_URL}/users`, {
            email: `emp${Date.now()}@test.com`,
            password: "Emp@123",
            name: "Test Employee",
            role: "EMPLOYEE",
            company_id: 1,
        });
        employeeId = empRes.data.data.id;
        console.log(`✅ Employee created: ID ${employeeId}\n`);
    }
    catch (error) {
        console.log(`❌ Setup failed: ${error.response?.data?.error?.message}\n`);
    }
    // ============ FEATURE 1: Manager Assignment ============
    console.log("🎯 FEATURE 1: Manager Assignment");
    console.log("─".repeat(64));
    try {
        const res = await axios_1.default.post(`${BASE_URL}/workflows/managers/assign`, {
            employeeId,
            managerId,
        });
        console.log(`✅ Assigned employee ${employeeId} to manager ${managerId}`);
        results.push({ test: "Assign Manager", status: "✅ PASS" });
    }
    catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
        results.push({ test: "Assign Manager", status: "❌ FAIL" });
    }
    // ============ FEATURE 2: Get Team Members ============
    console.log("\n🎯 FEATURE 2: Get Team Members");
    console.log("─".repeat(64));
    try {
        const res = await axios_1.default.get(`${BASE_URL}/workflows/managers/${managerId}/team`);
        console.log(`✅ Retrieved team for manager ${managerId}`);
        console.log(`   Team size: ${res.data.data.length}`);
        results.push({ test: "Get Team Members", status: "✅ PASS" });
    }
    catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
        results.push({ test: "Get Team Members", status: "❌ FAIL" });
    }
    // ============ FEATURE 3: Get Manager Hierarchy ============
    console.log("\n🎯 FEATURE 3: Get Manager Hierarchy");
    console.log("─".repeat(64));
    try {
        const res = await axios_1.default.get(`${BASE_URL}/workflows/employees/${employeeId}/manager`);
        if (res.data.data) {
            console.log(`✅ Retrieved manager for employee ${employeeId}`);
            console.log(`   Manager: ${res.data.data.name}`);
        }
        else {
            console.log(`ℹ️  Employee has no manager assigned`);
        }
        results.push({ test: "Get Manager Hierarchy", status: "✅ PASS" });
    }
    catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
        results.push({ test: "Get Manager Hierarchy", status: "❌ FAIL" });
    }
    // ============ FEATURE 4: Create Workflow ============
    console.log("\n🎯 FEATURE 4: Create Workflow with Sequential Steps");
    console.log("─".repeat(64));
    let workflowId = 0;
    try {
        const res = await axios_1.default.post(`${BASE_URL}/workflows`, {
            company_id: 1,
            name: "Multi-level Approval Workflow",
            steps: [
                { step_order: 1, role_id: 2 }, // Manager role ID (usually 2)
                { step_order: 2, role_id: 3 }, // Finance role
                { step_order: 3, role_id: 5 }, // Director role
            ],
            rule: {
                is_sequential: true,
            },
        });
        workflowId = res.data.data.workflow.id;
        console.log(`✅ Created workflow: ID ${workflowId}`);
        console.log(`   Steps: 3 (Manager → Finance → Director)`);
        console.log(`   Type: Sequential`);
        results.push({ test: "Create Workflow", status: "✅ PASS" });
    }
    catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
        results.push({ test: "Create Workflow", status: "❌ FAIL" });
    }
    // ============ FEATURE 5: Get Workflow ============
    console.log("\n🎯 FEATURE 5: Get Workflow Details");
    console.log("─".repeat(64));
    if (workflowId > 0) {
        try {
            const res = await axios_1.default.get(`${BASE_URL}/workflows/${workflowId}`);
            console.log(`✅ Retrieved workflow: ${res.data.data.name}`);
            console.log(`   Steps: ${res.data.data.steps.length}`);
            console.log(`   Rules configured: ${res.data.data.rules.length}`);
            results.push({ test: "Get Workflow", status: "✅ PASS" });
        }
        catch (error) {
            console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
            results.push({ test: "Get Workflow", status: "❌ FAIL" });
        }
    }
    // ============ FEATURE 6: Create Workflow with Percentage Rule ============
    console.log("\n🎯 FEATURE 6: Create Workflow with Percentage Rule");
    console.log("─".repeat(64));
    let percentageWorkflowId = 0;
    try {
        const res = await axios_1.default.post(`${BASE_URL}/workflows`, {
            company_id: 1,
            name: "Percentage-based Approval",
            steps: [
                { step_order: 1, role_id: 2 }, // Manager
                { step_order: 2, role_id: 3 }, // Finance
                { step_order: 3, role_id: 5 }, // Director
            ],
            rule: {
                min_approval_percentage: 60,
                is_sequential: false,
            },
        });
        percentageWorkflowId = res.data.data.workflow.id;
        console.log(`✅ Created percentage-based workflow: ID ${percentageWorkflowId}`);
        console.log(`   Requirement: 60% of approvers must approve`);
        console.log(`   Type: Non-sequential (parallel approvals)`);
        results.push({ test: "Create Percentage Workflow", status: "✅ PASS" });
    }
    catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
        results.push({ test: "Create Percentage Workflow", status: "❌ FAIL" });
    }
    // ============ FEATURE 7: Create Expense with Workflow ============
    console.log("\n🎯 FEATURE 7: Create Expense with Workflow Assignment");
    console.log("─".repeat(64));
    let expenseId = 0;
    try {
        const res = await axios_1.default.post(`${BASE_URL}/expenses`, {
            amount: 5000,
            currency: "INR",
            category_id: 1,
            description: "Test expense for workflow testing",
            paid_by: "CARD",
            expense_date: new Date().toISOString().split("T")[0],
        });
        expenseId = res.data.data.id;
        console.log(`✅ Created expense: ID ${expenseId}`);
        console.log(`   Amount: ${res.data.data.amount} ${res.data.data.currency}`);
        console.log(`   Status: ${res.data.data.status}`);
        results.push({ test: "Create Expense", status: "✅ PASS" });
    }
    catch (error) {
        console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
        results.push({ test: "Create Expense", status: "❌ FAIL" });
    }
    // ============ FEATURE 8: Check Approval Rules ============
    console.log("\n🎯 FEATURE 8: Check Approval Rules");
    console.log("─".repeat(64));
    if (expenseId > 0 && workflowId > 0) {
        try {
            const res = await axios_1.default.get(`${BASE_URL}/workflows/expenses/${expenseId}/rules/${workflowId}`);
            console.log(`✅ Checked approval rules for expense ${expenseId}`);
            console.log(`   Should approve: ${res.data.data.shouldApprove}`);
            console.log(`   Reason: ${res.data.data.reason}`);
            results.push({ test: "Check Approval Rules", status: "✅ PASS" });
        }
        catch (error) {
            console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
            results.push({ test: "Check Approval Rules", status: "❌ FAIL" });
        }
    }
    // ============ FEATURE 9: Get Approval Status ============
    console.log("\n🎯 FEATURE 9: Get Approval Status");
    console.log("─".repeat(64));
    if (expenseId > 0) {
        try {
            const res = await axios_1.default.get(`${BASE_URL}/workflows/expenses/${expenseId}/approval-status`);
            console.log(`✅ Retrieved approval status for expense ${expenseId}`);
            console.log(`   Total approvers: ${res.data.data.stats.total}`);
            console.log(`   Approved: ${res.data.data.stats.approved}`);
            console.log(`   Pending: ${res.data.data.stats.pending}`);
            console.log(`   Approval percentage: ${res.data.data.approvalPercentage.toFixed(1)}%`);
            results.push({ test: "Get Approval Status", status: "✅ PASS" });
        }
        catch (error) {
            console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
            results.push({ test: "Get Approval Status", status: "❌ FAIL" });
        }
    }
    // ============ FEATURE 10: Submit Expense and Move to Next Approver ============
    console.log("\n🎯 FEATURE 10: Submit Expense and Move to Next Approver");
    console.log("─".repeat(64));
    if (expenseId > 0) {
        try {
            // Submit expense first
            await axios_1.default.post(`${BASE_URL}/expenses/${expenseId}/submit`);
            console.log(`✅ Submitted expense for approval`);
            // Move to next approver
            const res = await axios_1.default.post(`${BASE_URL}/workflows/expenses/${expenseId}/next-approver/${workflowId}`);
            console.log(`✅ Moved to next approval step`);
            console.log(`   Next step: ${res.data.data.nextStepOrder}`);
            results.push({ test: "Move to Next Approver", status: "✅ PASS" });
        }
        catch (error) {
            console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
            results.push({ test: "Move to Next Approver", status: "❌ FAIL" });
        }
    }
    // ============ FEATURE 11: Approve with Workflow Rules ============
    console.log("\n🎯 FEATURE 11: Approve Expense with Comments");
    console.log("─".repeat(64));
    if (expenseId > 0) {
        try {
            const res = await axios_1.default.post(`${BASE_URL}/approvals/${expenseId}/approve`, {
                remarks: "Approved - Budget within limits",
            });
            console.log(`✅ Approved expense with remarks`);
            console.log(`   Status: ${res.data.data.expense.status}`);
            console.log(`   Auto-approved: ${res.data.data.autoApproved}`);
            results.push({ test: "Approve with Comments", status: "✅ PASS" });
        }
        catch (error) {
            console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
            results.push({ test: "Approve with Comments", status: "⚠️ FAIL" });
        }
    }
    // ============ SUMMARY ============
    console.log("\n\n");
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║                      TEST SUMMARY                             ║");
    console.log("╠════════════════════════════════════════════════════════════════╣");
    const passed = results.filter((r) => r.status === "✅ PASS").length;
    const failed = results.filter((r) => r.status.includes("FAIL")).length;
    const total = results.length;
    results.forEach((r) => {
        console.log(`║ ${r.status} ${r.test.padEnd(50)} ║`);
    });
    console.log("╠════════════════════════════════════════════════════════════════╣");
    console.log(`║ Passed: ${passed.toString().padEnd(54)} ║`);
    console.log(`║ Failed: ${failed.toString().padEnd(54)} ║`);
    console.log(`║ Total:  ${total.toString().padEnd(54)} ║`);
    console.log(`║ Success Rate: ${((passed / total) * 100).toFixed(1)}%${" ".padEnd(46)} ║`);
    console.log("╚════════════════════════════════════════════════════════════════╝");
    process.exit(failed > 0 ? 1 : 0);
}
testNewFeatures().catch((error) => {
    console.error("Test error:", error);
    process.exit(1);
});
//# sourceMappingURL=testNewFeatures.js.map
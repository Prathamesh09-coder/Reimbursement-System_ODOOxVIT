import type { Expense, User, Workflow } from "@/types";

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "EXP-1042",
    description: "Client dinner meeting",
    category: "Meals & Entertainment",
    date: "2026-03-27",
    amount: 250,
    currency: "USD",
    status: "pending",
    paidBy: "Credit Card",
    remarks: "Dinner with potential client from TechnoSoft",
    submittedBy: "Alex Johnson",
    approvalHistory: [
      { approver: "Maria Chen", role: "Manager", status: "pending" },
      { approver: "David Park", role: "Finance", status: "pending" },
    ],
  },
  {
    id: "EXP-1041",
    description: "Flight to NYC conference",
    category: "Travel",
    date: "2026-03-25",
    amount: 489,
    currency: "USD",
    status: "approved",
    paidBy: "Company Card",
    submittedBy: "Alex Johnson",
    approvalHistory: [
      { approver: "Maria Chen", role: "Manager", status: "approved", comment: "Approved", timestamp: "Mar 25, 2:30 PM" },
      { approver: "David Park", role: "Finance", status: "approved", comment: "Verified receipt", timestamp: "Mar 26, 9:15 AM" },
    ],
  },
  {
    id: "EXP-1040",
    description: "Office supplies - Q1",
    category: "Office Supplies",
    date: "2026-03-22",
    amount: 134.5,
    currency: "USD",
    status: "approved",
    paidBy: "Cash",
    submittedBy: "Sarah Williams",
    approvalHistory: [
      { approver: "Alex Johnson", role: "Admin", status: "approved", comment: "Looks good", timestamp: "Mar 22, 4:00 PM" },
    ],
  },
  {
    id: "EXP-1039",
    description: "Software subscription - Figma",
    category: "Software",
    date: "2026-03-20",
    amount: 75,
    currency: "USD",
    status: "pending",
    paidBy: "Credit Card",
    submittedBy: "Tom Baker",
    approvalHistory: [
      { approver: "Maria Chen", role: "Manager", status: "approved", comment: "Needed for design team", timestamp: "Mar 20, 11:00 AM" },
      { approver: "David Park", role: "Finance", status: "pending" },
    ],
  },
  {
    id: "EXP-1038",
    description: "Uber rides - March",
    category: "Transportation",
    date: "2026-03-18",
    amount: 62.3,
    currency: "USD",
    status: "rejected",
    paidBy: "Personal Card",
    remarks: "Multiple rides for client visits",
    submittedBy: "Alex Johnson",
    approvalHistory: [
      { approver: "Maria Chen", role: "Manager", status: "rejected", comment: "Missing receipts for 2 rides", timestamp: "Mar 19, 10:00 AM" },
    ],
  },
  {
    id: "EXP-1037",
    description: "Team lunch celebration",
    category: "Meals & Entertainment",
    date: "2026-03-15",
    amount: 320,
    currency: "USD",
    status: "approved",
    paidBy: "Company Card",
    submittedBy: "Maria Chen",
    approvalHistory: [
      { approver: "Alex Johnson", role: "Admin", status: "approved", timestamp: "Mar 15, 5:30 PM" },
    ],
  },
];

export const MOCK_USERS: User[] = [
  { id: "1", name: "Alex Johnson", email: "alex@acmecorp.com", role: "Admin", manager: "-" },
  { id: "2", name: "Maria Chen", email: "maria@acmecorp.com", role: "Manager", manager: "Alex Johnson" },
  { id: "3", name: "David Park", email: "david@acmecorp.com", role: "Finance", manager: "Alex Johnson" },
  { id: "4", name: "Sarah Williams", email: "sarah@acmecorp.com", role: "Employee", manager: "Maria Chen" },
  { id: "5", name: "Tom Baker", email: "tom@acmecorp.com", role: "Employee", manager: "Maria Chen" },
  { id: "6", name: "Lisa Wang", email: "lisa@acmecorp.com", role: "Director", manager: "-" },
];

export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: "WF-1",
    name: "Standard Expense Approval",
    steps: [
      { id: "s1", order: 1, approverType: "role", approverValue: "Manager", mode: "sequential", minApprovalPercent: 100 },
      { id: "s2", order: 2, approverType: "role", approverValue: "Finance", mode: "sequential", minApprovalPercent: 100 },
    ],
  },
  {
    id: "WF-2",
    name: "High Value Approval",
    steps: [
      { id: "s1", order: 1, approverType: "role", approverValue: "Manager", mode: "sequential", minApprovalPercent: 100 },
      { id: "s2", order: 2, approverType: "role", approverValue: "Director", mode: "parallel", minApprovalPercent: 50 },
      { id: "s3", order: 3, approverType: "specific", approverValue: "Alex Johnson", mode: "sequential", minApprovalPercent: 100 },
    ],
  },
];

export const CATEGORIES = [
  "Meals & Entertainment",
  "Travel",
  "Office Supplies",
  "Software",
  "Transportation",
  "Accommodation",
  "Training",
  "Other",
];

export const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"];

export const PAYMENT_METHODS = ["Cash", "Credit Card", "Company Card", "Personal Card", "Bank Transfer"];

export const COUNTRIES = [
  "United States", "India", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Singapore", "Japan", "Brazil",
];

import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return <Badge variant={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
};

export default StatusBadge;

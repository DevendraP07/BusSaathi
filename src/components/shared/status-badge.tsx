"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusVariant =
	| "active"
	| "inactive"
	| "suspended"
	| "pending"
	| "confirmed"
	| "failed"
	| "refunded"
	| "scheduled"
	| "started"
	| "ongoing"
	| "completed"
	| "cancelled"
	| "open"
	| "in_progress"
	| "resolved"
	| "closed"
	| "approved"
	| "rejected"
	| "boarded"
	| "dropped"
	| "absent"
	| "present"
	| "maintenance"
	| "morning"
	| "evening"
	| "full_day"
	| "low"
	| "medium"
	| "high"
	| "critical"
	| "monthly"
	| "term"
	| "annual"
	| string;

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
	active: {
		label: "Active",
		className: "bg-green-100 text-green-700 border-green-200",
	},
	inactive: {
		label: "Inactive",
		className: "bg-gray-100 text-gray-600 border-gray-200",
	},
	suspended: {
		label: "Suspended",
		className: "bg-red-100 text-red-700 border-red-200",
	},
	maintenance: {
		label: "Maintenance",
		className: "bg-orange-100 text-orange-700 border-orange-200",
	},
	pending: {
		label: "Pending",
		className: "bg-yellow-100 text-yellow-700 border-yellow-200",
	},
	confirmed: {
		label: "Confirmed",
		className: "bg-green-100 text-green-700 border-green-200",
	},
	failed: {
		label: "Failed",
		className: "bg-red-100 text-red-700 border-red-200",
	},
	refunded: {
		label: "Refunded",
		className: "bg-purple-100 text-purple-700 border-purple-200",
	},
	scheduled: {
		label: "Scheduled",
		className: "bg-blue-100 text-blue-700 border-blue-200",
	},
	started: {
		label: "Started",
		className: "bg-indigo-100 text-indigo-700 border-indigo-200",
	},
	ongoing: {
		label: "Ongoing",
		className: "bg-indigo-100 text-indigo-700 border-indigo-200",
	},
	completed: {
		label: "Completed",
		className: "bg-green-100 text-green-700 border-green-200",
	},
	cancelled: {
		label: "Cancelled",
		className: "bg-red-100 text-red-700 border-red-200",
	},
	open: { label: "Open", className: "bg-red-100 text-red-700 border-red-200" },
	in_progress: {
		label: "In Progress",
		className: "bg-blue-100 text-blue-700 border-blue-200",
	},
	resolved: {
		label: "Resolved",
		className: "bg-green-100 text-green-700 border-green-200",
	},
	closed: {
		label: "Closed",
		className: "bg-gray-100 text-gray-600 border-gray-200",
	},
	approved: {
		label: "Approved",
		className: "bg-green-100 text-green-700 border-green-200",
	},
	rejected: {
		label: "Rejected",
		className: "bg-red-100 text-red-700 border-red-200",
	},
	boarded: {
		label: "Boarded",
		className: "bg-green-100 text-green-700 border-green-200",
	},
	dropped: {
		label: "Dropped",
		className: "bg-blue-100 text-blue-700 border-blue-200",
	},
	absent: {
		label: "Absent",
		className: "bg-red-100 text-red-700 border-red-200",
	},
	present: {
		label: "Present",
		className: "bg-green-100 text-green-700 border-green-200",
	},
	morning: {
		label: "Morning",
		className: "bg-amber-100 text-amber-700 border-amber-200",
	},
	evening: {
		label: "Evening",
		className: "bg-purple-100 text-purple-700 border-purple-200",
	},
	full_day: {
		label: "Full Day",
		className: "bg-blue-100 text-blue-700 border-blue-200",
	},
	low: { label: "Low", className: "bg-gray-100 text-gray-600 border-gray-200" },
	medium: {
		label: "Medium",
		className: "bg-yellow-100 text-yellow-700 border-yellow-200",
	},
	high: {
		label: "High",
		className: "bg-orange-100 text-orange-700 border-orange-200",
	},
	critical: {
		label: "Critical",
		className: "bg-red-100 text-red-700 border-red-200",
	},
	monthly: {
		label: "Monthly",
		className: "bg-blue-100 text-blue-700 border-blue-200",
	},
	term: {
		label: "Term",
		className: "bg-indigo-100 text-indigo-700 border-indigo-200",
	},
	annual: {
		label: "Annual",
		className: "bg-purple-100 text-purple-700 border-purple-200",
	},
};

interface StatusBadgeProps {
	status: StatusVariant;
	className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
	if (!status) return null;
	const config = STATUS_CONFIG[status] ?? {
		label: status.replace(/_/g, " "),
		className: "bg-gray-100 text-gray-600 border-gray-200",
	};
	return (
		<Badge
			className={cn(
				"font-medium text-xs capitalize",
				config.className,
				className,
			)}
			variant="outline"
		>
			{config.label}
		</Badge>
	);
}

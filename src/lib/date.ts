export function formatDate(date: Date | string | null | undefined): string {
	if (!date) return "—";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

export function formatDateTime(date: Date | string | null | undefined): string {
	if (!date) return "—";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function formatTime(date: Date | string | null | undefined): string {
	if (!date) return "—";
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleTimeString("en-IN", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function getMonthYear(date: Date = new Date()): string {
	return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function isOverdue(dueDate: Date | string): boolean {
	const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
	return d < new Date();
}

export function daysUntilDue(dueDate: Date | string): number {
	const d = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
	const diff = d.getTime() - Date.now();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

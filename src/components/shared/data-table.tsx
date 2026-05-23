"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./empty-state";

export interface Column<T> {
	key: string;
	header: string;
	cell: (row: T) => React.ReactNode;
	className?: string;
}

interface DataTableProps<T> {
	data: T[];
	columns: Column<T>[];
	searchPlaceholder?: string;
	searchKeys?: (keyof T)[];
	pageSize?: number;
	isLoading?: boolean;
	emptyTitle?: string;
	emptyDescription?: string;
	toolbar?: React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
	data,
	columns,
	searchPlaceholder = "Search...",
	searchKeys = [],
	pageSize = 10,
	isLoading,
	emptyTitle = "No results found",
	emptyDescription,
	toolbar,
}: DataTableProps<T>) {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);

	const filtered = search
		? data.filter((row) =>
				searchKeys.some((key) =>
					String(row[key] ?? "")
						.toLowerCase()
						.includes(search.toLowerCase()),
				),
			)
		: data;

	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				{searchKeys.length > 0 && (
					<div className="relative max-w-sm flex-1">
						<Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							className="pl-8"
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							placeholder={searchPlaceholder}
							value={search}
						/>
					</div>
				)}
				{toolbar && (
					<div className="ml-auto flex items-center gap-2">{toolbar}</div>
				)}
			</div>

			<div className="overflow-hidden rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40">
							{columns.map((col) => (
								<TableHead
									className={cn(
										"font-semibold text-xs uppercase tracking-wide",
										col.className,
									)}
									key={col.key}
								>
									{col.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							["sk-a", "sk-b", "sk-c", "sk-d", "sk-e"].map((skKey) => (
								<TableRow key={skKey}>
									{columns.map((col) => (
										<TableCell key={col.key}>
											<div className="h-4 animate-pulse rounded bg-muted" />
										</TableCell>
									))}
								</TableRow>
							))
						) : paginated.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length}>
									<EmptyState
										description={emptyDescription}
										title={emptyTitle}
									/>
								</TableCell>
							</TableRow>
						) : (
							paginated.map((row) => {
								const rowKey =
									(row.id as string | undefined) ??
									(row.paymentRef as string | undefined) ??
									(row.issueRef as string | undefined) ??
									(row.tripRef as string | undefined) ??
									(row.registrationNumber as string | undefined) ??
									(row.routeCode as string | undefined) ??
									(row.email as string | undefined) ??
									JSON.stringify(row).slice(0, 40);
								return (
									<TableRow className="hover:bg-muted/30" key={rowKey}>
										{columns.map((col) => (
											<TableCell className={col.className} key={col.key}>
												{col.cell(row)}
											</TableCell>
										))}
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>

			{totalPages > 1 && (
				<div className="flex items-center justify-between text-muted-foreground text-sm">
					<span>
						Showing {(page - 1) * pageSize + 1}–
						{Math.min(page * pageSize, filtered.length)} of {filtered.length}
					</span>
					<div className="flex items-center gap-1">
						<Button
							className="h-7 w-7"
							disabled={page === 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
							size="icon"
							variant="outline"
						>
							<ChevronLeft className="h-3.5 w-3.5" />
						</Button>
						<span className="px-2 font-medium">
							{page} / {totalPages}
						</span>
						<Button
							className="h-7 w-7"
							disabled={page === totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
							size="icon"
							variant="outline"
						>
							<ChevronRight className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

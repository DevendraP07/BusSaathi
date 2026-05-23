"use client";

import { AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/date";
import { api } from "@/trpc/react";

export function DriverIssuesClient() {
	const { data: issues, isLoading } = api.issue.myIssues.useQuery();

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					<Button
						asChild
						className="gap-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
						size="sm"
					>
						<Link href="/driver/issues/report">
							<Plus className="h-4 w-4" />
							Report Issue
						</Link>
					</Button>
				}
				description="Issues you've reported to management"
				icon={AlertTriangle}
				title="My Issues"
			/>
			{isLoading ? (
				<p className="text-muted-foreground text-sm">Loading...</p>
			) : !issues?.length ? (
				<EmptyState
					description="Report any delays, breakdowns, or other issues during your trips."
					icon={AlertTriangle}
					title="No issues reported"
				/>
			) : (
				<div className="space-y-3">
					{issues.map((issue) => (
						<Card key={issue.id}>
							<CardContent className="p-4">
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1 space-y-1.5">
										<div className="flex flex-wrap items-center gap-2">
											<p className="font-semibold text-sm">{issue.title}</p>
											<StatusBadge status={issue.priority} />
											<StatusBadge status={issue.status} />
										</div>
										<p className="text-muted-foreground text-xs">
											{issue.issueRef} · {issue.type.replace(/_/g, " ")}
										</p>
										<p className="text-muted-foreground text-sm leading-snug">
											{issue.description}
										</p>
										{issue.resolutionNote && (
											<p className="rounded border border-green-200 bg-green-50 px-2 py-1 text-green-700 text-xs">
												Resolution: {issue.resolutionNote}
											</p>
										)}
									</div>
									<p className="shrink-0 text-muted-foreground text-xs">
										{formatDate(issue.createdAt)}
									</p>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}

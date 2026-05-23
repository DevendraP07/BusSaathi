"use client";

import { Pencil, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";

export function ParentStudentsClient() {
	const { data: students, isLoading } = api.student.myStudents.useQuery();
	const utils = api.useUtils();
	const remove = api.student.remove.useMutation({
		onSuccess: () => {
			toast.success("Child removed");
			void utils.student.myStudents.invalidate();
		},
		onError: (e) => toast.error(e.message),
	});

	return (
		<div className="space-y-6">
			<PageHeader
				actions={
					<Button
						asChild
						className="gap-1 bg-[oklch(0.18_0.04_250)] text-white hover:bg-[oklch(0.22_0.04_250)]"
						size="sm"
					>
						<Link href="/parent/students/new">
							<Plus className="h-4 w-4" />
							Add Child
						</Link>
					</Button>
				}
				description="Manage your children's transport profiles"
				icon={Users}
				title="My Children"
			/>
			{isLoading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Skeleton className="h-36" />
					<Skeleton className="h-36" />
					<Skeleton className="h-36" />
				</div>
			) : students?.length === 0 ? (
				<EmptyState
					action={
						<Button asChild>
							<Link href="/parent/students/new">Add Child</Link>
						</Button>
					}
					description="Add your child to manage their school transport."
					icon={Users}
					title="No children added"
				/>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{students?.map((child) => {
						const alloc = child.allocations[0];
						return (
							<Card
								className="transition-shadow hover:shadow-md"
								key={child.id}
							>
								<CardContent className="p-5">
									<div className="mb-3 flex items-start justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-700 text-lg">
												{child.name.charAt(0)}
											</div>
											<div>
												<p className="font-semibold">{child.name}</p>
												<p className="text-muted-foreground text-xs">
													{child.className} {child.section}{" "}
													{child.rollNumber
														? `· Roll: ${child.rollNumber}`
														: ""}
												</p>
											</div>
										</div>
										<div className="flex gap-1">
											<Button
												asChild
												className="h-7 w-7"
												size="icon"
												variant="ghost"
											>
												<Link href={`/parent/students/${child.id}`}>
													<Pencil className="h-3.5 w-3.5" />
												</Link>
											</Button>
											<ConfirmDialog
												confirmLabel="Remove"
												description={`This will remove ${child.name} from your account. Their transport history will be retained.`}
												onConfirm={() => remove.mutate({ studentId: child.id })}
												title="Remove child?"
												trigger={
													<Button
														className="h-7 w-7 text-destructive hover:text-destructive"
														size="icon"
														variant="ghost"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</Button>
												}
												variant="destructive"
											/>
										</div>
									</div>
									<div className="space-y-1.5 text-sm">
										{alloc ? (
											<>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">Route</span>
													<span className="font-medium">
														{alloc.route.name}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">
														Pickup Stop
													</span>
													<span className="font-medium">
														{alloc.pickupStop?.stopName ?? "—"}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-muted-foreground">Status</span>
													<StatusBadge status={alloc.status} />
												</div>
											</>
										) : (
											<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
												<p className="font-medium text-amber-700 text-xs">
													Not allocated to any route
												</p>
												<Link
													className="text-amber-600 text-xs underline"
													href="/parent/transport"
												>
													Apply for transport →
												</Link>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}
		</div>
	);
}

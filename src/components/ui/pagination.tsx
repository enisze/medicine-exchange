"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	baseUrl: string;
	searchParams?: Record<string, string | undefined>;
}

function buildUrl(baseUrl: string, page: number, searchParams?: Record<string, string | undefined>) {
	const params = new URLSearchParams();
	if (searchParams) {
		for (const [key, value] of Object.entries(searchParams)) {
			if (value !== undefined) {
				params.set(key, value);
			}
		}
	}
	params.set("page", String(page));
	return `${baseUrl}?${params.toString()}`;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const pages: (number | "ellipsis")[] = [1];

	if (currentPage > 3) {
		pages.push("ellipsis");
	}

	const start = Math.max(2, currentPage - 1);
	const end = Math.min(totalPages - 1, currentPage + 1);

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	if (currentPage < totalPages - 2) {
		pages.push("ellipsis");
	}

	if (totalPages > 1) {
		pages.push(totalPages);
	}

	return pages;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const pages = getPageNumbers(currentPage, totalPages);

	return (
		<nav className="flex items-center justify-center gap-1" aria-label="Pagination">
			{currentPage > 1 ? (
				<Link
					href={buildUrl(baseUrl, currentPage - 1, searchParams)}
					className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
					aria-label="Vorherige Seite"
				>
					<ChevronLeft className="h-4 w-4" />
				</Link>
			) : (
				<Button variant="outline" size="icon-sm" disabled aria-label="Vorherige Seite">
					<ChevronLeft className="h-4 w-4" />
				</Button>
			)}

			{pages.map((page, index) =>
				page === "ellipsis" ? (
					<span
						key={`ellipsis-${index}`}
						className="flex h-8 w-8 items-center justify-center"
					>
						<MoreHorizontal className="h-4 w-4 text-muted-foreground" />
					</span>
				) : (
					<Link
						key={page}
						href={buildUrl(baseUrl, page, searchParams)}
						className={cn(
							buttonVariants({
								variant: page === currentPage ? "default" : "outline",
								size: "icon-sm",
							})
						)}
						aria-current={page === currentPage ? "page" : undefined}
					>
						{page}
					</Link>
				)
			)}

			{currentPage < totalPages ? (
				<Link
					href={buildUrl(baseUrl, currentPage + 1, searchParams)}
					className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
					aria-label="Nächste Seite"
				>
					<ChevronRight className="h-4 w-4" />
				</Link>
			) : (
				<Button variant="outline" size="icon-sm" disabled aria-label="Nächste Seite">
					<ChevronRight className="h-4 w-4" />
				</Button>
			)}
		</nav>
	);
}

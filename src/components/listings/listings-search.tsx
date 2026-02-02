"use client";

import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ListingsSearch() {
	const [search, setSearch] = useQueryState("q", {
		defaultValue: "",
		shallow: false,
	});

	return (
		<div className="relative">
			<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Medikamente suchen..."
				value={search}
				onChange={(e) => setSearch(e.target.value || null)}
				className="pl-10 pr-10"
			/>
			{search && (
				<Button
					variant="ghost"
					size="sm"
					className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
					onClick={() => setSearch(null)}
				>
					<X className="h-4 w-4" />
				</Button>
			)}
		</div>
	);
}

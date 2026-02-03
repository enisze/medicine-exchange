"use server";

import { revalidatePath } from "next/cache";
import { ListingsRepository, RequestsRepository } from "@/db/repositories";
import { createListingSchema, idSchema } from "@/lib/validations";
import { authActionClient } from "@/lib/safe-action";

export const createListing = authActionClient
	.schema(createListingSchema)
	.action(async ({ parsedInput, ctx }) => {
		if (ctx.user.role !== "SELLER") {
			throw new Error("Nur Verkäufer können Angebote erstellen");
		}

		const listing = await ListingsRepository.create({
			userId: ctx.user.id,
			title: parsedInput.title,
			description: parsedInput.description,
			quantity: parsedInput.quantity,
			unit: parsedInput.unit,
			expiryDate: new Date(parsedInput.expiryDate),
		});

		revalidatePath("/dashboard/listings");
		return { listing };
	});

export const publishListing = authActionClient
	.schema(idSchema)
	.action(async ({ parsedInput, ctx }) => {
		const listing = await ListingsRepository.getByIdAndUserId({
			id: parsedInput.id,
			userId: ctx.user.id,
		});

		if (!listing) {
			throw new Error("Angebot nicht gefunden");
		}

		if (listing.status !== "DRAFT") {
			throw new Error("Nur Entwürfe können veröffentlicht werden");
		}

		await ListingsRepository.updateStatus({
			id: parsedInput.id,
			status: "ACTIVE",
		});

		revalidatePath("/dashboard/listings");
		revalidatePath("/listings");
		return { success: true };
	});

export const cancelListing = authActionClient
	.schema(idSchema)
	.action(async ({ parsedInput, ctx }) => {
		const listing = await ListingsRepository.getByIdAndUserId({
			id: parsedInput.id,
			userId: ctx.user.id,
		});

		if (!listing) {
			throw new Error("Angebot nicht gefunden");
		}

		if (listing.status === "CANCELLED") {
			throw new Error("Angebot ist bereits storniert");
		}

		if (listing.status === "SOLD") {
			throw new Error("Verkaufte Angebote können nicht storniert werden");
		}

		await RequestsRepository.rejectAllByListingId(parsedInput.id);

		await ListingsRepository.updateStatus({
			id: parsedInput.id,
			status: "CANCELLED",
		});

		revalidatePath("/dashboard/listings");
		revalidatePath("/dashboard/requests");
		revalidatePath("/listings");
		return { success: true };
	});

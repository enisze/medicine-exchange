"use server";

import { revalidatePath } from "next/cache";
import { ListingsRepository, RequestsRepository } from "@/db/repositories";
import { createRequestSchema, idSchema } from "@/lib/validations";
import { authActionClient } from "@/lib/safe-action";

export const createRequest = authActionClient
	.schema(createRequestSchema)
	.action(async ({ parsedInput, ctx }) => {
		const listing = await ListingsRepository.getById(parsedInput.listingId);

		if (!listing) {
			throw new Error("Angebot nicht gefunden");
		}

		if (listing.userId === ctx.user.id) {
			throw new Error("Sie können keine Anfrage für Ihr eigenes Angebot stellen");
		}

		if (listing.status !== "ACTIVE") {
			throw new Error("Angebot ist nicht verfügbar");
		}

		if (listing.expiryDate <= new Date()) {
			throw new Error("Angebot ist abgelaufen");
		}

		const availableQuantity = listing.quantity - listing.reservedQuantity;

		if (parsedInput.quantity > availableQuantity) {
			throw new Error(`Nur ${availableQuantity} ${listing.unit} verfügbar`);
		}

		const reserved = await ListingsRepository.reserveQuantity({
			id: parsedInput.listingId,
			quantity: parsedInput.quantity,
		});

		if (!reserved) {
			throw new Error(
				"Menge nicht mehr verfügbar. Bitte versuchen Sie es erneut."
			);
		}

		try {
			const request = await RequestsRepository.create({
				listingId: parsedInput.listingId,
				buyerId: ctx.user.id,
				quantity: parsedInput.quantity,
			});

			revalidatePath("/listings");
			revalidatePath(`/listings/${parsedInput.listingId}`);
			revalidatePath("/dashboard/requests");
			return { request };
		} catch (error) {
			await ListingsRepository.releaseReservation({
				id: parsedInput.listingId,
				quantity: parsedInput.quantity,
			});
			throw error;
		}
	});

export const approveRequest = authActionClient
	.schema(idSchema)
	.action(async ({ parsedInput, ctx }) => {
		const request = await RequestsRepository.getById(parsedInput.id);

		if (!request) {
			throw new Error("Anfrage nicht gefunden");
		}

		const listing = await ListingsRepository.getById(request.listingId);

		if (!listing || listing.userId !== ctx.user.id) {
			throw new Error("Keine Berechtigung");
		}

		if (request.status !== "PENDING") {
			throw new Error("Anfrage kann nicht mehr bearbeitet werden");
		}

		if (listing.expiryDate <= new Date()) {
			throw new Error("Angebot ist abgelaufen");
		}

		if (request.quantity > listing.quantity) {
			throw new Error(
				`Nicht genügend Bestand. Nur ${listing.quantity} ${listing.unit} verfügbar.`
			);
		}

		await ListingsRepository.fulfillReservation({
			id: request.listingId,
			quantity: request.quantity,
		});

		await RequestsRepository.updateStatus({
			id: parsedInput.id,
			status: "APPROVED",
		});

		revalidatePath("/listings");
		revalidatePath(`/listings/${request.listingId}`);
		revalidatePath("/dashboard/requests");
		return { success: true };
	});

export const rejectRequest = authActionClient
	.schema(idSchema)
	.action(async ({ parsedInput, ctx }) => {
		const request = await RequestsRepository.getById(parsedInput.id);

		if (!request) {
			throw new Error("Anfrage nicht gefunden");
		}

		const listing = await ListingsRepository.getById(request.listingId);

		if (!listing || listing.userId !== ctx.user.id) {
			throw new Error("Keine Berechtigung");
		}

		if (request.status !== "PENDING") {
			throw new Error("Anfrage kann nicht mehr bearbeitet werden");
		}

		await ListingsRepository.releaseReservation({
			id: request.listingId,
			quantity: request.quantity,
		});

		await RequestsRepository.updateStatus({
			id: parsedInput.id,
			status: "REJECTED",
		});

		revalidatePath("/listings");
		revalidatePath(`/listings/${request.listingId}`);
		revalidatePath("/dashboard/requests");
		return { success: true };
	});

export const cancelRequest = authActionClient
	.schema(idSchema)
	.action(async ({ parsedInput, ctx }) => {
		const request = await RequestsRepository.getById(parsedInput.id);

		if (!request) {
			throw new Error("Anfrage nicht gefunden");
		}

		if (request.buyerId !== ctx.user.id) {
			throw new Error("Keine Berechtigung");
		}

		if (request.status !== "PENDING") {
			throw new Error("Nur ausstehende Anfragen können storniert werden");
		}

		await ListingsRepository.releaseReservation({
			id: request.listingId,
			quantity: request.quantity,
		});

		await RequestsRepository.updateStatus({
			id: parsedInput.id,
			status: "CANCELLED",
		});

		revalidatePath("/listings");
		revalidatePath(`/listings/${request.listingId}`);
		revalidatePath("/dashboard/requests");
		return { success: true };
	});

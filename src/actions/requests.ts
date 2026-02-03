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

		// Prevent users from requesting their own listings
		if (listing.userId === ctx.user.id) {
			throw new Error("Sie können keine Anfrage für Ihr eigenes Angebot stellen");
		}

		if (listing.status !== "ACTIVE") {
			throw new Error("Angebot ist nicht verfügbar");
		}

		// Check expiry
		if (listing.expiryDate <= new Date()) {
			throw new Error("Angebot ist abgelaufen");
		}

		// Calculate available quantity (total - reserved)
		const availableQuantity = listing.quantity - listing.reservedQuantity;

		if (parsedInput.quantity > availableQuantity) {
			throw new Error(`Nur ${availableQuantity} ${listing.unit} verfügbar`);
		}

		// Atomic reservation - WHERE clause prevents race conditions
		const reserved = await ListingsRepository.reserveQuantity({
			id: parsedInput.listingId,
			quantity: parsedInput.quantity,
		});

		if (!reserved) {
			throw new Error(
				"Menge nicht mehr verfügbar. Bitte versuchen Sie es erneut."
			);
		}

		// Create request (reservation already secured)
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
			// Rollback reservation if request creation fails
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

		// Check if listing expired
		if (listing.expiryDate <= new Date()) {
			throw new Error("Angebot ist abgelaufen");
		}

		// Verify there's enough stock (quantity, not just available)
		if (request.quantity > listing.quantity) {
			throw new Error(
				`Nicht genügend Bestand. Nur ${listing.quantity} ${listing.unit} verfügbar.`
			);
		}

		// Fulfill reservation (decrements both quantity and reservedQuantity, auto-SOLD if empty)
		await ListingsRepository.fulfillReservation({
			id: request.listingId,
			quantity: request.quantity,
		});

		// Update request status
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

		// Release the reservation
		await ListingsRepository.releaseReservation({
			id: request.listingId,
			quantity: request.quantity,
		});

		// Update request status
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

		// Only the buyer who created the request can cancel it
		if (request.buyerId !== ctx.user.id) {
			throw new Error("Keine Berechtigung");
		}

		if (request.status !== "PENDING") {
			throw new Error("Nur ausstehende Anfragen können storniert werden");
		}

		// Release the reservation
		await ListingsRepository.releaseReservation({
			id: request.listingId,
			quantity: request.quantity,
		});

		// Update request status
		await RequestsRepository.updateStatus({
			id: parsedInput.id,
			status: "CANCELLED",
		});

		revalidatePath("/listings");
		revalidatePath(`/listings/${request.listingId}`);
		revalidatePath("/dashboard/requests");
		return { success: true };
	});

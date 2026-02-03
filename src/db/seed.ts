import { createId } from "@paralleldrive/cuid2";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { users, listings, requests } from "./schema";

// Seed configuration
const CONFIG = {
	sellers: 15,
	buyers: 50,
	listingsPerSeller: { min: 5, max: 25 },
	requestsPerBuyer: { min: 3, max: 15 },
};

// Medicine categories with realistic data
const MEDICINE_CATEGORIES = [
	{
		category: "Antibiotics",
		items: [
			{ name: "Amoxicillin", strengths: ["250mg", "500mg", "875mg"], forms: ["capsules", "tablets"] },
			{ name: "Azithromycin", strengths: ["250mg", "500mg"], forms: ["tablets"] },
			{ name: "Ciprofloxacin", strengths: ["250mg", "500mg", "750mg"], forms: ["tablets"] },
			{ name: "Doxycycline", strengths: ["50mg", "100mg"], forms: ["capsules"] },
			{ name: "Metronidazole", strengths: ["250mg", "400mg", "500mg"], forms: ["tablets"] },
			{ name: "Cephalexin", strengths: ["250mg", "500mg"], forms: ["capsules"] },
			{ name: "Clindamycin", strengths: ["150mg", "300mg"], forms: ["capsules"] },
			{ name: "Levofloxacin", strengths: ["250mg", "500mg", "750mg"], forms: ["tablets"] },
		],
	},
	{
		category: "Pain Relief",
		items: [
			{ name: "Ibuprofen", strengths: ["200mg", "400mg", "600mg", "800mg"], forms: ["tablets"] },
			{ name: "Naproxen", strengths: ["250mg", "500mg"], forms: ["tablets"] },
			{ name: "Diclofenac", strengths: ["25mg", "50mg", "75mg"], forms: ["tablets"] },
			{ name: "Acetaminophen", strengths: ["325mg", "500mg", "650mg"], forms: ["tablets"] },
			{ name: "Tramadol", strengths: ["50mg", "100mg"], forms: ["capsules"] },
			{ name: "Meloxicam", strengths: ["7.5mg", "15mg"], forms: ["tablets"] },
			{ name: "Celecoxib", strengths: ["100mg", "200mg"], forms: ["capsules"] },
			{ name: "Ketorolac", strengths: ["10mg"], forms: ["tablets"] },
		],
	},
	{
		category: "Diabetes",
		items: [
			{ name: "Metformin", strengths: ["500mg", "850mg", "1000mg"], forms: ["tablets"] },
			{ name: "Glipizide", strengths: ["5mg", "10mg"], forms: ["tablets"] },
			{ name: "Sitagliptin", strengths: ["25mg", "50mg", "100mg"], forms: ["tablets"] },
			{ name: "Empagliflozin", strengths: ["10mg", "25mg"], forms: ["tablets"] },
			{ name: "Glimepiride", strengths: ["1mg", "2mg", "4mg"], forms: ["tablets"] },
			{ name: "Pioglitazone", strengths: ["15mg", "30mg", "45mg"], forms: ["tablets"] },
			{ name: "Insulin Glargine", strengths: ["100U/ml"], forms: ["boxes", "pens"] },
			{ name: "Insulin Lispro", strengths: ["100U/ml"], forms: ["cartridges", "vials"] },
		],
	},
	{
		category: "Cardiovascular",
		items: [
			{ name: "Lisinopril", strengths: ["5mg", "10mg", "20mg", "40mg"], forms: ["tablets"] },
			{ name: "Amlodipine", strengths: ["2.5mg", "5mg", "10mg"], forms: ["tablets"] },
			{ name: "Atenolol", strengths: ["25mg", "50mg", "100mg"], forms: ["tablets"] },
			{ name: "Losartan", strengths: ["25mg", "50mg", "100mg"], forms: ["tablets"] },
			{ name: "Metoprolol", strengths: ["25mg", "50mg", "100mg"], forms: ["tablets"] },
			{ name: "Furosemide", strengths: ["20mg", "40mg", "80mg"], forms: ["tablets"] },
			{ name: "Hydrochlorothiazide", strengths: ["12.5mg", "25mg", "50mg"], forms: ["tablets"] },
			{ name: "Warfarin", strengths: ["1mg", "2mg", "5mg", "10mg"], forms: ["tablets"] },
			{ name: "Clopidogrel", strengths: ["75mg"], forms: ["tablets"] },
			{ name: "Diltiazem", strengths: ["30mg", "60mg", "120mg"], forms: ["tablets", "capsules"] },
		],
	},
	{
		category: "Gastrointestinal",
		items: [
			{ name: "Omeprazole", strengths: ["10mg", "20mg", "40mg"], forms: ["capsules"] },
			{ name: "Pantoprazole", strengths: ["20mg", "40mg"], forms: ["tablets"] },
			{ name: "Esomeprazole", strengths: ["20mg", "40mg"], forms: ["capsules"] },
			{ name: "Ranitidine", strengths: ["150mg", "300mg"], forms: ["tablets"] },
			{ name: "Ondansetron", strengths: ["4mg", "8mg"], forms: ["tablets"] },
			{ name: "Metoclopramide", strengths: ["5mg", "10mg"], forms: ["tablets"] },
			{ name: "Loperamide", strengths: ["2mg"], forms: ["capsules"] },
			{ name: "Sucralfate", strengths: ["1g"], forms: ["tablets"] },
		],
	},
	{
		category: "Respiratory",
		items: [
			{ name: "Salbutamol Inhaler", strengths: ["100mcg"], forms: ["inhalers"] },
			{ name: "Fluticasone Inhaler", strengths: ["50mcg", "125mcg", "250mcg"], forms: ["inhalers"] },
			{ name: "Montelukast", strengths: ["4mg", "5mg", "10mg"], forms: ["tablets"] },
			{ name: "Cetirizine", strengths: ["5mg", "10mg"], forms: ["tablets"] },
			{ name: "Loratadine", strengths: ["10mg"], forms: ["tablets"] },
			{ name: "Fexofenadine", strengths: ["60mg", "120mg", "180mg"], forms: ["tablets"] },
			{ name: "Budesonide Nasal Spray", strengths: ["32mcg", "64mcg"], forms: ["bottles"] },
			{ name: "Tiotropium", strengths: ["18mcg"], forms: ["inhalers"] },
		],
	},
	{
		category: "Mental Health",
		items: [
			{ name: "Sertraline", strengths: ["25mg", "50mg", "100mg"], forms: ["tablets"] },
			{ name: "Escitalopram", strengths: ["5mg", "10mg", "20mg"], forms: ["tablets"] },
			{ name: "Fluoxetine", strengths: ["10mg", "20mg", "40mg"], forms: ["capsules"] },
			{ name: "Alprazolam", strengths: ["0.25mg", "0.5mg", "1mg", "2mg"], forms: ["tablets"] },
			{ name: "Zolpidem", strengths: ["5mg", "10mg"], forms: ["tablets"] },
			{ name: "Duloxetine", strengths: ["20mg", "30mg", "60mg"], forms: ["capsules"] },
			{ name: "Venlafaxine", strengths: ["37.5mg", "75mg", "150mg"], forms: ["capsules"] },
			{ name: "Buspirone", strengths: ["5mg", "10mg", "15mg"], forms: ["tablets"] },
		],
	},
	{
		category: "Vitamins & Supplements",
		items: [
			{ name: "Vitamin D3", strengths: ["1000IU", "2000IU", "5000IU"], forms: ["softgels", "tablets"] },
			{ name: "Vitamin B12", strengths: ["500mcg", "1000mcg", "2500mcg"], forms: ["tablets"] },
			{ name: "Iron (Ferrous Sulfate)", strengths: ["65mg", "325mg"], forms: ["tablets"] },
			{ name: "Folic Acid", strengths: ["400mcg", "800mcg", "1mg"], forms: ["tablets"] },
			{ name: "Omega-3 Fish Oil", strengths: ["1000mg", "1200mg"], forms: ["softgels"] },
			{ name: "Calcium + Vitamin D", strengths: ["600mg/400IU", "500mg/200IU"], forms: ["tablets"] },
			{ name: "Magnesium", strengths: ["250mg", "400mg", "500mg"], forms: ["tablets", "capsules"] },
			{ name: "Zinc", strengths: ["15mg", "30mg", "50mg"], forms: ["tablets"] },
		],
	},
	{
		category: "Thyroid",
		items: [
			{ name: "Levothyroxine", strengths: ["25mcg", "50mcg", "75mcg", "100mcg", "125mcg", "150mcg"], forms: ["tablets"] },
			{ name: "Liothyronine", strengths: ["5mcg", "25mcg"], forms: ["tablets"] },
			{ name: "Methimazole", strengths: ["5mg", "10mg"], forms: ["tablets"] },
		],
	},
	{
		category: "Cholesterol",
		items: [
			{ name: "Atorvastatin", strengths: ["10mg", "20mg", "40mg", "80mg"], forms: ["tablets"] },
			{ name: "Rosuvastatin", strengths: ["5mg", "10mg", "20mg", "40mg"], forms: ["tablets"] },
			{ name: "Simvastatin", strengths: ["10mg", "20mg", "40mg"], forms: ["tablets"] },
			{ name: "Pravastatin", strengths: ["10mg", "20mg", "40mg", "80mg"], forms: ["tablets"] },
			{ name: "Ezetimibe", strengths: ["10mg"], forms: ["tablets"] },
		],
	},
	{
		category: "Topical",
		items: [
			{ name: "Hydrocortisone Cream", strengths: ["0.5%", "1%", "2.5%"], forms: ["tubes"] },
			{ name: "Clotrimazole Cream", strengths: ["1%"], forms: ["tubes"] },
			{ name: "Mupirocin Ointment", strengths: ["2%"], forms: ["tubes"] },
			{ name: "Triamcinolone Cream", strengths: ["0.1%", "0.5%"], forms: ["tubes"] },
			{ name: "Ketoconazole Cream", strengths: ["2%"], forms: ["tubes"] },
			{ name: "Benzoyl Peroxide Gel", strengths: ["2.5%", "5%", "10%"], forms: ["tubes"] },
		],
	},
	{
		category: "Eye Care",
		items: [
			{ name: "Artificial Tears", strengths: ["0.5%"], forms: ["boxes", "bottles"] },
			{ name: "Latanoprost Eye Drops", strengths: ["0.005%"], forms: ["bottles"] },
			{ name: "Timolol Eye Drops", strengths: ["0.25%", "0.5%"], forms: ["bottles"] },
			{ name: "Prednisolone Eye Drops", strengths: ["1%"], forms: ["bottles"] },
			{ name: "Ciprofloxacin Eye Drops", strengths: ["0.3%"], forms: ["bottles"] },
		],
	},
];

const LISTING_STATUSES = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "DRAFT", "SOLD", "EXPIRED", "CANCELLED"] as const;
const REQUEST_STATUSES = ["PENDING", "PENDING", "PENDING", "APPROVED", "APPROVED", "REJECTED", "CANCELLED"] as const;

const PHARMACY_NAMES = [
	"City Pharmacy", "MedSupply Co", "HealthFirst Distributors", "PharmaCare Plus", "Wellness Pharmacy",
	"Central Medical Supply", "QuickMeds Pharmacy", "Family Health Pharmacy", "MediStock Solutions",
	"Premier Pharmaceuticals", "Guardian Pharmacy", "LifeCare Medical", "Unity Health Supply",
	"Apex Pharmacy Services", "Reliable Med Distributors", "TrustMed Pharmacy", "CarePoint Medical",
];

const HEALTHCARE_FACILITIES = [
	"Downtown Clinic", "General Hospital", "Sunrise Nursing Home", "Community Health Center",
	"Regional Medical Center", "Family Practice Associates", "Urgent Care Plus", "Children's Hospital",
	"Veterans Medical Center", "University Hospital", "St. Mary's Medical", "Riverside Health",
	"Mountain View Clinic", "Coastal Medical Group", "Valley Health Services", "Metro Health System",
	"Oakwood Medical Center", "Pinecrest Hospital", "Lakeside Clinic", "Harbor View Medical",
	"Meadows Health Center", "Summit Care Facility", "Parkview Hospital", "Greenfield Medical",
	"Cedar Grove Clinic", "Willow Springs Health", "Maple Leaf Medical", "Birchwood Hospital",
	"Aspen Medical Group", "Evergreen Health Center", "Redwood Medical", "Cypress Health Services",
	"Elmwood Clinic", "Hickory Health", "Magnolia Medical Center", "Juniper Care Facility",
	"Spruce Valley Hospital", "Poplar Health Group", "Sycamore Medical", "Chestnut Grove Clinic",
	"Walnut Creek Health", "Alder Medical Center", "Beech Tree Hospital", "Dogwood Clinic",
	"Hawthorn Health Services", "Laurel Medical Group", "Olive Branch Hospital", "Palm Health Center",
	"Sequoia Medical", "Willow Care Facility",
];

function randomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function generateMedicineListing(sellerId: string, now: Date) {
	const category = randomElement(MEDICINE_CATEGORIES);
	const item = randomElement(category.items);
	const strength = randomElement(item.strengths);
	const form = randomElement(item.forms);

	const title = `${item.name} ${strength}`;
	const status = randomElement(LISTING_STATUSES);

	// Generate expiry date based on status
	let expiryDate: Date;
	if (status === "EXPIRED") {
		// Past date
		expiryDate = new Date(now.getTime() - randomInt(1, 90) * 24 * 60 * 60 * 1000);
	} else {
		// Future date (1 week to 18 months)
		expiryDate = new Date(now.getTime() + randomInt(7, 540) * 24 * 60 * 60 * 1000);
	}

	// Generate quantity based on status
	let quantity: number;
	let reservedQuantity = 0;
	if (status === "SOLD") {
		quantity = 0;
	} else {
		quantity = randomInt(10, 1000);
		// Some active listings have reserved quantities
		if (status === "ACTIVE" && Math.random() > 0.6) {
			reservedQuantity = randomInt(1, Math.floor(quantity * 0.4));
		}
	}

	const descriptions = [
		`${category.category} medication. Original sealed packaging.`,
		`High-quality ${item.name}. Properly stored.`,
		`${item.name} ${strength} - ${form}. Batch verified.`,
		`Pharmaceutical grade ${item.name}. Complete documentation available.`,
		`${category.category}. Expires ${expiryDate.toLocaleDateString()}. Good condition.`,
		`${item.name} from reputable manufacturer. Storage conditions maintained.`,
		`Surplus inventory of ${item.name}. All quality checks passed.`,
		`${form.charAt(0).toUpperCase() + form.slice(1)} of ${item.name}. Sealed and unopened.`,
	];

	return {
		id: createId(),
		userId: sellerId,
		title,
		description: randomElement(descriptions),
		quantity,
		reservedQuantity,
		unit: form,
		expiryDate,
		status,
	};
}

async function seed() {
	console.log("🌱 Starting seed with Faker...\n");

	// Check for DATABASE_URL
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		console.error("❌ DATABASE_URL environment variable is not set");
		console.error("   Please set it in your .env file or environment");
		process.exit(1);
	}

	console.log("Connecting to database...");
	const client = postgres(connectionString);
	const db = drizzle(client, { schema });

	// Set faker seed for reproducibility (optional - comment out for different data each time)
	faker.seed(42);

	try {
		const now = new Date();

		// Create sellers
		console.log(`Creating ${CONFIG.sellers} sellers...`);
		const sellerIds: string[] = [];
		const sellerData = [];

		for (let i = 0; i < CONFIG.sellers; i++) {
			const id = createId();
			sellerIds.push(id);
			sellerData.push({
				id,
				email: `seller${i + 1}@medsupply.test`,
				emailVerified: true,
				name: i < PHARMACY_NAMES.length ? PHARMACY_NAMES[i] : faker.company.name() + " Pharmacy",
				role: "SELLER" as const,
			});
		}
		await db.insert(users).values(sellerData).onConflictDoNothing();

		// Create buyers
		console.log(`Creating ${CONFIG.buyers} buyers...`);
		const buyerIds: string[] = [];
		const buyerData = [];

		for (let i = 0; i < CONFIG.buyers; i++) {
			const id = createId();
			buyerIds.push(id);
			buyerData.push({
				id,
				email: `buyer${i + 1}@healthcare.test`,
				emailVerified: true,
				name: i < HEALTHCARE_FACILITIES.length ? HEALTHCARE_FACILITIES[i] : faker.company.name() + " Medical",
				role: "BUYER" as const,
			});
		}
		await db.insert(users).values(buyerData).onConflictDoNothing();

		// Create listings
		console.log("Creating listings...");
		const listingData: Array<{
			id: string;
			userId: string;
			title: string;
			description: string;
			quantity: number;
			reservedQuantity: number;
			unit: string;
			expiryDate: Date;
			status: "DRAFT" | "ACTIVE" | "SOLD" | "EXPIRED" | "CANCELLED";
		}> = [];

		const activeListingIds: string[] = [];

		for (const sellerId of sellerIds) {
			const numListings = randomInt(CONFIG.listingsPerSeller.min, CONFIG.listingsPerSeller.max);
			for (let i = 0; i < numListings; i++) {
				const listing = generateMedicineListing(sellerId, now);
				listingData.push(listing);
				if (listing.status === "ACTIVE" && listing.quantity > 0) {
					activeListingIds.push(listing.id);
				}
			}
		}

		// Batch insert listings
		const BATCH_SIZE = 100;
		for (let i = 0; i < listingData.length; i += BATCH_SIZE) {
			await db.insert(listings).values(listingData.slice(i, i + BATCH_SIZE)).onConflictDoNothing();
		}

		// Create requests
		console.log("Creating requests...");
		const requestData: Array<{
			id: string;
			listingId: string;
			buyerId: string;
			quantity: number;
			status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
		}> = [];

		for (const buyerId of buyerIds) {
			const numRequests = randomInt(CONFIG.requestsPerBuyer.min, CONFIG.requestsPerBuyer.max);
			const usedListings = new Set<string>();

			for (let i = 0; i < numRequests && activeListingIds.length > 0; i++) {
				// Pick a random active listing (avoid duplicates per buyer)
				let listingId: string;
				let attempts = 0;
				do {
					listingId = randomElement(activeListingIds);
					attempts++;
				} while (usedListings.has(listingId) && attempts < 10);

				if (usedListings.has(listingId)) continue;
				usedListings.add(listingId);

				const listing = listingData.find((l) => l.id === listingId);
				if (!listing) continue;

				const status = randomElement(REQUEST_STATUSES);
				let quantity: number;

				if (status === "REJECTED") {
					// Rejected requests often ask for too much
					quantity = Math.random() > 0.5 ? randomInt(listing.quantity + 1, listing.quantity * 2) : randomInt(1, Math.max(1, listing.quantity));
				} else {
					quantity = randomInt(1, Math.max(1, Math.floor(listing.quantity * 0.5)));
				}

				requestData.push({
					id: createId(),
					listingId,
					buyerId,
					quantity,
					status,
				});
			}
		}

		// Batch insert requests
		for (let i = 0; i < requestData.length; i += BATCH_SIZE) {
			await db.insert(requests).values(requestData.slice(i, i + BATCH_SIZE)).onConflictDoNothing();
		}

		// Calculate statistics
		const stats = {
			users: {
				sellers: CONFIG.sellers,
				buyers: CONFIG.buyers,
				total: CONFIG.sellers + CONFIG.buyers,
			},
			listings: {
				total: listingData.length,
				active: listingData.filter((l) => l.status === "ACTIVE").length,
				draft: listingData.filter((l) => l.status === "DRAFT").length,
				sold: listingData.filter((l) => l.status === "SOLD").length,
				expired: listingData.filter((l) => l.status === "EXPIRED").length,
				cancelled: listingData.filter((l) => l.status === "CANCELLED").length,
			},
			requests: {
				total: requestData.length,
				pending: requestData.filter((r) => r.status === "PENDING").length,
				approved: requestData.filter((r) => r.status === "APPROVED").length,
				rejected: requestData.filter((r) => r.status === "REJECTED").length,
				cancelled: requestData.filter((r) => r.status === "CANCELLED").length,
			},
			inventory: {
				totalUnits: listingData.reduce((sum, l) => sum + l.quantity, 0),
				reservedUnits: listingData.reduce((sum, l) => sum + l.reservedQuantity, 0),
			},
		};

		console.log("\n✅ Seed completed successfully!\n");
		console.log("═══════════════════════════════════════════════════════");
		console.log("                    SEED STATISTICS                     ");
		console.log("═══════════════════════════════════════════════════════\n");

		console.log("👥 USERS");
		console.log(`   Sellers: ${stats.users.sellers}`);
		console.log(`   Buyers:  ${stats.users.buyers}`);
		console.log(`   Total:   ${stats.users.total}\n`);

		console.log("📦 LISTINGS");
		console.log(`   Total:     ${stats.listings.total}`);
		console.log(`   ├─ Active:    ${stats.listings.active}`);
		console.log(`   ├─ Draft:     ${stats.listings.draft}`);
		console.log(`   ├─ Sold:      ${stats.listings.sold}`);
		console.log(`   ├─ Expired:   ${stats.listings.expired}`);
		console.log(`   └─ Cancelled: ${stats.listings.cancelled}\n`);

		console.log("📋 REQUESTS");
		console.log(`   Total:     ${stats.requests.total}`);
		console.log(`   ├─ Pending:   ${stats.requests.pending}`);
		console.log(`   ├─ Approved:  ${stats.requests.approved}`);
		console.log(`   ├─ Rejected:  ${stats.requests.rejected}`);
		console.log(`   └─ Cancelled: ${stats.requests.cancelled}\n`);

		console.log("📊 INVENTORY");
		console.log(`   Total Units:    ${stats.inventory.totalUnits.toLocaleString()}`);
		console.log(`   Reserved Units: ${stats.inventory.reservedUnits.toLocaleString()}\n`);

		console.log("═══════════════════════════════════════════════════════");
		console.log("                    TEST ACCOUNTS                       ");
		console.log("═══════════════════════════════════════════════════════\n");
		console.log("Sellers:");
		console.log("   seller1@medsupply.test ... seller15@medsupply.test\n");
		console.log("Buyers:");
		console.log("   buyer1@healthcare.test ... buyer50@healthcare.test\n");
	} catch (error) {
		console.error("❌ Seed failed:", error);
		console.error("");
		console.error("Make sure you have:");
		console.error("  1. DATABASE_URL set in your environment");
		console.error("  2. Run migrations: bun run db:push");
		throw error;
	} finally {
		await client.end();
	}
}

seed()
	.then(() => process.exit(0))
	.catch(() => process.exit(1));

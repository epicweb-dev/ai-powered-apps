import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

const ShippingEstimateInput = z.object({
	zipCode: z
		.string()
		.regex(/^\d{5}(-\d{4})?$/, 'US ZIP code (5 digits or ZIP+4).')
		.describe('US ZIP code where the order would be shipped.'),
})

const ShippingEstimateOutput = z.object({
	cost: z.number(),
	days: z.number(),
	region: z.string(),
})

// Hardcoded shipping logic — in a real store this would call a carrier API.
// 🦉 Pre-built helper. Your `.server(...)` callback just needs to call it.
function estimate(zipCode: string) {
	const prefix = zipCode[0]
	if (prefix === '9') return { cost: 5, days: 2, region: 'West Coast' }
	if (prefix === '0' || prefix === '1')
		return { cost: 5, days: 3, region: 'East Coast' }
	return { cost: 8, days: 5, region: 'Other US' }
}

/**
 * 🐨 Define and export `getShippingEstimate` here — same shape as the
 *    server tools you've built before, with one new field on the
 *    definition you have not used yet.
 *
 *    💰 `name`: `'getShippingEstimate'`
 *
 *    💰 `description`: copy this in exactly —
 *
 *       'Estimate shipping cost and delivery time for an order to a given ' +
 *       'US ZIP code. Use this when the customer asks "how long does ' +
 *       'shipping take?", "how much for shipping to X?", or similar.'
 *
 *    💰 `inputSchema`: plug in the pre-built `ShippingEstimateInput`.
 *    💰 `outputSchema`: plug in the pre-built `ShippingEstimateOutput`.
 *
 *    💰 `lazy: true` — the new field. Setting this on the definition tells
 *       TanStack AI to *not* include the tool's full description in the
 *       prompt by default. Instead, the model sees the tool's name on a
 *       synthetic "discovery" tool. When the model decides it might need
 *       `getShippingEstimate`, it calls discovery first to load the full
 *       description + schema, then calls the real tool.
 *
 *    💰 `.server(execute)` callback: takes `{ zipCode }` and returns the
 *       result of calling the pre-built `estimate(zipCode)` above.
 *
 * 🦉 The same `lazy: true` flag is already on the four pre-built tools
 *    next to this file (return-policy, size-guide, care-instructions,
 *    restock). All five share TanStack AI's discovery mechanism — the
 *    model only sees their names in the discovery tool's enum until it
 *    decides it needs one.
 */

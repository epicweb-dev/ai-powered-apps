import { z } from 'zod'

/**
 * The shape the model writes into on every comparison turn.
 *
 * The shape is sketched in — every field already has the right type. But the
 * model only ever sees the JSON Schema generated from this file, so a bare
 * `z.string()` tells it nothing about what to write. Two things turn this
 * shape into something the model can act on:
 *
 *   1. Descriptions — the `.describe(...)` calls are prompt engineering. They
 *      ship to the model inside the JSON Schema and tell it what each field is
 *      for and how to format it.
 *   2. Constraints — `.min(...)`, `.int()`, `.nullable()` express what makes a
 *      field useful, not just well-formed (a comparison with zero dimensions
 *      is valid JSON but useless).
 *
 * 🐨 Marty 💰 has pre-written the description and constraints for every field
 *    below, commented out inline. Uncomment each `💰` block (drop the comment
 *    markers around it) so they become part of the schema. Read each one as
 *    you go — the wording is the prompt the model reads.
 */
export const ComparisonSchema = z.object({
	criteria: z
		.string()
		/* 💰 .describe(
			'The lens the customer wants this comparison through, in their own words. Examples: "Best price-to-quality ratio", "Most durable for hiking", "Best for everyday use". Use "Overall comparison" if the customer has not stated a preference yet.',
		) */,
	dimensions: z
		.array(
			z.object({
				name: z
					.string()
					/* 💰 .describe(
						'A short label for this attribute. Examples: "Price", "Materials", "Weight", "Warranty".',
					) */,
				values: z
					.array(
						z.object({
							productId: z.string()/* 💰 .describe('The product this value belongs to.') */,
							value: z
								.string()
								/* 💰 .describe(
									'A short, human-readable description of this product on this dimension. Format numbers the way a customer would expect: "$129", "3 days", "Leather + waxed cotton". Keep it under 10 words.',
								) */,
						}),
					)
					/* 💰 .min(1)
					.describe('One entry per product being compared on this dimension.') */,
				edge: z
					.string()
					/* 💰 .nullable()
					.describe(
						'The productId that has the edge on this dimension. Set to null if the dimension is too close to call or does not have a clear winner.',
					) */,
			}),
		)
		/* 💰 .min(2)
		.describe(
			'The attributes that actually differentiate these products for the stated `criteria`. Pick the dimensions a real customer would weigh — do not enumerate every spec on the box.',
		) */,
	rankings: z
		.array(
			z.object({
				productId: z.string(),
				rank: z
					.number()
					/* 💰 .int()
					.min(1)
					.describe('1 is the best fit for `criteria`. Each product gets a unique rank.') */,
				reason: z
					.string()
					/* 💰 .describe(
						'A short justification for this rank. Reference the dimensions that drove it. One or two sentences.',
					) */,
			}),
		)
		/* 💰 .min(1)
		.describe(
			'One entry per product being compared. Sort the array ascending by `rank` so the best fit appears first.',
		) */,
	summary: z
		.string()
		/* 💰 .describe(
			'A one or two sentence verdict in plain language. Imagine you are telling a friend "here is what I would pick and why". Do not enumerate the dimensions — the table already shows them.',
		) */,
})

export type Comparison = z.infer<typeof ComparisonSchema>

import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

const ShowVariationsInput = z.object({
	productId: z
		.string()
		.describe('The id of the product whose variations should be shown.'),
})

const ShowVariationsOutput = z.object({
	productName: z.string(),
	variations: z.array(
		z.object({
			size: z.string(),
			color: z.string(),
			quantity: z.number(),
		}),
	),
})

export const showVariationsDef = toolDefinition({
	name: 'showVariations',
	description:
		'Show the customer a table of all size × color variations for a product, with stock counts per cell. Use this when the customer wants to add a product to their cart but has not picked a size or color yet, or when they ask "what sizes are available?" / "what colors do you have?". Calling this tool renders an interactive table in the chat — the customer reads it and then tells you what they want.',
	inputSchema: ShowVariationsInput,
	outputSchema: ShowVariationsOutput,
})

import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

const AddToCartInput = z.object({
	productId: z
		.string()
		.describe(
			'The id of the product to add. Comes from a product card the customer just saw, or the currently viewed product.',
		),
	productName: z
		.string()
		.describe(
			"Display name of the product. Shown to the customer in the approval prompt so they can see what's about to be added before they confirm.",
		),
	size: z
		.string()
		.describe(
			'Size variation (e.g. "9", "10", "M", "L"). Must be one of the in-stock variations listed in the product context. Do not call this tool without a size — if the customer did not pick one, ask them first.',
		),
	color: z
		.string()
		.describe(
			'Color variation (e.g. "Black", "Red"). Must be one of the in-stock variations listed in the product context. Do not call this tool without a color — if the customer did not pick one, ask them first.',
		),
	quantity: z
		.number()
		.int()
		.min(1)
		.max(10)
		.describe('How many to add. Default to 1 if not specified.'),
})

const AddToCartOutput = z.object({
	added: z.boolean(),
})

export const addToCartDef = toolDefinition({
	name: 'addToCart',
	description:
		"Add a product to the customer's shopping cart. Use this only when (a) the customer explicitly asks to add something AND (b) you know both the size and color from the customer. If size or color is missing, call `showVariations` first so the customer can see the table and pick — do not call addToCart with guessed values. The customer will see what is about to be added and click Yes or No before this tool actually runs.",
	inputSchema: AddToCartInput,
	outputSchema: AddToCartOutput,
	needsApproval: true,
})

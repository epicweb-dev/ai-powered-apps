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

/**
 * 🐨 Define and export `addToCartDef` here using `toolDefinition({...})`.
 *    Same pattern as the tool definitions you've built before — with one
 *    new field you haven't used yet.
 *
 *    💰 `name`: `'addToCart'`
 *
 *    💰 `description`: copy this in exactly —
 *
 *       'Add a product to the customer\'s shopping cart. Use this only ' +
 *       'when (a) the customer explicitly asks to add something AND (b) ' +
 *       'you know both the size and color from the customer. If size or ' +
 *       'color is missing, call `showVariations` first so the customer ' +
 *       'can see the table and pick — do not call addToCart with guessed ' +
 *       'values. The customer will see what is about to be added and click ' +
 *       'Yes or No before this tool actually runs.'
 *
 *    💰 `inputSchema`: plug in the pre-built `AddToCartInput`.
 *    💰 `outputSchema`: plug in the pre-built `AddToCartOutput`.
 *
 *    💰 `needsApproval: true` — the new field. Setting this on the definition
 *       tells TanStack AI to *pause* before running the tool's callback and
 *       wait for the UI to confirm. Without it, the tool would just run as
 *       soon as the model picked it.
 *
 * 🦉 As with `navigateToDef`, this file exports just the definition. The
 *    server passes it to `chat({ tools: [...] })` so the model is told the
 *    tool exists. The browser attaches the `.client(...)` callback that
 *    actually runs *after the customer approves*.
 */

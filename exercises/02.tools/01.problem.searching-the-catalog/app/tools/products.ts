import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'
import {
	getProductById,
	getProducts,
	getRelatedProducts,
} from '#app/domain/products.server.ts'

/**
 * Shape of one product that comes back from any of the product tools. This
 * matches what the existing `ProductCard` component already expects, so the
 * chat panel can show tool results as real product cards.
 *
 * 🦉 You don't need to write this schema — it's pre-built. Just glance at it
 *    once so you know what the tools return.
 */
const ProductInfo = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	imageUrl: z.string(),
	price: z.number(),
	reviewScore: z.number(),
	brand: z.object({ id: z.string(), name: z.string() }),
	_count: z.object({ reviews: z.number() }),
})

const ProductList = z.object({
	products: z.array(ProductInfo),
})

/**
 * Pre-built input schema for the `searchProducts` tool you're about to build.
 * Each `.describe('...')` is what the model reads to decide how to fill the
 * field in, so they're worth reading once.
 *
 * 🦉 Pre-built — just plug this in as the `inputSchema` of your tool.
 */
const SearchProductsInput = z.object({
	query: z
		.string()
		.describe('Free-text search across product names and descriptions.'),
	brand: z
		.string()
		.optional()
		.describe('Optional brand name to filter by, e.g. "Nike".'),
	category: z
		.string()
		.optional()
		.describe('Optional category to filter by, e.g. "Athletic".'),
	priceMax: z
		.number()
		.optional()
		.describe(
			'Optional maximum price. Returns only products at or below this price.',
		),
	limit: z
		.number()
		.int()
		.min(1)
		.max(10)
		.optional()
		.describe('How many products to return. Defaults to 5.'),
})

/**
 * Pre-built tool: find products similar to a given one.
 *
 * 🦉 You won't author this one — it's part of the scaffolding. Read through
 *    it so you know what shape a working server tool takes. `searchProducts`
 *    below should follow the same pattern.
 */
const findSimilarProductsDef = toolDefinition({
	name: 'findSimilarProducts',
	description:
		'Find products similar to a given product (same category and brand). Use this when the customer wants alternatives — for example when their preferred size is out of stock, or when they want to compare a few options.',
	inputSchema: z.object({
		productId: z
			.string()
			.describe('The id of the product to find similar items for.'),
	}),
	outputSchema: ProductList,
})

export const findSimilarProducts = findSimilarProductsDef.server(
	async ({ productId }) => {
		const product = await getProductById(productId)
		if (!product) return { products: [] }
		const products = await getRelatedProducts(
			productId,
			product.category.id,
			product.brand.id,
		)
		return { products }
	},
)

/**
 * Pre-built tool: recommend top-rated products from the catalog.
 *
 * 🦉 Also pre-built. Another reference for `searchProducts`.
 */
const recommendProductsDef = toolDefinition({
	name: 'recommendProducts',
	description:
		'Recommend top-rated products from the catalog. Use this when the customer is browsing and asks for suggestions or popular picks.',
	inputSchema: z.object({
		limit: z
			.number()
			.int()
			.min(1)
			.max(10)
			.optional()
			.describe('How many products to recommend. Defaults to 5.'),
	}),
	outputSchema: ProductList,
})

export const recommendProducts = recommendProductsDef.server(
	async ({ limit = 5 }) => {
		const { products } = await getProducts({ sortBy: 'rating', limit })
		return { products }
	},
)

/**
 * 🦉 About the `description` field
 *
 *    The `description` is not for you and it's not for other developers. It's
 *    the prompt the *model* reads when it's deciding whether to call this
 *    tool. When you pass a tool to `chat()`, TanStack AI sends the model a
 *    list of available tools — each one as just a name, a description, and
 *    an input shape. The model never sees the code inside `.server(...)`. So
 *    the description is the entire pitch: "here is what this tool does and
 *    here is when you should reach for it."
 *
 *    A vague description ("get products") will be ignored when it should be
 *    called and called when it shouldn't. A specific description that names
 *    *when* the tool is the right choice gets picked at the right time.
 *
 *    Read the descriptions on the two tools above and notice how each one
 *    ends with a "use this when..." sentence. That's not decoration — it's
 *    the cue the model is looking for.
 *
 * 🐨 Build the third server tool below: `searchProductsDef` and the exported
 *    `searchProducts`. Follow the same shape as the two tools above.
 *
 *    💰 `name`: `'searchProducts'`
 *
 *    💰 `description`: use this string (copy it in exactly — writing good
 *       tool descriptions is its own skill and we're focused on the wiring
 *       here):
 *
 *       'Search the EpicStore catalog by free-text query and optional ' +
 *       'filters. Use this whenever the customer asks about products that ' +
 *       'are not the one they are currently looking at.'
 *
 *    💰 `inputSchema`: plug in the pre-built `SearchProductsInput` from above.
 *
 *    💰 `outputSchema`: plug in the pre-built `ProductList` from above.
 *
 *    💰 `.server(...)` callback: destructure the args, default `limit` to 5,
 *       then call the pre-imported `getProducts({ ... })` and return
 *       `{ products }`. Map the inputs like this:
 *         - `query`     → `search`
 *         - `brand`     → `brand: brand ? [brand] : undefined`
 *         - `category`  → `category: category ? [category] : undefined`
 *         - `priceMax`  → `priceMax`
 *         - `limit`     → `limit`
 */

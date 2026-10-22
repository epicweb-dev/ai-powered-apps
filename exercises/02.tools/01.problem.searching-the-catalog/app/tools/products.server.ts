import {
	getProductById,
	getProducts,
	getRelatedProducts,
} from '#app/domain/products.server.ts'
import {
	findSimilarProductsDef,
	recommendProductsDef,
	searchProductsDef,
} from '#app/tools/products.ts'

/**
 * 🦉 The `.server(...)` half of each product tool. `.server(execute)` takes a
 *    definition from `products.ts` and attaches the code that runs when the
 *    model calls the tool. This file can reach the database, and the
 *    `.server.ts` name keeps it out of the browser bundle.
 */

/**
 * Pre-built: find products similar to a given one.
 */
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
 * Pre-built: recommend top-rated products from the catalog.
 */
export const recommendProducts = recommendProductsDef.server(
	async ({ limit = 5 }) => {
		const { products } = await getProducts({ sortBy: 'rating', limit })
		return { products }
	},
)

/**
 * 🐨 Attach the server code to the `searchProductsDef` you built in
 *    `products.ts`, and export the result as `searchProducts` (the chat route
 *    already imports it under that name).
 *
 *    💰 `searchProductsDef.server(async (args) => { ... })`: destructure the
 *       args, default `limit` to 5, then call the pre-imported
 *       `getProducts({ ... })` and return `{ products }`. Map the inputs like
 *       this:
 *         - `query`     → `search`
 *         - `brand`     → `brand: brand ? [brand] : undefined`
 *         - `category`  → `category: category ? [category] : undefined`
 *         - `priceMax`  → `priceMax`
 *         - `limit`     → `limit`
 *
 * 💣 Delete the `void` line below once `searchProducts` uses the definition.
 */
void searchProductsDef

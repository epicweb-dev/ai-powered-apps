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

export const recommendProducts = recommendProductsDef.server(
	async ({ limit = 5 }) => {
		const { products } = await getProducts({ sortBy: 'rating', limit })
		return { products }
	},
)

export const searchProducts = searchProductsDef.server(
	async ({ query, brand, category, priceMax, limit = 5 }) => {
		const { products } = await getProducts({
			search: query,
			brand: brand ? [brand] : undefined,
			category: category ? [category] : undefined,
			priceMax,
			limit,
		})
		return { products }
	},
)

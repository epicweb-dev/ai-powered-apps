import { getProductById } from '#app/domain/products.server.ts'
import { showVariationsDef } from '#app/tools/variations.ts'

export const showVariations = showVariationsDef.server(
	async ({ productId }) => {
		const product = await getProductById(productId)
		if (!product) {
			return { productName: 'unknown product', variations: [] }
		}
		return {
			productName: product.name,
			variations: product.variations.map((v) => ({
				size: v.size,
				color: v.color,
				quantity: v.quantity,
			})),
		}
	},
)

import { getProductById } from '#app/domain/products.server.ts'
import { type Route } from './+types/api.product-mini.$productId'

/**
 * Lightweight product info endpoint used by the `addToCart` client tool.
 *
 * The cart needs name, brand, price, and image to render an item — but
 * having the model pass all of those as tool arguments would be brittle.
 * Instead the tool passes just `{ productId, size, color, quantity }` and
 * the browser fetches the rest from this route before calling `addItem`.
 */
export const loader = async ({ params }: Route.LoaderArgs) => {
	const product = await getProductById(params.productId)
	if (!product) {
		return Response.json({ error: 'Not found' }, { status: 404 })
	}
	return Response.json({
		id: product.id,
		name: product.name,
		brand: product.brand.name,
		price: product.price,
		imageUrl: product.imageUrl,
	})
}

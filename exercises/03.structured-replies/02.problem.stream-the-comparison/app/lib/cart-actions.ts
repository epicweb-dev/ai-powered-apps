type CartLike = {
	addItem: (item: {
		productId: string
		name: string
		brand: string
		price: number
		imageUrl: string
		size: string
		color: string
		quantity: number
	}) => void
}

type AddProductArgs = {
	productId: string
	size: string
	color: string
	quantity: number
}

/**
 * Pre-built helper used by the `addToCart` client tool.
 *
 * Fetches the product details we need to render the cart item, then calls
 * the cart context's `addItem`. Pulling this out keeps the cart-state
 * plumbing out of the tool callback so the lesson stays focused on tool
 * approvals.
 */
export async function addProductToCart(args: AddProductArgs, cart: CartLike) {
	const res = await fetch(`/api/product-mini/${args.productId}`)
	if (!res.ok) {
		throw new Error(`Could not fetch product ${args.productId}`)
	}
	const product = (await res.json()) as {
		id: string
		name: string
		brand: string
		price: number
		imageUrl: string
	}
	cart.addItem({
		productId: product.id,
		name: product.name,
		brand: product.brand,
		price: product.price,
		imageUrl: product.imageUrl,
		size: args.size,
		color: args.color,
		quantity: args.quantity,
	})
}

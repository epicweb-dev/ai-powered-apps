import { type getProductById } from '#app/domain/products.server.ts'

// 🦉 The `Product` type is inferred from the existing `getProductById`
//    helper, so you do not need to write it yourself.
export type Product = NonNullable<Awaited<ReturnType<typeof getProductById>>>

/**
 * 🐨 Fill in `GLOBAL_SYSTEM_PROMPT` with rules the bot must follow on every
 *    chat request. The prompt should keep the bot on-topic (shopping only)
 *    and stop it from inventing facts.
 *
 * 💰 Drop this string into the empty value below.
 *
 * `You are EpicStore's shopping assistant. EpicStore is an online store that
 * sells shoes and clothing.
 *
 * Rules:
 * - Only answer questions about EpicStore products, sizing, brands, shipping,
 *   and shopping in general.
 * - If the user asks about anything else, politely tell them you can only
 *   help with shopping.
 * - Never invent products, prices, stock, or sizes. If you do not know the
 *   answer, say so.
 * - Before calling any tool that takes action on the customer's behalf, make
 *   sure you have every required field. If something is missing, ask the
 *   customer — do not guess.`
 */
export const GLOBAL_SYSTEM_PROMPT = ``

/**
 * 🐨 Fill in `buildProductPrompt` so it returns a string describing the
 *    product the customer is currently looking at. The model uses this to
 *    answer follow-up questions ("does it come in red?", "how much is it?")
 *    and to know which `productId` to pass when it calls a tool.
 *
 * 💰 The `Product` type includes `id`, `name`, `brand.name`, `category.name`,
 *    `price`, `reviewScore`, `description`, and `variations` (each variation
 *    has `size`, `color`, and `quantity`). Use this template:
 *
 * ```
 * const variationLines = product.variations
 *   .map((v) => {
 *     const stock = v.quantity > 0 ? `${v.quantity} in stock` : 'out of stock'
 *     return `  - size ${v.size}, color ${v.color} (${stock})`
 *   })
 *   .join('\n')
 *
 * return `The customer is currently looking at this product:
 * - Product ID: ${product.id}
 * - Name: ${product.name}
 * - Brand: ${product.brand.name}
 * - Category: ${product.category.name}
 * - Price: $${product.price}
 * - Rating: ${product.reviewScore}/5
 * - Description: ${product.description}
 * - Available variations:
 * ${variationLines}
 *
 * Use this information to answer questions about this product. When a tool
 * needs a productId, this is the product the customer is looking at — use
 * the Product ID listed above. If the customer asks something that the
 * information above does not cover, say you are not sure rather than
 * guessing.`
 * ```
 */
export function buildProductPrompt(product: Product): string {
	void product
	return ''
}

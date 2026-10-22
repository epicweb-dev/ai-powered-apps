import { type InferToolOutput } from '@tanstack/ai'
import { ProductCard } from '#app/components/product-card'
import { type navigateToDef } from '#app/tools/navigation.ts'
import { type searchProductsDef } from '#app/tools/products.ts'

/**
 * Pre-built pieces the chat panel renders for each tool call. Every prop type
 * is inferred from the tool's own definition, so a component can only be
 * handed the output of the tool it was built for.
 */

export function ProductResults({
	products,
}: InferToolOutput<typeof searchProductsDef>) {
	return (
		<div className="mt-2 flex flex-col gap-3">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	)
}

export function NavigatedNotice({
	destination,
}: InferToolOutput<typeof navigateToDef>) {
	return (
		<div className="mt-1 text-xs text-gray-500 italic dark:text-gray-400">
			📍 Took you to the {destination} page.
		</div>
	)
}

export function ToolCallPending({ name }: { name: string }) {
	return (
		<div className="mt-1 text-xs text-gray-500 italic dark:text-gray-400">
			🔧 Calling {name}…
		</div>
	)
}

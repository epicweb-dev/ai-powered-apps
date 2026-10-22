import { type InferToolInput, type InferToolOutput } from '@tanstack/ai'
import { ProductCard } from '#app/components/product-card'
import { type addToCartDef } from '#app/tools/cart.ts'
import { type navigateToDef } from '#app/tools/navigation.ts'
import { type searchProductsDef } from '#app/tools/products.ts'
import { type showVariationsDef } from '#app/tools/variations.ts'

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

export function VariationsTable({
	productName,
	variations,
}: InferToolOutput<typeof showVariationsDef>) {
	const sizes = Array.from(new Set(variations.map((v) => v.size)))
	const colors = Array.from(new Set(variations.map((v) => v.color)))
	const find = (size: string, color: string) =>
		variations.find((v) => v.size === size && v.color === color)?.quantity
	return (
		<div className="mt-2">
			<div className="mb-1 text-xs font-medium text-gray-800 dark:text-gray-100">
				{productName ? `Variations for ${productName}` : 'Available variations'}
			</div>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-xs">
					<thead>
						<tr className="border-b border-stone-200 dark:border-gray-700">
							<th className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-400">
								Size
							</th>
							{colors.map((c) => (
								<th
									key={c}
									className="px-2 py-1 text-left font-medium text-gray-600 dark:text-gray-400"
								>
									{c}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{sizes.map((s) => (
							<tr
								key={s}
								className="border-b border-stone-100 dark:border-gray-800"
							>
								<td className="px-2 py-1 font-medium text-gray-800 dark:text-gray-100">
									{s}
								</td>
								{colors.map((c) => {
									const qty = find(s, c)
									if (qty === undefined) {
										return (
											<td key={c} className="px-2 py-1 text-gray-400">
												—
											</td>
										)
									}
									if (qty === 0) {
										return (
											<td
												key={c}
												className="px-2 py-1 text-gray-400 line-through"
											>
												0
											</td>
										)
									}
									return (
										<td
											key={c}
											className="px-2 py-1 text-emerald-700 dark:text-emerald-400"
										>
											{qty}
										</td>
									)
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>
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

export function AddToCartApproval({
	args,
	onApprove,
	onDeny,
}: {
	args: InferToolInput<typeof addToCartDef>
	onApprove: () => void
	onDeny: () => void
}) {
	return (
		<div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
			<div className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
				🛒 Add to cart?
			</div>
			<div className="mb-3 text-xs text-gray-700 dark:text-gray-300">
				<div>{args.productName}</div>
				<div className="mt-1 opacity-75">
					size {args.size} · color {args.color} · qty {args.quantity}
				</div>
			</div>
			<div className="flex gap-2">
				<button
					type="button"
					onClick={onApprove}
					className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
				>
					Yes, add it
				</button>
				<button
					type="button"
					onClick={onDeny}
					className="rounded bg-gray-300 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
				>
					No, cancel
				</button>
			</div>
		</div>
	)
}

export function AddedToCartNotice() {
	return (
		<div className="mt-1 rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
			✅ Added to your cart.
		</div>
	)
}

export function CancelledNotice() {
	return (
		<div className="mt-1 text-xs text-gray-500 italic dark:text-gray-400">
			❌ Cancelled — not added.
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

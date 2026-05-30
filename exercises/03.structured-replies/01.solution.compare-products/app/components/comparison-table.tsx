import { Award, Minus, Trophy } from 'lucide-react'
import { type Comparison } from '#app/schemas/comparison.ts'

type ProductSummary = {
	id: string
	name: string
	brand: { name: string }
	imageUrl: string
	price: number
}

export function ComparisonTable({
	comparison,
	products,
}: {
	comparison: Comparison
	products: Array<ProductSummary>
}) {
	const productById = new Map(products.map((p) => [p.id, p]))
	const orderedRankings = [...comparison.rankings].sort(
		(a, b) => a.rank - b.rank,
	)

	return (
		<section className="space-y-8">
			<header className="rounded-lg border border-stone-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
				<div className="mb-2 text-xs font-medium tracking-wide text-amber-600 uppercase dark:text-amber-500">
					Comparing for: {comparison.criteria}
				</div>
				<p className="text-base leading-relaxed text-gray-700 dark:text-gray-200">
					{comparison.summary}
				</p>
			</header>

			<div>
				<h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
					Rankings
				</h2>
				<ol className="space-y-3">
					{orderedRankings.map((r) => {
						const product = productById.get(r.productId)
						const isWinner = r.rank === 1
						return (
							<li
								key={r.productId}
								className={`flex items-start gap-4 rounded-lg border p-4 ${
									isWinner
										? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/40'
										: 'border-stone-200 bg-white dark:border-gray-700 dark:bg-gray-800'
								}`}
							>
								<div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white">
									{isWinner ? <Trophy className="h-5 w-5" /> : `#${r.rank}`}
								</div>
								<div className="flex-1">
									<div className="text-base font-medium text-gray-900 dark:text-white">
										{product?.name ?? r.productId}
									</div>
									<div className="text-xs text-gray-500 dark:text-gray-400">
										{product?.brand.name}
										{product ? ` · $${product.price}` : null}
									</div>
									<p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
										{r.reason}
									</p>
								</div>
							</li>
						)
					})}
				</ol>
			</div>

			<div>
				<h2 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
					Dimensions
				</h2>
				<div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-gray-700">
					<table className="w-full border-collapse text-sm">
						<thead className="bg-stone-100 dark:bg-gray-800">
							<tr>
								<th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300">
									Dimension
								</th>
								{products.map((p) => (
									<th
										key={p.id}
										className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-300"
									>
										{p.name}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{comparison.dimensions.map((d) => (
								<tr
									key={d.name}
									className="border-t border-stone-200 dark:border-gray-700"
								>
									<td className="bg-stone-50 px-4 py-3 font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-100">
										{d.name}
									</td>
									{products.map((p) => {
										const cell = d.values.find((v) => v.productId === p.id)
										const hasEdge = d.edge === p.id
										return (
											<td
												key={p.id}
												className={`px-4 py-3 align-top text-gray-700 dark:text-gray-200 ${
													hasEdge ? 'bg-amber-50/60 dark:bg-amber-950/30' : ''
												}`}
											>
												<div className="flex items-start gap-2">
													{hasEdge ? (
														<Award className="mt-0.5 h-4 w-4 flex-none text-amber-600 dark:text-amber-500" />
													) : null}
													<span>{cell?.value ?? <Minus className="h-4 w-4 text-gray-300" />}</span>
												</div>
											</td>
										)
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	)
}

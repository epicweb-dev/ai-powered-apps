import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { Loader2, Send } from 'lucide-react'
import { useState } from 'react'
import { ComparisonTable } from '#app/components/comparison-table.tsx'
import { ComparisonSchema } from '#app/schemas/comparison.ts'

type ProductSummary = {
	id: string
	name: string
	brand: { name: string }
	imageUrl: string
	price: number
}

export function ComparisonChat({
	products,
}: {
	products: Array<ProductSummary>
}) {
	const productIds = products.map((p) => p.id)
	const [draft, setDraft] = useState('')

	const { sendMessage, isLoading, partial, final } = useChat({
		connection: fetchServerSentEvents('/api/compare'),
		forwardedProps: { productIds },
		outputSchema: ComparisonSchema,
	})

	// Prefer `final` once the run validates; until then, render whatever fields
	// `partial` has already streamed in.
	const live = final ?? partial
	const hasData = live !== null && Object.keys(live).length > 0

	return (
		<div className="space-y-6">
			<div className="min-h-[16rem] rounded-lg border border-dashed border-stone-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
				{hasData ? (
					<ComparisonTable comparison={live} products={products} />
				) : isLoading ? (
					<div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500 dark:text-gray-400">
						<Loader2 className="h-8 w-8 animate-spin text-amber-600" />
						<div className="text-sm">Starting the comparison…</div>
					</div>
				) : (
					<div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
						Ask a question below to compare these products.
						<div className="mt-2 text-xs text-gray-400">
							Try "What's the best value for the money?" or "Which is most durable?"
						</div>
					</div>
				)}
			</div>

			<form
				onSubmit={(event) => {
					event.preventDefault()
					if (!draft.trim() || isLoading) return
					void sendMessage(draft)
					setDraft('')
				}}
				className="flex items-center gap-2 rounded-full border border-stone-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800"
			>
				<input
					type="text"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder="What matters most to you?"
					disabled={isLoading}
					className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none disabled:opacity-60 dark:text-gray-200"
				/>
				<button
					type="submit"
					disabled={isLoading || !draft.trim()}
					className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-600 text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
					aria-label="Send"
				>
					<Send className="h-4 w-4" />
				</button>
			</form>
		</div>
	)
}

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

	// 🐨 This page waits 20–30 seconds before anything appears, because it only
	//    renders `final` — the fully-validated object, which lands all at once.
	//    But the server is already streaming the comparison down token by token:
	//    `useChat({ outputSchema })` exposes that in-flight state as `partial`,
	//    a `DeepPartial<Comparison>` that updates on every JSON token.
	//
	// 💰 Add `partial` to the destructure below.
	const { sendMessage, isLoading, final } = useChat({
		connection: fetchServerSentEvents('/api/compare'),
		forwardedProps: { productIds },
		outputSchema: ComparisonSchema,
	})

	// 🐨 Render `partial` while it streams in, then `final` once it validates.
	// 💰 Change this one line to `const live = final ?? partial`. That's it.
	const live = final
	const hasData = live !== null && Object.keys(live).length > 0

	// 🦉 You don't touch `comparison-table.tsx` — open it and look. It already
	//    renders a `PartialComparison`, falling back to a `<Skeleton />` for any
	//    field that hasn't streamed in yet (every value is `field ?? <Skeleton />`,
	//    every array `?? []`). Reading `partial` is the *only* thing you change;
	//    the table was built to cope with half-written data from the start.

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

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

	// 🐨 Tell `useChat` the assistant's reply will conform to ComparisonSchema.
	//    Once you pass `outputSchema`, the hook exposes a new field on its
	//    return value: `final` — the validated comparison object, or `null`
	//    until the model finishes. (There is also a `partial` field that
	//    streams in as tokens arrive — you'll use that in the next exercise.)
	//
	// 💰 Add `outputSchema: ComparisonSchema` to the options object below,
	//    and destructure `final` alongside `sendMessage` and `isLoading`.
	const { sendMessage, isLoading } = useChat({
		connection: fetchServerSentEvents('/api/compare'),
		forwardedProps: { productIds },
	})
	void ComparisonSchema

	// 🐨 The card below shows the empty/loading state. Add a branch that
	//    renders `<ComparisonTable comparison={final} products={products} />`
	//    whenever `final` is set. The render order should be:
	//      1. `final` exists → table
	//      2. `isLoading` → spinner
	//      3. otherwise → empty prompt
	const final = null as null

	return (
		<div className="space-y-6">
			<div className="min-h-[16rem] rounded-lg border border-dashed border-stone-300 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
				{final ? null : isLoading ? (
					<div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-500 dark:text-gray-400">
						<Loader2 className="h-8 w-8 animate-spin text-amber-600" />
						<div className="text-sm">
							Reading reviews and weighing your options…
						</div>
						<div className="text-xs text-gray-400">
							This can take 20–30 seconds while the model writes the whole comparison.
						</div>
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

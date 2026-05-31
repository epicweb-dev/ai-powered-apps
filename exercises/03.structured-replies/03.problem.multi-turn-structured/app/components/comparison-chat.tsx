import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { AlertCircle, Send } from 'lucide-react'
import { useState } from 'react'
import { ComparisonTable } from '#app/components/comparison-table.tsx'
import {
	ComparisonSchema,
	type PartialComparison,
} from '#app/schemas/comparison.ts'

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

	// 🐨 Pull `messages` off useChat — the whole conversation, where every
	//    assistant turn carries its own `structured-output` part. (Last exercise
	//    you read `partial`/`final`, but those only ever hold the *latest* reply,
	//    which is why each follow-up wiped the previous comparison off the screen.)
	const { sendMessage, isLoading } = useChat({
		connection: fetchServerSentEvents('/api/compare'),
		forwardedProps: { productIds },
		outputSchema: ComparisonSchema,
	})

	// 🐨 Delete this placeholder and read the real `messages` from useChat above.
	// 💰 It only exists so the page renders (the empty state) before you wire it up.
	const messages = []

	return (
		<div className="space-y-4">
			{messages.length === 0 ? (
				<EmptyState />
			) : (
				<div className="space-y-6">
					{messages.map((m) => {
						// 🐨 Return the right thing for this message:
						//      - a user turn      → <UserBubble key={m.id} text={getUserText(m.parts)} />
						//      - an assistant turn → find its structured-output part; if it has none
						//        yet, render nothing. Otherwise show the error card or the
						//        comparison card.
						//    Key every returned element with `m.id`.
						//
						// 💰 Find the part:
						//      const part = m.parts.find((p) => p.type === 'structured-output')
						//    Bail out early when it's missing — `if (!part) return` — so a turn
						//    that's still streaming other chunks doesn't flash an empty card.
						//    Once found, the part carries: status ('streaming' | 'complete' |
						//    'error'), partial, data, and errorMessage.
						//
						// 💰 The comparison to render is `part.data ?? part.partial`. Pass it as
						//    `comparison ?? {}` — it's empty until the first tokens land, and the
						//    table renders skeletons for whatever hasn't streamed in yet.
						//
						// 💰 The pre-built components + their props (all defined below):
						//      <ComparisonErrorCard key={m.id} message={part.errorMessage} />
						//      <ComparisonCard key={m.id} comparison={comparison ?? {}} products={products} />

						// 🐨 These `void`s just keep the pre-built components compiling until
						//    you use them — delete each one as you return the matching component.
						void getUserText
						void UserBubble
						void ComparisonCard
						void ComparisonErrorCard
						return null
					})}
				</div>
			)}

			<form
				onSubmit={(event) => {
					event.preventDefault()
					if (!draft.trim() || isLoading) return
					void sendMessage(draft)
					setDraft('')
				}}
				className="sticky bottom-4 flex items-center gap-2 rounded-full border border-stone-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800"
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

// ─── Pre-built presentation — you don't write any of this ────────────────────

function getUserText(parts: ReadonlyArray<{ type: string; content?: string }>) {
	return parts
		.filter((p) => p.type === 'text')
		.map((p) => p.content ?? '')
		.join('')
}

function UserBubble({ text }: { text: string }) {
	return (
		<div className="flex justify-end">
			<div className="max-w-[80%] rounded-2xl bg-amber-600 px-4 py-2 text-sm text-white">
				{text}
			</div>
		</div>
	)
}

function ComparisonCard({
	comparison,
	products,
}: {
	comparison: PartialComparison
	products: Array<ProductSummary>
}) {
	return (
		<div className="rounded-lg border border-stone-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
			<ComparisonTable comparison={comparison} products={products} />
		</div>
	)
}

function EmptyState() {
	return (
		<div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
			Ask a question below to compare these products.
			<div className="mt-2 text-xs text-gray-400">
				Try "What's the best value for the money?" or "Which is most durable?"
			</div>
		</div>
	)
}

function ComparisonErrorCard({ message }: { message?: string }) {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
			<AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
			<div>
				<div className="font-medium">The comparison didn't validate.</div>
				<div className="text-xs opacity-80">
					{message ?? 'Try rephrasing your question.'}
				</div>
			</div>
		</div>
	)
}

import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { MessageCircle, Send, X } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useRouteLoaderData } from 'react-router'

export type ProductChatContext = {
	productId: string
	name: string
	brand: string
	price: number
	description: string
	reviewScore: number
}

type ProductDetailLoaderData = {
	product: {
		id: string
		name: string
		description: string
		price: number
		reviewScore: number
		brand: { name: string }
	} | null
}

function useCurrentProduct(): ProductChatContext | undefined {
	const data = useRouteLoaderData<ProductDetailLoaderData>(
		'routes/_landing/products/$productId',
	)
	const p = data?.product
	if (!p) return undefined
	return {
		productId: p.id,
		name: p.name,
		brand: p.brand.name,
		price: p.price,
		description: p.description,
		reviewScore: p.reviewScore,
	}
}

/**
 * Floating chat panel pinned to the bottom-right of every customer-facing
 * page (mounted from `app/routes/_landing/_layout.tsx`).
 *
 * 🐨 In this exercise you'll replace the hand-rolled `fetch` setup below with
 *    TanStack AI's `useChat` hook. The imports above are already in scope:
 *    - `useChat` manages messages, loading state, and the streaming connection
 *    - `fetchServerSentEvents('/api/chat')` is the connection adapter that
 *       knows how to consume our SSE endpoint
 *
 * 💣 Everything marked with the bomb emoji below is the hand-rolled fetch
 *    wrapper that lit up the panel in the previous exercise. Delete those
 *    pieces as you wire `useChat` — they'll all be replaced.
 */
export function ProductChat() {
	const product = useCurrentProduct()
	const [isOpen, setIsOpen] = useState(false)
	const [draft, setDraft] = useState('')

	// 💣 Hand-rolled chat state — to be replaced by `useChat`.
	const [reply, setReply] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	// 💣 Hand-rolled chat submission — to be replaced by `useChat`'s
	//    `sendMessage`.
	async function sendHandRolled(event: React.FormEvent) {
		event.preventDefault()
		if (!draft.trim() || isLoading) return
		setError(null)
		setReply('')
		setIsLoading(true)
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: [{ role: 'user', content: draft }],
				}),
			})
			if (!res.ok) {
				throw new Error(`${res.status} ${await res.text()}`)
			}
			setReply(await res.text())
			setDraft('')
		} catch (err) {
			setError(err instanceof Error ? err.message : String(err))
		} finally {
			setIsLoading(false)
		}
	}

	// 🐨 Reference the pre-imported names so TypeScript stays happy until you
	//    consume them. Delete these `void` calls once `useChat` is wired.
	void useChat
	void fetchServerSentEvents
	void ReactMarkdown

	return (
		<div className="fixed right-6 bottom-6 z-50">
			{isOpen ? (
				<div className="flex h-[32rem] w-[22rem] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
					<header className="flex items-center justify-between border-b border-stone-200 bg-amber-600 px-4 py-3 text-white dark:border-gray-700">
						<div>
							<div className="text-sm font-medium tracking-wide">
								Shopping Assistant
							</div>
							<div className="text-xs text-amber-100">
								{product ? `About: ${product.name}` : 'Shopping Assistant'}
							</div>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="rounded-lg p-1 text-white transition-colors hover:bg-amber-700"
							aria-label="Close chat"
						>
							<X className="h-5 w-5" />
						</button>
					</header>

					<div className="flex-1 space-y-4 overflow-y-auto p-4">
						<div className="rounded-lg bg-stone-100 p-3 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
							👋 Hi! Ask me anything about this product.
						</div>

						{/* 💣 Delete the `<pre>` and the error `<div>` below — they
						    belong to the hand-written `fetch`. */}
						{reply ? (
							<pre className="overflow-x-auto rounded-lg bg-stone-100 p-3 text-xs whitespace-pre-wrap text-gray-700 dark:bg-gray-800 dark:text-gray-200">
								{reply}
							</pre>
						) : null}
						{error ? (
							<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
								⚠️ {error}
							</div>
						) : null}

						{/*
						💰 After deleting the bomb-marked code above, uncomment this
						   messages list in its place. It walks each message's
						   `parts` and renders every `text` part through ReactMarkdown
						   so the bot's bold, lists, and other formatting show up
						   nicely instead of as raw asterisks.

						{messages.map((m) => (
							<div
								key={m.id}
								className={
									m.role === 'user'
										? 'ml-auto max-w-[80%] rounded-lg bg-amber-600 p-3 text-sm text-white'
										: 'max-w-[80%] rounded-lg bg-stone-100 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200'
								}
							>
								{m.parts.map((part, i) =>
									part.type === 'text' ? (
										<ReactMarkdown key={i}>{part.content}</ReactMarkdown>
									) : null,
								)}
							</div>
						))}
						*/}
					</div>

					{/* 💣 The form's `onSubmit` calls the hand-rolled fetch. Repoint
					    it at `useChat`'s `sendMessage`. */}
					<form
						onSubmit={sendHandRolled}
						className="flex items-center gap-2 border-t border-stone-200 p-3 dark:border-gray-700"
					>
						<input
							type="text"
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							placeholder="Ask about this product..."
							disabled={isLoading}
							className="flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
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
			) : (
				<button
					onClick={() => setIsOpen(true)}
					className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white shadow-lg transition-colors hover:bg-amber-700"
					aria-label="Open shopping assistant"
				>
					<MessageCircle className="h-6 w-6" />
				</button>
			)}
		</div>
	)
}

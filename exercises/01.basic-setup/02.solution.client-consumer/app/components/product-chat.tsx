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

export function ProductChat() {
	const product = useCurrentProduct()
	const [isOpen, setIsOpen] = useState(false)
	const [draft, setDraft] = useState('')

	const { messages, sendMessage, isLoading } = useChat({
		connection: fetchServerSentEvents('/api/chat'),
	})

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
					</div>

					<form
						onSubmit={(event) => {
							event.preventDefault()
							if (!draft.trim() || isLoading) return
							void sendMessage(draft)
							setDraft('')
						}}
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

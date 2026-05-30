import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { MessageCircle, Send, X } from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useNavigate, useRouteLoaderData } from 'react-router'
import { ProductCard } from '#app/components/product-card'
import { useCart } from '#app/contexts/cart.js'
import { addProductToCart } from '#app/lib/cart-actions.ts'
import { addToCartDef } from '#app/tools/cart.ts'
import { navigateToDef } from '#app/tools/navigation.ts'

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
	const navigate = useNavigate()
	const cart = useCart()
	const [isOpen, setIsOpen] = useState(false)
	const [draft, setDraft] = useState('')

	const navigateTo = navigateToDef.client(({ destination }) => {
		navigate(destination)
		return { destination }
	})

	/**
	 * 🐨 Build the second client tool below. Same pattern as `navigateTo`
	 *    above — but this one closes over `cart` (from `useCart()`) instead
	 *    of `navigate`.
	 *
	 *    💰 Use `addToCartDef.client(execute)` and store in `const addToCart`.
	 *    💰 The callback receives the args the model picked. You only need
	 *       `productId`, `size`, `color`, `quantity` to actually do the
	 *       add — `productName` is for the approval prompt UI, not the cart.
	 *    💰 Call `addProductToCart({ productId, size, color, quantity }, cart)`
	 *       to do the work. It's already imported. It returns a Promise, so
	 *       your callback should be `async`.
	 *    💰 Return `{ added: true }` so the model knows the add succeeded.
	 *
	 * 🦉 Notice this tool's definition has `needsApproval: true` (you set
	 *    that in `cart.ts`). That means TanStack AI will *not* call your
	 *    `.client(...)` callback until the customer approves. The approval
	 *    UI is rendered further down in `messages.map(...)` — the click
	 *    handlers there are also yours to wire up.
	 */
	void addToCartDef
	void addProductToCart
	void cart

	const { messages, sendMessage, isLoading, addToolApprovalResponse } =
		useChat({
			connection: fetchServerSentEvents('/api/chat'),
			forwardedProps: product ? { productId: product.productId } : {},
			// 🐨 Add `addToCart` to this list once you've built it above.
			tools: [navigateTo],
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
							👋 Hi! Ask me about products, or tell me where you'd like to go.
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
								{m.parts.map((part, i) => {
									if (part.type === 'text') {
										return <ReactMarkdown key={i}>{part.content}</ReactMarkdown>
									}
									if (part.type === 'thinking') {
										return (
											<details
												key={i}
												className="mt-1 mb-2 rounded border border-stone-200 bg-white p-2 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
											>
												<summary className="cursor-pointer font-medium">
													💭 Thinking…
												</summary>
												<div className="mt-1 whitespace-pre-wrap">
													{part.content}
												</div>
											</details>
										)
									}
									if (part.type === 'tool-call') {
										const output = part.output as
											| {
													products?: Array<{ id: string }>
													destination?: string
													added?: boolean
													productName?: string
													variations?: Array<{
														size: string
														color: string
														quantity: number
													}>
											  }
											| undefined

										const products = output?.products
										if (Array.isArray(products) && products.length > 0) {
											return (
												<div key={i} className="mt-2 flex flex-col gap-3">
													{products.map((p) => (
														<ProductCard
															key={p.id}
															product={p as Parameters<typeof ProductCard>[0]['product']}
														/>
													))}
												</div>
											)
										}

										if (Array.isArray(output?.variations)) {
											const variations = output.variations
											const sizes = Array.from(
												new Set(variations.map((v) => v.size)),
											)
											const colors = Array.from(
												new Set(variations.map((v) => v.color)),
											)
											const find = (size: string, color: string) =>
												variations.find(
													(v) => v.size === size && v.color === color,
												)?.quantity
											return (
												<div key={i} className="mt-2">
													<div className="mb-1 text-xs font-medium text-gray-800 dark:text-gray-100">
														{output.productName
															? `Variations for ${output.productName}`
															: 'Available variations'}
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
																					<td
																						key={c}
																						className="px-2 py-1 text-gray-400"
																					>
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

										if (output?.destination) {
											return (
												<div
													key={i}
													className="mt-1 text-xs italic text-gray-500 dark:text-gray-400"
												>
													📍 Took you to the {output.destination} page.
												</div>
											)
										}

										if (output?.added) {
											return (
												<div
													key={i}
													className="mt-1 rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
												>
													✅ Added to your cart.
												</div>
											)
										}

										if (
											part.state === 'approval-requested' &&
											part.approval
										) {
											const approvalId = part.approval.id
											void approvalId
											const input = (part.input ?? {}) as {
												productName?: string
												size?: string
												color?: string
												quantity?: number
											}
											return (
												<div
													key={i}
													className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950"
												>
													<div className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
														🛒 Add to cart?
													</div>
													<div className="mb-3 text-xs text-gray-700 dark:text-gray-300">
														<div>{input.productName ?? 'this product'}</div>
														<div className="mt-1 opacity-75">
															size {input.size ?? '–'} · color{' '}
															{input.color ?? '–'} · qty {input.quantity ?? 1}
														</div>
													</div>
													<div className="flex gap-2">
														{/*
														  🐨 Wire these buttons up. On click, call
														      addToolApprovalResponse({ id: approvalId, approved: true })
														      for "Yes" and approved: false for "No".
														      `approvalId` is already destructured above this card.
														*/}
														<button
															type="button"
															onClick={() => {
																// 🐨 approve
															}}
															className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
														>
															Yes, add it
														</button>
														<button
															type="button"
															onClick={() => {
																// 🐨 deny
															}}
															className="rounded bg-gray-300 px-3 py-1 text-xs font-medium text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
														>
															No, cancel
														</button>
													</div>
												</div>
											)
										}

										if (
											part.state === 'approval-responded' &&
											part.approval?.approved === false
										) {
											return (
												<div
													key={i}
													className="mt-1 text-xs italic text-gray-500 dark:text-gray-400"
												>
													❌ Cancelled — not added.
												</div>
											)
										}

										return (
											<div
												key={i}
												className="mt-1 text-xs italic text-gray-500 dark:text-gray-400"
											>
												🔧 Calling {(part as { name?: string }).name ?? 'tool'}…
											</div>
										)
									}
									return null
								})}
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
							placeholder="Ask about products or where to go..."
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

import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

/**
 * Single source of truth for which pages the bot is allowed to send the
 * customer to. The keys become the enum the model picks from, and the values
 * become the per-page descriptions the model reads to decide which page is
 * the right pick.
 *
 * 🦉 Why an explicit allowlist instead of "all routes"?
 *    React Router doesn't ship a runtime hook that enumerates every defined
 *    route — and we wouldn't want one here even if it did. `/api/chat` is a
 *    route. `/products/$productId` is a route that needs an id the bot can't
 *    guess. Future `/admin/...` routes would be routes. The set of pages the
 *    bot is *allowed* to navigate to is a deliberately curated subset, not
 *    the full router config. Adding a new public page = add one entry here.
 */
const NAVIGABLE_PAGES = {
	'/': 'The home page (hero, featured products, categories).',
	'/cart': "The customer's shopping cart.",
	'/products':
		'The full product catalog. Use this for general browse requests when no specific filter applies (for filtered search, use `searchProducts` instead).',
	'/about': 'The "about EpicStore" page.',
	'/contact': 'The contact form.',
} as const

type Destination = keyof typeof NAVIGABLE_PAGES

const destinationDoc = Object.entries(NAVIGABLE_PAGES)
	.map(([path, desc]) => `- ${path} — ${desc}`)
	.join('\n')

const NavigateToInput = z.object({
	destination: z
		.enum(
			Object.keys(NAVIGABLE_PAGES) as [Destination, ...Array<Destination>],
		)
		.describe(`Which page to take the customer to. Pick one of:\n${destinationDoc}`),
})

const NavigateToOutput = z.object({
	destination: z.string(),
})

/**
 * 🐨 Define and export `navigateToDef` here — same shape as the
 *    `toolDefinition({...})` calls you wrote for the server tools last time.
 *    The two schemas above (`NavigateToInput`, `NavigateToOutput`) are
 *    pre-built for you to plug in.
 *
 *    💰 `name`: `'navigateTo'`
 *
 *    💰 `description`: copy this in exactly —
 *
 *       'Take the customer to a page in the EpicStore site. Use this when ' +
 *       'they ask to go somewhere — for example "take me to the cart", ' +
 *       '"show me all products", "go back home", "open the about page".'
 *
 *    💰 `inputSchema`: plug in `NavigateToInput`.
 *    💰 `outputSchema`: plug in `NavigateToOutput`.
 *
 * 🦉 Don't call `.server(...)` or `.client(...)` on it here — this file
 *    exports just the definition. The server (`api.chat.tsx`) will pass the
 *    definition straight into `chat({ tools: [...] })` to advertise the tool
 *    to the model. The browser (`product-chat.tsx`) will attach the actual
 *    `.client(...)` callback. Same definition, two sides.
 */

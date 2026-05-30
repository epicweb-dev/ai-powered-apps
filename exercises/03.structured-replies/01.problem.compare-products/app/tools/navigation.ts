import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

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

export const navigateToDef = toolDefinition({
	name: 'navigateTo',
	description:
		'Take the customer to a page in the EpicStore site. Use this when they ask to go somewhere — for example "take me to the cart", "show me all products", "go back home", "open the about page".',
	inputSchema: NavigateToInput,
	outputSchema: NavigateToOutput,
})

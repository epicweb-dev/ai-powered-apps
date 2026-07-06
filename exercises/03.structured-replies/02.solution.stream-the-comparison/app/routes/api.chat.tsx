import {
	chat,
	chatParamsFromRequest,
	toServerSentEventsResponse,
} from '@tanstack/ai'
import { openRouterText } from '@tanstack/ai-openrouter'
import { getProductById } from '#app/domain/products.server.ts'
import {
	GLOBAL_SYSTEM_PROMPT,
	buildProductPrompt,
} from '#app/prompts/system.ts'
import { PageForwardedProps } from '#app/schemas/chat.js'
import { addToCartDef } from '#app/tools/cart.ts'
import { navigateToDef } from '#app/tools/navigation.ts'
import {
	findSimilarProducts,
	recommendProducts,
	searchProducts,
} from '#app/tools/products.ts'
import { getCareInstructions } from '#app/tools/care-instructions.ts'
import { getReturnPolicy } from '#app/tools/return-policy.ts'
import { subscribeToRestock } from '#app/tools/restock.ts'
import { getShippingEstimate } from '#app/tools/shipping.ts'
import { getSizeGuide } from '#app/tools/size-guide.ts'
import { showVariations } from '#app/tools/variations.ts'
import { type Route } from './+types/api.chat'

const adapter = openRouterText('openai/gpt-oss-120b:free')

export const action = async ({ request }: Route.ActionArgs) => {
	const { messages, forwardedProps, threadId } =
		await chatParamsFromRequest(request)
	const props = PageForwardedProps.safeParse(forwardedProps)
	if (!props.success) {
		return new Response(props.error.message, { status: 400 })
	}
	const product = props.data.productId
		? await getProductById(props.data.productId)
		: null

	const systemPrompts = product
		? [GLOBAL_SYSTEM_PROMPT, buildProductPrompt(product)]
		: [GLOBAL_SYSTEM_PROMPT]

	const stream = chat({
		adapter,
		systemPrompts,
		messages,
		threadId,
		tools: [
			// Eager tools — described to the model on every message.
			searchProducts,
			findSimilarProducts,
			recommendProducts,
			showVariations,
			navigateToDef,
			addToCartDef,
			// Lazy tools — name-only in the discovery tool's enum until the
			// model asks for one. Same registration shape as the eager tools;
			// the `lazy: true` flag on each definition is what does the work.
			getReturnPolicy,
			getSizeGuide,
			getCareInstructions,
			subscribeToRestock,
			getShippingEstimate,
		],
	})
	return toServerSentEventsResponse(stream)
}

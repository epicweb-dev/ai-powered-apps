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
import { showVariations } from '#app/tools/variations.ts'
import { type Route } from './+types/api.chat'

const adapter = openRouterText('openai/gpt-5.5')

// 🐨 The new tool's *definition* is imported above. Add `addToCartDef` to the
//    `tools: [...]` array on `chat({...})` below — just like you did with
//    `navigateToDef` last time. Even though `addToCart` runs in the browser
//    *and* needs approval, the server still has to advertise it to the model.
void addToCartDef

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
			searchProducts,
			findSimilarProducts,
			recommendProducts,
			showVariations,
			navigateToDef,
		],
		modelOptions: {
			reasoning: { effort: 'medium' },
		},
	})
	return toServerSentEventsResponse(stream)
}

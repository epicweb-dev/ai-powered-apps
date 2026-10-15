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
import { navigateToDef } from '#app/tools/navigation.ts'
import {
	findSimilarProducts,
	recommendProducts,
	searchProducts,
} from '#app/tools/products.ts'
import { type Route } from './+types/api.chat'

const adapter = openRouterText('nvidia/nemotron-3-super-120b-a12b:free')

export const action = async ({ request }: Route.ActionArgs) => {
	const { messages, forwardedProps, threadId, runId, parentRunId, resume } =
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
		runId,
		parentRunId,
		resume,
		tools: [
			searchProducts,
			findSimilarProducts,
			recommendProducts,
			navigateToDef,
		],
		reasoning: 'medium',
	})
	return toServerSentEventsResponse(stream)
}

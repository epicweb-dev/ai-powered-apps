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
		modelOptions: {
			reasoning: { effort: 'medium' },
		},
	})
	return toServerSentEventsResponse(stream)
}

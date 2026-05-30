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

const adapter = openRouterText('openai/gpt-5.5')

// 🐨 The new client tool's *definition* is imported above. The server doesn't
//    run `navigateTo` itself — it just needs to tell the model the tool
//    exists. Add `navigateToDef` to the `tools: [...]` array on `chat({...})`
//    below. (Note: it's a definition, not a `.server(...)` tool — that's the
//    whole point of client tools. The model sees it the same way either way.)
void navigateToDef

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
		tools: [searchProducts, findSimilarProducts, recommendProducts],
		modelOptions: {
			reasoning: { effort: 'medium' },
		},
	})
	return toServerSentEventsResponse(stream)
}

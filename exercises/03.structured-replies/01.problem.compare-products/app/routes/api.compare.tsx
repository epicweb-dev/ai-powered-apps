import { chat, chatParamsFromRequest, toServerSentEventsResponse } from '@tanstack/ai'
import { openRouterText } from '@tanstack/ai-openrouter'
import { getProductById } from '#app/domain/products.server.ts'
import {
	COMPARISON_SYSTEM_PROMPT,
	buildComparisonPrompt,
} from '#app/prompts/comparison.ts'
import { CompareForwardedProps } from '#app/schemas/chat.js'
import { ComparisonSchema } from '#app/schemas/comparison.ts'
import {
	findSimilarProducts,
	searchProducts,
} from '#app/tools/products.ts'
import { type Route } from './+types/api.compare'

const adapter = openRouterText('openai/gpt-5.5')

export const action = async ({ request }: Route.ActionArgs) => {
	const { messages, forwardedProps } = await chatParamsFromRequest(request)
	const props = CompareForwardedProps.safeParse(forwardedProps)
	if (!props.success) {
		return new Response(props.error.message, { status: 400 })
	}

	const products = (
		await Promise.all(props.data.productIds.map((id) => getProductById(id)))
	).filter((p): p is NonNullable<typeof p> => p !== null)

	if (products.length === 0) {
		return new Response('No valid products to compare.', { status: 400 })
	}

	const systemPrompts = [
		COMPARISON_SYSTEM_PROMPT,
		buildComparisonPrompt(products),
	]

	// 🐨 Constrain the model's reply to `ComparisonSchema`, and stream the
	//    structured output back over SSE.
	//
	//    Two options to add to the `chat({...})` call below:
	//      - `outputSchema`: the Zod schema the model must conform to.
	//      - `stream`: set to `true`. Without this, `chat()` resolves to a
	//         single `Promise<T>` after the whole response is validated —
	//         useful for non-streaming jobs, but `useChat` needs SSE.
	//
	// 💰 The schema is already imported above as `ComparisonSchema`.
	const stream = chat({
		adapter,
		systemPrompts,
		messages,
		tools: [searchProducts, findSimilarProducts],
	})
	// 🦉 The agent loop runs first (so the model can call `searchProducts` /
	//    `findSimilarProducts` to look up product attributes), and only
	//    after all tool calls complete does the structured output start
	//    streaming. You don't need to wire that yourself — it's automatic
	//    once `outputSchema` and `tools` are both set.
	void ComparisonSchema

	return toServerSentEventsResponse(stream)
}

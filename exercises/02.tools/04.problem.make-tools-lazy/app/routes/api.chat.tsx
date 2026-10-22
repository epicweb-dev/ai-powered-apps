import {
	chat,
	chatParamsFromRequest,
	mergeAgentTools,
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
} from '#app/tools/products.server.ts'
import { getCareInstructions } from '#app/tools/care-instructions.ts'
import { getReturnPolicy } from '#app/tools/return-policy.ts'
import { subscribeToRestock } from '#app/tools/restock.ts'
import { getShippingEstimate } from '#app/tools/shipping.ts'
import { getSizeGuide } from '#app/tools/size-guide.ts'
import { showVariations } from '#app/tools/variations.server.ts'
import { type Route } from './+types/api.chat'

const adapter = openRouterText('nvidia/nemotron-3-super-120b-a12b:free')

// 🐨 Five new lazy tools are imported above (return policy, size guide, care
//    instructions, restock, and the shipping estimate you'll build). Register
//    them all in the array inside `mergeAgentTools([...], clientTools)` below
//    — same as every tool you've added so far. The `lazy: true` flag on each
//    definition is what makes TanStack AI lazy-load them; from the
//    registration side, eager and lazy tools look identical.
void getCareInstructions
void getReturnPolicy
void subscribeToRestock
void getShippingEstimate
void getSizeGuide

export const action = async ({ request }: Route.ActionArgs) => {
	const {
		messages,
		forwardedProps,
		threadId,
		runId,
		parentRunId,
		resume,
		tools: clientTools,
	} = await chatParamsFromRequest(request)
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
		// The browser also sends the tools it passed to `useChat`. Merge them in
		// instead of ignoring them. On a name clash the server's copy wins: the
		// browser only sends a name, a description, and an input schema, so
		// `needsApproval`, `lazy`, and the output schema come from the
		// definitions listed here. That's why the client tools are listed too.
		tools: mergeAgentTools(
			[
				searchProducts,
				findSimilarProducts,
				recommendProducts,
				showVariations,
				navigateToDef,
				addToCartDef,
			],
			clientTools,
		),
		reasoning: 'medium',
	})
	return toServerSentEventsResponse(stream)
}

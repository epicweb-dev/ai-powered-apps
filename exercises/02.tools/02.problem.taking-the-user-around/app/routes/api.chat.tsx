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
import { navigateToDef } from '#app/tools/navigation.ts'
import {
	findSimilarProducts,
	recommendProducts,
	searchProducts,
} from '#app/tools/products.server.ts'
import { type Route } from './+types/api.chat'

const adapter = openRouterText('nvidia/nemotron-3-super-120b-a12b:free')

// 🐨 Two changes in the action below.
//
//    1. The browser sends the tools it passed to `useChat` along with every
//       request, and `chatParamsFromRequest` hands them back as `tools`.
//       Pull them off the destructure, renamed so they don't clash with the
//       `tools` option: `tools: clientTools`.
//
//    2. Add `navigateToDef` to the tools array, then wrap the whole array in
//       `mergeAgentTools(serverTools, clientTools)`:
//
//       💰 tools: mergeAgentTools(
//            [searchProducts, findSimilarProducts, recommendProducts, navigateToDef],
//            clientTools,
//          ),
//
// 🦉 Why not `[...serverTools, ...clientTools]`? The browser sends each tool as
//    `{ name, description, parameters }`, but `chat()` reads `inputSchema`, so
//    a plain spread hands the model a tool with no arguments. The browser also
//    declares the server tools (you passed their definitions to `useChat`),
//    so a spread would list them twice. `mergeAgentTools` converts the shape
//    and drops duplicates — on a name clash the server's copy wins.
//
// 🦉 Then why list `navigateToDef` here at all? The browser only sends a name,
//    a description, and an input schema. Everything else on the definition —
//    the output schema, and flags like `needsApproval` you'll meet next — only
//    exists in the server's copy. Listing the shared definition here makes the
//    server's full copy win the merge. Leave it out and the console warns that
//    the server and client tool schemas differ.
//
// 🦉 A client tool pauses the run. The browser runs the tool, then sends a
//    second request with the result. `runId`, `parentRunId`, and `resume`
//    are already forwarded below, so `chat()` knows which run to continue.
void navigateToDef
void mergeAgentTools

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
		tools: [searchProducts, findSimilarProducts, recommendProducts],
		reasoning: 'medium',
	})
	return toServerSentEventsResponse(stream)
}

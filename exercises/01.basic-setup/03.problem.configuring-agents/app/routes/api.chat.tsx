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

/**
 * 🐨 In this exercise you will give the bot a role, product awareness, and
 *    turn on the model's reasoning mode. The imports above are already in
 *    place for you. You will:
 *
 *    1. Destructure `forwardedProps` alongside `messages` from
 *       `chatParamsFromRequest(request)`. (`chatParamsFromRequest` already
 *       validates the AG-UI body and throws a 400 on bad input — you only
 *       need to validate the `forwardedProps` portion yourself.)
 *    2. Validate `forwardedProps` with `PageForwardedProps.safeParse(...)`.
 *       `productId` is **optional** here, because the chat panel also shows
 *       up on the products listing page, where the customer is not looking
 *       at a specific product. Return a 400 Response if validation fails.
 *    3. If `productId` is set, call `getProductById(productId)` to load the
 *       product from the database. If it is not set, the product is `null`.
 *    4. Pass `systemPrompts: [GLOBAL_SYSTEM_PROMPT, buildProductPrompt(product)]`
 *       into the `chat()` call so the model sees both the global rules and the
 *       product details. If the product is `null` (either no `productId` or
 *       the id is unknown), pass just `[GLOBAL_SYSTEM_PROMPT]` instead.
 *    5. Add `modelOptions: { reasoning: { effort: 'medium' } }` to the same
 *       `chat()` call. This tells OpenRouter to ask the model to think before
 *       it answers. The thinking shows up in the chat as a separate "thinking"
 *       message part.
 *
 * 💣 Delete the `void` lines below once you are using the new imports.
 */
void getProductById
void GLOBAL_SYSTEM_PROMPT
void buildProductPrompt
void PageForwardedProps

export const action = async ({ request }: Route.ActionArgs) => {
	const { messages, threadId } = await chatParamsFromRequest(request)
	const stream = chat({ adapter, messages, threadId })
	return toServerSentEventsResponse(stream)
}

import {
	chat,
	chatParamsFromRequest,
	toServerSentEventsResponse,
} from '@tanstack/ai'
import { openRouterText } from '@tanstack/ai-openrouter'
import { type Route } from './+types/api.chat'

/**
 * Resource route for the product chat backend.
 *
 * 🐨 Build an OpenRouter text adapter by calling
 *    `openRouterText('openai/gpt-5.5')`. The adapter reads
 *    `OPENROUTER_API_KEY` from your environment automatically.
 * 🐨 In the action below:
 *    - Call `await chatParamsFromRequest(request)` to parse and validate
 *      the AG-UI request body. On a malformed body it throws a `Response`
 *      with status 400 — React Router 7 surfaces that to the client
 *      automatically, so you don't need a try/catch.
 *    - Destructure `messages` and `threadId` from the returned params.
 *    - Call `chat({ adapter, messages, threadId })` (the model is baked into the
 *      adapter — no separate `model:` field needed) and return
 *      `toServerSentEventsResponse(stream)`.
 * 💣 Delete the `void` references and the 501 `Response` once your real
 *    implementation is in place.
 */
export const action = async ({ request }: Route.ActionArgs) => {
	void request
	void chat
	void chatParamsFromRequest
	void toServerSentEventsResponse
	void openRouterText
	return new Response('TODO: implement chat endpoint', { status: 501 })
}

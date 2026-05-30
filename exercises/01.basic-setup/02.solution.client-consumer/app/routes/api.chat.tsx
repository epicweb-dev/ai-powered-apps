import {
	chat,
	chatParamsFromRequest,
	toServerSentEventsResponse,
} from '@tanstack/ai'
import { openRouterText } from '@tanstack/ai-openrouter'
import { type Route } from './+types/api.chat'

const adapter = openRouterText('openai/gpt-5.5')

export const action = async ({ request }: Route.ActionArgs) => {
	const { messages, threadId } = await chatParamsFromRequest(request)
	const stream = chat({ adapter, messages, threadId })
	return toServerSentEventsResponse(stream)
}

import { z } from 'zod'

/**
 * Validates the `forwardedProps` portion of the AG-UI request body that
 * `useChat` POSTs. The AG-UI envelope itself (`threadId`, `runId`, `tools`,
 * `messages`, `context`, ...) is validated by TanStack AI's
 * `chatParamsFromRequest(request)` — we only need to validate the extra
 * fields the page sends through `forwardedProps`.
 *
 * `productId` is optional because the chat panel also lives on the products
 * listing page, where the customer is not looking at a specific product. In
 * that case the server falls back to the global system prompt only.
 *
 * You won't author this schema in the workshop — it's part of the
 * scaffolding so the focus stays on TanStack AI.
 */
export const PageForwardedProps = z.object({
	productId: z.string().min(1).optional(),
})
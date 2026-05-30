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
 * Pre-built — you'll use it but won't author it.
 */
export const PageForwardedProps = z.object({
	productId: z.string().min(1).optional(),
})

/**
 * Validates `forwardedProps` for the `/compare` page. The customer drives
 * the list size from there; we require at least one product so the server
 * can always build the system prompt.
 *
 * Also pre-built.
 */
export const CompareForwardedProps = z.object({
	productIds: z.array(z.string().min(1)).min(1),
})
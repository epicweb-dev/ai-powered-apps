# Exercise 04 — Page Context (Detailed Plan)

> **One concept:** pass the current product into the system prompt so the bot is grounded in what the user is viewing.
>
> Target time: **30–40 min** including intro + outro video.

## Pre-exercise state

After Ex03 the bot has an EpicStore persona but is page-blind:

- Open a specific product → ask "what is this?" → "I don't know what product you're looking at"
- Ask "how much?" → same
- The bot *behaves* like an EpicStore employee but has no eyes on the page

Scaffolding for this exercise:

- `app/prompts/system.ts` already has `SYSTEM_PROMPT` from Ex03
- `app/components/product-chat.tsx` already receives `product` as a prop (from the original scaffolding) and uses `useChat` (Ex02)
- The chat panel header already displays the product name
- `app/prompts/system.ts` pre-imports `ProductChatContext`
- `api.chat.tsx` pre-imports `buildSystemPrompt` and `ProductChatContext`

## Wrong attempt (felt in the playground)

Open any product. Ask "what's this called?" — the bot says it doesn't know. Persona without page context isn't enough.

## What the learner does

1. In `app/prompts/system.ts`, refactor `SYSTEM_PROMPT` into `buildSystemPrompt(product)` — a function that returns the persona text plus a product context block (name, brand, price, rating, description) templated in.
2. In `product-chat.tsx`, add `body: { product }` to the `useChat` options so the current product is sent with every request.
3. In `api.chat.tsx`, parse `product` from the request body alongside `messages`, then replace `{ role: 'system', content: SYSTEM_PROMPT }` with `{ role: 'system', content: buildSystemPrompt(product) }`.

## Verification

- Open a specific product
- "What's this called?" → bot quotes the name
- "How much?" → bot quotes the price
- "What's it good for?" → bot uses the description
- Navigate to a different product, ask the same question → answers update to match the new page

## Common stumbles

- Using the deprecated `body` option on `useChat` instead of `forwardedProps`. `body` still works (mirrored to `forwardedProps` on the wire) but `forwardedProps` is the modern AG-UI path.
- Description includes special characters that interfere with the template → guard with simple trim/escape.
- Trying to read `product` directly from `await request.json()` at the top level — it lives at `body.forwardedProps.product` (the AG-UI envelope wraps it).

## Locked decisions

1. **Fields in the system prompt:** name + brand + price + reviewScore + description
2. **Prompt format:** bullets
3. **Body augmentation API:** `forwardedProps: { product }` on `useChat` (modern AG-UI path); server reads `parsed.data.forwardedProps.product`

## Code surface — what the learner actually types

### `app/prompts/system.ts` — convert constant into function

**Pre-built scaffold:**

```ts
// ProductChatContext is pre-imported.

// 🐨 Convert SYSTEM_PROMPT into a `buildSystemPrompt(product)` function that
//    appends a product context block to the persona text below.

const BASE = `You are EpicStore's shopping assistant.

Help users find products, compare options, and decide what to buy. Keep replies short and conversational, like a knowledgeable store clerk.

Rules:
- Stay focused on shopping. If a user asks something off-topic, politely steer them back.
- Never invent products, prices, stock, sizes, or reviews. If you don't know, say so.
- When you don't have enough information about the current product, ask a clarifying question.`

// 🐨 Export buildSystemPrompt — takes a ProductChatContext, returns persona +
//    a bulleted product context block (name, brand, price, rating, description).
export function buildSystemPrompt(product: ProductChatContext): string {
	void product
	return BASE
}
```

**Focal change:**

```ts
export function buildSystemPrompt(product: ProductChatContext): string {
	return `${BASE}

The customer is currently viewing this product:
- Name: ${product.name}
- Brand: ${product.brand}
- Price: $${product.price}
- Rating: ${product.reviewScore}/5
- Description: ${product.description}

Use this information to give grounded answers about this product.`
}
```

### `app/components/product-chat.tsx` — send the product via `forwardedProps`

**Pre-built scaffold (relevant slice):**

```tsx
// 🐨 Tell useChat to include the current product in every request body
//    via the AG-UI `forwardedProps` field.
// 💰 Add `forwardedProps: { product }` to the options object below.
const { messages, sendMessage, isLoading } = useChat({
	connection: fetchServerSentEvents('/api/chat'),
})
```

**Focal change** (one line, no imports):

```tsx
const { messages, sendMessage, isLoading } = useChat({
	connection: fetchServerSentEvents('/api/chat'),
	forwardedProps: { product },
})
```

### `app/schemas/chat.ts` — pre-built `PagePayload` schema (learner does NOT edit)

The scaffolding ships a second exported schema that knows about the AG-UI envelope and the product:

```ts
// 🦉 Pre-built scaffolding. Learners read it once for context, never edit.
//    The wire shape `useChat` sends is `{ messages, forwardedProps, ... }`.

const ProductContextSchema = z.object({
	productId: z.string(),
	name: z.string(),
	brand: z.string(),
	price: z.number(),
	reviewScore: z.number(),
	description: z.string(),
})

export const PagePayload = z.object({
	messages: MessagesPayload.shape.messages,
	forwardedProps: z.object({
		product: ProductContextSchema,
	}),
})
```

### `app/routes/api.chat.tsx` — consume the product, build per-request prompt

**Pre-built scaffold (relevant slice):**

```tsx
// PagePayload, buildSystemPrompt, ProductChatContext are pre-imported.

// 🐨 Replace `MessagesPayload` with `PagePayload` so the server validates
//    that `forwardedProps.product` is present and well-shaped.
// 🐨 Swap `systemPrompts: [SYSTEM_PROMPT]` for
//    `systemPrompts: [buildSystemPrompt(product)]` after destructuring the
//    product out of the parsed payload.

const parsed = MessagesPayload.safeParse(await request.json())
if (!parsed.success) {
	return new Response(parsed.error.message, { status: 400 })
}
const { messages } = parsed.data

const stream = chat({
	adapter,
	systemPrompts: [SYSTEM_PROMPT],
	messages,
})
```

**Focal change** (swap the schema + swap the system prompt):

```tsx
const parsed = PagePayload.safeParse(await request.json())
if (!parsed.success) {
	return new Response(parsed.error.message, { status: 400 })
}
const { messages, forwardedProps } = parsed.data
const { product } = forwardedProps

const stream = chat({
	adapter,
	systemPrompts: [buildSystemPrompt(product)],
	messages,
})
```

**Verify:** open a product, ask "what is this?" — bot answers with the product name. Navigate to a different product, ask the same — answer updates.

## What the learner does NOT write in this exercise

- ❌ **Imports** — every identifier is pre-imported
- ❌ JSX, styling, or any visual changes (the panel header already shows the product name)
- ❌ The `ProductChatContext` type (already defined and pre-imported)
- ❌ The product prop wiring on the product detail page (scaffolding)
- ❌ Prisma / DB queries

The focal surface is ~3 small file edits.

## Risks specific to Exercise 04

- **AG-UI envelope shape.** The wire body `useChat` POSTs is the full AG-UI `RunAgentInput` shape: `{ threadId, runId, state, messages, tools, context, forwardedProps, data }`. Our `PagePayload` schema validates the slices we care about and Zod strips the rest. If the AG-UI shape evolves, the schema may need updates.
- **Description content.** Real product descriptions may contain backticks, markdown, or other characters that interfere with the prompt template. Add a small sanitization helper if it surfaces during live delivery.


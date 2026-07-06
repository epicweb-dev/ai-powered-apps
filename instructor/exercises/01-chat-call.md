# Exercise 01 — Chat Call (Detailed Plan)

> **One concept:** stand up a production-ready server-side chat endpoint with TanStack AI's `chat()`, OpenRouter, SSE response, and validated input.
>
> Target time: **25–30 min** including intro + outro video.

## API reality check

TanStack AI is **streaming-first**. `chat()` always returns a stream; the server uses `toServerSentEventsResponse(stream)` to ship SSE. There is no idiomatic non-streaming path.

## Pre-exercise state

- `app/routes/api.chat.tsx` — pre-imports `chat`, `toServerSentEventsResponse`, `openRouterText`, and `MessagesPayload`. The action returns a 501 placeholder.
- `app/schemas/chat.ts` — a pre-written Zod schema `MessagesPayload` already lives here. The learner reads it once to know the shape, but never writes Zod themselves. The schema is part of the workshop's scaffolding so the lesson stays focused on TanStack AI, not on Zod.
- `app/components/product-chat.tsx` — fully built floating panel that POSTs to `/api/chat` via a hand-rolled `fetch()` wrapper. Right now that fetch shows the 501 response in a red error bubble inside the panel — visible proof the endpoint isn't wired yet. The hand-rolled bits are 💣-marked and Ex02 will rip them out.
- Panel slotted into `$productId.tsx`
- `.env.example` lists `OPENROUTER_API_KEY=`
- TanStack AI deps + `zod` already installed

## Wrong attempt (intro framing, not coded)

"You could hand-roll a `fetch()` to OpenRouter's REST API and parse SSE manually, *and* trust the request body without validation." Instructor shows the 30+ line slide — no types, no provider swap, crashes on malformed input. The canonical TanStack AI server endpoint is shorter, safer, and provider-agnostic.

## What the learner does

The scaffold already imports everything they consume (`chat`, `toServerSentEventsResponse`, `openRouterText`, `MessagesPayload`).

1. Drop their `OPENROUTER_API_KEY` into `.env`.
2. In `api.chat.tsx`, replace the 501 action so it:
   - Builds the OpenRouter adapter with `openRouterText('openai/gpt-oss-120b:free')` (the adapter reads `OPENROUTER_API_KEY` from env automatically)
   - Calls `MessagesPayload.safeParse(await request.json())` to validate the incoming body
   - On `parsed.success === false`, returns `new Response(parsed.error.message, { status: 400 })`
   - On success, destructures `messages` from `parsed.data`
   - Calls `chat({ adapter, messages })` — model is baked into the adapter, no separate `model:` field
   - Returns `toServerSentEventsResponse(stream)`
   - 💣 Deletes the `void` placeholder + the 501 `Response`
3. Verify in the running app — no curl. Open a product, click the bubble, type a message, hit send. Before this step the panel showed a red 501 bubble. Now the hand-rolled fetch lands a real response and the panel renders the raw SSE `data:` frames in a `<pre>` block. Ugly, but visibly working.
4. Tamper with the request in browser devtools (send `{ foo: 'bar' }` or `messages: []`) → red 400 bubble with a readable Zod error. Production-grade endpoint.

## Verification

- Red 501 error bubble is gone after submitting a real message
- Panel shows raw SSE `data:` frames in the `<pre>` block — proof the endpoint streams real data
- Tampered requests return a clean 400 with `parsed.error.message`, no uncaught throws in the server console
- The raw SSE rendering is intentionally ugly — motivates Ex02 (swap hand-rolled fetch for `useChat`)

## Common stumbles

- Forgot to set `OPENROUTER_API_KEY` → 401 from upstream in the red bubble. README's 🚨 Alfred section calls this out.
- Wrong model id (`gpt-oss-120b:free` vs `openai/gpt-oss-120b:free`) → 400 from OpenRouter (it expects the provider prefix).
- Putting the `safeParse` check after the destructure → defeats the purpose. Must run on the raw `await request.json()` output.
- Returning the full Zod error object instead of just `parsed.error.message` → noisier than it needs to be in the panel.
- Forgetting the early return on the failure branch → TypeScript can't narrow `parsed.data`.

## Locked decisions

1. **Default model:** `openai/gpt-oss-120b:free`
2. **Validation:** Zod via the pre-built `MessagesPayload` schema in `app/schemas/chat.ts`. Learners never write a schema.
3. **Error response body:** the plain `parsed.error.message` string (renders directly in the panel's red error bubble)

## Code surface — what the learner actually types

**Pre-built scaffold — `app/schemas/chat.ts`** (already in place, learner does **not** edit):

```ts
import { z } from 'zod'

export const MessagesPayload = z.object({
	messages: z
		.array(
			z.object({
				role: z.enum(['user', 'assistant']),
				content: z.string().min(1),
			}),
		)
		.min(1),
})

// 🦉 Note: `role` is only `user | assistant` because that's what comes over
// the wire from `useChat`. System prompts go through `chat({ systemPrompts })`
// in a later exercise — they are never sent in the messages array.
```

**Pre-built scaffold — `app/routes/api.chat.tsx`:**

```tsx
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openRouterText } from '@tanstack/ai-openrouter'
import { MessagesPayload } from '#app/schemas/chat.js'
import { type Route } from './+types/api.chat'

// 🐨 Build the OpenRouter adapter with `openRouterText('openai/gpt-oss-120b:free')`.
//    The adapter reads OPENROUTER_API_KEY from your environment automatically.
// 🐨 In the action: validate `await request.json()` with the pre-imported
//    `MessagesPayload.safeParse(...)`. On failure return a 400 with
//    `parsed.error.message`. On success, call `chat({ adapter, messages })`
//    (the model is baked into the adapter — no separate `model:` field) and
//    return `toServerSentEventsResponse(stream)`.
// 💣 Delete the 501 placeholder once your chat() call is in.

export const action = async ({ request }: Route.ActionArgs) => {
	void request
	void chat
	void toServerSentEventsResponse
	void openRouterText
	void MessagesPayload
	return new Response('TODO: implement chat endpoint', { status: 501 })
}
```

**Focal change in the solution** (~11 lines, no imports, no Zod authoring):

```tsx
const adapter = openRouterText('openai/gpt-oss-120b:free')

export const action = async ({ request }: Route.ActionArgs) => {
	const parsed = MessagesPayload.safeParse(await request.json())
	if (!parsed.success) {
		return new Response(parsed.error.message, { status: 400 })
	}
	const { messages } = parsed.data

	const stream = chat({ adapter, messages })
	return toServerSentEventsResponse(stream)
}
```

## What the learner does NOT write in this exercise

- ❌ **Imports** — every identifier the learner consumes is pre-imported
- ❌ **The Zod schema** — `MessagesPayload` is pre-built in `app/schemas/chat.ts`. Learners read it for context; they don't write it. Zod is not part of the lesson.
- ❌ The action signature or RR type wiring
- ❌ Any JSX or styling
- ❌ The hand-rolled fetch on the client (scaffold; Ex02 deletes it)
- ❌ Prisma / DB queries

The focal surface is ~12 lines inside one file.

## Risks

- **Hand-rolled fetch fragility.** The scaffold's hand-rolled fetch POSTs `{ messages: [{ role, content }] }`. Keep this matched with `MessagesPayload`'s expected shape until Ex02 deletes the hand-rolled fetch.
- **TS `noUnusedLocals`** in the base `@epic-web/config/typescript`. The `void` references in the scaffold keep it quiet until the imports are consumed.

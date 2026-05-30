# Exercise 03 — Persona (Detailed Plan)

> **One concept:** establish the bot's identity and guardrails with a static system prompt so it's an EpicStore shopping assistant rather than a generic AI.
>
> Target time: **20–25 min** including intro + outro video.

## Pre-exercise state

After Ex02's outro, Kellie 🧝‍♀️ shipped UX polish (typing dots, error bubble + retry, stop button, finished submit guard, auto-scroll). The chat now feels smooth but is generic:

- Ask "what's the weather in Tokyo?" → it answers, with confidence
- Ask "write a Python function" → it does
- Ask anything off-shopping → it engages

It has no identity. That's wrong.

Scaffolding for this exercise:

- A new file `app/prompts/system.ts` with a `SYSTEM_PROMPT = ''` placeholder
- `api.chat.tsx` pre-imports `SYSTEM_PROMPT` from `#app/prompts/system.js`
- A 🐨 comment inside the action marks where the system message gets prepended

## Wrong attempt (intro framing + felt in the playground)

Open the panel, ask the bot anything off-topic. It cheerfully obliges. The bot is a generic AI, not an EpicStore employee.

## What the learner does

Marty 💰 hands the persona text in the README — learners place it.

1. In `app/prompts/system.ts`, fill in `SYSTEM_PROMPT` with the persona Marty 💰 provides.
2. In `api.chat.tsx`, pass `systemPrompts: [SYSTEM_PROMPT]` to the `chat()` call. TanStack AI accepts a `systemPrompts: string[]` parameter — system prompts are **not** smuggled into the messages array.
3. Re-run off-topic prompts and watch the bot deflect.

## Verification

- "What's the weather in Tokyo?" → bot says it's a shopping assistant, asks what you're looking for
- "Write a Python function..." → same deflection
- "Hi" → bot greets and asks what kind of products you're interested in

## Common stumbles

- Trying to prepend a `{ role: 'system', content: ... }` object to the `messages` array. TanStack AI's `ModelMessage.role` is `'user' | 'assistant' | 'tool'` — there's no `'system'` on the wire. Use `systemPrompts: [...]` on the `chat()` call instead.
- Prompt is too long and too restrictive → bot becomes robotic. The provided template balances guidance with naturalness.
- Forgetting "never invent products / prices" → bot will hallucinate later when we get to tools. Worth baking in from day one.

## Locked decisions

1. **Persona tone:** knowledgeable store clerk — helpful, concise, not pushy
2. **Guardrail strictness:** strict deflection on off-topic
3. **Prompt lives at:** `app/prompts/system.ts` (extracted constant, set up for the page-context exercise that follows)

## Code surface — what the learner actually types

**Pre-built scaffold — `app/prompts/system.ts`:**

```ts
// 🐨 Fill in SYSTEM_PROMPT with the EpicStore shopping assistant persona.
//    Marty 💰 has the text for you in the README.
export const SYSTEM_PROMPT = '' // TODO
```

**Pre-built scaffold — relevant slice of `app/routes/api.chat.tsx`:**

```tsx
// SYSTEM_PROMPT is pre-imported at the top of the file.

// ... inside the action, after parsing:

const stream = chat({
	adapter,
	// 🐨 Pass `systemPrompts: [SYSTEM_PROMPT]` here. The model is baked into
	//    the adapter, so no separate `model:` field is needed.
	messages,
})
```

**Focal change — `app/prompts/system.ts`** (the prompt text Marty 💰 hands them):

```ts
export const SYSTEM_PROMPT = `You are EpicStore's shopping assistant.

Help users find products, compare options, and decide what to buy. Keep replies short and conversational, like a knowledgeable store clerk.

Rules:
- Stay focused on shopping. If a user asks something off-topic, politely steer them back.
- Never invent products, prices, stock, sizes, or reviews. If you don't know, say so.
- When you don't have enough information about the current product, ask a clarifying question.`
```

**Focal change — `app/routes/api.chat.tsx`** (1 line, no imports):

```tsx
const stream = chat({
	adapter,
	systemPrompts: [SYSTEM_PROMPT],
	messages,
})
```

## What the learner does NOT write in this exercise

- ❌ **Imports** — `SYSTEM_PROMPT` is pre-imported in `api.chat.tsx`
- ❌ JSX, styling, or anything client-side
- ❌ A dynamic prompt builder (that's Ex04)
- ❌ Prisma / DB queries

The focal surface is the persona text + one line in the action.

## Risks specific to Exercise 03

- **Persona prompt drift.** The provided template is opinionated. If your real EpicStore brand voice differs, swap before live delivery — the persona should match the visible brand the learner sees on the site.

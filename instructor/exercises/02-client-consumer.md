# Exercise 02 — Client Consumer (Detailed Plan)

> **One concept:** replace the hand-rolled fetch in the floating chat panel with TanStack AI's canonical `useChat` consumer.
>
> Target time: **25–35 min** including intro + outro video.

## Pre-exercise state

The learner inherits Ex01's outcome:

- `/api/chat` is wired to TanStack AI's `chat()` + OpenRouter, returns a real SSE stream, and rejects malformed payloads with a 400.
- The floating panel still uses the hand-rolled `fetch` — submitting a message renders the raw SSE `data:` frames inside a `<pre>` block. Multi-turn doesn't work (the hand-rolled fetch ignores prior messages). Streaming "works" but the UX is rough.

Pieces marked 💣 since the workshop began, about to be deleted:

- `reply`, `error`, `isLoading` `useState` calls
- The `sendHandRolled` async function
- The `<pre>{reply}</pre>` + `<div>⚠️ {error}</div>` JSX inside the messages area
- The `onSubmit={sendHandRolled}` reference on the form

`useChat` and `fetchServerSentEvents` are pre-imported from `@tanstack/ai-react`.

## Wrong attempt (felt in the playground)

Open a product. Submit one message — the SSE `data:` frames stream into a `<pre>`. Submit a follow-up — same thing, but the bot has no memory of the first turn (the hand-rolled fetch only ever sends a single user message). The bot is amnesiac.

Plus the raw SSE rendering is hostile. We can do better.

## What the learner does

`useChat` and `fetchServerSentEvents` are pre-imported.

1. Call `useChat({ connection: fetchServerSentEvents('/api/chat') })` and destructure `messages`, `sendMessage`, `isLoading`.
2. 💣 Delete the four hand-rolled pieces (state, function, JSX, form handler reference) listed in the pre-exercise state.
3. Paste in the small messages-list JSX block Marty 💰 provides in the README (renders `messages.map(m => ...)` with user vs assistant styling — same look as the existing welcome bubble).
4. Change the form's submit handler to call `sendMessage(draft); setDraft('')` directly instead of `sendHandRolled`.

The result: same component, fewer lines, real streaming UX, real multi-turn memory.

## Verification

- Open a product, click the bubble, panel expands
- Type "hello" + Enter → tokens stream into a left-aligned assistant bubble live, token-by-token
- Type a follow-up like "tell me more" → previous turn is remembered (multi-turn works)
- Network tab: one SSE request per send, payload includes the full prior conversation

## Common stumbles

- Forgetting to delete one of the 💣 pieces → TypeScript complains about a duplicate `isLoading` identifier. The README's 🚨 Alfred section calls this out.
- Open/closed panel state accidentally derived from `useChat` (it shouldn't be — `isOpen` stays local component state).
- Hydration warning if `useChat`'s internal effects mismatch SSR. **Mitigation if it bites:** render the message list only after a `mounted` flag flips client-side.

## End-of-exercise state

- The floating panel uses `useChat` + `fetchServerSentEvents`
- Streaming, multi-turn, send-button disable while in-flight all work
- All 💣 hand-rolled code is gone
- **Limitation by design:** the bot still has no idea what page the user is on. Ask "what is this product?" and it says it doesn't know. This is the cliffhanger that motivates Ex03 (Persona) and Ex04 (Page Context).

## Handoff to Exercise 03 — Kellie's PR 🧝‍♀️

The workshop intro for Ex03 frames it as: while you were finishing your coffee, Kellie pushed a PR with the UX polish on the chat panel. The Ex03 starter inherits, but the learner doesn't author:

- Typing-dots indicator while a response is in flight (placeholder assistant bubble until the first token arrives)
- Inline error bubble + retry button when `error` is set
- Stop button while streaming that calls the abort path
- Submit guard (disabled while empty or while in-flight) finished
- Auto-scroll-to-bottom polish

This keeps Ex02 focused on the canonical hook wiring and Ex03 focused on the persona, without dropping production polish on the floor.

## Locked decisions

1. **Welcome bubble in the empty state:** yes, static text (carried over from Ex01 scaffolding)
2. **UX polish placement:** Kellie's PR between Ex02 and Ex03

---

## Code surface — what the learner actually types

> **Discipline:** the only code the learner writes in this exercise is the `useChat` hook wiring + a small JSX paste from Marty 💰. Everything else — JSX scaffolding, styling, form structure, the entire panel chrome — is pre-built.

### Pre-built scaffold of `app/components/product-chat.tsx` (excerpt)

The component already has open/close toggle, panel chrome, welcome bubble, input form with draft state and Enter-to-submit, dark mode, and styling. The 💣 pieces to delete:

```tsx
// 💣 Hand-rolled chat state — to be replaced by `useChat`.
const [reply, setReply] = useState('')
const [error, setError] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)

// 💣 Hand-rolled chat submission — to be replaced by `useChat`'s sendMessage.
async function sendHandRolled(event: React.FormEvent) {
	event.preventDefault()
	if (!draft.trim() || isLoading) return
	setError(null); setReply(''); setIsLoading(true)
	try {
		const res = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages: [{ role: 'user', content: draft }] }),
		})
		if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
		setReply(await res.text()); setDraft('')
	} catch (err) {
		setError(err instanceof Error ? err.message : String(err))
	} finally { setIsLoading(false) }
}

// ...inside the messages area:
{reply ? <pre>{reply}</pre> : null}
{error ? <div>⚠️ {error}</div> : null}

// ...on the form:
<form onSubmit={sendHandRolled}>
```

**Pre-imported at the top of the scaffold** (learner doesn't write):

```tsx
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
```

### Focal change in the solution (3 small edits, no imports, no new files)

1. **Replace the 💣 state + function with the hook:**
   ```tsx
   const { messages, sendMessage, isLoading } = useChat({
   	connection: fetchServerSentEvents('/api/chat'),
   })
   ```
2. **Replace `<pre>{reply}</pre>` + the error bubble** with Marty 💰's messages-list JSX snippet (in the README). `useChat` returns each message as `{ id, role, parts: Array<MessagePart> }` — there's no `m.content` on a UIMessage. We iterate `m.parts` and render each text part:
   ```tsx
   {messages.map((m) => (
   	<div
   		key={m.id}
   		className={
   			m.role === 'user'
   				? 'ml-auto max-w-[80%] rounded-lg bg-amber-600 p-3 text-sm text-white'
   				: 'max-w-[80%] rounded-lg bg-stone-100 p-3 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200'
   		}
   	>
   		{m.parts.map((part, i) =>
   			part.type === 'text' ? <span key={i}>{part.content}</span> : null
   		)}
   	</div>
   ))}
   ```
   Other part types (`'tool-call'`, `'tool-result'`, `'thinking'`, etc.) will start appearing in later exercises — we render `null` for them here and add real handling when they become relevant.
3. **Change the form's submit handler** to call `sendMessage(draft); setDraft('')` directly instead of `sendHandRolled`.

After the edits, the file is shorter than the scaffold and the panel now streams tokens live, supports multi-turn, and uses TanStack AI's canonical SSE consumer.

---

## What the learner does NOT write in this exercise

- ❌ **Imports** — every identifier the learner consumes is pre-imported in the scaffold
- ❌ Any JSX or Tailwind classes beyond Marty 💰's pasted messages-list block
- ❌ Form input HTML, draft state, or send-button styling
- ❌ Open/close panel toggle logic
- ❌ Welcome message text or empty-state styling
- ❌ Dark mode rules
- ❌ Prisma / DB queries
- ❌ Server-side code (Ex01 is done)
- ❌ TypeScript message type (`useChat` infers it)

The focal surface is ~3 small edits inside one file.

## Risks specific to Exercise 02

- **`useChat` API surface details** — message shape, status flags, exact field names — are not 100% confirmed from the TanStack AI quick-start. Verify against the live API when authoring. Plan accounts for this with "verify when authoring" notes.
- **Hydration in RR 7 framework mode.** `useChat` likely does internal `useEffect` work. If SSR triggers a mismatch, learners hit warnings. Mitigation: a `mounted` gate.
- **Cost during live delivery.** Same as Ex01 — cents.

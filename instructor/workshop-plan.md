# Workshop: AI-Powered Apps with TanStack AI

> **Status:** Draft v2 — outline mapped to the real starter app. Review before any exercise code is written.

## Overview

- **Duration:** 5–6 hours (1 day, including breaks)
- **App Type:** Project app — single React Router 7 e-commerce starter (the `01.problem.infinite-fetching-with-fetchers` baseline you copied in)
- **Testing:** In-browser verification (chat is visual + interactive); Playwright tests for tools with deterministic outputs (search, comparison, size suggestion)
- **Stack (the one opinionated path):**
  - **React Router 7 (framework mode)** — host framework, already in the starter
  - **Prisma + SQLite** — already wired, real product/brand/category/variation/review data
  - `@tanstack/ai` core + `@tanstack/ai-react` (`useChat`)
  - **OpenRouter** adapter (one key, swappable models)
  - `@tanstack/ai-code-mode` + `@tanstack/ai-isolate-node` for code mode in the final exercise (V8 isolates via `isolated-vm`)
  - **Zod** for tool inputs and structured-output schemas

## Target Audience

- **Primary audience:** React developers who have never wired up an AI feature
- **Experience level:** Intermediate React + React Router. No AI experience required.
- **What they already know:** React, React Router 7 loaders/actions, basic TypeScript, async/await, Prisma basics
- **What they don't know yet:** LLMs, streaming, prompt design, tool calling, structured output, when to use the LLM vs deterministic code

## Workshop Series Context

- **Previous workshop:** None directly — but the starter is the final state of the React Router Fundamentals workshop, so anyone who took that lands here ready to go
- **Follow-up workshops planned:**
  - **#2 — Generative Media:** dedicated image + video gen, multi-step media pipelines
  - **#3 — Agentic Workflows:** multi-step tool-calling loops, planning, autonomous flows
- **Deferred to follow-up:**
  - Video generation
  - Multi-step planning agents / autonomous loops
  - Embeddings, RAG, vector search
  - Production observability (Helicone, LangSmith, etc.)

## Learning Outcomes

By the end of this workshop, learners will be able to:

1. Wire `useChat` against a TanStack AI adapter (OpenRouter) and stream responses inside a React Router app
2. Pass page context (the currently-viewed product) into the system prompt so the bot is aware of where the user is
3. Define server-side tools with `toolDefinition().server()` backed by Prisma queries
4. Define client-side tools with `.client()` that mutate UI state (cart, navigation)
5. Gate destructive tools behind a tool-approval flow
6. Generate structured output with a Zod schema and render it as a typed UI component
7. Use TanStack AI's **code mode** to let the model orchestrate multiple tools in a single sandboxed TypeScript program (V8 isolate)
8. Reason about when to use a tool, a system prompt, structured output, or code mode for a given problem

## Prerequisites

- React Router 7 fundamentals (loaders, actions, components, fetchers)
- Basic TypeScript + Prisma
- Node.js v24+, npm v9+
- An OpenRouter API key (free tier is fine)
- Native compilation toolchain for the final exercise (`isolated-vm` — see notes per OS in the prereq doc)

## Example App: An AI Assistant on the Product Detail Page

The chatbot **lives on the product detail page** (`app/routes/_landing/products/$productId.tsx`). It's contextually aware of the product the user is currently viewing. This is the spine of every exercise — every feature the learner builds is the assistant getting smarter about helping the user buy *this product*.

By the end, the assistant can:

- Discuss the current product
- Search the catalog and surface related products
- Suggest a size based on the product's variations and review feedback
- Compare this product against alternatives in a structured table
- Add a configured variation (size + color) to the cart, behind user approval
- Compose multi-step workflows via code mode: in one prompt, search → compare → suggest a size, all orchestrated as a single sandboxed program

**Out-of-scope code that the starter ships with (learners do not edit):** product list, infinite scroll, related products, breadcrumbs, header/footer, ToS pages. Per the avoid-distraction principle, the `instructor/` and `epicshop/` instructions explicitly tell the learner: "you only edit these files." Everything else is provided.

**Workshop-only scaffolding the starter must add before exercise 01** (i.e., these are pre-built, not exercises):

- A `<ChatPanel />` placeholder slot on the product detail page (an empty card with a "chat coming soon" state)
- A working `CartProvider` + `useCart()` hook (replaces the hardcoded mock array in `app/routes/_landing/cart.tsx`). Adding cart state is plumbing, not the lesson.
- An `app/routes/api.chat.tsx` resource route stub (empty — exercises fill it in)

## Exercise Plan

### 01. First Chat on the Product Page

**Concept:** Get from zero to a streaming LLM response inside the product page, contextually aware of the current product.

**Files learners touch:**
- `app/routes/api.chat.tsx` (resource route — server adapter)
- `app/components/product-chat.tsx` (the chat panel UI — new, scaffolded empty)
- `app/routes/_landing/products/$productId.tsx` (slot the chat panel in)

**Steps:**
- `01.problem.adapter`: Wire the OpenRouter adapter inside `api.chat.tsx`. Send a hardcoded message via `chat()`, log the response. *Wrong attempt to demonstrate: hand-rolled `fetch` to the OpenRouter REST API — verbose, no streaming, no types.*
- `02.problem.use-chat`: Replace the chat panel placeholder with `useChat`. User can type a message; assistant responds (non-streaming).
- `03.problem.system-prompt`: Inject the current product (name, brand, price, description, available sizes/colors) into the system prompt so the bot knows what page the user is on. Confirm: bot answers "what color is this?" correctly.
- `04.problem.streaming`: Convert to streaming. Render token-by-token. Handle loading/error/abort. *Wrong attempt: buffer the stream and show all at once.*

**Key Takeaway:** TanStack AI gives you a typed `useChat` + streaming for free. The win for product pages is wiring real page context into the system prompt.

### 02. Searching the Catalog (Server Tools)

**Concept:** Stop the LLM from making up products by giving it a typed tool backed by Prisma.

**Files learners touch:**
- `app/routes/api.chat.tsx` (register tool)
- `app/domain/products.server.ts` (already has search helpers — wrap them in a tool)
- `app/components/product-chat.tsx` (render tool call results as `<ProductCard />`s)

**Steps:**
- `01.problem.hallucination`: Ask "do you have anything by Patagonia under $100?" Watch the bot make up SKUs. *(This IS the wrong attempt — the failure is the lesson.)*
- `02.problem.search-tool`: Define `searchProducts` with `toolDefinition({ inputSchema: z.object({ query, brand?, priceMax? }), outputSchema }).server(...)` that wraps the existing search query.
- `03.problem.render-results`: When the tool returns, render the products as `<ProductCard />`s inline in the chat thread (reuse the existing component — no new design work).
- `04.problem.details-tool`: Add `getProductDetails` for follow-up questions ("does this one come in a medium?"). Show the model chaining tool calls.

**Key Takeaway:** Tools ground the LLM in your real data. The model decides *when* to call them; you decide *what they expose*.

### 03. Suggesting Products From a User's Need

**Concept:** Move from "here's what I asked for" to "here's what I need" — let the model interpret natural language and pick the right filters.

**Files learners touch:**
- `app/routes/api.chat.tsx` (extend tool inputs, add `suggestSize`)
- `app/domain/products.server.ts` (richer query function with category, size-availability, rating filters)

**Steps:**
- `01.problem.rich-search`: Extend `searchProducts` to accept richer filters — `category`, `availableSize`, `minRating`, `priceRange`. The model picks how to fill them when the user says "running shoes for cold weather size 10."
- `02.problem.size-reasoning`: Add a `suggestSize` tool that reads the current product's `variations` (size + stock) and recent `reviews` ("runs small", "true to size", "fits big") and returns a recommendation with the rationale text. *This is the meaty production-flavored step — show what an LLM unlocks vs. a rules engine.*

**Key Takeaway:** A small set of well-shaped tools + the LLM's natural-language understanding replaces a lot of UI filter machinery.

### 04. Comparing Products (Structured Output)

**Concept:** When the answer is data, not prose, use structured output.

**Files learners touch:**
- `app/routes/api.chat.tsx` (define schema, return structured output from a comparison tool)
- `app/components/product-chat.tsx` (render schema → typed component)
- `app/components/product-comparison.tsx` (new — typed comparison table)

**Steps:**
- `01.problem.fragile-parse`: Ask "compare this product to the two related ones below." Try to parse the free-form markdown response. Watch it break when the model varies the format. *(Built-in wrong attempt.)*
- `02.problem.schema`: Define a Zod schema for `ProductComparison` (array of products × rows: price, rating, available sizes, key features, verdict).
- `03.problem.structured-output`: Use TanStack AI's structured-output API to enforce the schema.
- `04.problem.render`: Render the schema as `<ProductComparison />`. Zero parsing.

**Key Takeaway:** If the UI takes a shape, give the model the shape.

### 05. Adding to Cart (Client Tools + Approval)

**Concept:** Mutating tools live on the client and must be approved by the user.

**Files learners touch:**
- `app/routes/api.chat.tsx` (`toolDefinition` for `addToCart`, no `.server()` — client only)
- `app/components/product-chat.tsx` (`.client()` impl that calls `useCart().addItem(...)`)
- `app/components/product-chat.tsx` (approval UI — approve/deny inline)

**Steps:**
- `01.problem.client-tool`: Define `addToCart` with **only** a `.client()` implementation that calls the `useCart` hook. Why this can't be a server tool (the cart is per-browser-session in this app).
- `02.problem.dangerous-no-approval`: Wire it up with no guard. Ask "buy two of these in size 10 black." Watch it execute silently. *(Built-in wrong attempt.)*
- `03.problem.approval-flow`: Gate the tool behind `useChat`'s approval flow. Render approve/deny UI inline.
- `04.problem.policy`: Discussion step (no code) — which tools need approval? Read-only never; mutating always; purely-suggestion sometimes.

**Key Takeaway:** Client tools are the right home for UI mutations. Approval is non-optional for anything destructive.

### 06. Code Mode — Let the Model Orchestrate Tools as a Program

**Concept:** Compound user requests ("find blue jackets under $200, sort by rating, suggest a size for the top one") are slow and brittle when the model takes one tool call at a time. **Code mode** lets the model write a single TypeScript program that calls all the tools — composed with `Promise.all`, branching, and aggregation — and runs it in a sandboxed V8 isolate.

**Files learners touch:**
- `app/routes/api.chat.tsx` (wire `createCodeMode` + `createNodeIsolateDriver`, swap individual tools for the single code-mode tool)
- `app/components/product-chat.tsx` (optional: render the generated TypeScript so the user can see what the model wrote)

**Steps:**
- `01.problem.tool-call-explosion`: Ask "find blue jackets under $200, compare the top three by review score, and suggest a size for the highest-rated one." Watch the existing chat make 4–6 sequential tool calls — slow, expensive, easy to derail. *(Built-in wrong attempt — this is the limit of the tool-calling pattern from earlier exercises.)*
- `02.problem.code-mode`: Install `@tanstack/ai-code-mode` + `@tanstack/ai-isolate-node`. Wire `createCodeMode({ driver: createNodeIsolateDriver(), tools: [searchProducts, getProductDetails, suggestSize, compareProducts], timeout: 30_000 })`. Pass the returned `tool` and `systemPrompt` into `chat()`. Re-run the same prompt — the model now writes one TypeScript program that calls `external_searchProducts`, `external_compareProducts`, `external_suggestSize` together (often via `Promise.all`), and the isolate runs it in a single round trip.
- `03.problem.show-the-code` *(optional, cut if running short)*: Render the generated TypeScript inline in the chat so the user can see the orchestration plan.

**Key constraint to teach:** Code mode runs in a server-side isolate with no host filesystem, network, or process access. **Mutating client tools (like `addToCart` from exercise 05) are not available inside the sandbox.** Mutations still go through the client-tool + approval flow. This is a feature, not a limitation: read-side compound queries get one shot; mutations stay user-gated.

**Key Takeaway:** When a single user prompt fans out into multiple read-side tool calls, give the model a sandbox and let it write code. Tool-call-per-step is fine for simple flows; code mode is the right tool for compound queries.

## Workshop Outro

- Recap: what's now in the learner's hands (a contextual, tool-using, structured-output product assistant that can compose compound queries via code mode)
- Tease workshop #2 (generative media — image + video via fal and friends) and workshop #3 (agentic workflows — planning, multi-turn loops, autonomous flows)
- Resources: TanStack AI docs, OpenRouter, the code-mode docs

## Out of Scope

- Auth, payments, real checkout
- Vector search / RAG / embeddings
- Production observability and tracing
- Multi-tenant prompt management
- Model fine-tuning
- Cart persistence to a database (the cart stays in client state for this workshop — keeps the focus on AI, not on Prisma plumbing)

## Deferred to Follow-Up Workshops

- **Workshop #2 — Generative Media:** dedicated image + video, multi-step media pipelines, prompt engineering for visual output
- **Workshop #3 — Agentic Workflows:** planning loops, multi-step tool execution, agent-of-agents, long-running tasks

## Potential Bonus Content (cut if running short)

- Swapping OpenRouter for Ollama to run locally (tip-style add-on, not an exercise)
- Cost tracking — wrapping the adapter to log token usage
- Persisting chat history across reloads via localStorage

## Files the Starter Must Ship Before Exercise 01

These are *not* exercises — they're scaffolding the learner inherits.

| File | Purpose |
|------|---------|
| `app/components/product-chat.tsx` | Empty chat panel placeholder, slotted into `$productId.tsx` |
| `app/contexts/cart.tsx` (or `app/hooks/use-cart.ts`) | A real `CartProvider` + `useCart()` hook. Replaces the hardcoded mock in `cart.tsx`. |
| `app/routes/api.chat.tsx` | Empty resource route stub for the chat backend |
| `app/routes/_landing/products/$productId.tsx` | Slot `<ProductChat />` into the existing layout (right column, below "Add to Cart"?) |
| `.env.example` | `OPENROUTER_API_KEY=`, optional `FAL_API_KEY=` |

## Risk Notes

- **TanStack AI is alpha** (released early 2026). API surface may shift before the workshop is stabilized via live deliveries. Plan for a re-record if a major API change lands.
- **OpenRouter rate limits** on the free tier may bite during a live workshop with 30+ attendees. Have learners create their own keys in the prereqs.
- **`isolated-vm` requires native compilation** for the code-mode exercise. Windows learners may need build tools installed (`windows-build-tools` or VS C++ build tools); macOS needs Xcode CLT; Linux needs `build-essential`. Document this in the prereqs and have a fallback (`createQuickJSDriver()` runs in WASM anywhere) ready if a learner can't build natively.
- **Cart implementation:** keeping cart in client state (no DB) is a deliberate scoping decision. If a learner asks "how do I persist the cart?" — that's a bonus / follow-up answer, not in scope.

## Locked Decisions (v2 review)

- **Title:** *AI-Powered Apps with TanStack AI*
- **Chat placement:** floating panel, bottom-right of the product detail page
- **Cart scaffolding:** React context, no DB persistence
- **Final exercise:** Code Mode with the Node V8 isolate driver (replaces image gen — image gen moves entirely to workshop #2)

## Still Open

- **Exercise 03 step 1 (rich-search) — fold or keep?** Decide when we get into step-level detail.

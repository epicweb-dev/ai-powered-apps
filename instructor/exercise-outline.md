# Exercise Outline — Learner Journey

> Companion to `workshop-plan.md`. The plan is what we're building; this is what the learner *does* in every step.

For each step:

- **Before:** what they see when they open the playground at that step
- **They do:** the concrete actions they take
- **After:** what's now different — the observable win
- **Wrong-attempt callouts:** where the problem-before-solution principle lives

---

## Pre-workshop (provided by the starter)

Learner opens the playground in their editor and runs `npm run dev`. They see the EpicStore homepage. They click into any product. On the product detail page, an amber **chat bubble** floats in the bottom-right corner. Clicking it expands a panel with a header ("Shopping Assistant — About: {product name}"), a disabled text input, and a placeholder bubble:

> 👋 Hi! I'll be your shopping assistant. The chat experience is being built across the upcoming exercises — for now this panel is just a placeholder slot.

The cart works manually. The chat does nothing. That's the starting state.

---

## Exercise 01 — First Chat on the Product Page

**Outcome of the whole exercise:** the panel streams real, page-aware replies from OpenRouter.

### 01.problem.adapter — Wire the OpenRouter adapter

- **Before:** `app/routes/api.chat.tsx` returns `501 chat endpoint not implemented yet`. The UI input is still disabled.
- **They do:**
  - Drop their OpenRouter API key into `.env` (`OPENROUTER_API_KEY=…`)
  - Import `chat` from `@tanstack/ai` and `createOpenRouter` from `@tanstack/ai-openrouter`
  - In the route's `action`, read the user message from the request body, call `chat({ adapter, model, messages })`, return the assistant text
  - From a second terminal: `curl -X POST localhost:3000/api/chat -d '{"message":"hello"}'` and see a real model reply
- **After:** The server endpoint talks to a real LLM. UI still doesn't use it yet — verified by curl only. This is deliberate: prove the path one piece at a time.
- **Wrong-attempt callout:** "You could hand-roll `fetch()` to OpenRouter's REST API directly." Instructor shows why we don't — no typed tool calling, no streaming helpers, no provider swap.

### 01.problem.use-chat — Wire `useChat` into the floating panel

- **Before:** Panel input is disabled. The endpoint works in curl but the UI doesn't call it.
- **They do:**
  - Import `useChat` from `@tanstack/ai-react` in `product-chat.tsx`
  - Point it at `/api/chat`
  - Enable the input; render the `messages` array as a list (user bubbles right-aligned, assistant left-aligned)
- **After:** Type "what is this product?" in the panel, hit enter, get a non-streamed reply. **But:** the bot says "I don't know what product you're looking at" — sets up the next step.

### 01.problem.system-prompt — Inject the current product as context

- **Before:** Bot is page-blind.
- **They do:**
  - The scaffolding already passes the product into `<ProductChat product={…} />` — they now use it
  - Templating the product name, brand, price, and description into a `systemPrompt` that goes into the `chat()` call
- **After:** Ask "what's the price?" → correct price. Ask "what's it made of?" → grounded in the description. The bot finally feels page-aware.

### 01.problem.streaming — Stream tokens

- **Before:** Replies arrive as one block after a 2–4s pause. Feels broken next to ChatGPT.
- **They do:**
  - Switch the `chat()` call to stream mode
  - Have `useChat` consume the stream and render tokens as they arrive
  - Add a typing indicator while pending
- **After:** Replies appear word-by-word. The panel feels alive.
- **Wrong-attempt callout:** "You could buffer the stream server-side and render the full reply" — defeats the point of streaming UX.

**End of exercise 01:** The chat panel streams contextual replies about the current product. It still hallucinates product details for anything beyond the current page.

---

## Exercise 02 — Searching the Catalog (Server Tools)

**Outcome:** the bot stops making up products and starts answering from the real catalog.

### 02.problem.hallucination — Witness the lying

- **Before:** Bot is contextually aware of the *current* product but lies about everything else.
- **They do:**
  - Ask 2–3 questions about *other* products: "do you have anything by Patagonia under $100?", "what's your cheapest jacket?", "do you carry Nike?"
  - Compare to `/products` — confirm the bot invented SKUs, fake brands, wrong prices
- **After:** No code changed. The pain is felt. (This step IS the wrong attempt.)

### 02.problem.search-tool — Define `searchProducts`

- **They do:**
  - Import `toolDefinition` from `@tanstack/ai` and `z` from `zod`
  - Define `searchProducts({ query, brand?, priceMax? })` with a Zod input schema + output schema
  - Implement `.server(async (input) => …)` calling the existing `products.server.ts` search helpers
  - Register the tool in the `chat({ tools: [searchProducts] })` call
- **After:** Same Patagonia question → bot calls the tool, returns real product names + real prices. No more inventions.

### 02.problem.render-results — Render tool results as ProductCards

- **Before:** Tool results show up as text bullets in the chat thread.
- **They do:**
  - Inspect the tool-call payload that `useChat` exposes
  - When a `searchProducts` result arrives, render `<ProductCard product={…} />` inline instead of plain text (reusing the existing component)
- **After:** Chat thread shows real product cards with image, price, brand. Clicking a card navigates to that product's detail page.

### 02.problem.details-tool — Add `getProductDetails`

- **They do:**
  - Define `getProductDetails({ productId })` returning variations + reviews
  - Register alongside `searchProducts`
- **After:** Ask "do those Patagonia jackets come in medium?" → bot first calls `searchProducts`, then chains a `getProductDetails` call on the top result, then answers correctly with the variation table.

**End of exercise 02:** Bot is grounded in real catalog data. Tool results render as native `ProductCard`s.

---

## Exercise 03 — Suggesting Products From a User's Need

**Outcome:** natural-language requests like "running shoes for cold weather size 10" land on the right products; sizing advice quotes real review data.

### 03.problem.rich-search — Extend filters

- **Before:** `searchProducts` only takes `query`, `brand`, `priceMax`. Bot has to guess when the user says "size 10" or "category: shoes".
- **They do:**
  - Extend the input schema to add `category`, `availableSize`, `minRating`
  - Update the Prisma query in `products.server.ts` to support those filters
- **After:** "Running shoes for cold weather size 10" → bot picks `category: "shoes"`, `availableSize: "10"`, returns only matching variations.

### 03.problem.size-reasoning — `suggestSize` tool

- **Before:** "Should I get size 10 or 11?" → generic LLM guess, no data.
- **They do:**
  - Define `suggestSize({ productId })`
  - Server impl reads:
    - The product's `variations` (which sizes are in stock)
    - Recent `reviews` (`runs small`, `true to size`, etc.)
  - Returns `{ recommendedSize, rationale, confidence }`
- **After:** Bot quotes real review text — *"Three reviewers said this runs small, so go up half a size."* Production-flavored, grounded in real data.

**End of exercise 03:** Bot bridges casual natural language to filtered DB queries, and reasons over real review data for sizing.

---

## Exercise 04 — Comparing Products (Structured Output)

**Outcome:** comparison requests return a typed comparison table, not brittle markdown.

### 04.problem.fragile-parse — Try to parse free-form markdown

- **Before:** Ask "compare this jacket to the two related ones below." Bot replies with markdown — sometimes a table, sometimes bullets, sometimes prose.
- **They do:**
  - Attempt to write a parser that turns the free-form reply into UI data
  - Try a few questions, watch the format vary, watch the parser break
- **After:** Learner has felt the parsing pain. (Wrong-attempt step.)

### 04.problem.schema — Define the comparison schema

- **They do:**
  - Write a Zod schema:
    ```ts
    z.object({
      products: z.array(z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number(),
        rating: z.number(),
        sizesAvailable: z.array(z.string()),
        keyFeatures: z.array(z.string()),
      })),
      verdict: z.string(),
    })
    ```
- **After:** Schema lives in the codebase. Not wired yet.

### 04.problem.structured-output — Wire structured output

- **They do:**
  - Use TanStack AI's structured-output API in a new `compareProducts` tool
  - Pass the schema as the output shape — the model must conform
- **After:** Every comparison call returns a typed object. No parsing.

### 04.problem.render — Render as a typed component

- **They do:**
  - Build `<ProductComparison data={…} />` — side-by-side cards or a table, with verdict at the bottom
  - Render it inline when the tool returns
- **After:** "Compare these three" → chat shows a clean comparison UI, including the model's verdict. Looks like a feature, not a chatbot.

**End of exercise 04:** Structured data → typed UI. The pattern generalizes to any "the answer is a shape, not prose" case.

---

## Exercise 05 — Adding to Cart (Client Tools + Approval)

**Outcome:** the bot can take real actions in the app, but only with user approval. Read-only tools stay frictionless.

### 05.problem.client-tool — Define `addToCart` as a client tool

- **Before:** Cart only fills when the user clicks "Add to Cart" on the page. Bot can talk *about* the cart but not modify it.
- **They do:**
  - Define `addToCart({ productId, name, brand, price, imageUrl, size, color, quantity })`
  - Implement with `.client()` *only* — no server impl
  - The `.client()` impl uses a hook bridge to call `useCart().addItem(…)`
  - Discusses *why* client-only: the cart lives in React context per-browser, the server has no view of it
- **After:** Bot CAN call `addToCart`. But no guard yet.

### 05.problem.dangerous-no-approval — Watch it run wild

- **They do:**
  - Tell the bot: "add three of these in size 10 black, two in size 11 white, and one of the related navy jacket in medium"
  - Watch it call `addToCart` six times silently
  - Open the cart page — full of stuff
- **After:** Pain felt. The bot is too trusted. (Wrong-attempt step.)

### 05.problem.approval-flow — Gate the tool

- **They do:**
  - Switch `addToCart` to require approval via `useChat`'s approval flow
  - Render inline approve / deny buttons in the chat thread for each pending tool call
  - Only on approve does the cart update
- **After:** Same six-item prompt → chat shows six pending approvals. User picks which to approve. Cart only reflects what they OK'd.

### 05.problem.policy — Discussion: which tools need approval

- **They do:**
  - Walk every tool defined so far:
    - `searchProducts` → read-only, no approval
    - `getProductDetails` → read-only, no approval
    - `suggestSize` → read-only, no approval
    - `compareProducts` → read-only, no approval
    - `addToCart` → mutating, **always approval**
  - Builds the mental model: read = frictionless, mutate = always gated
- **After:** Learner has a defensible policy they can apply to their own apps.

**End of exercise 05:** Bot takes real action, but never without user consent for destructive operations.

---

## Exercise 06 — Code Mode

**Outcome:** compound requests run in one shot via a model-written TypeScript program in a sandboxed V8 isolate.

### 06.problem.tool-call-explosion — Watch the chain break down

- **Before:** Bot has six tools. Each tool call is its own round trip.
- **They do:**
  - Ask: *"find blue jackets under $200, sort by rating, get the variations and reviews for the top three, suggest a size for the highest-rated one."*
  - Watch the chat:
    - `searchProducts` → ~1.5s
    - `getProductDetails` (top) → ~1.5s
    - `getProductDetails` (second) → ~1.5s
    - `getProductDetails` (third) → ~1.5s
    - `suggestSize` → ~1.5s
    - Final synthesis reply → ~1s
  - Notices the cumulative latency (~8–10s). Sometimes the bot loses the size step entirely.
- **After:** Limit of step-by-step tool calling felt. (Wrong-attempt step.)

### 06.problem.code-mode — Wire code mode

- **They do:**
  - Import `createCodeMode` from `@tanstack/ai-code-mode`, `createNodeIsolateDriver` from `@tanstack/ai-isolate-node`
  - Initialize:
    ```ts
    const { tool, systemPrompt } = createCodeMode({
      driver: createNodeIsolateDriver(),
      tools: [searchProducts, getProductDetails, suggestSize, compareProducts],
      timeout: 30_000,
    })
    ```
  - Pass `tool` into `chat({ tools: [tool] })` and merge `systemPrompt` into the system prompts
  - Re-run the same compound prompt
  - Watch the model emit ONE TypeScript program that calls `external_searchProducts`, then fans `external_getProductDetails` over the top three results in `Promise.all`, then `external_suggestSize`, and returns the composed result. Runs in the V8 isolate. ~2s total.
- **After:** ~5× faster on compound prompts. Feels almost instant.

### 06.problem.show-the-code *(optional, cut if running short)*

- **They do:**
  - Capture the generated program from the chat stream
  - Render it as a collapsible code block in the thread, with a "Generated plan" label
- **After:** Transparency. User and dev can both see exactly what the model "thought."

**Key teaching moment surfaced in the exercise:** `addToCart` from exercise 05 is a *client* tool. Code mode runs *server-side* in an isolate that has no host filesystem, no network, no client React context. Client tools are deliberately not available inside the sandbox. This is a feature: read-side compound queries get one shot; mutations stay on the client tool + approval path. The two patterns coexist.

**End of exercise 06:** The bot composes multi-step read-side queries as a single program. Mutations still go through the approval flow from exercise 05. Workshop is done.

---

## What the learner walks away with

By the end of the workshop, the floating bottom-right panel on every product page can:

- Stream contextual replies grounded in the current product
- Search the catalog and surface real `ProductCard`s
- Suggest sizes by reasoning over variations + real reviews
- Return typed product comparisons that render as a native component
- Add items to the cart under user approval
- Compose compound queries in a single sandboxed program via code mode

And they have a defensible mental model for *when* to reach for tools, structured output, approval flows, and code mode — including the seam between server-side code mode and client-side mutation tools.

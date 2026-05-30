<div>
  <h1 align="center"><a href="https://www.epicweb.dev/workshops/ai-powered-apps">AI-Powered Apps with TanStack AI</a></h1>
  <strong>
    Build a streaming AI shopping assistant on top of a real React Router app
  </strong>
  <p>
    Take a working React Router 7 e-commerce app and progressively layer in a production-grade AI shopping assistant: a streaming chat endpoint, a polished client UI built on <code>useChat</code>, page-aware system prompts, tools that hit a real Prisma catalog, structured output, approval flows for mutating actions, and finally code-mode orchestration running in a V8 isolate. By the end you've shipped real AI features into a real app — not a toy demo.
  </p>
</div>

<hr />

<div align="center">
  <a
    alt="Epic Web logo with the words Deployed Version"
    href="https://ai-powered-apps.epicweb.dev/"
  >
    <img
      width="300px"
      src="https://github-production-user-asset-6210df.s3.amazonaws.com/1500684/254000390-447a3559-e7b9-4918-947a-1b326d239771.png"
    />
  </a>
</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![GPL 3.0 License][license-badge]][license]
[![Code of Conduct][coc-badge]][coc]
<!-- prettier-ignore-end -->

## What you'll build

A floating AI shopping assistant pinned to the bottom-right of every product page in the included EpicStore e-commerce app. By the end of the workshop, the assistant can:

- Stream replies from an OpenRouter-backed LLM
- Stay grounded in the product the user is currently viewing
- Search the real Prisma-backed catalog through type-safe tools
- Recommend sizes by reasoning over real review data
- Return structured product comparisons that render as a typed React component
- Add items to the user's cart only after explicit approval

Every exercise lands in the same e-commerce app so the AI features feel like real product work, not isolated demos.

## Prerequisites

- Solid React fundamentals (components, hooks, state)
- Basic familiarity with React Router 7 (loaders, actions, framework mode)
- Basic TypeScript
- Comfort reading short Prisma queries (you won't write any in this workshop — the data layer is scaffolding)
- An [OpenRouter](https://openrouter.ai) account — the free tier is enough

You do **not** need prior experience with LLMs, prompt engineering, agents, or any other AI tooling. The workshop builds that mental model from zero.

## Pre-workshop Resources

These are optional but useful to skim before showing up:

- [TanStack AI overview](https://tanstack.com/ai/latest) — the library this workshop is built on
- [TanStack AI quick start](https://tanstack.com/ai/latest/docs/getting-started/quick-start) — the basic `chat()` + `useChat` pattern
- [React Router 7 framework mode](https://reactrouter.com/start/framework/installation) — the host framework

## System Requirements

- [git][git] v2.18 or greater
- [NodeJS][node] v24 or greater
- [npm][npm] v9 or greater
- A native C++ build toolchain (for the code-mode exercise — V8 isolates via `isolated-vm`):
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Linux:** `build-essential`
  - **Windows:** Visual Studio C++ build tools (the `npm install` should handle this automatically with the bundled `windows-build-tools`)

All of these must be available in your `PATH`. To verify:

```shell
git --version
node --version
npm --version
```

If you have trouble with any of these, learn more about the PATH environment variable and how to fix it here for [windows][win-path] or [mac/linux][mac-path].

## Setup

```sh nonumber
npx --yes epicshop@latest add ai-powered-apps
```

Then add your OpenRouter API key to the `.env` in any exercise playground:

```
OPENROUTER_API_KEY=your-key-here
```

If you experience errors during setup, please open [an issue][issue] with as many details as you can offer.

## The Workshop App

Learn all about the workshop app on the [Epic Web Getting Started Guide](https://www.epicweb.dev/get-started).

Make sure to complete [the Epic Workshop app Tutorial](https://github.com/epicweb-dev/epicshop-tutorial):

```
npx --yes epicshop@latest add epicshop-tutorial
```

<!-- prettier-ignore-start -->
[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[git]: https://git-scm.com/
[build-badge]: https://img.shields.io/github/actions/workflow/status/epicweb-dev/ai-powered-apps/validate.yml?branch=main&logo=github&style=flat-square
[build]: https://github.com/epicweb-dev/ai-powered-apps/actions?query=workflow%3Avalidate
[license-badge]: https://img.shields.io/badge/license-GPL%203.0%20License-blue.svg?style=flat-square
[license]: https://github.com/epicweb-dev/ai-powered-apps/blob/main/LICENSE
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://kentcdodds.com/conduct
[win-path]: https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/
[mac-path]: http://stackoverflow.com/a/24322978/971592
[issue]: https://github.com/epicweb-dev/ai-powered-apps/issues/new
<!-- prettier-ignore-end -->

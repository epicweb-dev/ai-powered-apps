import { aiDevtoolsPlugin } from '@tanstack/react-ai-devtools'

/**
 * Registers the TanStack AI Devtools panel as a tab inside
 * react-router-devtools. The rdt Vite plugin auto-discovers each named
 * export in its configured `pluginDir` and mounts it as a devtools plugin.
 */
export const aiDevtoolsRdtPlugin = aiDevtoolsPlugin()

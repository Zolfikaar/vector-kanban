import WebSocket from 'ws'

/**
 * Node.js < 22 has no native WebSocket. Supabase Realtime needs one at client
 * creation time. Public runtimeConfig cannot carry the `ws` constructor, so we
 * polyfill globalThis before any Supabase plugin or API route runs.
 */
export default defineNitroPlugin(() => {
  if (typeof globalThis.WebSocket === 'undefined') {
    globalThis.WebSocket = WebSocket as unknown as typeof globalThis.WebSocket
  }
})

/**
 * UrPulse server-side heartbeat for Nuxt/Nitro.
 *
 * Copy to: <kanban-app>/server/plugins/urpulse-heartbeat.ts
 * Remove any browser setInterval heartbeat from app.vue.
 *
 * Env (optional):
 *   URPULSE_CORE_URL=http://localhost:5252
 *   URPULSE_APP_ID=vector-kanban
 *   URPULSE_SERVICE_NAME=App-Server
 */
export default defineNitroPlugin(() => {
  const coreUrl = (process.env.URPULSE_CORE_URL || 'http://localhost:5252').replace(/\/$/, '')
  const appId = process.env.URPULSE_APP_ID || 'vector-kanban'
  const serviceName = process.env.URPULSE_SERVICE_NAME || 'App-Server'

  let intervalSeconds = 10
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  let configTimer: ReturnType<typeof setInterval> | null = null

  async function refreshClientConfig() {
    try {
      const res = await fetch(`${coreUrl}/api/pulse/client-config`)
      if (!res.ok) return

      const data = await res.json() as { heartbeatIntervalSeconds?: number }
      const next = Math.max(5, Math.min(60, Number(data.heartbeatIntervalSeconds) || 10))
      if (next !== intervalSeconds) {
        intervalSeconds = next
        console.log(`[UrPulse] Heartbeat interval synced from Core: ${intervalSeconds}s`)
        restartHeartbeatTimer()
      }
    }
    catch {
      // Core may be temporarily down — keep last known interval
    }
  }

  async function sendHeartbeat() {
    try {
      const res = await fetch(`${coreUrl}/api/pulse/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          serviceName,
          status: 'Healthy',
          metadata: {
            environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Local-Dev',
            runtime: 'nitro',
          },
        }),
      })

      if (!res.ok) {
        console.warn(`[UrPulse] Heartbeat rejected (${res.status}).`)
      }
    }
    catch {
      console.warn('[UrPulse] Heartbeat failed — Core unreachable.')
    }
  }

  function restartHeartbeatTimer() {
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    heartbeatTimer = setInterval(() => {
      void sendHeartbeat()
    }, intervalSeconds * 1000)
  }

  void (async () => {
    await refreshClientConfig()
    await sendHeartbeat()
    restartHeartbeatTimer()

    configTimer = setInterval(() => {
      void refreshClientConfig()
    }, 60_000)

    console.log(`[UrPulse] Server heartbeat started for ${appId}:${serviceName} every ${intervalSeconds}s → ${coreUrl}`)
  })()

  if (typeof process !== 'undefined') {
    const stop = () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      if (configTimer) clearInterval(configTimer)
    }
    process.once('exit', stop)
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
  }
})

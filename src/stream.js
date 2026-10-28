// Single shared SSE connection. Import `es` where you need it instead of using a global.
export const es = new EventSource('/stream')
window.addEventListener('beforeunload', () => es.close())

// Lookup caches used by the markdown renderer to resolve mentions
export const rolesCache = []
export const usersCache = []
export const channelsCache = []

es.onmessage = ev => {
  const data = JSON.parse(ev.data)
  rolesCache.push(...data.roles)
  usersCache.push(...data.users)
  channelsCache.push(...data.channels)
}

import superagent from 'superagent'

// Discord user IDs with access to developer-only settings
export const DEVELOPERS = ['254814547326533632']

export const isDeveloper = user => !!user && DEVELOPERS.includes(user.id)

// GET request that asks the server for a normal user's view while simulating one
export function get (url) {
  const req = superagent.get(url)
  return req
}

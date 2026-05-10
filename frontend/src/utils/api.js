// Centralised API helper — proxied through Vite to FastAPI on :8000
const BASE = '/api'

function getToken() {
  return localStorage.getItem('token') || ''
}

async function request(method, path, body = null) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json()
  return data
}

export const api = {
  // Auth
  signup: (body) => request('POST', '/auth/signup', body),
  login:  (body) => request('POST', '/auth/login',  body),

  // AI Tools
  aiToolsPopular:       ()     => request('GET',  '/ai-tools/popular'),
  aiToolsCategories:    ()     => request('GET',  '/ai-tools/categories'),
  aiToolsByCategory:    (cat)  => request('GET',  `/ai-tools/by-category/${cat}`),
  aiCompare:            (body) => request('POST', '/ai-compare', body),

  // Cloud
  cloudPopular:         ()     => request('GET',  '/cloud/popular'),
  cloudCompare:         (body) => request('POST', '/compare',     body),
  cloudRegions:         ()     => request('GET',  '/regions'),
  cloudServiceTypes:    (cat)  => request('GET',  `/service-types/${cat}`),

  // Chat
  chat: (message, chatType, history = []) =>
    request('POST', '/chat', { message, chat_type: chatType, history }),
}

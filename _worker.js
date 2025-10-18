export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Forward /api/* requests to Firebase Functions
    if (url.pathname.startsWith('/api/')) {
      const targetPath = url.pathname.replace('/api', '')
      const firebaseURL = `https://australia-southeast1-fit5032-assessment.cloudfunctions.net${targetPath}`

      const newRequest = new Request(firebaseURL, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' ? await request.text() : undefined,
      })

      return fetch(newRequest)
    }

    // Otherwise, serve the normal Vue app assets
    return env.ASSETS.fetch(request)
  },
}
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname === '/getRecipesList') {
      const firebaseURL = 'https://getrecipesapi-jdbghckipq-ts.a.run.app'

      try {
        const response = await fetch(firebaseURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        const json = await response.json()

        return new Response(JSON.stringify(json.data || json, null, 2), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    if (url.pathname === '/getEventsList') {
      const firebaseURL = 'https://geteventsapi-jdbghckipq-ts.a.run.app'

      try {
        const response = await fetch(firebaseURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        const json = await response.json()

        return new Response(JSON.stringify(json.data || json, null, 2), {
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    return env.ASSETS.fetch(request)
  },
}

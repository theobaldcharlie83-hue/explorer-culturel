const WP_FR = 'https://fr.wikipedia.org/w/api.php'
const WP_EN = 'https://en.wikipedia.org/w/api.php'

async function getWikiImage(name, base) {
  const s = await fetch(
    `${base}?action=query&list=search&srsearch=${encodeURIComponent(name)}&srlimit=1&srprop=&format=json&origin=*`
  )
  const sd = await s.json()
  const title = sd.query?.search?.[0]?.title
  if (!title) return null
  const r = await fetch(
    `${base}?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&pithumbsize=640&format=json&origin=*`
  )
  const rd = await r.json()
  const page = Object.values(rd.query?.pages ?? {})[0]
  return page?.thumbnail?.source ?? null
}

export async function fetchPlaceImage(name) {
  try {
    const fr = await getWikiImage(name, WP_FR)
    if (fr) return fr
    return await getWikiImage(name, WP_EN)
  } catch {
    return null
  }
}

const files = import.meta.glob('./content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export type Page = { slug: string; title: string; body: string; group: string; problem: string; headings: { id: string; text: string }[] }

export const GROUPS: { name: string; slugs: string[] }[] = [
  { name: 'Start', slugs: ['start-here', 'credits-and-pricing'] },
  { name: 'Find the threads', slugs: ['audit', 'ask', 'research', 'search', 'graph'] },
  { name: 'Write the post', slugs: ['ideate', 'reply-to-threads', 'your-voice'] },
  { name: 'Keep track', slugs: ['board'] },
  { name: 'Help', slugs: ['help'] },
]

export function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const bySlug: Record<string, Page> = {}
Object.entries(files).forEach(([path, body]) => {
  const name = path.split('/').pop()!.replace(/\.md$/, '')
  const slug = name.replace(/^\d+-/, '')
  const title = (body.match(/^# (.+)$/m)?.[1] ?? slug).trim()
  const rawProblem = (body.match(/\*\*The problem:\*\*\s*(.+)/)?.[1] ?? '').trim()
  const problem = rawProblem.charAt(0).toUpperCase() + rawProblem.slice(1)
  const headings = [...body.matchAll(/^## (.+)$/gm)].map(m => ({ id: slugify(m[1]), text: m[1].trim() }))
  const group = GROUPS.find(g => g.slugs.includes(slug))?.name ?? 'Start'
  bySlug[slug] = { slug, title, body, group, problem, headings }
})

export const pages: Page[] = GROUPS.flatMap(g => g.slugs.map(s => bySlug[s]).filter(Boolean))
export const firstSlug = pages[0].slug
export const features = ['audit', 'ask', 'board', 'ideate', 'reply-to-threads', 'research', 'search', 'graph'].map(s => bySlug[s]).filter(Boolean)

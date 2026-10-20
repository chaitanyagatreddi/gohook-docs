import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { GROUPS, features, pages, slugify } from './pages'
import { GoHookWordmark } from './GoHookLogo'

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="GoHook docs home">
      <GoHookWordmark className="logo-mark" />
      <em>Docs</em>
    </Link>
  )
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (node && typeof node === 'object' && 'props' in node) return textOf((node as { props: { children?: ReactNode } }).props.children)
  return ''
}

function SearchBox({ onPick }: { onPick: () => void }) {
  const [q, setQ] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ref.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const hits = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (term.length < 2) return []
    return pages
      .map(p => {
        const body = p.body.toLowerCase()
        const at = body.indexOf(term)
        const inTitle = p.title.toLowerCase().includes(term)
        if (at < 0 && !inTitle) return null
        const snippet = at >= 0 ? '…' + p.body.slice(Math.max(0, at - 40), at + 90).replace(/[#*|`\n]+/g, ' ') + '…' : ''
        return { p, snippet, score: inTitle ? 0 : 1 }
      })
      .filter(Boolean)
      .sort((a, b) => a!.score - b!.score)
      .slice(0, 6) as { p: (typeof pages)[number]; snippet: string }[]
  }, [q])
  return (
    <div className="search">
      <input ref={ref} value={q} onChange={e => setQ(e.target.value)} placeholder="Search the docs" aria-label="Search the docs" />
      <kbd>Ctrl K</kbd>
      {q.trim().length >= 2 && (
        <ul className="results">
          {hits.length === 0 && <li className="none">Nothing found. Try another word.</li>}
          {hits.map(({ p, snippet }) => (
            <li key={p.slug}>
              <Link to={`/${p.slug}`} onClick={() => { setQ(''); onPick() }}>
                <strong>{p.title}</strong>
                <span>{snippet}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Home() {
  useEffect(() => { document.title = 'GoHook Docs' }, [])
  return (
    <div className="home">
      <p className="step">GoHook docs</p>
      <h1>Reddit into customers.<br />Without the ban.</h1>
      <p className="lead">GoHook finds the conversations your buyers are already in. Then it helps you write something worth posting. You read every draft. You post it yourself.</p>
      <div className="cta">
        <Link className="btn primary" to="/start-here">Start here</Link>
        <a className="btn" href="https://app.gohook.dev">Open GoHook</a>
        <Link className="btn" to="/credits-and-pricing">Credits and pricing</Link>
      </div>
      <h2 className="cards-title">What GoHook does for you</h2>
      <div className="cards">
        {features.map(f => (
          <Link key={f.slug} to={`/${f.slug}`} className="card">
            <strong>{f.title}</strong>
            <span>{f.problem || 'Read how it works.'}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function DocPage({ slug }: { slug: string }) {
  const index = pages.findIndex(p => p.slug === slug)
  const page = pages[index]
  useEffect(() => {
    window.scrollTo(0, 0)
    if (page) document.title = `${page.title} | GoHook Docs`
  }, [page])
  if (!page) return <Navigate to="/" replace />
  const prev = pages[index - 1]
  const next = pages[index + 1]
  return (
    <div className="with-toc">
      <article className="doc">
        <p className="step">{page.group}</p>
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{ h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2> }}
        >
          {page.body}
        </Markdown>
        <nav className="pager" aria-label="Previous and next page">
          {prev ? <Link to={`/${prev.slug}`} className="prev"><small>Previous</small>{prev.title}</Link> : <span />}
          {next ? <Link to={`/${next.slug}`} className="next"><small>Next</small>{next.title}</Link> : <span />}
        </nav>
      </article>
      {page.headings.length > 1 && (
        <aside className="toc" aria-label="On this page">
          <p>On this page</p>
          {page.headings.map(h => <a key={h.id} href={`#${h.id}`}>{h.text}</a>)}
        </aside>
      )}
    </div>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  useEffect(() => { setOpen(false) }, [location.pathname])
  const slug = location.pathname.replace(/^\/|\/$/g, '')
  return (
    <div className="shell">
      <header className="top">
        <Logo />
        <button className="menu" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="side">
          {open ? 'Close' : 'Menu'}
        </button>
        <a className="open-app" href="https://app.gohook.dev">Open GoHook</a>
      </header>
      <div className="body">
        <aside id="side" className={open ? 'side open' : 'side'}>
          <SearchBox onPick={() => setOpen(false)} />
          <nav aria-label="Docs">
            {GROUPS.map(g => (
              <div key={g.name} className="group">
                <p>{g.name}</p>
                {g.slugs.map(s => {
                  const p = pages.find(x => x.slug === s)
                  if (!p) return null
                  return <NavLink key={s} to={`/${s}`} className={({ isActive }) => (isActive || slug === s ? 'active' : '')}>{p.title}</NavLink>
                })}
              </div>
            ))}
          </nav>
        </aside>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:slug" element={<DocPage slug={slug} />} />
          </Routes>
          <footer className="foot">
            <span>GoHook · Reddit intelligence tool</span>
            <span><a href="mailto:c@gohook.dev">c@gohook.dev</a></span>
          </footer>
        </main>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react';

type Health = 'loading' | 'connected' | 'unavailable';

export default function App() {
  const [health, setHealth] = useState<Health>('loading');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('API unavailable'); return response.json(); })
      .then(data => { if (data.status === 'ok') setHealth('connected'); else setHealth('unavailable'); })
      .catch(error => { if (error.name !== 'AbortError') setHealth('unavailable'); });
    return () => controller.abort();
  }, []);

  return (
    <main className="layout">
      <section className="hero">
        <div className="eyebrow"><span className="dot" /> CODEX SOFTWARE FACTORY · STARTER</div>
        <h1>Your next product<br /><em>starts here.</em></h1>
        <p>This application is a working React and Express baseline. The factory will implement your product requirements, data model, tests, and security reviews here.</p>
        <div className="status"><span className={health === 'connected' ? 'light connected' : 'light'} /> API {health === 'loading' ? 'connecting…' : health === 'connected' ? 'connected' : 'unavailable'}</div>
      </section>
      <section className="grid" aria-label="Starter technologies">
        <article><span>01 / INTERFACE</span><h2>React + Vite</h2><p>Typed, responsive frontend with a local API proxy.</p></article>
        <article><span>02 / SERVICES</span><h2>Express + TypeScript</h2><p>Small HTTP server with independent health and readiness checks.</p></article>
        <article><span>03 / DATA</span><h2>PostgreSQL</h2><p>Simple migrations and local isolated database service.</p></article>
      </section>
      <footer>Generated from a reusable template. No production authentication or deployment is configured.</footer>
    </main>
  );
}

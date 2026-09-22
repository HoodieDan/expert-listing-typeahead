# Wayfinder country typeahead

A focused screening submission built with Next.js 16, React 19, TypeScript, and Tailwind CSS. It searches the public [World Bank Countries API](https://datahelpdesk.worldbank.org/knowledgebase/articles/898590-country-api-queries) through a small server-side route handler.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables or API keys are required.

```bash
npm test
npm run lint
npm run build
```

## Application write-up (240 words)

I kept the interaction deliberately small, but treated it like a production surface. The input waits 320 ms after the last keystroke before searching, which is long enough to reduce noisy requests without making the interface feel sluggish. Queries shorter than two characters never reach the network. A Next.js route handler sits between the browser and the World Bank; it validates input, normalises the upstream payload into a narrow UI contract, limits results, applies cache headers, and turns upstream failures into a consistent error response.

Race conditions are handled twice: each superseded request is aborted, and a monotonically increasing request ID prevents an older response from committing state even if cancellation is ignored by an intermediary. Successful queries are also cached in memory for instant repeat searches. The combobox follows the WAI-ARIA pattern, supports arrow keys, Enter, Escape, pointer input, focus states, and a polite live region. Loading skeletons, no-results guidance, retryable errors, and the selected-country summary make state changes explicit.

At higher traffic, I would add shared edge caching, upstream rate limiting, request coalescing, observability, and a circuit breaker with a small static fallback dataset. I would also set performance budgets and measure real latency and abandonment rather than guessing at the debounce interval.

The included component tests cover debounce timing, keyboard selection, and stale-response ordering. I would add route-handler contract tests, automated accessibility checks, and Playwright tests for focus, mobile layouts, network failure, and slow connections before release.

## Notable implementation details

- Server Component page with a narrowly scoped Client Component for the interactive combobox
- AbortController plus a request sequence guard for stale/out-of-order responses
- Query-result memoization and server-side revalidation for repeat traffic
- Responsive layout, reduced-motion support, visible focus styles, and semantic status announcements

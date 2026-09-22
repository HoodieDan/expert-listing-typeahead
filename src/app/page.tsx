import { TypeaheadSearch } from "@/components/typeahead-search";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f2efe5] text-[#17251f]">
      <div className="map-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute -left-40 top-32 h-80 w-80 rounded-full border border-[#17251f]/8" />
      <div className="pointer-events-none absolute -left-24 top-48 h-48 w-48 rounded-full border border-[#17251f]/8" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <a
          href="#main-content"
          className="flex items-center gap-2.5"
          aria-label="Wayfinder home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#17251f] text-sm font-black text-[#f5ca52]">
            W
          </span>
          <span className="text-sm font-black tracking-[0.14em]">WAYFINDER</span>
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-semibold text-[#5e6a63] sm:inline">
            Frontend screening task
          </span>
          <span className="rounded-full border border-[#17251f]/15 bg-white/55 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] backdrop-blur">
            React + Next.js
          </span>
        </div>
      </header>

      <main
        id="main-content"
        className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-16 pt-8 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20 lg:px-12 lg:pb-24 lg:pt-20"
      >
        <section>
          <div className="mb-7 flex items-center gap-3">
            <span className="h-px w-8 bg-[#d85d35]" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d85d35]">
              Explore with context
            </p>
          </div>
          <h1 className="max-w-2xl text-[clamp(3.15rem,8vw,6.7rem)] font-semibold leading-[0.88] tracking-[-0.065em]">
            The world,
            <span className="relative ml-[0.08em] font-serif font-normal italic text-[#d85d35]">
              within reach.
              <svg
                className="absolute -bottom-2 left-0 w-full text-[#d85d35]/45"
                viewBox="0 0 440 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 10.5c97-8 293-12 433-6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-[#536159] sm:text-lg sm:leading-8">
            A fast, resilient country finder that turns imperfect input into
            useful context without making the user wait or wonder.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-[#17251f]/15 pt-6 sm:gap-6">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.04em]">200+</p>
              <p className="mt-1 text-xs leading-4 text-[#68736d]">
                Countries &amp; territories
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-[-0.04em]">8 max</p>
              <p className="mt-1 text-xs leading-4 text-[#68736d]">
                Relevant suggestions
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-[-0.04em]">0 keys</p>
              <p className="mt-1 text-xs leading-4 text-[#68736d]">
                Required to explore
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Country typeahead demo"
          className="relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:justify-self-end"
        >
          <div
            className="absolute -inset-3 -z-10 rotate-2 rounded-[2rem] bg-[#f5ca52] sm:-inset-4"
            aria-hidden="true"
          />
          <TypeaheadSearch />
        </section>
      </main>

      <footer className="relative mx-auto flex w-full max-w-7xl flex-col gap-2 border-t border-[#17251f]/12 px-5 py-5 text-xs text-[#68736d] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>Built as a focused frontend engineering exercise.</p>
        <p>Data from the World Bank · No API key required</p>
      </footer>
    </div>
  );
}

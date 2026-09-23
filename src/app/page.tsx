import { TypeaheadSearch } from "@/components/typeahead-search";

export default function Home() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-[#f2efe5] text-[#17251f]">
      <div className="map-grid pointer-events-none absolute inset-0 opacity-55" />
      <div className="pointer-events-none absolute -left-40 top-32 h-80 w-80 rounded-full border border-[#17251f]/8" />
      <div className="pointer-events-none absolute -left-24 top-48 h-48 w-48 rounded-full border border-[#17251f]/8" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-4 min-[380px]:px-5 min-[380px]:py-5 sm:px-8 sm:py-6 lg:px-12">
        <a
          href="#main-content"
          className="flex items-center gap-2.5"
          aria-label="Wayfinder home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#17251f] text-sm font-black text-[#f5ca52]">
            W
          </span>
          <span className="hidden text-sm font-black tracking-[0.14em] min-[350px]:inline">
            WAYFINDER
          </span>
        </a>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-semibold text-[#5e6a63] sm:inline">
            Frontend screening task
          </span>
          <span className="whitespace-nowrap rounded-full border border-[#17251f]/15 bg-white/55 px-2.5 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] backdrop-blur min-[380px]:px-3 min-[380px]:text-[0.65rem] min-[380px]:tracking-[0.14em]">
            React + Next.js
          </span>
        </div>
      </header>

      <main
        id="main-content"
        className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-4 pb-14 pt-8 min-[380px]:px-5 sm:gap-16 sm:px-8 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-12 lg:pb-24 lg:pt-16 xl:gap-20 xl:pt-20"
      >
        <section>
          <div className="mb-5 flex items-center gap-3 sm:mb-7">
            <span className="h-px w-8 bg-[#d85d35]" />
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d85d35]">
              Explore with context
            </p>
          </div>
          <h1 className="max-w-2xl text-[clamp(3rem,14vw,6.7rem)] font-semibold leading-[0.88] tracking-[-0.065em] sm:text-[clamp(4.75rem,10vw,6.7rem)] lg:text-[clamp(4.75rem,7.5vw,6.7rem)]">
            <span className="block">The world,</span>
            <span className="relative block w-fit max-w-full font-serif font-normal italic text-[#d85d35]">
              within reach.
              <svg
                className="absolute -bottom-1 left-0 w-full text-[#d85d35]/45 sm:-bottom-2"
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
          <p className="mt-7 max-w-xl text-[0.95rem] leading-7 text-[#536159] min-[380px]:text-base sm:mt-8 sm:text-lg sm:leading-8">
            A fast, resilient country finder that turns imperfect input into
            useful context without making the user wait or wonder.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-2 border-t border-[#17251f]/15 pt-5 min-[380px]:gap-3 sm:mt-10 sm:gap-6 sm:pt-6">
            <div>
              <p className="text-xl font-semibold tracking-[-0.04em] min-[380px]:text-2xl">200+</p>
              <p className="mt-1 text-[0.65rem] leading-4 text-[#68736d] min-[380px]:text-xs">
                Countries &amp; territories
              </p>
            </div>
            <div>
              <p className="text-xl font-semibold tracking-[-0.04em] min-[380px]:text-2xl">8 max</p>
              <p className="mt-1 text-[0.65rem] leading-4 text-[#68736d] min-[380px]:text-xs">
                Relevant suggestions
              </p>
            </div>
            <div>
              <p className="text-xl font-semibold tracking-[-0.04em] min-[380px]:text-2xl">0 keys</p>
              <p className="mt-1 text-[0.65rem] leading-4 text-[#68736d] min-[380px]:text-xs">
                Required to explore
              </p>
            </div>
          </div>
        </section>

        <section
          aria-label="Country typeahead demo"
          className="relative isolate mx-auto w-full max-w-[34rem] lg:mx-0 lg:justify-self-end"
        >
          <div
            className="absolute -inset-2 -z-10 rotate-1 rounded-[2rem] bg-[#f5ca52] min-[380px]:-inset-3 min-[380px]:rotate-2 sm:-inset-4"
            aria-hidden="true"
          />
          <TypeaheadSearch />
        </section>
      </main>

      <footer className="relative mx-auto flex w-full max-w-7xl flex-col gap-1.5 border-t border-[#17251f]/12 px-4 py-5 text-[0.7rem] leading-5 text-[#68736d] min-[380px]:px-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:text-xs lg:px-12">
        <p>Built as a focused frontend engineering exercise.</p>
        <p>Data from the World Bank · No API key required</p>
      </footer>
    </div>
  );
}

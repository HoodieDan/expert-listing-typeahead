"use client";

import {
  type ChangeEvent,
  type KeyboardEvent,
  type SVGProps,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ApiErrorResponse,
  CountryOption,
  CountrySearchResponse,
} from "@/lib/types";

const MIN_QUERY_LENGTH = 2;
const DEFAULT_DEBOUNCE_MS = 320;
const RESULTS_ID = "country-search-results";

type SearchStatus = "idle" | "loading" | "success" | "empty" | "error";

type TypeaheadSearchProps = {
  debounceMs?: number;
};

function countryCodeToEmoji(code: string) {
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((letter) => 127397 + letter.charCodeAt(0)),
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m21 21-4.35-4.35m2.35-5.4A7.75 7.75 0 1 1 3.5 11.25a7.75 7.75 0 0 1 15.5 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function TypeaheadSearch({
  debounceMs = DEFAULT_DEBOUNCE_MS,
}: TypeaheadSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CountryOption[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<CountryOption | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const requestIdRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const cacheRef = useRef(new Map<string, CountryOption[]>());

  useEffect(() => {
    if (selected) return;

    const trimmedQuery = query.trim();
    const cacheKey = trimmedQuery.toLocaleLowerCase();

    requestIdRef.current += 1;
    const requestId = requestIdRef.current;

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      return;
    }

    if (cacheRef.current.has(cacheKey)) return;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setStatus("loading");
      setIsOpen(true);

      try {
        const response = await fetch(
          `/api/places?q=${encodeURIComponent(trimmedQuery)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as
          | CountrySearchResponse
          | ApiErrorResponse;

        if (!response.ok) {
          throw new Error(
            "error" in payload ? payload.error : "Unable to search countries.",
          );
        }

        if (requestId !== requestIdRef.current) return;

        const nextResults = (payload as CountrySearchResponse).results;
        cacheRef.current.set(cacheKey, nextResults);
        setResults(nextResults);
        setStatus(nextResults.length > 0 ? "success" : "empty");
      } catch {
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        setResults([]);
        setStatus("error");
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [debounceMs, query, retryCount, selected]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    const trimmedQuery = nextQuery.trim();
    const cachedResults = cacheRef.current.get(trimmedQuery.toLocaleLowerCase());

    setSelected(null);
    setQuery(nextQuery);
    setActiveIndex(-1);

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus("idle");
      setIsOpen(false);
    } else if (cachedResults) {
      setResults(cachedResults);
      setStatus(cachedResults.length > 0 ? "success" : "empty");
      setIsOpen(true);
    } else {
      setResults([]);
      setStatus("idle");
      setIsOpen(false);
    }
  }

  function selectCountry(country: CountryOption) {
    setSelected(country);
    setQuery(country.name);
    setResults([]);
    setStatus("idle");
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? results.length - 1 : current - 1,
      );
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectCountry(results[activeIndex]);
    }
  }

  function clearSearch() {
    setSelected(null);
    setQuery("");
    setResults([]);
    setStatus("idle");
    setIsOpen(false);
    inputRef.current?.focus();
  }

  const statusMessage =
    status === "loading"
      ? `Searching for ${query}`
      : status === "empty"
        ? `No countries found for ${query}`
        : status === "error"
          ? "Country search failed"
          : status === "success"
            ? `${results.length} countries found`
            : selected
              ? `${selected.name} selected`
              : "";

  return (
    <div className="relative">
      <div className="rounded-[1.75rem] border border-[#17251f]/10 bg-white p-4 shadow-[0_26px_70px_rgba(27,40,33,0.14)] sm:p-5">
        <div className="mb-4 flex items-center justify-between px-1">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#d85d35]">
              Country explorer
            </p>
            <p className="mt-1 text-sm text-[#5d6862]">
              Search live country data
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-[#eef4ef] px-3 py-1.5 text-xs font-semibold text-[#355344]">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5c8b70] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4b7a60]" />
            </span>
            Live API
          </span>
        </div>

        <div className="relative">
          <label htmlFor="country-search" className="sr-only">
            Search for a country
          </label>
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#66716b]" />
          <input
            ref={inputRef}
            id="country-search"
            role="combobox"
            aria-autocomplete="list"
            aria-controls={RESULTS_ID}
            aria-expanded={isOpen}
            aria-activedescendant={
              activeIndex >= 0 ? `country-option-${activeIndex}` : undefined
            }
            autoComplete="off"
            spellCheck="false"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (query.trim().length >= MIN_QUERY_LENGTH && !selected) {
                setIsOpen(true);
              }
            }}
            onBlur={() => setIsOpen(false)}
            placeholder="Try “Nigeria” or “United”…"
            className="h-16 w-full rounded-2xl border border-[#17251f]/15 bg-[#f8f7f2] pl-12 pr-12 text-base font-medium text-[#17251f] outline-none transition placeholder:text-[#87908b] hover:border-[#17251f]/30 focus:border-[#d85d35] focus:bg-white focus:ring-4 focus:ring-[#d85d35]/10"
          />
          {query ? (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={clearSearch}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[#66716b] transition hover:bg-[#17251f]/7 hover:text-[#17251f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d85d35]"
              aria-label="Clear search"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          ) : null}

          {isOpen ? (
            <div
              id={RESULTS_ID}
              role={status === "success" ? "listbox" : "status"}
              aria-label="Country suggestions"
              className="absolute left-0 right-0 top-[calc(100%+0.55rem)] z-20 overflow-hidden rounded-2xl border border-[#17251f]/10 bg-white p-2 shadow-[0_22px_60px_rgba(21,36,28,0.2)]"
            >
              {status === "loading" ? (
                <div className="space-y-1 p-1" aria-hidden="true">
                  {[0, 1, 2].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl px-3 py-3">
                      <div className="search-shimmer h-10 w-10 rounded-full bg-[#eef0eb]" />
                      <div className="flex-1 space-y-2">
                        <div className="search-shimmer h-3 w-2/5 rounded-full bg-[#eef0eb]" />
                        <div className="search-shimmer h-2.5 w-3/5 rounded-full bg-[#f2f3ef]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {status === "success"
                ? results.map((country, index) => (
                    <button
                      type="button"
                      role="option"
                      tabIndex={-1}
                      id={`country-option-${index}`}
                      aria-selected={index === activeIndex}
                      key={country.code}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectCountry(country)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#f3f4ef] focus-visible:outline-2 focus-visible:outline-[#d85d35] aria-selected:bg-[#eef2ec]"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#17251f]/8 bg-[#f8f7f2] text-2xl shadow-sm" aria-hidden="true">
                        {countryCodeToEmoji(country.code)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-[#17251f]">
                          {country.name}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-[#6d7771]">
                          {country.capital} · {country.region}
                        </span>
                      </span>
                      <ArrowIcon className="h-5 w-5 shrink-0 text-[#89918d] transition group-hover:translate-x-0.5 group-hover:text-[#d85d35]" />
                    </button>
                  ))
                : null}

              {status === "empty" ? (
                <div className="px-5 py-7 text-center">
                  <p className="font-bold text-[#17251f]">No places found</p>
                  <p className="mt-1 text-sm text-[#6d7771]">
                    Check the spelling or try a broader term.
                  </p>
                </div>
              ) : null}

              {status === "error" ? (
                <div className="px-5 py-6 text-center">
                  <p className="font-bold text-[#17251f]">We hit some turbulence</p>
                  <p className="mt-1 text-sm text-[#6d7771]">
                    The country service could not be reached.
                  </p>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setStatus("idle");
                      setRetryCount((count) => count + 1);
                    }}
                    className="mt-3 rounded-full bg-[#17251f] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#d85d35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d85d35]"
                  >
                    Try again
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="sr-only" role="status" aria-live="polite">
          {statusMessage}
        </div>

        {selected ? (
          <div className="mt-4 overflow-hidden rounded-2xl bg-[#17251f] text-white">
            <div className="relative p-5 sm:p-6">
              <div className="absolute -right-5 -top-8 text-[7rem] opacity-10" aria-hidden="true">
                {countryCodeToEmoji(selected.code)}
              </div>
              <div className="relative flex items-start gap-4">
                <span className="text-4xl" aria-hidden="true">
                  {countryCodeToEmoji(selected.code)}
                </span>
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-[-0.02em]">
                    {selected.name}
                  </p>
                  <p className="mt-1 truncate text-sm text-white/60">
                    {selected.region} · {selected.code}
                  </p>
                </div>
              </div>
              <div className="relative mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/6 p-3">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/45">Capital</p>
                  <p className="mt-1.5 text-sm font-semibold">{selected.capital}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/6 p-3">
                  <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/45">Income group</p>
                  <p className="mt-1.5 text-sm font-semibold">{selected.incomeLevel}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-[#17251f]/15 bg-[#f8f7f2]/70 px-4 py-4 text-sm text-[#657069]">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e9efe9] text-[#3f684f]">
              <PinIcon className="h-4 w-4" />
            </span>
            <p>
              Type at least two letters, then use <kbd className="rounded border border-[#17251f]/15 bg-white px-1.5 py-0.5 text-[0.68rem] font-bold text-[#17251f] shadow-sm">↑</kbd>{" "}
              <kbd className="rounded border border-[#17251f]/15 bg-white px-1.5 py-0.5 text-[0.68rem] font-bold text-[#17251f] shadow-sm">↓</kbd> and{" "}
              <kbd className="rounded border border-[#17251f]/15 bg-white px-1.5 py-0.5 text-[0.68rem] font-bold text-[#17251f] shadow-sm">Enter</kbd>.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-[#536159] lg:justify-start">
        <span>320ms debounce</span>
        <span aria-hidden="true">·</span>
        <span>Abortable requests</span>
        <span aria-hidden="true">·</span>
        <span>WAI-ARIA combobox</span>
      </div>
    </div>
  );
}

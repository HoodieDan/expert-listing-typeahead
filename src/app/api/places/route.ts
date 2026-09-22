import { NextResponse } from "next/server";

import type { CountryOption } from "@/lib/types";

const UPSTREAM_URL =
  "https://api.worldbank.org/v2/country?format=json&per_page=400";
const MAX_RESULTS = 8;

type WorldBankCountry = {
  iso2Code?: string;
  name?: string;
  capitalCity?: string;
  region?: { value?: string };
  incomeLevel?: { value?: string };
};

function normaliseCountry(country: WorldBankCountry): CountryOption | null {
  const code = country.iso2Code?.toUpperCase();
  const name = country.name;
  const region = country.region?.value?.trim();

  if (!code || !name || !region || region === "Aggregates") return null;

  return {
    code,
    name,
    capital: country.capitalCity || "No official capital",
    region,
    incomeLevel: country.incomeLevel?.value || "Not classified",
  };
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json(
      { error: "Enter at least two characters." },
      { status: 400 },
    );
  }

  if (query.length > 60) {
    return NextResponse.json(
      { error: "Search terms must be 60 characters or fewer." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(UPSTREAM_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(7_000),
    });

    if (!response.ok) {
      throw new Error(`World Bank returned ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload) || !Array.isArray(payload[1])) {
      throw new Error("World Bank returned an unexpected response shape");
    }

    const lowerQuery = query.toLocaleLowerCase();
    const countries = payload[1] as WorldBankCountry[];
    const results = countries
      .map(normaliseCountry)
      .filter((country): country is CountryOption => country !== null)
      .filter((country) => {
        const searchable = [country.name, country.capital, country.code]
          .join(" ")
          .toLocaleLowerCase();
        return searchable.includes(lowerQuery);
      })
      .sort((a, b) => {
        const aStarts = a.name.toLocaleLowerCase().startsWith(lowerQuery);
        const bStarts = b.name.toLocaleLowerCase().startsWith(lowerQuery);

        if (aStarts !== bStarts) return aStarts ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, MAX_RESULTS);

    return NextResponse.json(
      { results },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "The country service timed out. Please try again."
        : "Country search is temporarily unavailable. Please try again.";

    return NextResponse.json({ error: message }, { status: 502 });
  }
}

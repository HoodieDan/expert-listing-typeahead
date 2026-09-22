import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TypeaheadSearch } from "./typeahead-search";

const nigeria = {
  code: "NG",
  name: "Nigeria",
  capital: "Abuja",
  region: "Africa",
  incomeLevel: "Lower middle income",
};

const niger = {
  code: "NE",
  name: "Niger",
  capital: "Niamey",
  region: "Africa",
  incomeLevel: "Low income",
};

function jsonResponse(data: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(data),
  } as Response);
}

describe("TypeaheadSearch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("debounces requests until the user pauses", async () => {
    vi.mocked(fetch).mockImplementation(() => jsonResponse({ results: [] }));
    render(<TypeaheadSearch debounceMs={30} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Nig" },
    });

    expect(fetch).not.toHaveBeenCalled();

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(fetch).toHaveBeenCalledWith(
      "/api/places?q=Nig",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("supports keyboard navigation and selection", async () => {
    vi.mocked(fetch).mockImplementation(() =>
      jsonResponse({ results: [niger, nigeria] }),
    );
    const user = userEvent.setup();
    render(<TypeaheadSearch debounceMs={0} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "Nig");
    await screen.findByText("Niger");

    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(input).toHaveValue("Nigeria");
    expect(screen.getByText("Lower middle income")).toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("ignores a stale response that resolves after the latest query", async () => {
    let resolveFirst: ((value: Response) => void) | undefined;
    let resolveSecond: ((value: Response) => void) | undefined;

    vi.mocked(fetch)
      .mockImplementationOnce(
        () => new Promise<Response>((resolve) => (resolveFirst = resolve)),
      )
      .mockImplementationOnce(
        () => new Promise<Response>((resolve) => (resolveSecond = resolve)),
      );

    render(<TypeaheadSearch debounceMs={0} />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "Ni" } });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    fireEvent.change(input, { target: { value: "Nig" } });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

    resolveSecond?.({
      ok: true,
      json: () => Promise.resolve({ results: [nigeria] }),
    } as Response);
    expect(await screen.findByText("Nigeria")).toBeInTheDocument();

    resolveFirst?.({
      ok: true,
      json: () => Promise.resolve({ results: [niger] }),
    } as Response);

    await waitFor(() => {
      expect(screen.queryByText("Niger")).not.toBeInTheDocument();
      expect(screen.getByText("Nigeria")).toBeInTheDocument();
    });
  });
});

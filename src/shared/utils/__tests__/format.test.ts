import { describe, it, expect } from "vitest";
import { formatBerries, formatBerriesShort, pad2 } from "../format";
import { invertLabels } from "../labels";

describe("format", () => {
  it("formatBerries usa B$ e separador pt-BR", () => {
    expect(formatBerries(1_234_567)).toBe("B$ 1.234.567");
  });

  it("formatBerriesShort usa k abaixo de 1M e M acima", () => {
    expect(formatBerriesShort(500_000)).toBe("B$ 500k");
    expect(formatBerriesShort(40_000_000)).toBe("B$ 40M");
  });

  it("pad2", () => {
    expect(pad2(3)).toBe("03");
    expect(pad2(12)).toBe("12");
  });
});

describe("invertLabels", () => {
  it("mapeia label minúsculo → id", () => {
    expect(invertLabels({ owned: "Próprio", crew: "Tripulante" })).toEqual({ "próprio": "owned", "tripulante": "crew" });
  });
});

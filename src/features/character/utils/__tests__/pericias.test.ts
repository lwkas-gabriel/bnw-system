import { describe, it, expect } from "vitest";
import { computePericiaBonuses, periciaTotal } from "../pericias";
import { blankPericias, createCharacterFixture, createRichCharacterFixture } from "./fixtures";

describe("utils/pericias", () => {
  it("escolha racial do Humano soma +1 à perícia escolhida", () => {
    const char = createCharacterFixture({ humanPericiaChoice: "ambicao", pericias: { ...blankPericias(), ambicao: 4 } });
    expect(computePericiaBonuses(char).ambicao).toEqual([{ label: "Raça: Humano", value: 1 }]);
    expect(periciaTotal(char, "ambicao")).toBe(5);
  });

  it("raça fixa e classe Zoan entram no total", () => {
    const char = createRichCharacterFixture(); // Mink (+1 Percepção), Zoan carnívora (+1 Furtividade)
    expect(periciaTotal(char, "percepcao")).toBe(char.pericias.percepcao + 1);
    expect(periciaTotal(char, "furtividade")).toBe(1);
    expect(periciaTotal(char, "ambicao")).toBe(char.pericias.ambicao);
  });
});

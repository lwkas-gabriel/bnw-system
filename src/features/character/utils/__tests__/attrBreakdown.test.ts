import { describe, it, expect } from "vitest";
import { computeAttrBreakdown, sumRows } from "../attrBreakdown";
import { createCharacterFixture, createRichCharacterFixture } from "./fixtures";

describe("computeAttrBreakdown", () => {
  it("personagem sem caminhos soma apenas os atributos base", () => {
    const rows = computeAttrBreakdown(createCharacterFixture()); // CON investida = 1
    expect(sumRows(rows.filter(r => !r.isCombat))).toEqual({ pod: 1, pre: 1, def: 1, con: 4 });
  });

  it("personagem completo — snapshot das fontes de bônus", () => {
    expect(computeAttrBreakdown(createRichCharacterFixture())).toMatchSnapshot();
  });
});

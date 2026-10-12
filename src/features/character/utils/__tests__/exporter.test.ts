import { describe, it, expect } from "vitest";
import { exportToForumHTML, exportToJSONString } from "../exporter";
import { parseImportForumHTML, parseImportJSON } from "../importer";
import { createCharacterFixture, createRichCharacterFixture } from "./fixtures";

describe("exportToForumHTML — snapshot (contrato com o fórum)", () => {
  it("personagem mínimo", () => {
    expect(exportToForumHTML(createCharacterFixture())).toMatchSnapshot();
  });

  it("personagem completo", () => {
    expect(exportToForumHTML(createRichCharacterFixture())).toMatchSnapshot();
  });
});

describe("round-trip JSON", () => {
  it("preserva o personagem completo", () => {
    const char = createRichCharacterFixture();
    const result = parseImportJSON(exportToJSONString(char));
    expect(result.status).not.toBe("error");
    expect(result.character).toMatchObject({
      name: char.name, level: char.level, race: char.race, location: char.location,
      investedAttributes: char.investedAttributes, haki: char.haki, akuma: char.akuma,
      artesMarciais: char.artesMarciais, cyborg: char.cyborg,
    });
    expect(result.character?.techniques.map(t => t.name)).toEqual(char.techniques.map(t => t.name));
  });
});

describe("round-trip fórum", () => {
  it("preserva os dados principais do personagem completo", () => {
    const char = createRichCharacterFixture();
    const result = parseImportForumHTML(exportToForumHTML(char));
    expect(result.status).not.toBe("error");
    const imported = result.character!;
    expect(imported.name).toBe(char.name);
    expect(imported.level).toBe(char.level);
    expect(imported.race).toBe(char.race);
    expect(imported.location).toBe(char.location);
    expect(imported.investedAttributes).toEqual(char.investedAttributes);
    expect(imported.pericias).toEqual(char.pericias);
    expect(imported.haki?.primaryType).toBe("armament");
    expect(imported.artesMarciais?.currentFaixa).toBe("verde");
    expect(imported.techniques.map(t => t.name).sort()).toEqual(char.techniques.map(t => t.name).sort());
  });
});

describe("energia com Ciborgue (Shift 3 = energia)", () => {
  it("export inclui o +20 de energia do Ciborgue", () => {
    // nível 20 → 60 + 6 investidos + 20 do Shift 3
    expect(exportToForumHTML(createRichCharacterFixture())).toContain("<e>Energia (EN): </e>86");
  });

  it("round-trip fórum preserva energia investida e escolha do Shift 3", () => {
    const char = createRichCharacterFixture();
    const imported = parseImportForumHTML(exportToForumHTML(char)).character!;
    expect(imported.energy.energyInvested).toBe(6);
    expect(imported.cyborg?.shift3Bonus).toBe("energy");
  });
});

describe("round-trip fórum — Akuma no Mi", () => {
  it.each([
    ["zoan" as const],
    ["logia" as const],
    ["paramecia" as const],
  ])("recupera nome, tipo e rank (%s)", (type) => {
    const base = createRichCharacterFixture();
    const akuma = type === "zoan" ? base.akuma! : type === "logia"
      ? { type, name: "Mera Mera no Mi", rank: "A" as const, elementalNatureAttr: "power" as const,
          statusEnhanced: { name: "Queimadura", description: "", combination: ["queimadura"] as [string] },
          intangibilityBonus: { defense: 4 as const, constitution: 4 as const } }
      : { type, name: "Gomu Gomu no Mi", rank: "C" as const, parameciaClass: "corporeal" as const,
          specialAdherence: "", passives: [], actives: [] };
    const imported = parseImportForumHTML(exportToForumHTML({ ...base, akuma })).character!;
    expect(imported.akuma).toMatchObject({ type, name: akuma.name, rank: akuma.rank });
  });
});


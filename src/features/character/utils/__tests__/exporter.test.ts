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

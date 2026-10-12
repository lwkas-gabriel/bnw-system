import { describe, it, expect } from "vitest";
import { applyAkumaRank, createAkuma, syncFreeTechniques } from "../akuma";
import { createCharacterFixture } from "./fixtures";

describe("utils/akuma", () => {
  it("createAkuma cria Rank C do tipo pedido", () => {
    expect(createAkuma("zoan")).toMatchObject({ type: "zoan", rank: "C", vigorAnimalBonus: 2 });
    expect(createAkuma("logia")).toMatchObject({ type: "logia", rank: "C" });
    expect(createAkuma("paramecia")).toMatchObject({ type: "paramecia", rank: "C" });
  });

  it("syncFreeTechniques ajusta as técnicas gratuitas ao rank", () => {
    const c = createCharacterFixture();
    syncFreeTechniques(c, "C");
    expect(c.techniques.filter(t => t.source === "akuma")).toHaveLength(1);
    syncFreeTechniques(c, "A");
    expect(c.techniques.filter(t => t.source === "akuma")).toHaveLength(2);
    syncFreeTechniques(c, "C");
    expect(c.techniques.filter(t => t.source === "akuma")).toHaveLength(1);
  });

  it("applyAkumaRank na Zoan atualiza Vigor/Points e adiciona o Desperto no Rank S", () => {
    const c = createCharacterFixture({ akuma: createAkuma("zoan") });
    applyAkumaRank(c, "B");
    expect(c.akuma).toMatchObject({ rank: "B", vigorAnimalBonus: 4 });
    applyAkumaRank(c, "S");
    const points = c.akuma?.type === "zoan" ? c.akuma.points : [];
    expect(points.map(p => p.id)).toEqual(["hybrid", "animal", "awakened"]);
    applyAkumaRank(c, "A");
    expect(c.akuma?.type === "zoan" && c.akuma.points.map(p => p.id)).toEqual(["hybrid", "animal"]);
  });
});

import { describe, it, expect } from "vitest";
import { getAvailableRanks, getFactionLabel, getFactionRank } from "../factions";

describe("helpers de facção", () => {
  it("getFactionRank encontra rank normal e lateral", () => {
    expect(getFactionRank("marinha", "capitao")?.label).toBe("Capitão (Rank 6)");
    expect(getFactionRank("revolucionario", "radical")?.label).toBe("Radical");
    expect(getFactionRank("marinha", "inexistente")).toBeUndefined();
  });

  it("getFactionLabel devolve o rótulo, ou o próprio ID se desconhecido", () => {
    expect(getFactionLabel("revolucionario", "vice_comandante")).toBe("Vice-Comandante");
    expect(getFactionLabel("governo", "agente_duplo")).toBe("Agente Duplo");
    expect(getFactionLabel("marinha", "rank_antigo")).toBe("rank_antigo");
  });

  it("getAvailableRanks filtra por nível e não inclui o rank lateral", () => {
    const ranks = getAvailableRanks("revolucionario", 8);
    expect(ranks.map(r => r.id)).toEqual(["voluntario", "companheiro", "informante"]);
  });
});

import type { AkumaNoMi, AkumaRank, AkumaType, Character } from "../../../shared/types/character";
import { AKUMA_FREE_TECH_COUNT, ZOAN_POINT_BONUS, ZOAN_VIGOR_ANIMAL } from "../../../data/akumaModules";

/** Ajusta as técnicas gratuitas da Akuma (source "akuma") à quantidade do rank */
export function syncFreeTechniques(c: Character, rank: AkumaRank): void {
  const target = AKUMA_FREE_TECH_COUNT[rank];
  const existing = c.techniques.filter(t => t.source === "akuma");
  const diff = target - existing.length;
  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      c.techniques.push({
        id: crypto.randomUUID(),
        name: `Técnica Akuma ${existing.length + i + 1}`,
        description: "",
        rank: "A",
        type: "offensive",
        targetAttr: "power",
        baseBonus: 5,
        energyCost: 5,
        adherences: [],
        source: "akuma",
      });
    }
  } else if (diff < 0) {
    let toRemove = -diff;
    for (let i = c.techniques.length - 1; i >= 0 && toRemove > 0; i--) {
      if (c.techniques[i].source === "akuma") {
        c.techniques.splice(i, 1);
        toRemove--;
      }
    }
  }
}

/** Akuma nova (Rank C) do tipo escolhido, com valores padrão */
export function createAkuma(type: AkumaType): AkumaNoMi {
  switch (type) {
    case "logia":
      return {
        type: "logia", name: "Nova Logia", rank: "C",
        elementalNatureAttr: "power",
        statusEnhanced: { name: "", description: "", combination: ["confusion"] },
        intangibilityBonus: { defense: 4, constitution: 4 },
      };
    case "zoan":
      return {
        type: "zoan", name: "Nova Zoan", rank: "C",
        animalClass: "carnivore", isMythical: false, isAncestral: false,
        points: [
          { id: "hybrid", primaryAttr: "power", complementaryAttr: "constitution", bonus: 1 },
          { id: "animal", primaryAttr: "power", complementaryAttr: "constitution", bonus: 1 },
        ],
        abilities: [],
        vigorAnimalBonus: 2,
      };
    case "paramecia":
      return {
        type: "paramecia", name: "Nova Paramecia", rank: "C",
        parameciaClass: "corporeal", specialAdherence: "",
        passives: [], actives: [],
      };
  }
}

/**
 * Muda o rank da Akuma do personagem, ajustando técnicas gratuitas e, na Zoan,
 * Vigor Animal e Points (Rank S ganha o Point Desperto).
 */
export function applyAkumaRank(c: Character, rank: AkumaRank): void {
  if (!c.akuma) return;
  c.akuma.rank = rank;
  syncFreeTechniques(c, rank);
  if (c.akuma.type !== "zoan") return;
  const zoan = c.akuma;
  zoan.vigorAnimalBonus = ZOAN_VIGOR_ANIMAL[rank];
  const bonus = ZOAN_POINT_BONUS[rank];
  const base = zoan.points.filter(p => p.id !== "awakened");
  if (base.length < 2) {
    zoan.points = [
      { id: "hybrid", primaryAttr: "power", complementaryAttr: "constitution", bonus },
      { id: "animal", primaryAttr: "power", complementaryAttr: "constitution", bonus },
    ];
  } else {
    zoan.points = base.map(p => ({ ...p, bonus }));
  }
  if (rank === "S") {
    const ref = zoan.points[0];
    zoan.points.push({
      id: "awakened",
      primaryAttr: ref.primaryAttr,
      complementaryAttr: ref.complementaryAttr,
      bonus: 8,
    });
  }
}

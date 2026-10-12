import { describe, it, expect, beforeEach } from "vitest";
import { useCharacterStore } from "../characterStore";
import { createCharacterFixture } from "../../utils/__tests__/fixtures";
import type { Character } from "../../../../shared/types/character";

const store = () => useCharacterStore.getState();

describe("characterStore", () => {
  beforeEach(() => useCharacterStore.setState({ draft: null, saved: [], errors: {}, budget: null }));

  it("newCharacter cria draft com orçamento calculado", () => {
    store().newCharacter("Luffy", 100, 5);
    expect(store().draft).toMatchObject({ name: "Luffy", gemBudget: 100, level: 5 });
    expect(store().budget?.total).toBeDefined();
  });

  it("updateDraft recalcula o orçamento", () => {
    store().newCharacter("Luffy", 400, 10);
    const before = store().budget!.spent;
    store().updateDraft(c => { c.energy.energyInvested = 5; });
    expect(store().budget!.spent).toBe(before + 5);
  });

  it("save/load/delete", () => {
    store().newCharacter("Zoro");
    store().saveDraft();
    const id = store().draft!.id;
    useCharacterStore.setState({ draft: null });
    store().loadCharacter(id);
    expect(store().draft?.name).toBe("Zoro");
    store().deleteCharacter(id);
    expect(store().saved).toHaveLength(0);
    expect(store().draft).toBeNull();
  });

  it("loadCharacter migra personagens antigos sem perícias", () => {
    const legacy = { ...createCharacterFixture({ id: "old" }), pericias: undefined, ambition: 3 } as unknown as Character;
    useCharacterStore.setState({ saved: [legacy] });
    store().loadCharacter("old");
    expect(store().draft?.pericias.ambicao).toBe(3);
  });
});

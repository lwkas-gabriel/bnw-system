import { useCharacterStore } from "../store/characterStore";

/**
 * Ficha em edição + `updateDraft`, via seletores (o componente só re-renderiza
 * quando o draft muda, e não a cada alteração do store).
 */
export function useDraft() {
  const draft = useCharacterStore(s => s.draft);
  const updateDraft = useCharacterStore(s => s.updateDraft);
  return { draft, updateDraft };
}

import type { Ship } from "../../../shared/types/ship";
import {
  ENGINEER_DISCOUNT, KLABAUTERMANN_DISCOUNT_PRICE, KLABAUTERMANN_VOYAGES,
  SHIP_COMODOS_BY_ID, SHIP_MECHANISMS_BY_ID, SHIP_OWNERSHIP_LABELS, SHIP_ROLE_LABELS, SHIP_SIZES,
} from "../../../data/ships";

// ─── JSON export ──────────────────────────────────────────────────────────────

export interface ExportedShip {
  _version: "1.0";
  _exportedAt: string;
  _system: "bnw-ship-system";
  ship: Ship;
}

export function exportShipToJSON(ship: Ship): ExportedShip {
  return {
    _version: "1.0",
    _exportedAt: new Date().toISOString(),
    _system: "bnw-ship-system",
    ship: structuredClone(ship),
  };
}

export function exportShipToJSONString(ship: Ship): string {
  return JSON.stringify(exportShipToJSON(ship), null, 2);
}

export function downloadShipJSON(ship: Ship): void {
  const json = exportShipToJSONString(ship);
  const blob = new Blob([json], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${ship.name.replace(/\s+/g, "_").toLowerCase()}_navio.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBerries(n: number): string {
  return `B$ ${n.toLocaleString("pt-BR")}`;
}

function computeShipTotalPrice(ship: Ship): number {
  const sizeData = SHIP_SIZES[ship.size];
  let total = sizeData.price;
  if (ship.builtByEngineer) total -= Math.floor(total * ENGINEER_DISCOUNT);
  for (const id of ship.mechanisms) {
    total += SHIP_MECHANISMS_BY_ID[id]?.price ?? 0;
  }
  for (const id of ship.comodoIds) {
    total += SHIP_COMODOS_BY_ID[id]?.price ?? 0;
  }
  if (ship.klabautermannUnlockedWithDiscount) total += KLABAUTERMANN_DISCOUNT_PRICE;
  return total;
}

// ─── Forum HTML export (dohtml) ───────────────────────────────────────────────

export function exportShipToForumHTML(ship: Ship): string {
  const sizeData = SHIP_SIZES[ship.size];
  const sizeLabel = sizeData.name;
  const ownershipLabel = SHIP_OWNERSHIP_LABELS[ship.ownership] ?? ship.ownership;
  const totalPrice = computeShipTotalPrice(ship);

  const usedSlots = ship.comodoIds.reduce((sum, id) => {
    return sum + (SHIP_COMODOS_BY_ID[id]?.size ?? 0);
  }, 0);

  const klabStr = ship.klabautermann.active
    ? `Ativo (${ship.klabautermann.voyageCount} viagens)`
    : `Não-ativo (${ship.klabautermann.voyageCount}/${KLABAUTERMANN_VOYAGES} viagens)`;

  const L: string[] = [];
  const ln = (...parts: string[]) => L.push(parts.join(""));

  ln(`[dohtml] <div id="BNWPOSTOFICIAL"><br><br>`);
  ln();
  ln(`<div class="toptitle">${ship.name}</div><br>`);
  ln();
  ln(`<div class="post"><t>Embarcação — ${sizeLabel}</t>`);
  ln();

  // ── Informações do Navio
  ln(`<div style=" border: 1px solid; padding: 10px; ">`);
  ln(`<d>Informações do Navio</d>`);
  ln(`<e>Nome: </e>${ship.name}`);
  ln(`<e>Tamanho: </e>${sizeLabel}`);
  ln(`<e>Casco (Hull): </e>${ship.currentHull}/${ship.maxHull}`);
  ln(`<e>Tripulação máx.: </e>${sizeData.maxCrew}`);
  ln(`<e>Slots de Cômodos: </e>${usedSlots}/${sizeData.comodoSlots}`);
  ln(`<e>Navegação (Percepção mín.): </e>${sizeData.percepaoRequired}`);
  ln(`<e>Aquisição: </e>${ownershipLabel}`);
  ln(`<e>Construído por Engenheiro: </e>${ship.builtByEngineer ? "Sim (30% desconto)" : "Não"}`);
  ln(`<e>Klabautermann: </e>${klabStr}`);
  ln(`<e>Valor total estimado: </e>${formatBerries(totalPrice)}`);
  ln(`</div>`);
  ln();

  // ── Mecanismos Avançados (condicional)
  if (ship.mechanisms.length > 0) {
    ln(`<div style=" border: 1px solid; padding: 10px; ">`);
    ln(`<d>Mecanismos Avançados (${ship.mechanisms.length}/2)</d>`);
    for (const id of ship.mechanisms) {
      const mec = SHIP_MECHANISMS_BY_ID[id];
      if (!mec) continue;
      ln(`[QUOTE][b]${mec.name}:[/b] ${mec.description}[/QUOTE]`);
    }
    ln(`</div>`);
    ln();
  }

  // ── Cômodos (condicional)
  if (ship.comodoIds.length > 0) {
    ln(`<div style=" border: 1px solid; padding: 10px; ">`);
    ln(`<d>Cômodos (${usedSlots}/${sizeData.comodoSlots} slots)</d>`);
    for (const id of ship.comodoIds) {
      const com = SHIP_COMODOS_BY_ID[id];
      if (!com) continue;
      ln(`[QUOTE][b]${com.name} (Tamanho ${com.size}):[/b] ${com.description}`);
      ln(`[b]Bônus:[/b] ${com.bonus}[/QUOTE]`);
    }
    ln(`</div>`);
    ln();
  }

  // ── Tripulação (condicional)
  if (ship.crew.length > 0) {
    ln(`<div style=" border: 1px solid; padding: 10px; ">`);
    ln(`<d>Tripulação (${ship.crew.length}/${sizeData.maxCrew})</d>`);
    for (const member of ship.crew) {
      ln(`[b]${SHIP_ROLE_LABELS[member.role] ?? member.role}:[/b] ${member.name}`);
    }
    ln(`</div>`);
    ln();
  }

  // ── Observações (sempre)
  ln(`<div style=" border: 1px solid; padding: 10px; ">`);
  ln(`<d>Observações</d>`);
  ln(ship.notes || "[PREENCHER]");
  ln(`</div>`);
  ln();

  ln(`</div>`);
  ln(`<div class="versao">STAFF BNW 2024</div></div>[/dohtml]`);

  return L.join("\n");
}

export function downloadShipForumHTML(ship: Ship): void {
  const html = exportShipToForumHTML(ship);
  const blob = new Blob([html], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `${ship.name.replace(/\s+/g, "_").toLowerCase()}_navio.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export { copyToClipboard as copyShipToClipboard } from "../../character/utils/exporter";

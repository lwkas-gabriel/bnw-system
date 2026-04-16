import { useNavigate } from "react-router-dom";
import { Button } from "../shared/components";

interface Props { module: string }

export default function ComingSoonPage({ module }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl mb-6">
        🔜
      </div>
      <h2 className="text-xl font-bold text-slate-300 mb-2">{module}</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-2">
        Este módulo está planejado e terá seus dados carregados assim que as regras completas forem fornecidas.
      </p>
      <p className="text-xs text-slate-600 mb-6">
        Para desbloquear: envie o arquivo de regras correspondente.
      </p>
      <Button variant="ghost" onClick={() => navigate("/")}>← Voltar ao início</Button>
    </div>
  );
}

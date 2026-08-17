import { KodaMark } from "@/components/Logo";
import { Sparkle } from "@/components/Leaf";
import { BobaIcon } from "@/components/Icons";
import type { LoyaltyStatus } from "@/lib/loyalty";

type Props = {
  status: LoyaltyStatus;
  /** Nombre corto que se imprime en la tarjeta */
  name?: string;
  /** Documento enmascarado */
  dni?: string;
  /** Anima los sellos al aparecer */
  animate?: boolean;
};

/**
 * Tarjeta de sellos de Roa Brew.
 *
 * Cada casilla llena estampa la huella de Koda. La casilla intermedia y la
 * final se marcan aparte porque son las que dan premio.
 */
export default function StampCard({ status, name, dni, animate = true }: Props) {
  const slots = Array.from({ length: status.goal }, (_, i) => i + 1);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-ink bg-cream p-6 text-ink shadow-[8px_8px_0_var(--color-ink)] sm:p-8">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-hand text-3xl text-roa-500">tarjeta brew brew</p>
          <h3 className="font-display text-3xl leading-none">
            {name ?? "Tu tarjeta"}
          </h3>
          {dni && (
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-ink/40">
              Doc. {dni}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="font-display text-4xl leading-none text-roa-600">
            {status.stamps}
            <span className="text-2xl text-ink/30">/{status.goal}</span>
          </p>
          {status.cycles > 0 && (
            <p className="mt-1 text-xs font-bold text-grape-deep">
              {status.cycles} tarjeta{status.cycles > 1 ? "s" : ""} completada
              {status.cycles > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Casillas */}
      <div className="mt-7 grid grid-cols-5 gap-3 sm:gap-4">
        {slots.map((n) => {
          const filled = n <= status.stamps;
          const isMid = n === status.midGoal;
          const isFinal = n === status.goal;

          // Premio disponible y todavía sin usar → destaca
          const midGlow = isMid && status.midAvailable;
          const finalGlow = isFinal && status.fullAvailable;

          return (
            <div
              key={n}
              className={`relative aspect-square rounded-2xl border-2 transition-colors ${
                filled
                  ? "border-ink bg-roa-500"
                  : isMid || isFinal
                    ? "border-dashed border-ink/45 bg-white/60"
                    : "border-dashed border-ink/20 bg-white/40"
              } ${midGlow || finalGlow ? "animate-[prize-pulse_1.8s_ease-in-out_infinite]" : ""}`}
              style={
                midGlow || finalGlow
                  ? { borderColor: "var(--color-mango)", borderStyle: "solid" }
                  : undefined
              }
            >
              {filled ? (
                <span
                  className="absolute inset-0 grid place-items-center text-cream"
                  style={
                    animate
                      ? {
                          animation: `stamp-in 0.5s cubic-bezier(0.34,1.56,0.64,1) ${n * 70}ms both`,
                        }
                      : { transform: "rotate(-5deg)" }
                  }
                >
                  <KodaMark className="h-3/5 w-3/5" />
                </span>
              ) : (
                <span className="absolute inset-0 grid place-items-center text-ink/25">
                  {isFinal ? (
                    <BobaIcon className="h-1/2 w-1/2" />
                  ) : isMid ? (
                    <Sparkle className="h-2/5 w-2/5" />
                  ) : (
                    <span className="font-display text-lg">{n}</span>
                  )}
                </span>
              )}

              {/* Etiqueta de premio */}
              {(isMid || isFinal) && (
                <span
                  className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-ink px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    isFinal ? "bg-mango text-ink" : "bg-grape text-ink"
                  }`}
                >
                  {isFinal ? "Gratis" : "Cortesía"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Premios */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <RewardBox
          active={status.midAvailable}
          used={status.midRewardUsed}
          tone="grape"
          title={`${status.midGoal} sellos`}
          text="Agranda tu bebida o pide una de cortesía"
        />
        <RewardBox
          active={status.fullAvailable}
          used={false}
          tone="mango"
          title={`${status.goal} sellos`}
          text="Una bebida completamente gratis"
        />
      </div>
    </div>
  );
}

function RewardBox({
  active,
  used,
  tone,
  title,
  text,
}: {
  active: boolean;
  used: boolean;
  tone: "grape" | "mango";
  title: string;
  text: string;
}) {
  const tones = {
    grape: "bg-grape",
    mango: "bg-mango",
  };

  return (
    <div
      className={`rounded-2xl border-2 border-ink p-4 transition ${
        active ? tones[tone] : "bg-white/50"
      } ${used ? "opacity-45" : ""}`}
    >
      <p className="flex items-center gap-2 font-display text-xl leading-none">
        {title}
        {active && (
          <span className="rounded-full border-2 border-ink bg-cream px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
            Disponible
          </span>
        )}
        {used && (
          <span className="rounded-full border-2 border-ink/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-ink/50">
            Usado
          </span>
        )}
      </p>
      <p className={`mt-1.5 text-sm ${active ? "text-ink/70" : "text-ink/50"}`}>
        {text}
      </p>
    </div>
  );
}

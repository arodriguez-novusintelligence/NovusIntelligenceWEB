/**
 * Fondo de "red neuronal": nodos y conexiones con un flujo suave.
 * Puramente decorativo (aria-hidden) y quieto si el sistema pide reducir movimiento.
 */
const NODES: Array<[number, number]> = [
  [8, 18], [22, 8], [34, 26], [18, 40], [6, 62], [28, 56], [44, 44], [52, 14],
  [64, 30], [72, 8], [86, 20], [94, 40], [78, 50], [60, 64], [40, 76], [16, 84],
  [70, 82], [90, 72], [50, 92], [96, 90],
];

const EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [0, 3], [2, 3], [3, 4], [3, 5], [2, 6], [5, 6], [1, 7], [7, 8], [6, 8],
  [7, 9], [9, 10], [8, 10], [10, 11], [8, 12], [11, 12], [12, 13], [6, 13], [13, 14], [5, 14],
  [4, 15], [14, 15], [13, 16], [12, 17], [16, 17], [14, 18], [16, 18], [17, 19],
];

export function NeuralBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute -bottom-48 -right-24 h-[560px] w-[560px] rounded-full bg-secondary/20 blur-[130px]" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.35]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="nadf-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="hsl(220 85% 60%)" />
            <stop offset="1" stopColor="hsl(295 70% 60%)" />
          </linearGradient>
        </defs>
        {EDGES.map(([a, b], i) => {
          const [x1, y1] = NODES[a];
          const [x2, y2] = NODES[b];
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="url(#nadf-edge)"
              strokeWidth="0.12"
              strokeDasharray="1.2 2.8"
              vectorEffect="non-scaling-stroke"
              className="animate-nadf-dash"
              style={{ animationDelay: `${(i % 7) * 0.23}s` }}
            />
          );
        })}
      </svg>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {NODES.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i % 5 === 0 ? 0.55 : 0.35}
            fill={i % 3 === 0 ? "hsl(295 70% 66%)" : "hsl(220 85% 66%)"}
            className="animate-nadf-breathe"
            style={{ animationDelay: `${(i % 9) * 0.35}s`, transformOrigin: `${x}px ${y}px` }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(264_40%_8%/0.75)_75%)]" />
    </div>
  );
}

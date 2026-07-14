import {
  Bot,
  Workflow,
  Plug,
  LineChart,
  FileText,
  Headphones,
  type LucideIcon,
} from "lucide-react";

export interface Solution {
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  outcomes: string[];
}

export const solutions: Solution[] = [
  {
    slug: "ai-agents",
    name: "Novus AI Agents",
    short: "Sistemas que perciben, deciden y ejecutan.",
    description:
      "Agentes autónomos diseñados para resolver tareas reales del negocio: investigan, razonan, llaman herramientas internas y coordinan acciones con supervisión humana cuando importa.",
    icon: Bot,
    features: [
      "Orquestación multiagente con memoria contextual",
      "Conexión segura a sistemas internos vía herramientas",
      "Trazabilidad completa de decisiones y acciones",
      "Políticas de aprobación humana configurables",
    ],
    outcomes: [
      "Reducción de tiempo operativo",
      "Decisiones consistentes 24/7",
      "Escalabilidad sin sumar headcount",
    ],
  },
  {
    slug: "automation",
    name: "Novus Automation",
    short: "Procesos repetitivos y operaciones optimizadas.",
    description:
      "Automatizamos flujos de trabajo críticos combinando IA con orquestación de procesos: tickets, back-office, conciliaciones, onboarding y más.",
    icon: Workflow,
    features: [
      "Workflows configurables con bifurcaciones inteligentes",
      "Integración con ERPs, CRMs y herramientas internas",
      "Monitoreo y SLAs por proceso",
      "Reglas de negocio versionadas",
    ],
    outcomes: ["−40% tiempo de ciclo promedio", "Reducción de errores manuales", "Auditoría completa"],
  },
  {
    slug: "integrations",
    name: "Novus Integrations",
    short: "Integración sin fricción de sistemas, plataformas y datos.",
    description:
      "Conectamos islas de información — legacy, SaaS y data warehouses — para que la inteligencia fluya hacia donde se toman las decisiones.",
    icon: Plug,
    features: [
      "Conectores empresariales (SAP, Salesforce, Oracle, custom)",
      "Event-driven architecture sobre AWS",
      "Gobernanza de APIs y contratos versionados",
      "Sincronización en tiempo real o batch",
    ],
    outcomes: ["Una fuente de verdad", "Datos en tiempo real", "Menor deuda técnica"],
  },
  {
    slug: "analytics",
    name: "Novus Analytics",
    short: "Convertimos datos en información para decidir mejor.",
    description:
      "Plataformas de datos modernas con modelos predictivos y tableros pensados para la C-suite. De la métrica al insight accionable.",
    icon: LineChart,
    features: [
      "Lakehouse sobre AWS / Snowflake / BigQuery",
      "Modelos predictivos y de forecasting",
      "Tableros ejecutivos y self-service BI",
      "Calidad y linaje de datos",
    ],
    outcomes: ["Decisiones basadas en evidencia", "Anticipación de demanda y riesgo", "ROI medible"],
  },
  {
    slug: "documents-ai",
    name: "Novus Documents AI",
    short: "Procesamiento inteligente de documentos.",
    description:
      "Extracción, clasificación y validación de información de contratos, facturas, soportes y formularios — con precisión auditable.",
    icon: FileText,
    features: [
      "OCR + LLMs especializados",
      "Plantillas dinámicas por tipo de documento",
      "Validación contra reglas de negocio",
      "Cola de revisión humana cuando aplica",
    ],
    outcomes: ["Procesamiento en segundos", "Menos errores de captura", "Cumplimiento regulatorio"],
  },
  {
    slug: "customer-ai",
    name: "Novus Customer AI",
    short: "Asistentes virtuales y experiencias inteligentes.",
    description:
      "Asistentes conversacionales que conocen tu negocio, atienden con tu tono y resuelven sin escalar — integrados a tus canales actuales.",
    icon: Headphones,
    features: [
      "Asistentes omnicanal (web, WhatsApp, voz)",
      "Conocimiento empresarial (RAG)",
      "Handoff a agente humano sin perder contexto",
      "Métricas de satisfacción y resolución",
    ],
    outcomes: ["+CSAT", "−tiempo de primera respuesta", "Atención 24/7"],
  },
];

export const solutionSlugs = solutions.map((s) => s.slug);

export function getSolution(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug);
}

export function getRelatedSolutions(slug: string, limit = 3): Solution[] {
  return solutions.filter((s) => s.slug !== slug).slice(0, limit);
}

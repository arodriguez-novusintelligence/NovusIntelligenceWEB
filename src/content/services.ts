import { Brain, Network, Cog, Cloud, BarChart3, type LucideIcon } from "lucide-react";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  highlights: string[];
}

export const services: Service[] = [
  {
    id: "ai",
    title: "Inteligencia Artificial",
    description:
      "Modelos a medida — visión, lenguaje y predicción — entrenados sobre tus datos y desplegados con gobernanza enterprise.",
    icon: Brain,
    highlights: ["LLMs privados", "Fine-tuning", "RAG empresarial", "MLOps"],
  },
  {
    id: "multiagent",
    title: "Sistemas Multiagente",
    description:
      "Arquitecturas de agentes que coordinan, deciden y ejecutan tareas complejas con autonomía controlada y trazabilidad total.",
    icon: Network,
    highlights: ["Orquestación", "Tools/Function calling", "Human-in-the-loop"],
  },
  {
    id: "automation",
    title: "Automatización Inteligente",
    description:
      "Procesos operativos optimizados de extremo a extremo: menos pasos manuales, menos errores, más velocidad de ejecución.",
    icon: Cog,
    highlights: ["Workflows", "RPA + IA", "Reglas de negocio"],
  },
  {
    id: "cloud",
    title: "Integración Cloud",
    description:
      "Arquitecturas escalables sobre AWS (partner principal), Azure y Google Cloud. Seguridad, observabilidad y costos bajo control.",
    icon: Cloud,
    highlights: ["AWS", "Azure", "GCP", "IaC", "FinOps"],
  },
  {
    id: "analytics",
    title: "Analítica Avanzada",
    description:
      "De los datos a las decisiones: data platforms, modelos predictivos y tableros que mueven la aguja del negocio.",
    icon: BarChart3,
    highlights: ["Data Platform", "Forecasting", "Dashboards ejecutivos"],
  },
];

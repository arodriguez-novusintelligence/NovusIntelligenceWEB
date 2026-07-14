import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { PageShell } from "@/components/layout/PageShell";
import { LandingPage } from "@/pages/LandingPage";

const ServicesPage = lazy(() =>
  import("@/pages/ServicesPage").then((m) => ({ default: m.ServicesPage })),
);
const SolutionsPage = lazy(() =>
  import("@/pages/SolutionsPage").then((m) => ({ default: m.SolutionsPage })),
);
const SolutionDetailPage = lazy(() =>
  import("@/pages/SolutionDetailPage").then((m) => ({ default: m.SolutionDetailPage })),
);
const AboutPage = lazy(() => import("@/pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const CasesPage = lazy(() => import("@/pages/CasesPage").then((m) => ({ default: m.CasesPage })));
const ContactPage = lazy(() =>
  import("@/pages/ContactPage").then((m) => ({ default: m.ContactPage })),
);
const LegalPages = lazy(() =>
  import("@/pages/LegalPages").then((m) => ({
    default: m.PrivacyPage,
  })),
);
const DataTreatmentPage = lazy(() =>
  import("@/pages/LegalPages").then((m) => ({ default: m.DataTreatmentPage })),
);
const TermsPage = lazy(() =>
  import("@/pages/LegalPages").then((m) => ({ default: m.TermsPage })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="py-32 text-center text-muted-foreground">Cargando…</div>}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PageShell />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "services",
        element: (
          <LazyPage>
            <ServicesPage />
          </LazyPage>
        ),
      },
      {
        path: "solutions",
        element: (
          <LazyPage>
            <SolutionsPage />
          </LazyPage>
        ),
      },
      {
        path: "solutions/:slug",
        element: (
          <LazyPage>
            <SolutionDetailPage />
          </LazyPage>
        ),
      },
      {
        path: "about",
        element: (
          <LazyPage>
            <AboutPage />
          </LazyPage>
        ),
      },
      {
        path: "cases",
        element: (
          <LazyPage>
            <CasesPage />
          </LazyPage>
        ),
      },
      {
        path: "contact",
        element: (
          <LazyPage>
            <ContactPage />
          </LazyPage>
        ),
      },
      {
        path: "privacy",
        element: (
          <LazyPage>
            <LegalPages />
          </LazyPage>
        ),
      },
      {
        path: "data-treatment",
        element: (
          <LazyPage>
            <DataTreatmentPage />
          </LazyPage>
        ),
      },
      {
        path: "terms",
        element: (
          <LazyPage>
            <TermsPage />
          </LazyPage>
        ),
      },
      {
        path: "*",
        element: (
          <LazyPage>
            <NotFoundPage />
          </LazyPage>
        ),
      },
    ],
  },
]);

import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

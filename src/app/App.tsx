import { lazy, Suspense } from "react";
import { AuthForm } from "@/features/auth/AuthForm";
import { useAuth } from "@/features/auth/useAuth";
import { Footer } from "./layout/Footer";
import { Header } from "./layout/Header";

const TeamApp = lazy(() => import("./TeamApp"));

export default function App() {
  const { teamAuth } = useAuth();
  if (teamAuth)
    return (
      <Suspense
        fallback={
          <p role="status" className="p-8">
            Cargando...
          </p>
        }
      >
        <TeamApp key={teamAuth.id} teamAuth={teamAuth} />
      </Suspense>
    );
  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        teamName=""
        isAdmin={false}
        onOpenSettings={() => {}}
        onLogout={() => {}}
      />
      <main className="container mx-auto px-4 py-8">
        <AuthForm />
      </main>
      <Footer />
    </div>
  );
}

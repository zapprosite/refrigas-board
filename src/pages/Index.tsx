import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import LoginPage from "@/components/LoginPage";
import KanbanBoard from "@/components/KanbanBoard";
import CollaboratorView from "@/components/CollaboratorView";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, role, isApproved, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user || !isApproved || !role) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-secondary border-b border-border shadow-orange">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              REFRIMIX TECNOLOGIA
            </h1>
            <p className="text-xs text-muted-foreground">
              {role === 'Admin' && 'Administrador'}
              {role === 'Secretary' && 'Secretária'}
              {role === 'Collaborator' && 'Colaborador'}
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={signOut}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {(role === 'Admin' || role === 'Secretary') && (
          <KanbanBoard role={role} />
        )}
        {role === 'Collaborator' && <CollaboratorView />}
      </main>
    </div>
  );
};

export default Index;

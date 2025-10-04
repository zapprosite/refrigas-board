import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import LoginPage from "@/components/LoginPage";
import KanbanBoard from "@/components/KanbanBoard";
import CollaboratorView from "@/components/CollaboratorView";

type UserRole = 'admin' | 'secretary' | 'collaborator' | null;

const Index = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  if (!userRole) {
    return <LoginPage onLogin={handleLogin} />;
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
              {userRole === 'admin' && 'Administrador'}
              {userRole === 'secretary' && 'Secretária'}
              {userRole === 'collaborator' && 'Colaborador'}
            </p>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {(userRole === 'admin' || userRole === 'secretary') && (
          <KanbanBoard role={userRole} />
        )}
        {userRole === 'collaborator' && <CollaboratorView />}
      </main>
    </div>
  );
};

export default Index;

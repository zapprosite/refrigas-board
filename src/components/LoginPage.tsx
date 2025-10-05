import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Chrome, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const { signInWithGoogle, user, isApproved, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // User logged in but not approved yet
  if (user && !isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-orange">
          <div className="text-center space-y-2">
            <Calendar className="w-12 h-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              REFRIMIX TECNOLOGIA
            </h1>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sua conta está aguardando aprovação do administrador.
              Você receberá acesso em breve.
            </AlertDescription>
          </Alert>

          <div className="text-center text-sm text-muted-foreground">
            Email: {user.email}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-cyan-glow">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              REFRIMIX TECNOLOGIA
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-card-foreground">Agenda Sincronizada</h2>
          <p className="text-muted-foreground text-sm">
            Sistema de gestão para serviços HVAC-R e Elétricos
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full gap-2 shadow-orange hover:shadow-cyan-glow transition-all"
            size="lg"
            onClick={signInWithGoogle}
          >
            <Chrome className="w-5 h-5" />
            Entrar com Google
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Aguarde aprovação do administrador após o primeiro login
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;

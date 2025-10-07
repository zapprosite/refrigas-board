import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, Chrome, AlertCircle, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const { signInWithGoogle, signOut, user, isApproved, loading } = useAuth();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
        <Card className="w-full max-w-md shadow-elegant border-status-pending/20">
          <CardHeader className="space-y-3 text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-status-pending/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-status-pending" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Aguardando Aprovação
            </CardTitle>
            <CardDescription className="text-base">
              Login realizado com sucesso!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-status-pending/5 border border-status-pending/20 p-4">
              <p className="text-xs text-muted-foreground text-center mb-1">
                Conta cadastrada:
              </p>
              <p className="text-center font-medium text-foreground">
                {user.email}
              </p>
            </div>
            
            <Alert className="border-status-pending/20 bg-status-pending/5">
              <AlertCircle className="h-4 w-4 text-status-pending" />
              <AlertDescription className="text-sm">
                <strong className="block mb-1">Status: Pendente de aprovação</strong>
                Um administrador precisa aprovar seu acesso e atribuir uma função 
                (Admin, Secretária ou Colaborador) para que você possa utilizar o sistema.
              </AlertDescription>
            </Alert>

            <div className="pt-2 space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Entre em contato com o administrador do sistema para concluir seu cadastro.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={signOut}
              >
                Sair
              </Button>
            </div>
          </CardContent>
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

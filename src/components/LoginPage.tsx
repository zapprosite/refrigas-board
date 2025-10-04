import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Chrome } from "lucide-react";

interface LoginPageProps {
  onLogin: (role: 'admin' | 'secretary' | 'collaborator') => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
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
          >
            <Chrome className="w-5 h-5" />
            Entrar com Google
          </Button>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Demo: Selecione uma função
            </p>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onLogin('admin')}
              >
                Admin
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onLogin('secretary')}
              >
                Secretária
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onLogin('collaborator')}
              >
                Colaborador
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Aguarde aprovação do administrador após o primeiro login
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;

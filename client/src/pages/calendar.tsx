
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import Calendar from "@/components/dashboard/calendar";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Calendar as CalendarIcon, Users } from "lucide-react";

export default function CalendarPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você não está autenticado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando calendário jurídico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Calendário Jurídico" 
          subtitle="Gerencie compromissos, audiências e prazos importantes"
          action={
            <Button className="legal-button-primary">
              <Plus className="w-4 h-4 mr-2" />
              Novo Compromisso
            </Button>
          }
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Calendário principal */}
              <div className="lg:col-span-3">
                <Calendar />
              </div>
              
              {/* Sidebar com informações */}
              <div className="space-y-6">
                {/* Próximos compromissos */}
                <UpcomingEvents />
                
                {/* Estatísticas rápidas */}
                <Card className="legal-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Estatísticas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Este Mês</span>
                        <Badge className="bg-blue-100 text-blue-800">29 eventos</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Audiências</span>
                        <Badge variant="outline">8</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Reuniões</span>
                        <Badge variant="outline">15</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Prazos</span>
                        <Badge className="bg-yellow-100 text-yellow-800">6</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações rápidas */}
                <Card className="legal-card">
                  <CardHeader>
                    <CardTitle className="text-base">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Agendar Audiência
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Marcar Reunião
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Clock className="w-4 h-4 mr-2" />
                      Definir Prazo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

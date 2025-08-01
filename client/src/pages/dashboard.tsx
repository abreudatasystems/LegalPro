
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import OverviewCards from "@/components/dashboard/overview-cards";
import RevenueChart from "@/components/dashboard/revenue-chart";
import RecentActivities from "@/components/dashboard/recent-activities";
import QuickActions from "@/components/dashboard/quick-actions";
import UpcomingEvents from "@/components/dashboard/upcoming-events";
import Calendar from "@/components/dashboard/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  DollarSign, 
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Bell
} from "lucide-react";

interface DashboardStats {
  totalRevenue: number;
  activeContracts: number;
  totalClients: number;
  pendingTasks: number;
  revenueGrowth: number;
  contractsGrowth: number;
  clientsGrowth: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  date: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeView, setActiveView] = useState("overview");

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/advanced-stats", timeRange],
    queryFn: async () => {
      // Simulação de dados aprimorados
      return {
        totalRevenue: 1250000,
        activeContracts: 24,
        totalClients: 156,
        pendingTasks: 8,
        revenueGrowth: 18.7,
        contractsGrowth: 12.5,
        clientsGrowth: 8.3
      };
    }
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ["/api/dashboard/alerts"],
    queryFn: async () => {
      return [
        {
          id: "1",
          type: "warning",
          title: "Prazo próximo",
          message: "3 contratos vencem nos próximos 7 dias",
          date: new Date().toISOString()
        },
        {
          id: "2", 
          type: "info",
          title: "Nova atualização",
          message: "Sistema atualizado com novas funcionalidades",
          date: new Date().toISOString()
        }
      ];
    }
  });

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
          <p className="text-lg text-gray-600">Carregando sistema jurídico...</p>
        </div>
      </div>
    );
  }

  const getAlertIcon = (type: string) => {
    const icons = {
      warning: AlertTriangle,
      info: Bell,
      success: CheckCircle,
      error: AlertTriangle
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getAlertColor = (type: string) => {
    const colors = {
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800", 
      success: "bg-green-50 border-green-200 text-green-800",
      error: "bg-red-50 border-red-200 text-red-800"
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Dashboard Executivo" 
          subtitle="Visão geral do sistema jurídico e indicadores de performance"
          action={
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 dias</SelectItem>
                  <SelectItem value="30d">30 dias</SelectItem>
                  <SelectItem value="90d">90 dias</SelectItem>
                  <SelectItem value="1y">1 ano</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          }
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Alertas e notificações */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  return (
                    <Card key={alert.id} className={`border ${getAlertColor(alert.type)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <AlertIcon className="w-5 h-5" />
                          <div className="flex-1">
                            <h4 className="font-medium">{alert.title}</h4>
                            <p className="text-sm opacity-90">{alert.message}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            Dispensar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Cards de overview */}
            <OverviewCards />

            {/* Navegação por abas */}
            <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
              <TabsList className="grid w-full grid-cols-4 legal-card">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Visão Geral</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Calendário</span>
                </TabsTrigger>
                <TabsTrigger value="financeiro" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Financeiro</span>
                </TabsTrigger>
                <TabsTrigger value="atividades" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Atividades</span>
                </TabsTrigger>
              </TabsList>

              {/* Aba Overview */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-6">
                    <RevenueChart />
                    <QuickActions />
                  </div>
                  <div className="space-y-6">
                    <UpcomingEvents />
                    <RecentActivities />
                  </div>
                </div>
              </TabsContent>

              {/* Aba Calendário */}
              <TabsContent value="calendar" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <Calendar />
                  </div>
                  <div className="space-y-6">
                    <UpcomingEvents />
                    <Card className="legal-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span>Estatísticas do Mês</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
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
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              6
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Total de Compromissos</span>
                            <Badge className="bg-blue-100 text-blue-800">29</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Aba Financeiro */}
              <TabsContent value="financeiro" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <RevenueChart />
                  </div>
                  <div className="space-y-6">
                    <Card className="legal-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span>Resumo Financeiro</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Receita Mensal</span>
                            <span className="font-semibold text-green-600">
                              R$ {stats?.totalRevenue ? (stats.totalRevenue / 1000).toFixed(0) : '0'}k
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Contratos Ativos</span>
                            <span className="font-semibold">{stats?.activeContracts || 0}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Crescimento</span>
                            <Badge className="bg-green-100 text-green-800">
                              +{stats?.revenueGrowth || 0}%
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <QuickActions />
                  </div>
                </div>
              </TabsContent>

              {/* Aba Atividades */}
              <TabsContent value="atividades" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <RecentActivities />
                  <div className="space-y-6">
                    <UpcomingEvents />
                    <Card className="legal-card">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Activity className="w-5 h-5 text-purple-600" />
                          <span>Produtividade</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Tarefas Concluídas</span>
                            <Badge className="bg-green-100 text-green-800">24</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Em Andamento</span>
                            <Badge className="bg-blue-100 text-blue-800">8</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pendentes</span>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              {stats?.pendingTasks || 0}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

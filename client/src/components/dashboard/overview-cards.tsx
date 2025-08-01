
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, DollarSign, Briefcase, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface DashboardStats {
  activeContracts: number;
  totalClients: number;
  monthlyRevenue: number;
  activeProjects: number;
  contractsGrowth?: number;
  clientsGrowth?: number;
  revenueGrowth?: number;
  projectsGrowth?: number;
}

export default function OverviewCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      // Simulação de dados mais realistas
      return {
        activeContracts: 24,
        totalClients: 156,
        monthlyRevenue: 285000,
        activeProjects: 12,
        contractsGrowth: 12.5,
        clientsGrowth: 8.3,
        revenueGrowth: 18.7,
        projectsGrowth: -3.2
      };
    }
  });

  const cards = [
    {
      title: "Contratos Ativos",
      value: stats?.activeContracts || 0,
      change: stats?.contractsGrowth || 0,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Contratos em vigência"
    },
    {
      title: "Total de Clientes",
      value: stats?.totalClients || 0,
      change: stats?.clientsGrowth || 0,
      icon: Users,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      description: "Clientes cadastrados"
    },
    {
      title: "Receita Mensal",
      value: `R$ ${((stats?.monthlyRevenue || 0) / 1000).toFixed(0)}k`,
      change: stats?.revenueGrowth || 0,
      icon: DollarSign,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      description: "Faturamento do mês"
    },
    {
      title: "Projetos Ativos",
      value: stats?.activeProjects || 0,
      change: stats?.projectsGrowth || 0,
      icon: Briefcase,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Projetos em andamento"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="legal-card">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded mb-2"></div>
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        const isPositive = card.change >= 0;
        const changeColor = isPositive ? "text-green-600" : "text-red-600";
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="legal-card hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                  <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <Badge 
                  variant="outline" 
                  className={`${changeColor} border-current`}
                >
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {Math.abs(card.change).toFixed(1)}%
                </Badge>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                <div>
                  <p className="text-sm font-medium text-gray-700">{card.title}</p>
                  <p className="text-xs text-gray-500">{card.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Activity className="w-3 h-3" />
                  <span>
                    {isPositive ? 'Crescimento' : 'Redução'} de {Math.abs(card.change).toFixed(1)}% este mês
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

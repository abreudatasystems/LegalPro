import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";

interface RevenueData {
  month: string;
  revenue: number;
}

export default function RevenueChart() {
  const { data: revenueData, isLoading } = useQuery<RevenueData[]>({
    queryKey: ["/api/dashboard/revenue"],
  });

  if (isLoading) {
    return (
      <Card className="legal-card">
        <CardHeader>
          <CardTitle>Receita Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center animate-pulse">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Carregando dados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="legal-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Receita Mensal</CardTitle>
          <Select defaultValue="6months">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="12months">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Gráfico de Receita</p>
            <p className="text-xs text-gray-400">Chart.js implementation</p>
            {revenueData && (
              <div className="mt-4 text-sm text-gray-600">
                <p>Dados carregados: {revenueData.length} meses</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

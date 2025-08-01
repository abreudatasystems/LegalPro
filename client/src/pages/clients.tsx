
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import ClientForm from "@/components/clients/client-form";
import ClientList from "@/components/clients/client-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Users, 
  Search, 
  Filter, 
  Download, 
  BarChart3,
  TrendingUp,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import type { Client } from "@/db/schema";

export default function Clients() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao excluir cliente");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      deleteClientMutation.mutate(client.id);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clientStats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inactive: clients.filter(c => c.status === 'inactive').length,
    prospects: clients.filter(c => c.status === 'prospect').length
  };

  if (isLoading) {
    return (
      <div className="legal-container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando sistema de clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen legal-container">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Gestão de Clientes" 
          subtitle="Gerencie sua carteira de clientes e prospects com eficiência"
          action={
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="legal-button-secondary">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="legal-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="legal-gradient-text">
                      {selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
                    </DialogTitle>
                  </DialogHeader>
                  <ClientForm 
                    client={selectedClient} 
                    onSuccess={() => {
                      setIsDialogOpen(false);
                      setSelectedClient(null);
                    }} 
                  />
                </DialogContent>
              </Dialog>
            </div>
          }
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Cards de estatísticas */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                      <p className="text-3xl font-bold legal-gradient-text">{clientStats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+12% este mês</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Clientes Ativos</p>
                      <p className="text-3xl font-bold legal-gradient-text">{clientStats.active}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge className="bg-green-100 text-green-800">
                      {Math.round((clientStats.active / clientStats.total) * 100)}% do total
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Prospects</p>
                      <p className="text-3xl font-bold legal-gradient-text">{clientStats.prospects}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Potencial de conversão
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Empresas</p>
                      <p className="text-3xl font-bold legal-gradient-text">
                        {clients.filter(c => c.type === 'empresa').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge className="bg-purple-100 text-purple-800">
                      Clientes corporativos
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros e busca */}
            <Card className="legal-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar clientes por nome ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="legal-input pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 legal-input">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                        <SelectItem value="prospect">Prospects</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de clientes */}
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="legal-card">
                <TabsTrigger value="grid">Grade</TabsTrigger>
                <TabsTrigger value="list">Lista</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="mt-6">
                {clientsLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="legal-card">
                        <CardContent className="p-6">
                          <div className="loading-shimmer h-48 rounded-lg"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClients.map((client) => (
                      <Card key={client.id} className="legal-card legal-hover-lift group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{client.name}</h3>
                                <Badge className={
                                  client.status === 'active' ? 'bg-green-100 text-green-800' :
                                  client.status === 'prospect' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {client.status === 'active' ? 'Ativo' : 
                                   client.status === 'prospect' ? 'Prospect' : 'Inativo'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setSelectedClient(client);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDeleteClient(client)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              <span className="truncate">{client.email}</span>
                            </div>
                            
                            {client.phone && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Cliente desde {new Date(client.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {client.type === 'pessoa_fisica' ? 'Pessoa Física' : 'Empresa'}
                              </Badge>
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                                <Eye className="w-4 h-4 mr-1" />
                                Ver detalhes
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="mt-6">
                <ClientList />
              </TabsContent>
            </Tabs>

            {filteredClients.length === 0 && !clientsLoading && (
              <Card className="legal-card">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                  <p className="text-gray-600 mb-6">
                    {searchTerm ? 'Nenhum cliente corresponde aos filtros aplicados.' : 'Comece adicionando seu primeiro cliente.'}
                  </p>
                  <Button 
                    className="legal-button-primary"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Cliente
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

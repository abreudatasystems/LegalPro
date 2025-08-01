import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Sidebar from "@/components/layout/sidebar";
import { 
  Search, 
  Plus, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  File, 
  Folder,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Document, type Client, type Project, type Contract } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Verificar autenticação
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: contracts } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Sucesso",
        description: "Documento excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir documento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const filteredDocuments = documents?.filter(doc => {
    const searchMatch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedCategory === "all") return searchMatch;
    return searchMatch && doc.type === selectedCategory;
  }) || [];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: "default",
      draft: "secondary", 
      archived: "outline",
    };
    
    const labels: Record<string, string> = {
      active: "Ativo",
      draft: "Rascunho",
      archived: "Arquivado",
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getClientName = (clientId: string) => {
    return clients?.find(c => c.id === clientId)?.name || "Cliente não encontrado";
  };

  const getProjectName = (projectId: string) => {
    return projects?.find(p => p.id === projectId)?.name || "Projeto não encontrado";
  };

  const documentCategories = [
    { value: "all", label: "Todos", count: documents?.length || 0 },
    { value: "contract", label: "Contratos", count: documents?.filter(d => d.type === "contract").length || 0 },
    { value: "legal", label: "Jurídicos", count: documents?.filter(d => d.type === "legal").length || 0 },
    { value: "financial", label: "Financeiros", count: documents?.filter(d => d.type === "financial").length || 0 },
    { value: "administrative", label: "Administrativos", count: documents?.filter(d => d.type === "administrative").length || 0 },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Documentos</h1>
                <p className="text-gray-600">Organize e gerencie todos os documentos jurídicos</p>
              </div>
        <Button className="flex items-center space-x-2">
          <Upload className="w-4 h-4" />
          <span>Upload Documento</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {documentCategories.map((category) => (
            <TabsTrigger key={category.value} value={category.value} className="flex items-center space-x-2">
              <span>{category.label}</span>
              <Badge variant="secondary" className="ml-1">
                {category.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="legal-card hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg line-clamp-1">{document.name}</CardTitle>
                      </div>
                      {getStatusBadge(document.status || "active")}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Folder className="w-4 h-4" />
                        <span>Tipo: {document.type}</span>
                      </div>
                      {document.clientId && (
                        <div className="flex items-center space-x-1">
                          <span>Cliente: {getClientName(document.clientId)}</span>
                        </div>
                      )}
                      {document.projectId && (
                        <div className="flex items-center space-x-1">
                          <span>Projeto: {getProjectName(document.projectId)}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(document.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteDocumentMutation.mutate(document.id)}
                        disabled={deleteDocumentMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredDocuments.length === 0 && (
            <Card className="legal-card">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm 
                    ? "Tente ajustar os termos de busca." 
                    : "Comece fazendo o upload do seu primeiro documento."
                  }
                </p>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documento
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
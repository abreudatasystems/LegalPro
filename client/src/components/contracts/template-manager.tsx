
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, FileText, Layers, Search, Eye, Scale, Gavel, BookOpen, Shield, Building, Users } from "lucide-react";
import { type ContractTemplate, type ContractClause } from "@shared/schema";

const templateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  category: z.string().optional(),
});

const clauseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  category: z.string().optional(),
});

const templateCategories = [
  { value: "civil", label: "Direito Civil", icon: Scale },
  { value: "trabalhista", label: "Direito Trabalhista", icon: Users },
  { value: "empresarial", label: "Direito Empresarial", icon: Building },
  { value: "imobiliario", label: "Direito Imobiliário", icon: Building },
  { value: "tributario", label: "Direito Tributário", icon: FileText },
  { value: "processual", label: "Direito Processual", icon: Gavel },
  { value: "outros", label: "Outros", icon: BookOpen },
];

const clauseCategories = [
  { value: "confidencialidade", label: "Confidencialidade", icon: Shield },
  { value: "pagamento", label: "Pagamento", icon: FileText },
  { value: "rescisao", label: "Rescisão", icon: Scale },
  { value: "responsabilidade", label: "Responsabilidade", icon: Gavel },
  { value: "garantias", label: "Garantias", icon: Shield },
  { value: "propriedade", label: "Propriedade Intelectual", icon: BookOpen },
  { value: "outros", label: "Outros", icon: Layers },
];

export default function TemplateManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("templates");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showClauseDialog, setShowClauseDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [editingClause, setEditingClause] = useState<ContractClause | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading: templatesLoading } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/contract-templates"],
  });

  const { data: clauses, isLoading: clausesLoading } = useQuery<ContractClause[]>({
    queryKey: ["/api/contract-clauses"],
  });

  const templateForm = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
      category: "",
    },
  });

  const clauseForm = useForm({
    resolver: zodResolver(clauseSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
    },
  });

  // Mutações para templates
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/contract-templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      toast({ 
        title: "✅ Sucesso", 
        description: "Minuta jurídica criada com sucesso." 
      });
      setShowTemplateDialog(false);
      templateForm.reset();
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/contract-templates/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      toast({ 
        title: "✅ Sucesso", 
        description: "Minuta jurídica atualizada com sucesso." 
      });
      setShowTemplateDialog(false);
      setEditingTemplate(null);
      templateForm.reset();
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contract-templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      toast({ 
        title: "✅ Sucesso", 
        description: "Minuta jurídica removida com sucesso." 
      });
    },
  });

  // Mutações para cláusulas
  const createClauseMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/contract-clauses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-clauses"] });
      toast({ 
        title: "✅ Sucesso", 
        description: "Cláusula jurídica criada com sucesso." 
      });
      setShowClauseDialog(false);
      clauseForm.reset();
    },
  });

  const updateClauseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/contract-clauses/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-clauses"] });
      toast({ 
        title: "✅ Sucesso", 
        description: "Cláusula jurídica atualizada com sucesso." 
      });
      setShowClauseDialog(false);
      setEditingClause(null);
      clauseForm.reset();
    },
  });

  const deleteClauseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contract-clauses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-clauses"] });
      toast({ 
        title: "✅ Sucesso", 
        description: "Cláusula jurídica removida com sucesso." 
      });
    },
  });

  const handleEditTemplate = (template: ContractTemplate) => {
    setEditingTemplate(template);
    templateForm.reset({
      name: template.name,
      description: template.description || "",
      content: template.content,
      category: template.category || "",
    });
    setShowTemplateDialog(true);
  };

  const handleEditClause = (clause: ContractClause) => {
    setEditingClause(clause);
    clauseForm.reset({
      title: clause.title,
      content: clause.content,
      category: clause.category || "",
    });
    setShowClauseDialog(true);
  };

  const handlePreview = (content: string, title: string) => {
    setPreviewContent(`# ${title}\n\n${content}`);
    setShowPreview(true);
  };

  const onSubmitTemplate = (data: any) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const onSubmitClause = (data: any) => {
    if (editingClause) {
      updateClauseMutation.mutate({ id: editingClause.id, data });
    } else {
      createClauseMutation.mutate(data);
    }
  };

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredClauses = clauses?.filter(clause =>
    clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clause.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clause.category?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const clausesByCategory = filteredClauses.reduce((acc, clause) => {
    const category = clause.category || "Geral";
    if (!acc[category]) acc[category] = [];
    acc[category].push(clause);
    return acc;
  }, {} as Record<string, ContractClause[]>);

  const getCategoryIcon = (category: string, type: 'template' | 'clause') => {
    const categories = type === 'template' ? templateCategories : clauseCategories;
    const found = categories.find(cat => cat.value === category);
    return found ? found.icon : (type === 'template' ? FileText : Layers);
  };

  const getCategoryLabel = (category: string, type: 'template' | 'clause') => {
    const categories = type === 'template' ? templateCategories : clauseCategories;
    const found = categories.find(cat => cat.value === category);
    return found ? found.label : category;
  };

  return (
    <div className="space-y-6">
      {/* Header com busca aprimorado */}
      <Card className="legal-card border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gavel className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Biblioteca Jurídica</h2>
                <p className="text-sm text-gray-600">Gerencie minutas base e cláusulas especializadas</p>
              </div>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar minutas e cláusulas jurídicas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 legal-card"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 legal-card">
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Scale className="w-4 h-4" />
            <span>Minutas Jurídicas</span>
          </TabsTrigger>
          <TabsTrigger value="clauses" className="flex items-center space-x-2">
            <Layers className="w-4 h-4" />
            <span>Biblioteca de Cláusulas</span>
          </TabsTrigger>
        </TabsList>

        {/* Aba de Minutas */}
        <TabsContent value="templates" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Scale className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Minutas Jurídicas ({filteredTemplates.length})</h3>
            </div>
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingTemplate(null); templateForm.reset(); }} className="legal-button-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Minuta Jurídica
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Scale className="w-5 h-5 text-blue-600" />
                    <span>{editingTemplate ? "Editar Minuta Jurídica" : "Nova Minuta Jurídica"}</span>
                  </DialogTitle>
                </DialogHeader>
                <Form {...templateForm}>
                  <form onSubmit={templateForm.handleSubmit(onSubmitTemplate)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={templateForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Minuta Jurídica</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Contrato de Prestação de Serviços Advocatícios" {...field} className="legal-card" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={templateForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área do Direito</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="legal-card">
                                  <SelectValue placeholder="Selecione a área jurídica" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {templateCategories.map((category) => {
                                  const IconComponent = category.icon;
                                  return (
                                    <SelectItem key={category.value} value={category.value}>
                                      <div className="flex items-center space-x-2">
                                        <IconComponent className="w-4 h-4" />
                                        <span>{category.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={templateForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição Jurídica</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Descrição detalhada da aplicação e escopo jurídico da minuta..." {...field} className="legal-card" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={templateForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo da Minuta Jurídica</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Conteúdo completo da minuta jurídica com cláusulas padrão..."
                              className="min-h-[400px] font-mono legal-card"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => setShowTemplateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="legal-button-primary">
                        {editingTemplate ? "Atualizar" : "Criar"} Minuta
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {templatesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Carregando minutas jurídicas...</p>
              </div>
            ) : (
              filteredTemplates.map((template) => {
                const IconComponent = getCategoryIcon(template.category || '', 'template');
                return (
                  <Card key={template.id} className="legal-card hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{template.name}</h4>
                              {template.category && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {getCategoryLabel(template.category, 'template')}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {template.description && (
                            <p className="text-sm text-gray-600 mb-3 leading-relaxed">{template.description}</p>
                          )}
                          <p className="text-xs text-gray-400">
                            Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(template.content, template.name)}
                            className="hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditTemplate(template)}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTemplateMutation.mutate(template.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Aba de Cláusulas */}
        <TabsContent value="clauses" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Biblioteca de Cláusulas ({filteredClauses.length})</h3>
            </div>
            <Dialog open={showClauseDialog} onOpenChange={setShowClauseDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingClause(null); clauseForm.reset(); }} className="legal-button-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Cláusula Jurídica
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>{editingClause ? "Editar Cláusula Jurídica" : "Nova Cláusula Jurídica"}</span>
                  </DialogTitle>
                </DialogHeader>
                <Form {...clauseForm}>
                  <form onSubmit={clauseForm.handleSubmit(onSubmitClause)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={clauseForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título da Cláusula</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Cláusula de Confidencialidade e Sigilo Profissional" {...field} className="legal-card" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={clauseForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categoria Jurídica</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="legal-card">
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clauseCategories.map((category) => {
                                  const IconComponent = category.icon;
                                  return (
                                    <SelectItem key={category.value} value={category.value}>
                                      <div className="flex items-center space-x-2">
                                        <IconComponent className="w-4 h-4" />
                                        <span>{category.label}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={clauseForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conteúdo da Cláusula Jurídica</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Conteúdo completo da cláusula com redação jurídica adequada..."
                              className="min-h-[250px] font-mono legal-card"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-3">
                      <Button type="button" variant="outline" onClick={() => setShowClauseDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" className="legal-button-primary">
                        {editingClause ? "Atualizar" : "Criar"} Cláusula
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-6">
            {clausesLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Carregando biblioteca de cláusulas...</p>
              </div>
            ) : (
              Object.entries(clausesByCategory).map(([category, categoryCllauses]) => {
                const IconComponent = getCategoryIcon(category, 'clause');
                return (
                  <Card key={category} className="legal-card">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <CardTitle className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>{getCategoryLabel(category, 'clause')}</span>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">{categoryCllauses.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {categoryCllauses.map((clause) => (
                          <div key={clause.id} className="border rounded-lg p-4 hover:bg-blue-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-semibold mb-2">{clause.title}</h5>
                                <p className="text-sm text-gray-600 line-clamp-3">{clause.content}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  Criado em {new Date(clause.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePreview(clause.content, clause.title)}
                                  className="hover:bg-blue-50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditClause(clause)}
                                  className="hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteClauseMutation.mutate(clause.id)}
                                  className="hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Preview aprimorado */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Visualização Jurídica</span>
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white border rounded-lg p-6 shadow-inner">
            <div className="bg-white p-8 font-mono text-sm leading-relaxed border border-gray-200 rounded">
              <pre className="whitespace-pre-wrap">
                {previewContent}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

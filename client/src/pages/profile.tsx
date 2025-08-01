import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Shield, 
  Bell, 
  Activity, 
  LogOut, 
  Edit, 
  Save, 
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award
} from "lucide-react";

interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  professional: {
    position: string;
    department: string;
    oabNumber: string;
    specialties: string[];
    experience: string;
    education: string;
    certifications: string[];
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    theme: string;
    language: string;
    timezone: string;
  };
  security: {
    lastLogin: string;
    activeSessions: number;
    twoFactorEnabled: boolean;
  };
}

export default function Profile() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    personal: {
      firstName: "João",
      lastName: "Silva",
      email: user?.email || "",
      phone: "(11) 99999-9999",
      birthDate: "1985-06-15",
      address: "Rua das Flores, 123",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567"
    },
    professional: {
      position: "Advogado Sênior",
      department: "Direito Civil",
      oabNumber: "SP 123.456",
      specialties: ["Direito Civil", "Direito Empresarial", "Contratos"],
      experience: "10+ anos",
      education: "Bacharel em Direito - USP",
      certifications: ["Especialização em Direito Civil", "MBA em Gestão Jurídica"]
    },
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      theme: "light",
      language: "pt-BR",
      timezone: "America/Sao_Paulo"
    },
    security: {
      lastLogin: new Date().toISOString(),
      activeSessions: 2,
      twoFactorEnabled: false
    }
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Acesso Negado",
        description: "Você não está autenticado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, isLoading, toast]);

  const handleSave = () => {
    // Simular salvamento do perfil
    setIsEditing(false);
    toast({
      title: "Perfil Atualizado",
      description: "Suas informações foram salvas com sucesso"
    });
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value
      }
    }));
  };

  const updateProfessionalInfo = (field: string, value: string | string[]) => {
    setProfile(prev => ({
      ...prev,
      professional: {
        ...prev.professional,
        [field]: value
      }
    }));
  };

  const updatePreferences = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Perfil do Usuário" 
          subtitle="Gerencie suas informações pessoais e profissionais"
          action={
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>
          }
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Cabeçalho do perfil */}
            <Card className="legal-card">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src="/placeholder-avatar.jpg" alt="Foto do perfil" />
                      <AvatarFallback className="text-xl">
                        {profile.personal.firstName[0]}{profile.personal.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">
                      {profile.personal.firstName} {profile.personal.lastName}
                    </h2>
                    <p className="text-muted-foreground">{profile.professional.position}</p>
                    <p className="text-sm text-muted-foreground">{profile.professional.department}</p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.professional.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{profile.personal.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{profile.personal.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>{profile.professional.oabNumber}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 legal-card">
                <TabsTrigger value="personal" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Pessoal</span>
                </TabsTrigger>
                <TabsTrigger value="professional" className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span>Profissional</span>
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Preferências</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Segurança</span>
                </TabsTrigger>
              </TabsList>

              {/* Aba Informações Pessoais */}
              <TabsContent value="personal" className="space-y-6 mt-6">
                <Card className="legal-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Informações Pessoais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          value={profile.personal.firstName}
                          onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          value={profile.personal.lastName}
                          onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.personal.email}
                          onChange={(e) => updatePersonalInfo('email', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={profile.personal.phone}
                          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={profile.personal.birthDate}
                        onChange={(e) => updatePersonalInfo('birthDate', e.target.value)}
                        disabled={!isEditing}
                        className="w-48"
                      />
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={profile.personal.address}
                        onChange={(e) => updatePersonalInfo('address', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={profile.personal.city}
                          onChange={(e) => updatePersonalInfo('city', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={profile.personal.state}
                          onChange={(e) => updatePersonalInfo('state', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input
                          id="zipCode"
                          value={profile.personal.zipCode}
                          onChange={(e) => updatePersonalInfo('zipCode', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Informações Profissionais */}
              <TabsContent value="professional" className="space-y-6 mt-6">
                <Card className="legal-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-green-600" />
                      <span>Informações Profissionais</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="position">Cargo</Label>
                        <Input
                          id="position"
                          value={profile.professional.position}
                          onChange={(e) => updateProfessionalInfo('position', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Departamento</Label>
                        <Input
                          id="department"
                          value={profile.professional.department}
                          onChange={(e) => updateProfessionalInfo('department', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="oabNumber">Número da OAB</Label>
                        <Input
                          id="oabNumber"
                          value={profile.professional.oabNumber}
                          onChange={(e) => updateProfessionalInfo('oabNumber', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience">Experiência</Label>
                        <Input
                          id="experience"
                          value={profile.professional.experience}
                          onChange={(e) => updateProfessionalInfo('experience', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="education">Formação</Label>
                      <Textarea
                        id="education"
                        value={profile.professional.education}
                        onChange={(e) => updateProfessionalInfo('education', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>Especializações</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.professional.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      {isEditing && (
                        <Input
                          placeholder="Digite uma especialização e pressione Enter"
                          className="mt-2"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = (e.target as HTMLInputElement).value;
                              if (value && !profile.professional.specialties.includes(value)) {
                                updateProfessionalInfo('specialties', [...profile.professional.specialties, value]);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                      )}
                    </div>

                    <div>
                      <Label>Certificações</Label>
                      <div className="space-y-2 mt-2">
                        {profile.professional.certifications.map((cert, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Preferências */}
              <TabsContent value="preferences" className="space-y-6 mt-6">
                <Card className="legal-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="w-5 h-5 text-purple-600" />
                      <span>Preferências</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notificações por E-mail</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações no seu e-mail
                        </p>
                      </div>
                      <Switch
                        checked={profile.preferences.emailNotifications}
                        onCheckedChange={(checked) => updatePreferences('emailNotifications', checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notificações SMS</Label>
                        <p className="text-sm text-muted-foreground">
                          Receber notificações por mensagem de texto
                        </p>
                      </div>
                      <Switch
                        checked={profile.preferences.smsNotifications}
                        onCheckedChange={(checked) => updatePreferences('smsNotifications', checked)}
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tema</Label>
                        <Select 
                          value={profile.preferences.theme} 
                          onValueChange={(value) => updatePreferences('theme', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="auto">Automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Idioma</Label>
                        <Select 
                          value={profile.preferences.language} 
                          onValueChange={(value) => updatePreferences('language', value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Segurança */}
              <TabsContent value="security" className="space-y-6 mt-6">
                <Card className="legal-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-red-600" />
                      <span>Segurança</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label>Último Login</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(profile.security.lastLogin).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <Label>Sessões Ativas</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.security.activeSessions} sessões
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Autenticação de Dois Fatores</Label>
                        <p className="text-sm text-muted-foreground">
                          Adiciona uma camada extra de segurança
                        </p>
                      </div>
                      <Switch
                        checked={profile.security.twoFactorEnabled}
                        disabled={!isEditing}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Shield className="w-4 h-4 mr-2" />
                        Alterar Senha
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Activity className="w-4 h-4 mr-2" />
                        Ver Atividade da Conta
                      </Button>
                      <Button variant="destructive" className="w-full justify-start" onClick={() => window.location.href = '/api/logout'}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Fazer Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
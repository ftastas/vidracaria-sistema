import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  Clipboard, 
  Edit, 
  Trash2, 
  Filter, 
  X,
  AlertCircle,
  Calendar,
  MoveRight,
  MoveLeft,
  CheckCircle2,
  Clock,
  Hammer,
  Truck
} from 'lucide-react';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

import { supabase, fetchAll, insert, update, remove } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../lib/utils';

// Esquema de validação para ordens de serviço
const ordemServicoSchema = z.object({
  cliente: z.string().min(1, 'Nome do cliente é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  produto: z.string().min(1, 'Produto é obrigatório'),
  data_entrada: z.string().min(1, 'Data de entrada é obrigatória'),
  data_entrega: z.string().min(1, 'Data de entrega é obrigatória'),
  status: z.string().min(1, 'Status é obrigatório'),
  valor: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  observacoes: z.string().optional(),
  endereco_entrega: z.string().optional(),
});

// Componente para o formulário de ordem de serviço
function OrdemServicoForm({ ordem, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ordemServicoSchema),
    defaultValues: {
      cliente: ordem?.cliente || '',
      telefone: ordem?.telefone || '',
      email: ordem?.email || '',
      produto: ordem?.produto || '',
      data_entrada: ordem?.data_entrada || format(new Date(), 'yyyy-MM-dd'),
      data_entrega: ordem?.data_entrega || format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      status: ordem?.status || 'em_aberto',
      valor: ordem?.valor || '',
      observacoes: ordem?.observacoes || '',
      endereco_entrega: ordem?.endereco_entrega || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Input
            id="cliente"
            {...register('cliente')}
            placeholder="Nome do cliente"
          />
          {errors.cliente && (
            <p className="text-sm text-red-500">{errors.cliente.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            {...register('telefone')}
            placeholder="(00) 00000-0000"
          />
          {errors.telefone && (
            <p className="text-sm text-red-500">{errors.telefone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="cliente@email.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="produto">Produto</Label>
          <Input
            id="produto"
            {...register('produto')}
            placeholder="Descrição do produto"
          />
          {errors.produto && (
            <p className="text-sm text-red-500">{errors.produto.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_entrada">Data de Entrada</Label>
          <Input
            id="data_entrada"
            type="date"
            {...register('data_entrada')}
          />
          {errors.data_entrada && (
            <p className="text-sm text-red-500">{errors.data_entrada.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data_entrega">Data de Entrega</Label>
          <Input
            id="data_entrega"
            type="date"
            {...register('data_entrega')}
          />
          {errors.data_entrega && (
            <p className="text-sm text-red-500">{errors.data_entrega.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            defaultValue={ordem?.status || 'em_aberto'} 
            onValueChange={(value) => setValue('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="em_aberto">Em Aberto</SelectItem>
              <SelectItem value="em_producao">Em Produção</SelectItem>
              <SelectItem value="pronto_entrega">Pronto para Entrega</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor">Valor</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              className="pl-8"
              {...register('valor')}
            />
          </div>
          {errors.valor && (
            <p className="text-sm text-red-500">{errors.valor.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="endereco_entrega">Endereço de Entrega</Label>
          <Input
            id="endereco_entrega"
            {...register('endereco_entrega')}
            placeholder="Endereço completo para entrega (opcional)"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register('observacoes')}
            placeholder="Observações adicionais sobre a ordem de serviço"
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {ordem ? 'Atualizar Ordem de Serviço' : 'Criar Ordem de Serviço'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente para o cartão de ordem de serviço no Kanban
function OrdemServicoCard({ ordem, onEdit, onDelete, onMoveLeft, onMoveRight }) {
  return (
    <Card className="mb-3">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{ordem.produto}</CardTitle>
          <div className="flex gap-1">
            {onMoveLeft && (
              <Button variant="ghost" size="icon" onClick={onMoveLeft} className="h-6 w-6">
                <MoveLeft className="h-4 w-4" />
              </Button>
            )}
            {onMoveRight && (
              <Button variant="ghost" size="icon" onClick={onMoveRight} className="h-6 w-6">
                <MoveRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription className="text-sm">{ordem.cliente}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2 pt-0">
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Entrada:</span>
            <span>{formatDate(ordem.data_entrada)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Entrega:</span>
            <span>{formatDate(ordem.data_entrega)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Valor:</span>
            <span className="font-medium">{formatCurrency(ordem.valor)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" /> Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-500">
                <Trash2 className="h-4 w-4 mr-1" /> Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir esta ordem de serviço?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={onDelete}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
}

// Componente principal da página de ordens de serviço
export default function OrdensServico() {
  const [ordens, setOrdens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordemAtual, setOrdemAtual] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    cliente: '',
    produto: '',
    status: '',
    dataInicio: '',
    dataFim: '',
  });
  const [error, setError] = useState('');
  const [visualizacao, setVisualizacao] = useState('kanban');

  // Busca as ordens de serviço no banco de dados
  const buscarOrdens = async () => {
    setLoading(true);
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      // Aqui estamos simulando os dados para demonstração
      const data = await fetchAll('ordens_servico').catch(() => {
        // Dados fictícios para demonstração
        return [
          {
            id: 1,
            cliente: 'Pedro Alves',
            telefone: '(11) 98765-4321',
            email: 'pedro@email.com',
            produto: 'Porta de Vidro',
            data_entrada: '2025-06-01',
            data_entrega: '2025-06-10',
            status: 'em_producao',
            valor: 1500,
            observacoes: 'Cliente solicitou entrega rápida',
            endereco_entrega: 'Rua das Flores, 123',
          },
          {
            id: 2,
            cliente: 'Ana Costa',
            telefone: '(11) 91234-5678',
            email: 'ana@email.com',
            produto: 'Box de Banheiro',
            data_entrada: '2025-06-02',
            data_entrega: '2025-06-12',
            status: 'pronto_entrega',
            valor: 850,
            observacoes: '',
            endereco_entrega: 'Av. Principal, 456',
          },
          {
            id: 3,
            cliente: 'Marcos Souza',
            telefone: '(11) 97777-8888',
            email: 'marcos@email.com',
            produto: 'Espelho',
            data_entrada: '2025-06-03',
            data_entrega: '2025-06-08',
            status: 'em_aberto',
            valor: 450,
            observacoes: 'Espelho com moldura',
            endereco_entrega: '',
          },
          {
            id: 4,
            cliente: 'Carla Lima',
            telefone: '(11) 95555-6666',
            email: 'carla@email.com',
            produto: 'Janela de Vidro',
            data_entrada: '2025-05-25',
            data_entrega: '2025-06-05',
            status: 'entregue',
            valor: 1200,
            observacoes: '',
            endereco_entrega: 'Rua dos Pinheiros, 789',
          },
          {
            id: 5,
            cliente: 'Roberto Santos',
            telefone: '(11) 94444-3333',
            email: 'roberto@email.com',
            produto: 'Mesa de Vidro',
            data_entrada: '2025-06-04',
            data_entrega: '2025-06-15',
            status: 'em_producao',
            valor: 2000,
            observacoes: 'Vidro temperado 10mm',
            endereco_entrega: 'Av. das Palmeiras, 321',
          },
        ];
      });
      
      setOrdens(data);
    } catch (error) {
      console.error('Erro ao buscar ordens de serviço:', error);
      setError('Não foi possível carregar as ordens de serviço. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarOrdens();
  }, []);

  // Filtra as ordens de serviço com base nos filtros aplicados
  const ordensFiltradas = ordens.filter((ordem) => {
    // Filtro por cliente
    if (filtros.cliente && !ordem.cliente.toLowerCase().includes(filtros.cliente.toLowerCase())) {
      return false;
    }
    
    // Filtro por produto
    if (filtros.produto && !ordem.produto.toLowerCase().includes(filtros.produto.toLowerCase())) {
      return false;
    }
    
    // Filtro por status
    if (filtros.status && ordem.status !== filtros.status) {
      return false;
    }
    
    // Filtro por data de início
    if (filtros.dataInicio && ordem.data_entrada < filtros.dataInicio) {
      return false;
    }
    
    // Filtro por data de fim
    if (filtros.dataFim && ordem.data_entrega > filtros.dataFim) {
      return false;
    }
    
    return true;
  });

  // Agrupa as ordens por status para o Kanban
  const ordensAgrupadas = {
    em_aberto: ordensFiltradas.filter(o => o.status === 'em_aberto'),
    em_producao: ordensFiltradas.filter(o => o.status === 'em_producao'),
    pronto_entrega: ordensFiltradas.filter(o => o.status === 'pronto_entrega'),
    entregue: ordensFiltradas.filter(o => o.status === 'entregue'),
  };

  // Manipula a criação de uma nova ordem de serviço
  const handleCriarOrdem = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const novaOrdem = await insert('ordens_servico', data).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: Math.max(...ordens.map(o => o.id), 0) + 1
        }];
      });
      
      setOrdens([...ordens, novaOrdem[0]]);
      setIsDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Erro ao criar ordem de serviço:', error);
      setError('Não foi possível criar a ordem de serviço. Tente novamente mais tarde.');
    }
  };

  // Manipula a atualização de uma ordem de serviço existente
  const handleAtualizarOrdem = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const ordemAtualizada = await update('ordens_servico', ordemAtual.id, data).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: ordemAtual.id
        }];
      });
      
      setOrdens(ordens.map(o => 
        o.id === ordemAtual.id ? ordemAtualizada[0] : o
      ));
      setIsDialogOpen(false);
      setOrdemAtual(null);
      setError('');
    } catch (error) {
      console.error('Erro ao atualizar ordem de serviço:', error);
      setError('Não foi possível atualizar a ordem de serviço. Tente novamente mais tarde.');
    }
  };

  // Manipula a exclusão de uma ordem de serviço
  const handleExcluirOrdem = async (id) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      await remove('ordens_servico', id).catch(() => {
        // Simulando resposta para demonstração
        return true;
      });
      
      setOrdens(ordens.filter(o => o.id !== id));
      setError('');
    } catch (error) {
      console.error('Erro ao excluir ordem de serviço:', error);
      setError('Não foi possível excluir a ordem de serviço. Tente novamente mais tarde.');
    }
  };

  // Manipula a abertura do formulário para edição
  const handleEditarOrdem = (ordem) => {
    setOrdemAtual(ordem);
    setIsDialogOpen(true);
  };

  // Manipula a abertura do formulário para criação
  const handleNovaOrdem = () => {
    setOrdemAtual(null);
    setIsDialogOpen(true);
  };

  // Manipula a mudança de status de uma ordem (mover para a esquerda no Kanban)
  const handleMoverEsquerda = (ordem) => {
    const statusAnterior = {
      em_producao: 'em_aberto',
      pronto_entrega: 'em_producao',
      entregue: 'pronto_entrega',
    };
    
    if (statusAnterior[ordem.status]) {
      const ordemAtualizada = { ...ordem, status: statusAnterior[ordem.status] };
      handleAtualizarOrdem(ordemAtualizada);
    }
  };

  // Manipula a mudança de status de uma ordem (mover para a direita no Kanban)
  const handleMoverDireita = (ordem) => {
    const proximoStatus = {
      em_aberto: 'em_producao',
      em_producao: 'pronto_entrega',
      pronto_entrega: 'entregue',
    };
    
    if (proximoStatus[ordem.status]) {
      const ordemAtualizada = { ...ordem, status: proximoStatus[ordem.status] };
      handleAtualizarOrdem(ordemAtualizada);
    }
  };

  // Retorna a cor do badge com base no status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'em_aberto':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'em_producao':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'pronto_entrega':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'entregue':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'cancelado':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Retorna o texto do status formatado
  const formatarStatus = (status) => {
    switch (status) {
      case 'em_aberto':
        return 'Em Aberto';
      case 'em_producao':
        return 'Em Produção';
      case 'pronto_entrega':
        return 'Pronto para Entrega';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Retorna o ícone do status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'em_aberto':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'em_producao':
        return <Hammer className="h-5 w-5 text-yellow-600" />;
      case 'pronto_entrega':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'entregue':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ordens de Serviço</h2>
          <p className="text-gray-500">Gerencie as ordens de serviço da vidraçaria.</p>
        </div>
        <Button onClick={handleNovaOrdem}>
          <Plus className="h-4 w-4 mr-2" /> Nova Ordem de Serviço
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filtros</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={visualizacao === 'kanban' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizacao('kanban')}
              >
                Kanban
              </Button>
              <Button
                variant={visualizacao === 'tabela' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizacao('tabela')}
              >
                Tabela
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="filtroCliente">Cliente</Label>
              <Input
                id="filtroCliente"
                placeholder="Nome do cliente"
                value={filtros.cliente}
                onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroProduto">Produto</Label>
              <Input
                id="filtroProduto"
                placeholder="Descrição do produto"
                value={filtros.produto}
                onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroStatus">Status</Label>
              <Select 
                value={filtros.status} 
                onValueChange={(value) => setFiltros({ ...filtros, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="em_aberto">Em Aberto</SelectItem>
                  <SelectItem value="em_producao">Em Produção</SelectItem>
                  <SelectItem value="pronto_entrega">Pronto para Entrega</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtroDataInicio">Data Início</Label>
              <Input
                id="filtroDataInicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="filtroDataFim">Data Fim</Label>
              <Input
                id="filtroDataFim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setFiltros({ cliente: '', produto: '', status: '', dataInicio: '', dataFim: '' })}
          >
            <X className="h-4 w-4 mr-2" /> Limpar Filtros
          </Button>
          <Button onClick={buscarOrdens}>
            <Search className="h-4 w-4 mr-2" /> Buscar
          </Button>
        </CardFooter>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : visualizacao === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <CardTitle className="text-lg">Em Aberto</CardTitle>
              </div>
              <CardDescription>
                {ordensAgrupadas.em_aberto.length} ordens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ordensAgrupadas.em_aberto.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma ordem em aberto
                </div>
              ) : (
                ordensAgrupadas.em_aberto.map(ordem => (
                  <OrdemServicoCard
                    key={ordem.id}
                    ordem={ordem}
                    onEdit={() => handleEditarOrdem(ordem)}
                    onDelete={() => handleExcluirOrdem(ordem.id)}
                    onMoveRight={() => handleMoverDireita(ordem)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Hammer className="h-5 w-5 text-yellow-600 mr-2" />
                <CardTitle className="text-lg">Em Produção</CardTitle>
              </div>
              <CardDescription>
                {ordensAgrupadas.em_producao.length} ordens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ordensAgrupadas.em_producao.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma ordem em produção
                </div>
              ) : (
                ordensAgrupadas.em_producao.map(ordem => (
                  <OrdemServicoCard
                    key={ordem.id}
                    ordem={ordem}
                    onEdit={() => handleEditarOrdem(ordem)}
                    onDelete={() => handleExcluirOrdem(ordem.id)}
                    onMoveLeft={() => handleMoverEsquerda(ordem)}
                    onMoveRight={() => handleMoverDireita(ordem)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Truck className="h-5 w-5 text-purple-600 mr-2" />
                <CardTitle className="text-lg">Pronto para Entrega</CardTitle>
              </div>
              <CardDescription>
                {ordensAgrupadas.pronto_entrega.length} ordens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ordensAgrupadas.pronto_entrega.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma ordem pronta para entrega
                </div>
              ) : (
                ordensAgrupadas.pronto_entrega.map(ordem => (
                  <OrdemServicoCard
                    key={ordem.id}
                    ordem={ordem}
                    onEdit={() => handleEditarOrdem(ordem)}
                    onDelete={() => handleExcluirOrdem(ordem.id)}
                    onMoveLeft={() => handleMoverEsquerda(ordem)}
                    onMoveRight={() => handleMoverDireita(ordem)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                <CardTitle className="text-lg">Entregue</CardTitle>
              </div>
              <CardDescription>
                {ordensAgrupadas.entregue.length} ordens
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ordensAgrupadas.entregue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhuma ordem entregue
                </div>
              ) : (
                ordensAgrupadas.entregue.map(ordem => (
                  <OrdemServicoCard
                    key={ordem.id}
                    ordem={ordem}
                    onEdit={() => handleEditarOrdem(ordem)}
                    onDelete={() => handleExcluirOrdem(ordem.id)}
                    onMoveLeft={() => handleMoverEsquerda(ordem)}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lista de Ordens de Serviço</CardTitle>
            <CardDescription>
              {ordensFiltradas.length} ordens encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordensFiltradas.length === 0 ? (
              <div className="text-center py-6">
                <Clipboard className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">Nenhuma ordem de serviço encontrada</h3>
                <p className="text-gray-500">Tente ajustar os filtros ou criar uma nova ordem de serviço.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Data Entrada</TableHead>
                      <TableHead>Data Entrega</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordensFiltradas.map((ordem) => (
                      <TableRow key={ordem.id}>
                        <TableCell className="font-medium">{ordem.cliente}</TableCell>
                        <TableCell>{ordem.produto}</TableCell>
                        <TableCell>{formatDate(ordem.data_entrada)}</TableCell>
                        <TableCell>{formatDate(ordem.data_entrega)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(ordem.status)}>
                            {formatarStatus(ordem.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(ordem.valor)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditarOrdem(ordem)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Ordem de Serviço</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir esta ordem de serviço?
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleExcluirOrdem(ordem.id)}
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {ordemAtual ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </DialogTitle>
            <DialogDescription>
              {ordemAtual
                ? 'Edite os detalhes da ordem de serviço existente.'
                : 'Preencha os detalhes para criar uma nova ordem de serviço.'}
            </DialogDescription>
          </DialogHeader>
          <OrdemServicoForm
            ordem={ordemAtual}
            onSubmit={ordemAtual ? handleAtualizarOrdem : handleCriarOrdem}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


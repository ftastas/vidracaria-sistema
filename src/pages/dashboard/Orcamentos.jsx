import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  Edit, 
  Trash2, 
  Filter, 
  X,
  Check,
  AlertCircle
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
  DialogTrigger,
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

import { supabase, fetchAll, insert, update, remove } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../lib/utils';

// Esquema de validação para orçamentos
const orcamentoSchema = z.object({
  cliente: z.string().min(1, 'Nome do cliente é obrigatório'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  data: z.string().min(1, 'Data é obrigatória'),
  valor_total: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  status: z.string().min(1, 'Status é obrigatório'),
  observacoes: z.string().optional(),
  itens: z.array(
    z.object({
      descricao: z.string().min(1, 'Descrição é obrigatória'),
      quantidade: z.coerce.number().min(1, 'Quantidade deve ser maior que zero'),
      valor_unitario: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
      valor_total: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
    })
  ).min(1, 'Adicione pelo menos um item ao orçamento'),
});

// Componente para o formulário de orçamento
function OrcamentoForm({ orcamento, onSubmit, onCancel }) {
  const [itens, setItens] = useState(orcamento?.itens || [{ descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }]);
  const [valorTotal, setValorTotal] = useState(orcamento?.valor_total || 0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      cliente: orcamento?.cliente || '',
      telefone: orcamento?.telefone || '',
      email: orcamento?.email || '',
      data: orcamento?.data || format(new Date(), 'yyyy-MM-dd'),
      valor_total: orcamento?.valor_total || 0,
      status: orcamento?.status || 'pendente',
      observacoes: orcamento?.observacoes || '',
      itens: orcamento?.itens || [{ descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }],
    },
  });

  // Atualiza o valor total quando os itens mudam
  useEffect(() => {
    const total = itens.reduce((sum, item) => sum + (item.valor_total || 0), 0);
    setValorTotal(total);
    setValue('valor_total', total);
  }, [itens, setValue]);

  // Adiciona um novo item ao orçamento
  const adicionarItem = () => {
    setItens([...itens, { descricao: '', quantidade: 1, valor_unitario: 0, valor_total: 0 }]);
  };

  // Remove um item do orçamento
  const removerItem = (index) => {
    const novosItens = [...itens];
    novosItens.splice(index, 1);
    setItens(novosItens);
  };

  // Atualiza um item do orçamento
  const atualizarItem = (index, campo, valor) => {
    const novosItens = [...itens];
    novosItens[index][campo] = valor;
    
    // Recalcula o valor total do item
    if (campo === 'quantidade' || campo === 'valor_unitario') {
      novosItens[index].valor_total = 
        novosItens[index].quantidade * novosItens[index].valor_unitario;
    }
    
    setItens(novosItens);
    setValue('itens', novosItens);
  };

  const submitForm = (data) => {
    // Garantir que os itens estão atualizados
    data.itens = itens;
    data.valor_total = valorTotal;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
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
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            type="date"
            {...register('data')}
          />
          {errors.data && (
            <p className="text-sm text-red-500">{errors.data.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            defaultValue={orcamento?.status || 'pendente'} 
            onValueChange={(value) => setValue('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="aprovado">Aprovado</SelectItem>
              <SelectItem value="recusado">Recusado</SelectItem>
              <SelectItem value="em_producao">Em Produção</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-red-500">{errors.status.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register('observacoes')}
            placeholder="Observações adicionais sobre o orçamento"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Itens do Orçamento</h3>
          <Button type="button" variant="outline" size="sm" onClick={adicionarItem}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar Item
          </Button>
        </div>

        {errors.itens && (
          <Alert variant="destructive">
            <AlertDescription>{errors.itens.message}</AlertDescription>
          </Alert>
        )}

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Descrição</TableHead>
                <TableHead className="w-[15%]">Quantidade</TableHead>
                <TableHead className="w-[20%]">Valor Unitário</TableHead>
                <TableHead className="w-[20%]">Valor Total</TableHead>
                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={item.descricao}
                      onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                      placeholder="Descrição do item"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) => atualizarItem(index, 'quantidade', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.valor_unitario}
                      onChange={(e) => atualizarItem(index, 'valor_unitario', Number(e.target.value))}
                    />
                  </TableCell>
                  <TableCell>
                    {formatCurrency(item.valor_total)}
                  </TableCell>
                  <TableCell>
                    {itens.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removerItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-end">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-lg font-medium">
              Valor Total: {formatCurrency(valorTotal)}
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {orcamento ? 'Atualizar Orçamento' : 'Criar Orçamento'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente principal da página de orçamentos
export default function Orcamentos() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orcamentoAtual, setOrcamentoAtual] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    cliente: '',
    status: '',
    dataInicio: '',
    dataFim: '',
  });
  const [error, setError] = useState('');

  // Busca os orçamentos no banco de dados
  const buscarOrcamentos = async () => {
    setLoading(true);
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      // Aqui estamos simulando os dados para demonstração
      const data = await fetchAll('orcamentos').catch(() => {
        // Dados fictícios para demonstração
        return [
          {
            id: 1,
            cliente: 'João Silva',
            telefone: '(11) 98765-4321',
            email: 'joao@email.com',
            data: '2025-06-01',
            valor_total: 850,
            status: 'aprovado',
            observacoes: 'Cliente solicitou entrega rápida',
            itens: [
              { descricao: 'Vidro temperado 8mm', quantidade: 2, valor_unitario: 250, valor_total: 500 },
              { descricao: 'Instalação', quantidade: 1, valor_unitario: 350, valor_total: 350 }
            ]
          },
          {
            id: 2,
            cliente: 'Maria Oliveira',
            telefone: '(11) 91234-5678',
            email: 'maria@email.com',
            data: '2025-06-02',
            valor_total: 1200,
            status: 'pendente',
            observacoes: '',
            itens: [
              { descricao: 'Espelho 2m x 1.5m', quantidade: 1, valor_unitario: 800, valor_total: 800 },
              { descricao: 'Moldura', quantidade: 1, valor_unitario: 250, valor_total: 250 },
              { descricao: 'Instalação', quantidade: 1, valor_unitario: 150, valor_total: 150 }
            ]
          },
          {
            id: 3,
            cliente: 'Carlos Santos',
            telefone: '(11) 97777-8888',
            email: 'carlos@email.com',
            data: '2025-06-03',
            valor_total: 650,
            status: 'recusado',
            observacoes: 'Cliente achou o preço alto',
            itens: [
              { descricao: 'Box de banheiro', quantidade: 1, valor_unitario: 650, valor_total: 650 }
            ]
          },
          {
            id: 4,
            cliente: 'Ana Costa',
            telefone: '(11) 95555-6666',
            email: 'ana@email.com',
            data: '2025-06-04',
            valor_total: 1800,
            status: 'em_producao',
            observacoes: '',
            itens: [
              { descricao: 'Porta de vidro', quantidade: 1, valor_unitario: 1500, valor_total: 1500 },
              { descricao: 'Puxador', quantidade: 2, valor_unitario: 150, valor_total: 300 }
            ]
          },
        ];
      });
      
      setOrcamentos(data);
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      setError('Não foi possível carregar os orçamentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarOrcamentos();
  }, []);

  // Filtra os orçamentos com base nos filtros aplicados
  const orcamentosFiltrados = orcamentos.filter((orcamento) => {
    // Filtro por cliente
    if (filtros.cliente && !orcamento.cliente.toLowerCase().includes(filtros.cliente.toLowerCase())) {
      return false;
    }
    
    // Filtro por status
    if (filtros.status && orcamento.status !== filtros.status) {
      return false;
    }
    
    // Filtro por data de início
    if (filtros.dataInicio && orcamento.data < filtros.dataInicio) {
      return false;
    }
    
    // Filtro por data de fim
    if (filtros.dataFim && orcamento.data > filtros.dataFim) {
      return false;
    }
    
    return true;
  });

  // Manipula a criação de um novo orçamento
  const handleCriarOrcamento = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const novoOrcamento = await insert('orcamentos', data).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: Math.max(...orcamentos.map(o => o.id), 0) + 1
        }];
      });
      
      setOrcamentos([...orcamentos, novoOrcamento[0]]);
      setIsDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      setError('Não foi possível criar o orçamento. Tente novamente mais tarde.');
    }
  };

  // Manipula a atualização de um orçamento existente
  const handleAtualizarOrcamento = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const orcamentoAtualizado = await update('orcamentos', orcamentoAtual.id, data).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: orcamentoAtual.id
        }];
      });
      
      setOrcamentos(orcamentos.map(o => 
        o.id === orcamentoAtual.id ? orcamentoAtualizado[0] : o
      ));
      setIsDialogOpen(false);
      setOrcamentoAtual(null);
      setError('');
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      setError('Não foi possível atualizar o orçamento. Tente novamente mais tarde.');
    }
  };

  // Manipula a exclusão de um orçamento
  const handleExcluirOrcamento = async (id) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      await remove('orcamentos', id).catch(() => {
        // Simulando resposta para demonstração
        return true;
      });
      
      setOrcamentos(orcamentos.filter(o => o.id !== id));
      setError('');
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      setError('Não foi possível excluir o orçamento. Tente novamente mais tarde.');
    }
  };

  // Manipula a abertura do formulário para edição
  const handleEditarOrcamento = (orcamento) => {
    setOrcamentoAtual(orcamento);
    setIsDialogOpen(true);
  };

  // Manipula a abertura do formulário para criação
  const handleNovoOrcamento = () => {
    setOrcamentoAtual(null);
    setIsDialogOpen(true);
  };

  // Retorna a cor do badge com base no status
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'aprovado':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'recusado':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'em_producao':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'concluido':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  // Retorna o texto do status formatado
  const formatarStatus = (status) => {
    switch (status) {
      case 'pendente':
        return 'Pendente';
      case 'aprovado':
        return 'Aprovado';
      case 'recusado':
        return 'Recusado';
      case 'em_producao':
        return 'Em Produção';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-gray-500">Gerencie os orçamentos da vidraçaria.</p>
        </div>
        <Button onClick={handleNovoOrcamento}>
          <Plus className="h-4 w-4 mr-2" /> Novo Orçamento
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
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="recusado">Recusado</SelectItem>
                  <SelectItem value="em_producao">Em Produção</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
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
            onClick={() => setFiltros({ cliente: '', status: '', dataInicio: '', dataFim: '' })}
          >
            <X className="h-4 w-4 mr-2" /> Limpar Filtros
          </Button>
          <Button onClick={buscarOrcamentos}>
            <Search className="h-4 w-4 mr-2" /> Buscar
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Orçamentos</CardTitle>
          <CardDescription>
            {orcamentosFiltrados.length} orçamentos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-100 rounded-md mb-2"></div>
                </div>
              ))}
            </div>
          ) : orcamentosFiltrados.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">Nenhum orçamento encontrado</h3>
              <p className="text-gray-500">Tente ajustar os filtros ou criar um novo orçamento.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentosFiltrados.map((orcamento) => (
                    <TableRow key={orcamento.id}>
                      <TableCell className="font-medium">{orcamento.cliente}</TableCell>
                      <TableCell>{formatDate(orcamento.data)}</TableCell>
                      <TableCell>{formatCurrency(orcamento.valor_total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(orcamento.status)}>
                          {formatarStatus(orcamento.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditarOrcamento(orcamento)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                          >
                            <Printer className="h-4 w-4" />
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
                                <AlertDialogTitle>Excluir Orçamento</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o orçamento de {orcamento.cliente}?
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleExcluirOrcamento(orcamento.id)}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {orcamentoAtual ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
            <DialogDescription>
              {orcamentoAtual
                ? 'Edite os detalhes do orçamento existente.'
                : 'Preencha os detalhes para criar um novo orçamento.'}
            </DialogDescription>
          </DialogHeader>
          <OrcamentoForm
            orcamento={orcamentoAtual}
            onSubmit={orcamentoAtual ? handleAtualizarOrcamento : handleCriarOrcamento}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


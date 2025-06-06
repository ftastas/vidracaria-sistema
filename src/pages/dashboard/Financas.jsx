import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Edit, 
  Trash2, 
  Filter, 
  X,
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

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

// Esquema de validação para lançamentos financeiros
const lancamentoSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  observacoes: z.string().optional(),
});

// Componente para o formulário de lançamento financeiro
function LancamentoForm({ lancamento, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(lancamentoSchema),
    defaultValues: {
      data: lancamento?.data || format(new Date(), 'yyyy-MM-dd'),
      tipo: lancamento?.tipo || 'entrada',
      categoria: lancamento?.categoria || '',
      descricao: lancamento?.descricao || '',
      valor: lancamento?.valor || '',
      observacoes: lancamento?.observacoes || '',
    },
  });

  const tipoLancamento = watch('tipo');

  // Lista de categorias por tipo
  const categorias = {
    entrada: [
      'Venda de produtos',
      'Serviços',
      'Instalação',
      'Manutenção',
      'Outros',
    ],
    saida: [
      'Fornecedores',
      'Salários',
      'Aluguel',
      'Energia',
      'Água',
      'Internet',
      'Telefone',
      'Impostos',
      'Manutenção',
      'Transporte',
      'Material de escritório',
      'Outros',
    ],
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Label htmlFor="tipo">Tipo</Label>
          <Select 
            defaultValue={lancamento?.tipo || 'entrada'} 
            onValueChange={(value) => setValue('tipo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo && (
            <p className="text-sm text-red-500">{errors.tipo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select 
            defaultValue={lancamento?.categoria || ''} 
            onValueChange={(value) => setValue('categoria', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias[tipoLancamento].map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoria && (
            <p className="text-sm text-red-500">{errors.categoria.message}</p>
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
              min="0.01"
              className="pl-8"
              {...register('valor')}
            />
          </div>
          {errors.valor && (
            <p className="text-sm text-red-500">{errors.valor.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            {...register('descricao')}
            placeholder="Descrição do lançamento"
          />
          {errors.descricao && (
            <p className="text-sm text-red-500">{errors.descricao.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register('observacoes')}
            placeholder="Observações adicionais sobre o lançamento"
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {lancamento ? 'Atualizar Lançamento' : 'Criar Lançamento'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente principal da página de finanças
export default function Financas() {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lancamentoAtual, setLancamentoAtual] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: '',
    categoria: '',
    dataInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    dataFim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [error, setError] = useState('');
  const [periodoGrafico, setPeriodoGrafico] = useState('mes');

  // Busca os lançamentos no banco de dados
  const buscarLancamentos = async () => {
    setLoading(true);
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      // Aqui estamos simulando os dados para demonstração
      const data = await fetchAll('financas').catch(() => {
        // Dados fictícios para demonstração
        return [
          {
            id: 1,
            data: '2025-06-01',
            tipo: 'entrada',
            categoria: 'Venda de produtos',
            descricao: 'Venda de vidro temperado',
            valor: 1200,
            observacoes: '',
          },
          {
            id: 2,
            data: '2025-06-02',
            tipo: 'saida',
            categoria: 'Fornecedores',
            descricao: 'Compra de material',
            valor: 500,
            observacoes: 'Pagamento à vista',
          },
          {
            id: 3,
            data: '2025-06-03',
            tipo: 'entrada',
            categoria: 'Serviços',
            descricao: 'Instalação de espelho',
            valor: 350,
            observacoes: '',
          },
          {
            id: 4,
            data: '2025-06-04',
            tipo: 'saida',
            categoria: 'Salários',
            descricao: 'Pagamento funcionário',
            valor: 1800,
            observacoes: '',
          },
          {
            id: 5,
            data: '2025-06-05',
            tipo: 'entrada',
            categoria: 'Venda de produtos',
            descricao: 'Venda de box para banheiro',
            valor: 950,
            observacoes: '',
          },
          {
            id: 6,
            data: '2025-05-15',
            tipo: 'entrada',
            categoria: 'Venda de produtos',
            descricao: 'Venda de porta de vidro',
            valor: 1500,
            observacoes: '',
          },
          {
            id: 7,
            data: '2025-05-20',
            tipo: 'saida',
            categoria: 'Aluguel',
            descricao: 'Aluguel da loja',
            valor: 2000,
            observacoes: '',
          },
          {
            id: 8,
            data: '2025-04-10',
            tipo: 'entrada',
            categoria: 'Serviços',
            descricao: 'Manutenção de janela',
            valor: 450,
            observacoes: '',
          },
          {
            id: 9,
            data: '2025-04-15',
            tipo: 'saida',
            categoria: 'Energia',
            descricao: 'Conta de energia',
            valor: 350,
            observacoes: '',
          },
        ];
      });
      
      setLancamentos(data);
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);
      setError('Não foi possível carregar os lançamentos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarLancamentos();
  }, []);

  // Filtra os lançamentos com base nos filtros aplicados
  const lancamentosFiltrados = lancamentos.filter((lancamento) => {
    // Filtro por tipo
    if (filtros.tipo && lancamento.tipo !== filtros.tipo) {
      return false;
    }
    
    // Filtro por categoria
    if (filtros.categoria && lancamento.categoria !== filtros.categoria) {
      return false;
    }
    
    // Filtro por data de início
    if (filtros.dataInicio && lancamento.data < filtros.dataInicio) {
      return false;
    }
    
    // Filtro por data de fim
    if (filtros.dataFim && lancamento.data > filtros.dataFim) {
      return false;
    }
    
    return true;
  });

  // Manipula a criação de um novo lançamento
  const handleCriarLancamento = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const novoLancamento = await insert('financas', data).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: Math.max(...lancamentos.map(l => l.id), 0) + 1
        }];
      });
      
      setLancamentos([...lancamentos, novoLancamento[0]]);
      setIsDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      setError('Não foi possível criar o lançamento. Tente novamente mais tarde.');
    }
  };

  // Manipula a atualização de um lançamento existente
  const handleAtualizarLancamento = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const lancamentoAtualizado = await update('financas', lancamentoAtual.id, data).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: lancamentoAtual.id
        }];
      });
      
      setLancamentos(lancamentos.map(l => 
        l.id === lancamentoAtual.id ? lancamentoAtualizado[0] : l
      ));
      setIsDialogOpen(false);
      setLancamentoAtual(null);
      setError('');
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      setError('Não foi possível atualizar o lançamento. Tente novamente mais tarde.');
    }
  };

  // Manipula a exclusão de um lançamento
  const handleExcluirLancamento = async (id) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      await remove('financas', id).catch(() => {
        // Simulando resposta para demonstração
        return true;
      });
      
      setLancamentos(lancamentos.filter(l => l.id !== id));
      setError('');
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
      setError('Não foi possível excluir o lançamento. Tente novamente mais tarde.');
    }
  };

  // Manipula a abertura do formulário para edição
  const handleEditarLancamento = (lancamento) => {
    setLancamentoAtual(lancamento);
    setIsDialogOpen(true);
  };

  // Manipula a abertura do formulário para criação
  const handleNovoLancamento = () => {
    setLancamentoAtual(null);
    setIsDialogOpen(true);
  };

  // Calcula o total de entradas
  const totalEntradas = lancamentosFiltrados
    .filter(l => l.tipo === 'entrada')
    .reduce((sum, l) => sum + l.valor, 0);

  // Calcula o total de saídas
  const totalSaidas = lancamentosFiltrados
    .filter(l => l.tipo === 'saida')
    .reduce((sum, l) => sum + l.valor, 0);

  // Calcula o saldo
  const saldo = totalEntradas - totalSaidas;

  // Prepara dados para o gráfico de barras (últimos 6 meses)
  const prepararDadosGraficoBarras = () => {
    const hoje = new Date();
    const dados = [];
    
    // Define o número de meses a serem exibidos com base no período selecionado
    const numMeses = periodoGrafico === 'mes' ? 6 : 12;
    
    for (let i = numMeses - 1; i >= 0; i--) {
      const mes = subMonths(hoje, i);
      const mesAno = format(mes, 'MMM/yy', { locale: ptBR });
      const mesInicio = format(startOfMonth(mes), 'yyyy-MM-dd');
      const mesFim = format(endOfMonth(mes), 'yyyy-MM-dd');
      
      const entradasMes = lancamentos
        .filter(l => l.tipo === 'entrada' && l.data >= mesInicio && l.data <= mesFim)
        .reduce((sum, l) => sum + l.valor, 0);
      
      const saidasMes = lancamentos
        .filter(l => l.tipo === 'saida' && l.data >= mesInicio && l.data <= mesFim)
        .reduce((sum, l) => sum + l.valor, 0);
      
      dados.push({
        name: mesAno,
        Entradas: entradasMes,
        Saídas: saidasMes,
        Saldo: entradasMes - saidasMes,
      });
    }
    
    return dados;
  };

  // Prepara dados para o gráfico de pizza (categorias)
  const prepararDadosGraficoPizza = () => {
    const categorias = {};
    
    // Agrupa por categoria
    lancamentosFiltrados.forEach(l => {
      if (!categorias[l.categoria]) {
        categorias[l.categoria] = 0;
      }
      categorias[l.categoria] += l.valor;
    });
    
    // Converte para o formato esperado pelo gráfico
    return Object.entries(categorias).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Cores para o gráfico de pizza
  const CORES_PIZZA = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6B66FF'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Finanças</h2>
          <p className="text-gray-500">Gerencie as finanças da vidraçaria.</p>
        </div>
        <Button onClick={handleNovoLancamento}>
          <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={saldo >= 0 ? 'border-green-200' : 'border-red-200'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Saldo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </div>
            <p className="text-sm text-gray-500">Período selecionado</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Entradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEntradas)}
            </div>
            <p className="text-sm text-gray-500">Período selecionado</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSaidas)}
            </div>
            <p className="text-sm text-gray-500">Período selecionado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="graficos">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="graficos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Evolução Financeira</CardTitle>
                <Select 
                  value={periodoGrafico} 
                  onValueChange={setPeriodoGrafico}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes">Últimos 6 meses</SelectItem>
                    <SelectItem value="ano">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepararDadosGraficoBarras()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Entradas" fill="#4ade80" />
                    <Bar dataKey="Saídas" fill="#f87171" />
                    <Bar dataKey="Saldo" fill="#60a5fa" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepararDadosGraficoPizza()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {prepararDadosGraficoPizza().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prepararDadosGraficoPizza().slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: CORES_PIZZA[index % CORES_PIZZA.length] }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                  {prepararDadosGraficoPizza().length > 5 && (
                    <div className="text-sm text-gray-500 text-center">
                      + {prepararDadosGraficoPizza().length - 5} outras categorias
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="lancamentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filtroTipo">Tipo</Label>
                  <Select 
                    value={filtros.tipo} 
                    onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos</SelectItem>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="filtroCategoria">Categoria</Label>
                  <Input
                    id="filtroCategoria"
                    placeholder="Categoria"
                    value={filtros.categoria}
                    onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                  />
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
                onClick={() => setFiltros({
                  tipo: '',
                  categoria: '',
                  dataInicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                  dataFim: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                })}
              >
                <X className="h-4 w-4 mr-2" /> Limpar Filtros
              </Button>
              <Button onClick={buscarLancamentos}>
                <Search className="h-4 w-4 mr-2" /> Buscar
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de Lançamentos</CardTitle>
              <CardDescription>
                {lancamentosFiltrados.length} lançamentos encontrados
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
              ) : lancamentosFiltrados.length === 0 ? (
                <div className="text-center py-6">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Nenhum lançamento encontrado</h3>
                  <p className="text-gray-500">Tente ajustar os filtros ou criar um novo lançamento.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lancamentosFiltrados.map((lancamento) => (
                        <TableRow key={lancamento.id}>
                          <TableCell>{formatDate(lancamento.data)}</TableCell>
                          <TableCell className="font-medium">{lancamento.descricao}</TableCell>
                          <TableCell>{lancamento.categoria}</TableCell>
                          <TableCell>
                            <Badge className={lancamento.tipo === 'entrada' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                              {lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                            </Badge>
                          </TableCell>
                          <TableCell className={lancamento.tipo === 'entrada' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {formatCurrency(lancamento.valor)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditarLancamento(lancamento)}
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
                                    <AlertDialogTitle>Excluir Lançamento</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir este lançamento?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleExcluirLancamento(lancamento.id)}
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
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lancamentoAtual ? 'Editar Lançamento' : 'Novo Lançamento'}
            </DialogTitle>
            <DialogDescription>
              {lancamentoAtual
                ? 'Edite os detalhes do lançamento existente.'
                : 'Preencha os detalhes para criar um novo lançamento.'}
            </DialogDescription>
          </DialogHeader>
          <LancamentoForm
            lancamento={lancamentoAtual}
            onSubmit={lancamentoAtual ? handleAtualizarLancamento : handleCriarLancamento}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


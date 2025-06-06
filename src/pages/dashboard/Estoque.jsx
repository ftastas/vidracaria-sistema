import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  Filter, 
  X,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  AlertTriangle
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
import { Progress } from '../../components/ui/progress';

import { supabase, fetchAll, insert, update, remove } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../lib/utils';

// Esquema de validação para produtos do estoque
const produtoSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome do produto é obrigatório'),
  descricao: z.string().optional(),
  quantidade: z.coerce.number().min(0, 'Quantidade deve ser maior ou igual a zero'),
  quantidade_minima: z.coerce.number().min(0, 'Quantidade mínima deve ser maior ou igual a zero'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  valor_unitario: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  fornecedor: z.string().optional(),
  localizacao: z.string().optional(),
});

// Esquema de validação para movimentação de estoque
const movimentacaoSchema = z.object({
  produto_id: z.coerce.number().min(1, 'Produto é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  quantidade: z.coerce.number().min(0.01, 'Quantidade deve ser maior que zero'),
  data: z.string().min(1, 'Data é obrigatória'),
  motivo: z.string().min(1, 'Motivo é obrigatório'),
  observacoes: z.string().optional(),
});

// Componente para o formulário de produto
function ProdutoForm({ produto, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      codigo: produto?.codigo || '',
      nome: produto?.nome || '',
      descricao: produto?.descricao || '',
      quantidade: produto?.quantidade || 0,
      quantidade_minima: produto?.quantidade_minima || 0,
      unidade: produto?.unidade || '',
      valor_unitario: produto?.valor_unitario || 0,
      fornecedor: produto?.fornecedor || '',
      localizacao: produto?.localizacao || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código</Label>
          <Input
            id="codigo"
            {...register('codigo')}
            placeholder="Código do produto"
          />
          {errors.codigo && (
            <p className="text-sm text-red-500">{errors.codigo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            {...register('nome')}
            placeholder="Nome do produto"
          />
          {errors.nome && (
            <p className="text-sm text-red-500">{errors.nome.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            {...register('descricao')}
            placeholder="Descrição do produto"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input
            id="quantidade"
            type="number"
            min="0"
            step="0.01"
            {...register('quantidade')}
          />
          {errors.quantidade && (
            <p className="text-sm text-red-500">{errors.quantidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantidade_minima">Quantidade Mínima</Label>
          <Input
            id="quantidade_minima"
            type="number"
            min="0"
            step="0.01"
            {...register('quantidade_minima')}
          />
          {errors.quantidade_minima && (
            <p className="text-sm text-red-500">{errors.quantidade_minima.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unidade">Unidade</Label>
          <Select 
            defaultValue={produto?.unidade || ''} 
            onValueChange={(value) => register('unidade').onChange({ target: { value } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unidade">Unidade</SelectItem>
              <SelectItem value="metro">Metro</SelectItem>
              <SelectItem value="metro_quadrado">Metro Quadrado</SelectItem>
              <SelectItem value="chapa">Chapa</SelectItem>
              <SelectItem value="caixa">Caixa</SelectItem>
              <SelectItem value="pacote">Pacote</SelectItem>
              <SelectItem value="rolo">Rolo</SelectItem>
              <SelectItem value="litro">Litro</SelectItem>
              <SelectItem value="kg">Quilograma</SelectItem>
            </SelectContent>
          </Select>
          {errors.unidade && (
            <p className="text-sm text-red-500">{errors.unidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_unitario">Valor Unitário</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              id="valor_unitario"
              type="number"
              step="0.01"
              min="0"
              className="pl-8"
              {...register('valor_unitario')}
            />
          </div>
          {errors.valor_unitario && (
            <p className="text-sm text-red-500">{errors.valor_unitario.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fornecedor">Fornecedor</Label>
          <Input
            id="fornecedor"
            {...register('fornecedor')}
            placeholder="Nome do fornecedor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="localizacao">Localização</Label>
          <Input
            id="localizacao"
            {...register('localizacao')}
            placeholder="Localização no estoque"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {produto ? 'Atualizar Produto' : 'Cadastrar Produto'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente para o formulário de movimentação de estoque
function MovimentacaoForm({ produtos, onSubmit, onCancel }) {
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(movimentacaoSchema),
    defaultValues: {
      produto_id: '',
      tipo: 'entrada',
      quantidade: '',
      data: format(new Date(), 'yyyy-MM-dd'),
      motivo: '',
      observacoes: '',
    },
  });

  const tipo = watch('tipo');
  const produtoId = watch('produto_id');

  // Atualiza o produto selecionado quando o ID muda
  useEffect(() => {
    if (produtoId) {
      const produto = produtos.find(p => p.id === Number(produtoId));
      setProdutoSelecionado(produto);
    } else {
      setProdutoSelecionado(null);
    }
  }, [produtoId, produtos]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="produto_id">Produto</Label>
          <Select 
            onValueChange={(value) => setValue('produto_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o produto" />
            </SelectTrigger>
            <SelectContent>
              {produtos.map((produto) => (
                <SelectItem key={produto.id} value={produto.id.toString()}>
                  {produto.nome} ({produto.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.produto_id && (
            <p className="text-sm text-red-500">{errors.produto_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo</Label>
          <Select 
            defaultValue="entrada" 
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
          <Label htmlFor="quantidade">Quantidade</Label>
          <Input
            id="quantidade"
            type="number"
            min="0.01"
            step="0.01"
            {...register('quantidade')}
          />
          {errors.quantidade && (
            <p className="text-sm text-red-500">{errors.quantidade.message}</p>
          )}
          {produtoSelecionado && tipo === 'saida' && (
            <p className="text-xs text-gray-500">
              Quantidade disponível: {produtoSelecionado.quantidade} {produtoSelecionado.unidade}
            </p>
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

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="motivo">Motivo</Label>
          <Select 
            onValueChange={(value) => setValue('motivo', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o motivo" />
            </SelectTrigger>
            <SelectContent>
              {tipo === 'entrada' ? (
                <>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="devolucao">Devolução</SelectItem>
                  <SelectItem value="ajuste">Ajuste de Inventário</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="venda">Venda</SelectItem>
                  <SelectItem value="producao">Produção</SelectItem>
                  <SelectItem value="perda">Perda/Quebra</SelectItem>
                  <SelectItem value="ajuste">Ajuste de Inventário</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {errors.motivo && (
            <p className="text-sm text-red-500">{errors.motivo.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register('observacoes')}
            placeholder="Observações adicionais sobre a movimentação"
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Registrar {tipo === 'entrada' ? 'Entrada' : 'Saída'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente principal da página de estoque
export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [produtoAtual, setProdutoAtual] = useState(null);
  const [isProdutoDialogOpen, setIsProdutoDialogOpen] = useState(false);
  const [isMovimentacaoDialogOpen, setIsMovimentacaoDialogOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    codigo: '',
    nome: '',
    fornecedor: '',
    mostrarApenasAlerta: false,
  });
  const [error, setError] = useState('');

  // Busca os produtos no banco de dados
  const buscarProdutos = async () => {
    setLoading(true);
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      // Aqui estamos simulando os dados para demonstração
      const data = await fetchAll('estoque').catch(() => {
        // Dados fictícios para demonstração
        return [
          {
            id: 1,
            codigo: 'V123',
            nome: 'Vidro temperado 8mm',
            descricao: 'Vidro temperado incolor 8mm',
            quantidade: 10,
            quantidade_minima: 5,
            unidade: 'chapa',
            valor_unitario: 250,
            fornecedor: 'Vidros Brasil',
            localizacao: 'Prateleira A1',
            ultima_entrada: '2025-06-01',
          },
          {
            id: 2,
            codigo: 'V456',
            nome: 'Vidro comum 4mm',
            descricao: 'Vidro comum incolor 4mm',
            quantidade: 3,
            quantidade_minima: 5,
            unidade: 'chapa',
            valor_unitario: 120,
            fornecedor: 'Vidros Brasil',
            localizacao: 'Prateleira A2',
            ultima_entrada: '2025-05-15',
          },
          {
            id: 3,
            codigo: 'P789',
            nome: 'Perfil de alumínio',
            descricao: 'Perfil de alumínio para box de banheiro',
            quantidade: 5,
            quantidade_minima: 10,
            unidade: 'barra',
            valor_unitario: 80,
            fornecedor: 'Alumínios SA',
            localizacao: 'Prateleira B1',
            ultima_entrada: '2025-05-20',
          },
          {
            id: 4,
            codigo: 'F101',
            nome: 'Ferragem para porta',
            descricao: 'Kit completo de ferragem para porta de vidro',
            quantidade: 15,
            quantidade_minima: 5,
            unidade: 'kit',
            valor_unitario: 150,
            fornecedor: 'Ferragens & Cia',
            localizacao: 'Prateleira C1',
            ultima_entrada: '2025-06-02',
          },
          {
            id: 5,
            codigo: 'S202',
            nome: 'Silicone',
            descricao: 'Silicone para vedação de vidros',
            quantidade: 25,
            quantidade_minima: 10,
            unidade: 'unidade',
            valor_unitario: 35,
            fornecedor: 'Adesivos Tech',
            localizacao: 'Prateleira D1',
            ultima_entrada: '2025-05-25',
          },
        ];
      });
      
      // Buscar movimentações
      const movs = await fetchAll('estoque_movimentacoes').catch(() => {
        // Dados fictícios para demonstração
        return [
          {
            id: 1,
            produto_id: 1,
            produto_nome: 'Vidro temperado 8mm',
            tipo: 'entrada',
            quantidade: 5,
            data: '2025-06-01',
            motivo: 'compra',
            observacoes: 'Compra mensal',
          },
          {
            id: 2,
            produto_id: 1,
            produto_nome: 'Vidro temperado 8mm',
            tipo: 'saida',
            quantidade: 2,
            data: '2025-06-02',
            motivo: 'venda',
            observacoes: 'Venda para cliente João',
          },
          {
            id: 3,
            produto_id: 2,
            produto_nome: 'Vidro comum 4mm',
            tipo: 'entrada',
            quantidade: 10,
            data: '2025-05-15',
            motivo: 'compra',
            observacoes: '',
          },
          {
            id: 4,
            produto_id: 2,
            produto_nome: 'Vidro comum 4mm',
            tipo: 'saida',
            quantidade: 7,
            data: '2025-05-20',
            motivo: 'producao',
            observacoes: 'Produção de espelhos',
          },
          {
            id: 5,
            produto_id: 3,
            produto_nome: 'Perfil de alumínio',
            tipo: 'entrada',
            quantidade: 15,
            data: '2025-05-20',
            motivo: 'compra',
            observacoes: '',
          },
        ];
      });
      
      setProdutos(data);
      setMovimentacoes(movs);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  // Filtra os produtos com base nos filtros aplicados
  const produtosFiltrados = produtos.filter((produto) => {
    // Filtro por código
    if (filtros.codigo && !produto.codigo.toLowerCase().includes(filtros.codigo.toLowerCase())) {
      return false;
    }
    
    // Filtro por nome
    if (filtros.nome && !produto.nome.toLowerCase().includes(filtros.nome.toLowerCase())) {
      return false;
    }
    
    // Filtro por fornecedor
    if (filtros.fornecedor && !produto.fornecedor.toLowerCase().includes(filtros.fornecedor.toLowerCase())) {
      return false;
    }
    
    // Filtro por alerta de estoque
    if (filtros.mostrarApenasAlerta && produto.quantidade > produto.quantidade_minima) {
      return false;
    }
    
    return true;
  });

  // Manipula a criação de um novo produto
  const handleCriarProduto = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const novoProduto = await insert('estoque', {
        ...data,
        ultima_entrada: format(new Date(), 'yyyy-MM-dd'),
      }).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: Math.max(...produtos.map(p => p.id), 0) + 1,
          ultima_entrada: format(new Date(), 'yyyy-MM-dd'),
        }];
      });
      
      setProdutos([...produtos, novoProduto[0]]);
      setIsProdutoDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      setError('Não foi possível criar o produto. Tente novamente mais tarde.');
    }
  };

  // Manipula a atualização de um produto existente
  const handleAtualizarProduto = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const produtoAtualizado = await update('estoque', produtoAtual.id, data).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: produtoAtual.id,
          ultima_entrada: produtoAtual.ultima_entrada,
        }];
      });
      
      setProdutos(produtos.map(p => 
        p.id === produtoAtual.id ? produtoAtualizado[0] : p
      ));
      setIsProdutoDialogOpen(false);
      setProdutoAtual(null);
      setError('');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      setError('Não foi possível atualizar o produto. Tente novamente mais tarde.');
    }
  };

  // Manipula a exclusão de um produto
  const handleExcluirProduto = async (id) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      await remove('estoque', id).catch(() => {
        // Simulando resposta para demonstração
        return true;
      });
      
      setProdutos(produtos.filter(p => p.id !== id));
      setError('');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      setError('Não foi possível excluir o produto. Tente novamente mais tarde.');
    }
  };

  // Manipula a abertura do formulário para edição
  const handleEditarProduto = (produto) => {
    setProdutoAtual(produto);
    setIsProdutoDialogOpen(true);
  };

  // Manipula a abertura do formulário para criação
  const handleNovoProduto = () => {
    setProdutoAtual(null);
    setIsProdutoDialogOpen(true);
  };

  // Manipula a abertura do formulário para movimentação
  const handleNovaMovimentacao = () => {
    setIsMovimentacaoDialogOpen(true);
  };

  // Manipula o registro de uma movimentação de estoque
  const handleRegistrarMovimentacao = async (data) => {
    try {
      const produto = produtos.find(p => p.id === Number(data.produto_id));
      
      if (!produto) {
        throw new Error('Produto não encontrado');
      }
      
      // Verificar se há quantidade suficiente para saída
      if (data.tipo === 'saida' && data.quantidade > produto.quantidade) {
        setError(`Quantidade insuficiente em estoque. Disponível: ${produto.quantidade} ${produto.unidade}`);
        return;
      }
      
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const novaMovimentacao = await insert('estoque_movimentacoes', {
        ...data,
        produto_nome: produto.nome,
      }).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...data,
          id: Math.max(...movimentacoes.map(m => m.id), 0) + 1,
          produto_nome: produto.nome,
        }];
      });
      
      // Atualizar a quantidade do produto
      const novaQuantidade = data.tipo === 'entrada' 
        ? produto.quantidade + Number(data.quantidade)
        : produto.quantidade - Number(data.quantidade);
      
      const produtoAtualizado = await update('estoque', produto.id, {
        ...produto,
        quantidade: novaQuantidade,
        ultima_entrada: data.tipo === 'entrada' ? data.data : produto.ultima_entrada,
      }).catch(() => {
        // Simulando resposta para demonstração
        return [{
          ...produto,
          quantidade: novaQuantidade,
          ultima_entrada: data.tipo === 'entrada' ? data.data : produto.ultima_entrada,
        }];
      });
      
      setMovimentacoes([...movimentacoes, novaMovimentacao[0]]);
      setProdutos(produtos.map(p => 
        p.id === produto.id ? produtoAtualizado[0] : p
      ));
      setIsMovimentacaoDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      setError('Não foi possível registrar a movimentação. Tente novamente mais tarde.');
    }
  };

  // Calcula o valor total do estoque
  const valorTotalEstoque = produtos.reduce((total, produto) => {
    return total + (produto.quantidade * produto.valor_unitario);
  }, 0);

  // Conta os produtos com alerta de estoque baixo
  const produtosComAlerta = produtos.filter(p => p.quantidade <= p.quantidade_minima).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Estoque</h2>
          <p className="text-gray-500">Gerencie o estoque da vidraçaria.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleNovaMovimentacao} variant="outline">
            <ArrowUpCircle className="h-4 w-4 mr-2" /> Registrar Movimentação
          </Button>
          <Button onClick={handleNovoProduto}>
            <Plus className="h-4 w-4 mr-2" /> Novo Produto
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total em Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(valorTotalEstoque)}
            </div>
            <p className="text-sm text-gray-500">{produtos.length} produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card className={produtosComAlerta > 0 ? 'border-amber-200' : ''}>
          <CardHeader className="pb-2">
            <div className="flex items-center">
              {produtosComAlerta > 0 && (
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              )}
              <CardTitle className="text-lg">Alertas de Estoque</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${produtosComAlerta > 0 ? 'text-amber-500' : ''}`}>
              {produtosComAlerta}
            </div>
            <p className="text-sm text-gray-500">
              {produtosComAlerta === 0 
                ? 'Nenhum produto com estoque baixo' 
                : `${produtosComAlerta} ${produtosComAlerta === 1 ? 'produto' : 'produtos'} com estoque baixo`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Últimas Movimentações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {movimentacoes.length}
            </div>
            <p className="text-sm text-gray-500">Total de movimentações registradas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="produtos">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="produtos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="filtroCodigo">Código</Label>
                  <Input
                    id="filtroCodigo"
                    placeholder="Código do produto"
                    value={filtros.codigo}
                    onChange={(e) => setFiltros({ ...filtros, codigo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="filtroNome">Nome</Label>
                  <Input
                    id="filtroNome"
                    placeholder="Nome do produto"
                    value={filtros.nome}
                    onChange={(e) => setFiltros({ ...filtros, nome: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="filtroFornecedor">Fornecedor</Label>
                  <Input
                    id="filtroFornecedor"
                    placeholder="Nome do fornecedor"
                    value={filtros.fornecedor}
                    onChange={(e) => setFiltros({ ...filtros, fornecedor: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="filtroAlerta"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={filtros.mostrarApenasAlerta}
                      onChange={(e) => setFiltros({ ...filtros, mostrarApenasAlerta: e.target.checked })}
                    />
                    <Label htmlFor="filtroAlerta" className="text-sm font-medium">
                      Mostrar apenas produtos com alerta de estoque
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setFiltros({ codigo: '', nome: '', fornecedor: '', mostrarApenasAlerta: false })}
              >
                <X className="h-4 w-4 mr-2" /> Limpar Filtros
              </Button>
              <Button onClick={buscarProdutos}>
                <Search className="h-4 w-4 mr-2" /> Buscar
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lista de Produtos</CardTitle>
              <CardDescription>
                {produtosFiltrados.length} produtos encontrados
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
              ) : produtosFiltrados.length === 0 ? (
                <div className="text-center py-6">
                  <Package className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Nenhum produto encontrado</h3>
                  <p className="text-gray-500">Tente ajustar os filtros ou cadastrar um novo produto.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produtosFiltrados.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell>{produto.codigo}</TableCell>
                          <TableCell className="font-medium">{produto.nome}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{produto.quantidade} {produto.unidade}</span>
                              <Progress 
                                value={(produto.quantidade / Math.max(produto.quantidade_minima * 2, 1)) * 100} 
                                className="h-1 mt-1"
                                indicatorClassName={
                                  produto.quantidade <= produto.quantidade_minima 
                                    ? 'bg-red-500' 
                                    : produto.quantidade <= produto.quantidade_minima * 1.5 
                                      ? 'bg-amber-500' 
                                      : 'bg-green-500'
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(produto.valor_unitario)}</TableCell>
                          <TableCell>{produto.fornecedor}</TableCell>
                          <TableCell>
                            {produto.quantidade <= produto.quantidade_minima ? (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                Estoque Baixo
                              </Badge>
                            ) : produto.quantidade <= produto.quantidade_minima * 1.5 ? (
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                Atenção
                              </Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditarProduto(produto)}
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
                                    <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir o produto {produto.nome}?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleExcluirProduto(produto.id)}
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
        
        <TabsContent value="movimentacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Movimentações</CardTitle>
              <CardDescription>
                Últimas movimentações de entrada e saída
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
              ) : movimentacoes.length === 0 ? (
                <div className="text-center py-6">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Nenhuma movimentação registrada</h3>
                  <p className="text-gray-500">Registre entradas e saídas de produtos no estoque.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Produto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoes
                        .sort((a, b) => new Date(b.data) - new Date(a.data))
                        .map((mov) => (
                          <TableRow key={mov.id}>
                            <TableCell>{formatDate(mov.data)}</TableCell>
                            <TableCell className="font-medium">{mov.produto_nome}</TableCell>
                            <TableCell>
                              <Badge className={mov.tipo === 'entrada' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-red-100 text-red-800 hover:bg-red-100'}>
                                {mov.tipo === 'entrada' ? (
                                  <ArrowUpCircle className="h-3 w-3 mr-1 inline" />
                                ) : (
                                  <ArrowDownCircle className="h-3 w-3 mr-1 inline" />
                                )}
                                {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                              </Badge>
                            </TableCell>
                            <TableCell>{mov.quantidade}</TableCell>
                            <TableCell>{mov.motivo}</TableCell>
                            <TableCell>{mov.observacoes}</TableCell>
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

      <Dialog open={isProdutoDialogOpen} onOpenChange={setIsProdutoDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {produtoAtual ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
            <DialogDescription>
              {produtoAtual
                ? 'Edite os detalhes do produto existente.'
                : 'Preencha os detalhes para cadastrar um novo produto.'}
            </DialogDescription>
          </DialogHeader>
          <ProdutoForm
            produto={produtoAtual}
            onSubmit={produtoAtual ? handleAtualizarProduto : handleCriarProduto}
            onCancel={() => setIsProdutoDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isMovimentacaoDialogOpen} onOpenChange={setIsMovimentacaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma entrada ou saída de produto no estoque.
            </DialogDescription>
          </DialogHeader>
          <MovimentacaoForm
            produtos={produtos}
            onSubmit={handleRegistrarMovimentacao}
            onCancel={() => setIsMovimentacaoDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


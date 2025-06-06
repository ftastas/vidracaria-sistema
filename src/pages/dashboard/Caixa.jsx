import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  X,
  AlertCircle,
  Calendar,
  Clock,
  Printer,
  LockOpen,
  Lock,
  FileText
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

// Esquema de validação para abertura de caixa
const aberturaCaixaSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  hora: z.string().min(1, 'Hora é obrigatória'),
  valor_inicial: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  observacoes: z.string().optional(),
});

// Esquema de validação para fechamento de caixa
const fechamentoCaixaSchema = z.object({
  valor_final: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  valor_sistema: z.coerce.number().min(0, 'Valor deve ser maior ou igual a zero'),
  diferenca: z.coerce.number(),
  observacoes: z.string().optional(),
});

// Esquema de validação para movimentação de caixa
const movimentacaoCaixaSchema = z.object({
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  valor: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  observacoes: z.string().optional(),
});

// Componente para o formulário de abertura de caixa
function AberturaCaixaForm({ onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(aberturaCaixaSchema),
    defaultValues: {
      data: format(new Date(), 'yyyy-MM-dd'),
      hora: format(new Date(), 'HH:mm'),
      valor_inicial: 0,
      observacoes: '',
    },
  });

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
          <Label htmlFor="hora">Hora</Label>
          <Input
            id="hora"
            type="time"
            {...register('hora')}
          />
          {errors.hora && (
            <p className="text-sm text-red-500">{errors.hora.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_inicial">Valor Inicial</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              id="valor_inicial"
              type="number"
              step="0.01"
              min="0"
              className="pl-8"
              {...register('valor_inicial')}
            />
          </div>
          {errors.valor_inicial && (
            <p className="text-sm text-red-500">{errors.valor_inicial.message}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register('observacoes')}
            placeholder="Observações adicionais sobre a abertura do caixa"
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Abrir Caixa
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente para o formulário de fechamento de caixa
function FechamentoCaixaForm({ caixa, movimentacoes, onSubmit, onCancel }) {
  // Calcula o valor esperado no sistema
  const valorInicial = caixa?.valor_inicial || 0;
  const totalEntradas = movimentacoes
    .filter(m => m.tipo === 'entrada')
    .reduce((sum, m) => sum + m.valor, 0);
  const totalSaidas = movimentacoes
    .filter(m => m.tipo === 'saida')
    .reduce((sum, m) => sum + m.valor, 0);
  const valorSistema = valorInicial + totalEntradas - totalSaidas;

  const [valorFinal, setValorFinal] = useState(valorSistema);
  const [diferenca, setDiferenca] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fechamentoCaixaSchema),
    defaultValues: {
      valor_final: valorSistema,
      valor_sistema: valorSistema,
      diferenca: 0,
      observacoes: '',
    },
  });

  // Atualiza a diferença quando o valor final muda
  useEffect(() => {
    const diff = valorFinal - valorSistema;
    setDiferenca(diff);
    setValue('diferenca', diff);
  }, [valorFinal, valorSistema, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="valor_sistema">Valor no Sistema</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              id="valor_sistema"
              type="number"
              step="0.01"
              className="pl-8"
              value={valorSistema}
              disabled
              {...register('valor_sistema')}
            />
          </div>
          <p className="text-xs text-gray-500">
            Valor inicial + entradas - saídas
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="valor_final">Valor Final (em caixa)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              id="valor_final"
              type="number"
              step="0.01"
              min="0"
              className="pl-8"
              {...register('valor_final')}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setValorFinal(value);
              }}
            />
          </div>
          {errors.valor_final && (
            <p className="text-sm text-red-500">{errors.valor_final.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="diferenca">Diferença</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
            <Input
              id="diferenca"
              type="number"
              step="0.01"
              className={`pl-8 ${diferenca < 0 ? 'text-red-600' : diferenca > 0 ? 'text-green-600' : ''}`}
              value={diferenca}
              disabled
              {...register('diferenca')}
            />
          </div>
          {diferenca !== 0 && (
            <p className={`text-xs ${diferenca < 0 ? 'text-red-500' : 'text-green-500'}`}>
              {diferenca < 0 ? 'Falta dinheiro no caixa' : 'Sobra dinheiro no caixa'}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            {...register('observacoes')}
            placeholder="Observações adicionais sobre o fechamento do caixa"
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Fechar Caixa
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente para o formulário de movimentação de caixa
function MovimentacaoCaixaForm({ onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(movimentacaoCaixaSchema),
    defaultValues: {
      tipo: 'entrada',
      valor: '',
      descricao: '',
      forma_pagamento: 'dinheiro',
      observacoes: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            placeholder="Descrição da movimentação"
          />
          {errors.descricao && (
            <p className="text-sm text-red-500">{errors.descricao.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
          <Select 
            defaultValue="dinheiro" 
            onValueChange={(value) => setValue('forma_pagamento', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
              <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="transferencia">Transferência Bancária</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
          {errors.forma_pagamento && (
            <p className="text-sm text-red-500">{errors.forma_pagamento.message}</p>
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
          Registrar Movimentação
        </Button>
      </DialogFooter>
    </form>
  );
}

// Componente principal da página de caixa
export default function Caixa() {
  const [caixaAtual, setCaixaAtual] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [historicoFechamentos, setHistoricoFechamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAberturaCaixaDialogOpen, setIsAberturaCaixaDialogOpen] = useState(false);
  const [isFechamentoCaixaDialogOpen, setIsFechamentoCaixaDialogOpen] = useState(false);
  const [isMovimentacaoDialogOpen, setIsMovimentacaoDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [dataAtual, setDataAtual] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Busca os dados do caixa no banco de dados
  const buscarDadosCaixa = async () => {
    setLoading(true);
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      // Aqui estamos simulando os dados para demonstração
      const caixas = await fetchAll('caixa').catch(() => {
        // Dados fictícios para demonstração
        return [
          {
            id: 1,
            data: format(new Date(), 'yyyy-MM-dd'),
            hora_abertura: '08:30',
            valor_inicial: 200,
            status: 'aberto',
            observacoes_abertura: 'Início do expediente',
            hora_fechamento: null,
            valor_final: null,
            valor_sistema: null,
            diferenca: null,
            observacoes_fechamento: null,
          },
        ];
      });
      
      // Buscar movimentações do caixa atual
      const movs = await fetchAll('caixa_movimentacoes').catch(() => {
        // Dados fictícios para demonstração
        return [
          {
            id: 1,
            caixa_id: 1,
            data: format(new Date(), 'yyyy-MM-dd'),
            hora: '09:00',
            tipo: 'entrada',
            valor: 150,
            descricao: 'Recebimento à vista',
            forma_pagamento: 'dinheiro',
            observacoes: '',
          },
          {
            id: 2,
            caixa_id: 1,
            data: format(new Date(), 'yyyy-MM-dd'),
            hora: '10:30',
            tipo: 'entrada',
            valor: 350,
            descricao: 'Pagamento de orçamento #123',
            forma_pagamento: 'cartao_credito',
            observacoes: 'Parcelado em 3x',
          },
          {
            id: 3,
            caixa_id: 1,
            data: format(new Date(), 'yyyy-MM-dd'),
            hora: '12:30',
            tipo: 'saida',
            valor: 50,
            descricao: 'Compra de material de escritório',
            forma_pagamento: 'dinheiro',
            observacoes: '',
          },
        ];
      });
      
      // Buscar histórico de fechamentos
      const fechamentos = await fetchAll('caixa_fechamentos').catch(() => {
        // Dados fictícios para demonstração
        return [
          {
            id: 1,
            data: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'), // Ontem
            hora_abertura: '08:00',
            hora_fechamento: '18:00',
            valor_inicial: 150,
            valor_final: 850,
            valor_sistema: 850,
            diferenca: 0,
            total_entradas: 800,
            total_saidas: 100,
            observacoes: '',
          },
          {
            id: 2,
            data: format(new Date(Date.now() - 2 * 86400000), 'yyyy-MM-dd'), // Anteontem
            hora_abertura: '08:15',
            hora_fechamento: '18:30',
            valor_inicial: 200,
            valor_final: 1200,
            valor_sistema: 1250,
            diferenca: -50,
            total_entradas: 1200,
            total_saidas: 150,
            observacoes: 'Diferença a verificar',
          },
        ];
      });
      
      // Definir o caixa atual (se existir um aberto)
      const caixaAberto = caixas.find(c => c.status === 'aberto');
      setCaixaAtual(caixaAberto || null);
      
      // Filtrar movimentações do caixa atual
      const movimentacoesCaixaAtual = caixaAberto 
        ? movs.filter(m => m.caixa_id === caixaAberto.id)
        : [];
      setMovimentacoes(movimentacoesCaixaAtual);
      
      setHistoricoFechamentos(fechamentos);
    } catch (error) {
      console.error('Erro ao buscar dados do caixa:', error);
      setError('Não foi possível carregar os dados do caixa. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarDadosCaixa();
  }, []);

  // Manipula a abertura de um novo caixa
  const handleAbrirCaixa = async (data) => {
    try {
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const novoCaixa = await insert('caixa', {
        data: data.data,
        hora_abertura: data.hora,
        valor_inicial: data.valor_inicial,
        status: 'aberto',
        observacoes_abertura: data.observacoes,
      }).catch(() => {
        // Simulando resposta para demonstração
        return [{
          id: Math.floor(Math.random() * 1000) + 1,
          data: data.data,
          hora_abertura: data.hora,
          valor_inicial: data.valor_inicial,
          status: 'aberto',
          observacoes_abertura: data.observacoes,
          hora_fechamento: null,
          valor_final: null,
          valor_sistema: null,
          diferenca: null,
          observacoes_fechamento: null,
        }];
      });
      
      setCaixaAtual(novoCaixa[0]);
      setMovimentacoes([]);
      setIsAberturaCaixaDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      setError('Não foi possível abrir o caixa. Tente novamente mais tarde.');
    }
  };

  // Manipula o fechamento do caixa atual
  const handleFecharCaixa = async (data) => {
    try {
      if (!caixaAtual) {
        throw new Error('Nenhum caixa aberto para fechar');
      }
      
      // Calcular totais
      const totalEntradas = movimentacoes
        .filter(m => m.tipo === 'entrada')
        .reduce((sum, m) => sum + m.valor, 0);
      const totalSaidas = movimentacoes
        .filter(m => m.tipo === 'saida')
        .reduce((sum, m) => sum + m.valor, 0);
      
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      // Atualizar o caixa atual para fechado
      await update('caixa', caixaAtual.id, {
        status: 'fechado',
        hora_fechamento: format(new Date(), 'HH:mm'),
        valor_final: data.valor_final,
        valor_sistema: data.valor_sistema,
        diferenca: data.diferenca,
        observacoes_fechamento: data.observacoes,
      }).catch(() => {
        // Simulando resposta para demonstração
        return [true];
      });
      
      // Registrar o fechamento no histórico
      await insert('caixa_fechamentos', {
        data: caixaAtual.data,
        hora_abertura: caixaAtual.hora_abertura,
        hora_fechamento: format(new Date(), 'HH:mm'),
        valor_inicial: caixaAtual.valor_inicial,
        valor_final: data.valor_final,
        valor_sistema: data.valor_sistema,
        diferenca: data.diferenca,
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        observacoes: data.observacoes,
      }).catch(() => {
        // Simulando resposta para demonstração
        return [true];
      });
      
      // Atualizar o estado
      setCaixaAtual(null);
      setMovimentacoes([]);
      setIsFechamentoCaixaDialogOpen(false);
      
      // Recarregar os dados para mostrar o histórico atualizado
      buscarDadosCaixa();
      setError('');
    } catch (error) {
      console.error('Erro ao fechar caixa:', error);
      setError('Não foi possível fechar o caixa. Tente novamente mais tarde.');
    }
  };

  // Manipula o registro de uma nova movimentação
  const handleRegistrarMovimentacao = async (data) => {
    try {
      if (!caixaAtual) {
        throw new Error('Nenhum caixa aberto para registrar movimentação');
      }
      
      // Em um ambiente real, esta seria uma chamada real ao Supabase
      const novaMovimentacao = await insert('caixa_movimentacoes', {
        caixa_id: caixaAtual.id,
        data: caixaAtual.data,
        hora: format(new Date(), 'HH:mm'),
        tipo: data.tipo,
        valor: data.valor,
        descricao: data.descricao,
        forma_pagamento: data.forma_pagamento,
        observacoes: data.observacoes,
      }).catch(() => {
        // Simulando resposta para demonstração
        return [{
          id: Math.floor(Math.random() * 1000) + 1,
          caixa_id: caixaAtual.id,
          data: caixaAtual.data,
          hora: format(new Date(), 'HH:mm'),
          tipo: data.tipo,
          valor: data.valor,
          descricao: data.descricao,
          forma_pagamento: data.forma_pagamento,
          observacoes: data.observacoes,
        }];
      });
      
      setMovimentacoes([...movimentacoes, novaMovimentacao[0]]);
      setIsMovimentacaoDialogOpen(false);
      setError('');
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      setError('Não foi possível registrar a movimentação. Tente novamente mais tarde.');
    }
  };

  // Calcula o saldo atual do caixa
  const calcularSaldoAtual = () => {
    if (!caixaAtual) return 0;
    
    const valorInicial = caixaAtual.valor_inicial || 0;
    const totalEntradas = movimentacoes
      .filter(m => m.tipo === 'entrada')
      .reduce((sum, m) => sum + m.valor, 0);
    const totalSaidas = movimentacoes
      .filter(m => m.tipo === 'saida')
      .reduce((sum, m) => sum + m.valor, 0);
    
    return valorInicial + totalEntradas - totalSaidas;
  };

  // Formata a forma de pagamento para exibição
  const formatarFormaPagamento = (forma) => {
    switch (forma) {
      case 'dinheiro':
        return 'Dinheiro';
      case 'cartao_credito':
        return 'Cartão de Crédito';
      case 'cartao_debito':
        return 'Cartão de Débito';
      case 'pix':
        return 'PIX';
      case 'transferencia':
        return 'Transferência Bancária';
      case 'cheque':
        return 'Cheque';
      case 'outro':
        return 'Outro';
      default:
        return forma;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Caixa</h2>
          <p className="text-gray-500">Gerencie o caixa da vidraçaria.</p>
        </div>
        <div className="flex gap-2">
          {caixaAtual ? (
            <>
              <Button onClick={() => setIsMovimentacaoDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" /> Nova Movimentação
              </Button>
              <Button onClick={() => setIsFechamentoCaixaDialogOpen(true)} variant="default">
                <Lock className="h-4 w-4 mr-2" /> Fechar Caixa
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsAberturaCaixaDialogOpen(true)}>
              <LockOpen className="h-4 w-4 mr-2" /> Abrir Caixa
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        </div>
      ) : caixaAtual ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Caixa Aberto</CardTitle>
                  <CardDescription>
                    Aberto em {formatDate(caixaAtual.data)} às {caixaAtual.hora_abertura}
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <LockOpen className="h-3 w-3 mr-1" /> Aberto
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Valor Inicial</div>
                  <div className="text-2xl font-bold">{formatCurrency(caixaAtual.valor_inicial)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Saldo Atual</div>
                  <div className="text-2xl font-bold">{formatCurrency(calcularSaldoAtual())}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">Movimentações</div>
                  <div className="text-2xl font-bold">{movimentacoes.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Movimentações do Caixa</CardTitle>
              <CardDescription>
                Entradas e saídas registradas no caixa atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              {movimentacoes.length === 0 ? (
                <div className="text-center py-6">
                  <Wallet className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Nenhuma movimentação registrada</h3>
                  <p className="text-gray-500">Registre entradas e saídas no caixa.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Forma de Pagamento</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movimentacoes
                        .sort((a, b) => a.hora.localeCompare(b.hora))
                        .map((mov) => (
                          <TableRow key={mov.id}>
                            <TableCell>{mov.hora}</TableCell>
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
                            <TableCell className="font-medium">{mov.descricao}</TableCell>
                            <TableCell>{formatarFormaPagamento(mov.forma_pagamento)}</TableCell>
                            <TableCell className={mov.tipo === 'entrada' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {formatCurrency(mov.valor)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm text-gray-500">Total de Entradas:</span>{' '}
                <span className="font-medium text-green-600">
                  {formatCurrency(
                    movimentacoes
                      .filter(m => m.tipo === 'entrada')
                      .reduce((sum, m) => sum + m.valor, 0)
                  )}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total de Saídas:</span>{' '}
                <span className="font-medium text-red-600">
                  {formatCurrency(
                    movimentacoes
                      .filter(m => m.tipo === 'saida')
                      .reduce((sum, m) => sum + m.valor, 0)
                  )}
                </span>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Caixa Fechado</CardTitle>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                <Lock className="h-3 w-3 mr-1" /> Fechado
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <Lock className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">O caixa está fechado</h3>
              <p className="text-gray-500 mb-4">Abra o caixa para começar a registrar movimentações.</p>
              <Button onClick={() => setIsAberturaCaixaDialogOpen(true)}>
                <LockOpen className="h-4 w-4 mr-2" /> Abrir Caixa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!caixaAtual && historicoFechamentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Fechamentos</CardTitle>
            <CardDescription>
              Últimos fechamentos de caixa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Valor Inicial</TableHead>
                    <TableHead>Entradas</TableHead>
                    <TableHead>Saídas</TableHead>
                    <TableHead>Valor Final</TableHead>
                    <TableHead>Diferença</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historicoFechamentos
                    .sort((a, b) => new Date(b.data) - new Date(a.data))
                    .map((fechamento) => (
                      <TableRow key={fechamento.id}>
                        <TableCell>{formatDate(fechamento.data)}</TableCell>
                        <TableCell>
                          {fechamento.hora_abertura} - {fechamento.hora_fechamento}
                        </TableCell>
                        <TableCell>{formatCurrency(fechamento.valor_inicial)}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(fechamento.total_entradas)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(fechamento.total_saidas)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(fechamento.valor_final)}
                        </TableCell>
                        <TableCell className={
                          fechamento.diferenca < 0 
                            ? 'text-red-600' 
                            : fechamento.diferenca > 0 
                              ? 'text-green-600' 
                              : ''
                        }>
                          {formatCurrency(fechamento.diferenca)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isAberturaCaixaDialogOpen} onOpenChange={setIsAberturaCaixaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abrir Caixa</DialogTitle>
            <DialogDescription>
              Preencha os dados para abrir o caixa.
            </DialogDescription>
          </DialogHeader>
          <AberturaCaixaForm
            onSubmit={handleAbrirCaixa}
            onCancel={() => setIsAberturaCaixaDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isFechamentoCaixaDialogOpen} onOpenChange={setIsFechamentoCaixaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fechar Caixa</DialogTitle>
            <DialogDescription>
              Preencha os dados para fechar o caixa.
            </DialogDescription>
          </DialogHeader>
          <FechamentoCaixaForm
            caixa={caixaAtual}
            movimentacoes={movimentacoes}
            onSubmit={handleFecharCaixa}
            onCancel={() => setIsFechamentoCaixaDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isMovimentacaoDialogOpen} onOpenChange={setIsMovimentacaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma entrada ou saída no caixa.
            </DialogDescription>
          </DialogHeader>
          <MovimentacaoCaixaForm
            onSubmit={handleRegistrarMovimentacao}
            onCancel={() => setIsMovimentacaoDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}


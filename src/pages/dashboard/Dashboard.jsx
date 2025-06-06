import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  FileText, 
  DollarSign, 
  Clipboard, 
  Package, 
  Wallet,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { supabase, fetchAll } from '../../lib/supabase';
import { formatCurrency } from '../../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    orcamentos: 0,
    ordens: 0,
    financas: { receitas: 0, despesas: 0 },
    estoque: { total: 0, alertas: 0 },
    caixa: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Em um ambiente real, estas seriam chamadas reais ao Supabase
        // Aqui estamos simulando os dados para demonstração
        
        // Simulando dados de orçamentos
        const orcamentos = await fetchAll('orcamentos', { limit: 100 }).catch(() => []);
        
        // Simulando dados de ordens de serviço
        const ordens = await fetchAll('ordens_servico', { limit: 100 }).catch(() => []);
        
        // Simulando dados financeiros
        const financas = await fetchAll('financas', { limit: 100 }).catch(() => []);
        const receitas = financas
          .filter(item => item.tipo === 'entrada')
          .reduce((sum, item) => sum + item.valor, 0);
        const despesas = financas
          .filter(item => item.tipo === 'saida')
          .reduce((sum, item) => sum + item.valor, 0);
        
        // Simulando dados de estoque
        const estoque = await fetchAll('estoque', { limit: 100 }).catch(() => []);
        const alertasEstoque = estoque.filter(item => item.quantidade <= item.quantidade_minima).length;
        
        // Simulando dados de caixa
        const caixa = await fetchAll('caixa_movimentacoes', { 
          filters: [{ column: 'data', operator: 'gte', value: new Date().toISOString().split('T')[0] }]
        }).catch(() => []);
        const saldoCaixa = caixa.reduce((sum, item) => {
          return item.tipo === 'entrada' ? sum + item.valor : sum - item.valor;
        }, 0);

        setStats({
          orcamentos: orcamentos.length,
          ordens: ordens.length,
          financas: { receitas, despesas },
          estoque: { total: estoque.length, alertas: alertasEstoque },
          caixa: saldoCaixa
        });
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        // Em caso de erro, usamos dados fictícios para demonstração
        setStats({
          orcamentos: 24,
          ordens: 18,
          financas: { receitas: 15000, despesas: 8500 },
          estoque: { total: 120, alertas: 5 },
          caixa: 2350
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cards = [
    {
      title: 'Orçamentos',
      value: stats.orcamentos,
      description: 'Total de orçamentos',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-50',
    },
    {
      title: 'Ordens de Serviço',
      value: stats.ordens,
      description: 'Em andamento',
      icon: <Clipboard className="h-6 w-6 text-green-600" />,
      color: 'bg-green-50',
    },
    {
      title: 'Receitas',
      value: formatCurrency(stats.financas.receitas),
      description: 'Mês atual',
      icon: <TrendingUp className="h-6 w-6 text-emerald-600" />,
      color: 'bg-emerald-50',
    },
    {
      title: 'Despesas',
      value: formatCurrency(stats.financas.despesas),
      description: 'Mês atual',
      icon: <DollarSign className="h-6 w-6 text-red-600" />,
      color: 'bg-red-50',
    },
    {
      title: 'Estoque',
      value: stats.estoque.total,
      description: `${stats.estoque.alertas} alertas de estoque baixo`,
      icon: <Package className="h-6 w-6 text-amber-600" />,
      color: 'bg-amber-50',
    },
    {
      title: 'Caixa',
      value: formatCurrency(stats.caixa),
      description: 'Saldo atual',
      icon: <Wallet className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-gray-500">Visão geral do sistema de gerenciamento da vidraçaria.</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-300 bg-gray-200 h-4 w-24 rounded"></CardTitle>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold bg-gray-200 h-8 w-20 rounded mb-1"></div>
                <p className="text-xs text-gray-300 bg-gray-200 h-3 w-32 rounded"></p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <Card key={i} className={`${card.color} border-none`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orçamentos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between animate-pulse">
                    <div className="bg-gray-200 h-4 w-32 rounded"></div>
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>João Silva</span>
                  <span className="font-medium">R$ 850,00</span>
                </div>
                <div className="flex justify-between">
                  <span>Maria Oliveira</span>
                  <span className="font-medium">R$ 1.200,00</span>
                </div>
                <div className="flex justify-between">
                  <span>Carlos Santos</span>
                  <span className="font-medium">R$ 650,00</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ordens de Serviço Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between animate-pulse">
                    <div className="bg-gray-200 h-4 w-32 rounded"></div>
                    <div className="bg-gray-200 h-4 w-20 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Porta de Vidro - Pedro Alves</span>
                  <span className="text-amber-600 font-medium">Em produção</span>
                </div>
                <div className="flex justify-between">
                  <span>Box de Banheiro - Ana Costa</span>
                  <span className="text-green-600 font-medium">Finalizado</span>
                </div>
                <div className="flex justify-between">
                  <span>Espelho - Marcos Souza</span>
                  <span className="text-blue-600 font-medium">Em aberto</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className={stats.estoque.alertas > 0 ? 'border-red-200 bg-red-50' : ''}>
        <CardHeader className="flex flex-row items-center">
          {stats.estoque.alertas > 0 && (
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          )}
          <CardTitle className={stats.estoque.alertas > 0 ? 'text-red-600' : ''}>
            Alertas de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-4 w-full rounded"></div>
              ))}
            </div>
          ) : stats.estoque.alertas > 0 ? (
            <div className="space-y-2">
              <p>Vidro temperado 8mm - Restam apenas 3 chapas</p>
              <p>Perfil de alumínio - Restam apenas 5 barras</p>
              {stats.estoque.alertas > 2 && (
                <p className="text-sm text-red-600 font-medium">
                  + {stats.estoque.alertas - 2} outros itens com estoque baixo
                </p>
              )}
            </div>
          ) : (
            <p>Não há alertas de estoque no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


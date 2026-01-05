import { useState } from 'react';
import { Calendar, DollarSign, AlertCircle, CheckCircle, Clock, TrendingUp, Filter } from 'lucide-react';

const RelatorioContasPagarReceber = () => {
  const [tipoVista, setTipoVista] = useState('ambos'); // 'pagar', 'receber', 'ambos'
  const [periodoFiltro, setPeriodoFiltro] = useState('mes_atual');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Dados mock
  const contasPagar = [
    { id: 1, descricao: 'Aluguel', categoria: 'Administrativa', valor: 3500.00, vencimento: '2025-01-05', status: 'pago', dataPagamento: '2025-01-04' },
    { id: 2, descricao: 'Energia Elétrica', categoria: 'Utilidades', valor: 850.00, vencimento: '2025-01-10', status: 'pago', dataPagamento: '2025-01-09' },
    { id: 3, descricao: 'Internet', categoria: 'Administrativa', valor: 250.00, vencimento: '2025-01-15', status: 'pendente', dataPagamento: null },
    { id: 4, descricao: 'Material Médico', categoria: 'Clínica', valor: 1200.00, vencimento: '2025-01-20', status: 'pendente', dataPagamento: null },
    { id: 5, descricao: 'Salários', categoria: 'Pessoal', valor: 8500.00, vencimento: '2025-01-05', status: 'atrasado', dataPagamento: null },
    { id: 6, descricao: 'Marketing Digital', categoria: 'Marketing', valor: 1450.00, vencimento: '2025-01-25', status: 'pendente', dataPagamento: null }
  ];

  const contasReceber = [
    { id: 1, descricao: 'Consulta - João Silva', categoria: 'Consultas', valor: 250.00, vencimento: '2025-01-03', status: 'recebido', dataRecebimento: '2025-01-03' },
    { id: 2, descricao: 'Procedimento - Maria Santos', categoria: 'Procedimentos', valor: 850.00, vencimento: '2025-01-08', status: 'recebido', dataRecebimento: '2025-01-07' },
    { id: 3, descricao: 'Convênio - Unimed', categoria: 'Convênios', valor: 3200.00, vencimento: '2025-01-15', status: 'pendente', dataRecebimento: null },
    { id: 4, descricao: 'Telemedicina - Pedro Costa', categoria: 'Telemedicina', valor: 180.00, vencimento: '2025-01-12', status: 'pendente', dataRecebimento: null },
    { id: 5, descricao: 'Exames - Ana Lima', categoria: 'Exames', valor: 420.00, vencimento: '2025-01-05', status: 'atrasado', dataRecebimento: null },
    { id: 6, descricao: 'Procedimento - Carlos Souza', categoria: 'Procedimentos', valor: 1200.00, vencimento: '2025-01-18', status: 'pendente', dataRecebimento: null }
  ];

  const calcularTotais = (contas) => {
    const total = contas.reduce((sum, conta) => sum + conta.valor, 0);
    const pago = contas.filter(c => c.status === 'pago' || c.status === 'recebido').reduce((sum, conta) => sum + conta.valor, 0);
    const pendente = contas.filter(c => c.status === 'pendente').reduce((sum, conta) => sum + conta.valor, 0);
    const atrasado = contas.filter(c => c.status === 'atrasado').reduce((sum, conta) => sum + conta.valor, 0);
    
    return { total, pago, pendente, atrasado };
  };

  const totaisPagar = calcularTotais(contasPagar);
  const totaisReceber = calcularTotais(contasReceber);

  const getStatusBadge = (status, tipo) => {
    const configs = {
      pago: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      recebido: { label: 'Recebido', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      atrasado: { label: 'Atrasado', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = configs[status];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const renderTabela = (contas, tipo) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Descrição</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Categoria</th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">Valor</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Vencimento</th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {contas.map((conta) => (
              <tr key={conta.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{conta.descricao}</td>
                <td className="py-3 px-4 text-gray-600">{conta.categoria}</td>
                <td className="py-3 px-4 text-right font-medium text-gray-900">{formatCurrency(conta.valor)}</td>
                <td className="py-3 px-4 text-center text-gray-600">{formatDate(conta.vencimento)}</td>
                <td className="py-3 px-4 text-center">{getStatusBadge(conta.status, tipo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Contas a Pagar e Receber</h3>
              <p className="text-sm text-gray-600">Gestão completa de contas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={tipoVista}
              onChange={(e) => setTipoVista(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ambos">Ambos</option>
              <option value="pagar">Apenas a Pagar</option>
              <option value="receber">Apenas a Receber</option>
            </select>
            <select
              value={periodoFiltro}
              onChange={(e) => setPeriodoFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="mes_atual">Mês Atual</option>
              <option value="proximos_7_dias">Próximos 7 dias</option>
              <option value="proximos_30_dias">Próximos 30 dias</option>
              <option value="vencidos">Vencidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contas a Pagar */}
        {(tipoVista === 'ambos' || tipoVista === 'pagar') && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Contas a Pagar</h4>
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(totaisPagar.total)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Pago</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totaisPagar.pago)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Pendente</span>
                <span className="text-lg font-bold text-yellow-600">{formatCurrency(totaisPagar.pendente)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600">Atrasado</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(totaisPagar.atrasado)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Percentual Pago</span>
                <span className="font-medium text-gray-900">
                  {((totaisPagar.pago / totaisPagar.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(totaisPagar.pago / totaisPagar.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Contas a Receber */}
        {(tipoVista === 'ambos' || tipoVista === 'receber') && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Contas a Receber</h4>
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(totaisReceber.total)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Recebido</span>
                <span className="text-lg font-bold text-green-600">{formatCurrency(totaisReceber.pago)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Pendente</span>
                <span className="text-lg font-bold text-yellow-600">{formatCurrency(totaisReceber.pendente)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600">Atrasado</span>
                <span className="text-lg font-bold text-red-600">{formatCurrency(totaisReceber.atrasado)}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Percentual Recebido</span>
                <span className="font-medium text-gray-900">
                  {((totaisReceber.pago / totaisReceber.total) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(totaisReceber.pago / totaisReceber.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Saldo Projetado */}
      {tipoVista === 'ambos' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Saldo Projetado do Período</h4>
              <p className="text-sm text-gray-600">Receitas menos despesas previstas</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(totaisReceber.total - totaisPagar.total)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {totaisReceber.total > totaisPagar.total ? 'Superávit' : 'Déficit'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabelas Detalhadas */}
      {(tipoVista === 'ambos' || tipoVista === 'pagar') && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-medium text-gray-900">Detalhamento - Contas a Pagar</h4>
          </div>
          <div className="p-6">
            {renderTabela(contasPagar, 'pagar')}
          </div>
        </div>
      )}

      {(tipoVista === 'ambos' || tipoVista === 'receber') && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h4 className="text-lg font-medium text-gray-900">Detalhamento - Contas a Receber</h4>
          </div>
          <div className="p-6">
            {renderTabela(contasReceber, 'receber')}
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatorioContasPagarReceber;

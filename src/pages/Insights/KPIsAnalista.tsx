import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';

interface KPIAnalista {
  analista: string;
  numero_entregas: number;
  horas_trabalhadas: string;
  valor_gerado_anual: string;
  produtividade_financeira: number;
  taxa_implementacao: number;
  entregas_por_cliente: Record<string, number>;
}

interface KPICliente {
  razao_social: string;
  valor_total_gerado: number;
  numero_entregas: number;
  problemas_recorrentes: string[];
  complexidade_media: number;
  implementacao_taxa: number;
}

interface KPIsAnalistaProps {
  analista: string;
}

const KPIsAnalista: React.FC<KPIsAnalistaProps> = ({ analista }) => {
  const [kpiAnalista, setKpiAnalista] = useState<KPIAnalista | null>(null);
  const [kpisClientes, setKpisClientes] = useState<KPICliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = async (analistaName: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Token de acesso não encontrado');
      }

      // Buscar KPI do analista
      const kpiRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/insights-analista/kpi/analista/${analistaName}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setKpiAnalista(kpiRes.data);

      // Buscar KPIs dos clientes desse analista
      // Você pode precisar ajustar esse endpoint
      try {
        const clientesRes = await axios.get(
          `${process.env.REACT_APP_API_URL}/insights-analista/kpi/clientes/${analistaName}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setKpisClientes(clientesRes.data || []);
      } catch (err) {
        // Se endpoint não existir, deixa vazio
        setKpisClientes([]);
      }
    } catch (err) {
      console.error('Erro ao buscar KPIs:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError('Nenhum KPI encontrado para este analista');
        } else {
          setError(`Erro: ${err.response?.status}`);
        }
      } else {
        setError('Erro ao conectar com a API');
      }
      setKpiAnalista(null);
      setKpisClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (analista) {
      fetchKPIs(analista);
    }
  }, [analista]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, pl: { xs: 2, sm: 3 } }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Carregando KPIs...
        </Typography>
      </Box>
    );
  }

  if (error && !kpiAnalista) {
    return (
      <Alert severity="warning" sx={{ ml: { xs: 2, sm: 3 } }}>
        {error}
      </Alert>
    );
  }

  if (!kpiAnalista) {
    return (
      <Alert severity="info" sx={{ ml: { xs: 2, sm: 3 } }}>
        Selecione um analista para visualizar os KPIs
      </Alert>
    );
  }

  const horasTrabalhadas = parseFloat(kpiAnalista.horas_trabalhadas) || 0;
  const valorGeradoAnual = parseFloat(kpiAnalista.valor_gerado_anual) || 0;

  return (
    <Box sx={{ pl: { xs: 2, sm: 3 } }}>
      {/* KPI Cards Principais */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 3, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Total de Entregas
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>
            {kpiAnalista.numero_entregas}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Registros cadastrados
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            💰 Valor Gerado (Anual)
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
            {valorGeradoAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Total de impacto anual
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            ⏱️ Horas Trabalhadas
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
            {horasTrabalhadas.toFixed(1)}h
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Total investido em análises
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            ✅ Taxa Implementação
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
            {(kpiAnalista.taxa_implementacao * 100).toFixed(1)}%
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Entregas implementadas
          </Typography>
        </Paper>
      </Box>

      {/* KPI Secundários */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 3, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            💎 Produtividade Financeira
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
            {kpiAnalista.produtividade_financeira.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/h
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Valor gerado por hora trabalhada
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            📊 Clientes Atendidos
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
            {Object.keys(kpiAnalista.entregas_por_cliente).length}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Clientes com entregas
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, backgroundColor: '#3B82F6', color: 'white' }}>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            📈 Ticket Médio
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 1 }}>
            {(valorGeradoAnual / (kpiAnalista.numero_entregas || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Impacto médio por entrega
          </Typography>
        </Paper>
      </Box>

      {/* Entregas por Cliente */}
      {Object.keys(kpiAnalista.entregas_por_cliente).length > 0 && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            📋 Entregas por Cliente
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
            {Object.entries(kpiAnalista.entregas_por_cliente).map(([cliente, count]) => (
              <Paper key={cliente} sx={{ p: 2, backgroundColor: '#F8FAFC' }}>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                  {cliente}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3B82F6' }}>
                  {count} {count === 1 ? 'entrega' : 'entregas'}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Card>
      )}

      {/* KPIs dos Clientes */}
      {kpisClientes.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            🎯 Performance por Cliente
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {kpisClientes.map((kpi, idx) => (
              <Paper key={idx} sx={{ p: 2, backgroundColor: '#F8FAFC', borderLeft: '4px solid #3B82F6' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      <strong>Cliente:</strong> {kpi.razao_social}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      <strong>Entregas:</strong> {kpi.numero_entregas}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      <strong>Complexidade Média:</strong> {kpi.complexidade_media === 1 ? 'Baixa' : kpi.complexidade_media === 2 ? 'Média' : 'Alta'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      <strong>💰 Valor Total:</strong> {kpi.valor_total_gerado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      <strong>✅ Taxa Implementação:</strong> {(kpi.implementacao_taxa * 100).toFixed(1)}%
                    </Typography>
                    {kpi.problemas_recorrentes.length > 0 && (
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        <strong>Problemas:</strong> {kpi.problemas_recorrentes.join(', ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Card>
      )}

      {/* Insights */}
      <Card sx={{ p: 3, mt: 3, backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2C5282', mb: 2 }}>
          💡 Insights & Recomendações
        </Typography>
        <Typography variant="body2" sx={{ color: '#2C5282', mb: 1 }}>
          • <strong>Produtividade:</strong> Você gera em média {kpiAnalista.produtividade_financeira.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de valor por hora trabalhada.
        </Typography>
        <Typography variant="body2" sx={{ color: '#2C5282', mb: 1 }}>
          • <strong>Taxa de Implementação:</strong> {(kpiAnalista.taxa_implementacao * 100).toFixed(1)}% das suas entregas foram implementadas pelos clientes.
        </Typography>
        {kpiAnalista.numero_entregas > 0 && (
          <Typography variant="body2" sx={{ color: '#2C5282' }}>
            • <strong>Média por Entrega:</strong> Cada entrega gera em média {((valorGeradoAnual / kpiAnalista.numero_entregas) * 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de valor durante 1 ano.
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default KPIsAnalista;

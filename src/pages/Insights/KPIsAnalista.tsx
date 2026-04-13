import React, { useState, useEffect, useMemo } from 'react';
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
  entregas: Array<{
    status: string;
    razao_social?: string;
    categoria?: string;
    complexidade?: string;
    impacto_anual_r?: number | string;
    horas_gastas?: number | string;
  }>;
}

const STATUS_COLORS: Record<string, string> = {
  'Em análise': '#3B82F6',
  'Entregue ao consultor': '#6366F1',
  'Apresentado ao cliente': '#F59E0B',
  'Implementado': '#10B981',
  'Rejeitado': '#EF4444',
};

const CATEGORY_COLORS = [
  '#2563EB',
  '#F59E0B',
  '#10B981',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#F97316',
  '#84CC16',
  '#06B6D4',
  '#EF4444',
  '#6366F1',
  '#0EA5E9',
];

const COMPLEXITY_COLORS: Record<string, string> = {
  Baixa: '#10B981',
  'Média': '#F59E0B',
  Alta: '#EF4444',
  'Sem complexidade': '#6B7280',
};

const KPIsAnalista: React.FC<KPIsAnalistaProps> = ({ analista, entregas }) => {
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

  const statusData = useMemo(() => {
    const counts = entregas.reduce<Record<string, number>>((acc, entrega) => {
      const status = entrega.status || 'Sem status';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (total === 0) {
      return [] as Array<{ status: string; count: number; percentage: number; color: string }>;
    }

    return Object.entries(counts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: (count / total) * 100,
        color: STATUS_COLORS[status] || '#6B7280',
      }))
      .sort((a, b) => b.count - a.count);
  }, [entregas]);

  const pieGradient = useMemo(() => {
    if (statusData.length === 0) {
      return '#E5E7EB';
    }

    let current = 0;
    const stops = statusData.map((item) => {
      const start = current;
      const end = current + item.percentage;
      current = end;
      return `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }, [statusData]);

  const categoriaData = useMemo(() => {
    const counts = entregas.reduce<Record<string, number>>((acc, entrega) => {
      const categoria = entrega.categoria || 'Sem categoria';
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (total === 0) {
      return [] as Array<{ categoria: string; count: number; percentage: number; color: string }>;
    }

    return Object.entries(counts)
      .map(([categoria, count], idx) => ({
        categoria,
        count,
        percentage: (count / total) * 100,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [entregas]);

  const categoriaGradient = useMemo(() => {
    if (categoriaData.length === 0) {
      return '#E5E7EB';
    }

    let current = 0;
    const stops = categoriaData.map((item) => {
      const start = current;
      const end = current + item.percentage;
      current = end;
      return `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    });

    return `conic-gradient(${stops.join(', ')})`;
  }, [categoriaData]);

  const radarData = useMemo(() => {
    const hoursByCategory = entregas.reduce<Record<string, number>>((acc, entrega) => {
      const categoria = entrega.categoria || 'Sem categoria';
      const horas = Number(entrega.horas_gastas) || 0;
      acc[categoria] = (acc[categoria] || 0) + horas;
      return acc;
    }, {});

    const entries = Object.entries(hoursByCategory)
      .map(([categoria, horas]) => ({ categoria, horas }))
      .filter((item) => item.horas > 0)
      .sort((a, b) => b.horas - a.horas)
      .slice(0, 8);

    const maxHoras = entries.length > 0 ? Math.max(...entries.map((item) => item.horas), 1) : 1;

    return {
      entries,
      maxHoras,
      totalHoras: entries.reduce((sum, item) => sum + item.horas, 0),
    };
  }, [entregas]);

  const radarSvg = useMemo(() => {
    if (radarData.entries.length < 3) {
      return null;
    }

    const size = 360;
    const center = size / 2;
    const radius = 120;
    const angleStep = (Math.PI * 2) / radarData.entries.length;

    const levels = [0.25, 0.5, 0.75, 1];

    const getPoint = (angle: number, scale: number) => {
      const x = center + Math.cos(angle) * radius * scale;
      const y = center + Math.sin(angle) * radius * scale;
      return { x, y };
    };

    const axisPoints = radarData.entries.map((_, idx) => {
      const angle = -Math.PI / 2 + idx * angleStep;
      const end = getPoint(angle, 1);
      const label = getPoint(angle, 1.18);
      return { angle, end, label };
    });

    const levelPolygons = levels.map((level) => {
      const points = axisPoints
        .map((axis) => {
          const p = getPoint(axis.angle, level);
          return `${p.x},${p.y}`;
        })
        .join(' ');
      return { level, points };
    });

    const dataPolygon = radarData.entries
      .map((item, idx) => {
        const angle = -Math.PI / 2 + idx * angleStep;
        const normalized = item.horas / radarData.maxHoras;
        const p = getPoint(angle, normalized);
        return `${p.x},${p.y}`;
      })
      .join(' ');

    const dataDots = radarData.entries.map((item, idx) => {
      const angle = -Math.PI / 2 + idx * angleStep;
      const normalized = item.horas / radarData.maxHoras;
      const p = getPoint(angle, normalized);
      return { ...p, horas: item.horas };
    });

    return { size, center, axisPoints, levelPolygons, dataPolygon, dataDots };
  }, [radarData]);

  const complexidadeHorasData = useMemo(() => {
    const totals = entregas.reduce<Record<string, number>>((acc, entrega) => {
      const complexidade = entrega.complexidade || 'Sem complexidade';
      const horas = Number(entrega.horas_gastas) || 0;
      acc[complexidade] = (acc[complexidade] || 0) + horas;
      return acc;
    }, {});

    const orderedKeys = ['Baixa', 'Média', 'Alta', 'Sem complexidade'];
    const data = orderedKeys
      .filter((key) => totals[key] > 0)
      .map((key) => ({
        complexidade: key,
        horas: totals[key],
        color: COMPLEXITY_COLORS[key] || '#6B7280',
      }));

    const maxHoras = data.length > 0 ? Math.max(...data.map((item) => item.horas)) : 0;
    const totalHoras = data.reduce((sum, item) => sum + item.horas, 0);

    return { data, maxHoras, totalHoras };
  }, [entregas]);

  const entregasPorClienteLocal = useMemo(() => {
    return entregas.reduce<Record<string, number>>((acc, entrega) => {
      const cliente = entrega.razao_social || 'Sem cliente';
      acc[cliente] = (acc[cliente] || 0) + 1;
      return acc;
    }, {});
  }, [entregas]);

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

  const totalEntregas = entregas.length;
  const valorGeradoAnual = entregas.reduce((sum, entrega) => sum + (Number(entrega.impacto_anual_r) || 0), 0);
  const horasTrabalhadas = entregas.reduce((sum, entrega) => sum + (Number(entrega.horas_gastas) || 0), 0);
  const totalImplementadas = entregas.filter((entrega) => entrega.status === 'Implementado').length;
  const taxaImplementacao = totalEntregas > 0 ? (totalImplementadas / totalEntregas) * 100 : 0;
  const produtividadeFinanceira = horasTrabalhadas > 0 ? valorGeradoAnual / horasTrabalhadas : 0;
  const ticketMedio = totalEntregas > 0 ? valorGeradoAnual / totalEntregas : 0;
  const clientesAtendidos = Object.keys(entregasPorClienteLocal).length;

  const resumoCards = [
    {
      titulo: 'Total de Entregas',
      valor: `${totalEntregas}`,
      detalhe: 'Registros cadastrados',
    },
    {
      titulo: 'Valor Gerado (Anual)',
      valor: valorGeradoAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      detalhe: 'Impacto financeiro acumulado',
    },
    {
      titulo: 'Horas Trabalhadas',
      valor: `${horasTrabalhadas.toFixed(1)}h`,
      detalhe: 'Total investido em análises',
    },
    {
      titulo: 'Taxa de Implementação',
      valor: `${taxaImplementacao.toFixed(1)}%`,
      detalhe: 'Entregas implementadas',
    },
    {
      titulo: 'Produtividade Financeira',
      valor: `${produtividadeFinanceira.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/h`,
      detalhe: 'Valor gerado por hora',
    },
    {
      titulo: 'Ticket Médio',
      valor: ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      detalhe: `${clientesAtendidos} clientes atendidos`,
    },
  ];

  return (
    <Box sx={{ pl: { xs: 2, sm: 3 }, pr: { xs: 0, sm: 1 } }}>
      <Card sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF4FF 100%)', border: '1px solid #DBEAFE' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 0.5 }}>
          Painel de KPIs do Analista
        </Typography>
        <Typography variant="body2" sx={{ color: '#475569' }}>
          Visão consolidada de performance, impacto financeiro e distribuição operacional.
        </Typography>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', xl: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        {resumoCards.map((card) => (
          <Paper
            key={card.titulo}
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              backgroundColor: '#FFFFFF',
            }}
          >
            <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5 }}>
              {card.titulo}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E3A8A', mb: 0.5, lineHeight: 1.2 }}>
              {card.valor}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {card.detalhe}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2, mb: 3 }}>

      {/* Distribuicao de Status */}
      <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
          🥧 Distribuição por Status
        </Typography>

        {statusData.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px 1fr' }, gap: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: pieGradient,
                  position: 'relative',
                  boxShadow: '0 8px 24px rgba(30, 58, 138, 0.12)',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 92,
                    height: 92,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    px: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                    {entregas.length} entregas
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {statusData.map((item) => (
                <Box
                  key={item.status}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.25,
                    borderRadius: 1,
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {item.status}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Alert severity="info">Sem dados suficientes para montar o gráfico de status.</Alert>
        )}
      </Card>

      {/* Distribuicao por Categoria */}
      <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
          🧩 Distribuição por Categoria
        </Typography>

        {categoriaData.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px 1fr' }, gap: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: categoriaGradient,
                  position: 'relative',
                  boxShadow: '0 8px 24px rgba(30, 58, 138, 0.12)',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 92,
                    height: 92,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    px: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                    {categoriaData.length} categorias
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {categoriaData.map((item) => (
                <Box
                  key={item.categoria}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.25,
                    borderRadius: 1,
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {item.categoria}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1E3A8A', flexShrink: 0 }}>
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Alert severity="info">Sem dados suficientes para montar o gráfico de categoria.</Alert>
        )}
      </Card>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2, mb: 3 }}>

      {/* Horas Gastas por Categoria (Radar) */}
      <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
          🕸️ Horas Gastas por Categoria
        </Typography>

        {radarSvg ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: 3, alignItems: 'start' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <svg width={radarSvg.size} height={radarSvg.size} role="img" aria-label="Radar de horas por categoria">
                {radarSvg.levelPolygons.map((level, idx) => (
                  <polygon
                    key={`level-${idx}`}
                    points={level.points}
                    fill="none"
                    stroke="#DBEAFE"
                    strokeWidth="1"
                  />
                ))}

                {radarSvg.axisPoints.map((axis, idx) => (
                  <line
                    key={`axis-${idx}`}
                    x1={radarSvg.center}
                    y1={radarSvg.center}
                    x2={axis.end.x}
                    y2={axis.end.y}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                ))}

                <polygon
                  points={radarSvg.dataPolygon}
                  fill="rgba(59, 130, 246, 0.25)"
                  stroke="#2563EB"
                  strokeWidth="2"
                />

                {radarSvg.dataDots.map((dot, idx) => (
                  <circle key={`dot-${idx}`} cx={dot.x} cy={dot.y} r="4" fill="#1D4ED8" />
                ))}

                {radarSvg.axisPoints.map((axis, idx) => (
                  <text
                    key={`label-${idx}`}
                    x={axis.label.x}
                    y={axis.label.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fill="#334155"
                  >
                    {radarData.entries[idx].categoria.length > 22
                      ? `${radarData.entries[idx].categoria.slice(0, 22)}...`
                      : radarData.entries[idx].categoria}
                  </text>
                ))}
              </svg>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <Paper sx={{ p: 2, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                  <strong>Total (top {radarData.entries.length}):</strong> {radarData.totalHoras.toFixed(1)}h
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                  <strong>Maior categoria:</strong> {radarData.maxHoras.toFixed(1)}h
                </Typography>
              </Paper>

              {radarData.entries.map((item) => (
                <Box
                  key={item.categoria}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1.25,
                    borderRadius: 1,
                    backgroundColor: '#F8FAFC',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#334155', pr: 1 }}>
                    {item.categoria}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 'bold', flexShrink: 0 }}>
                    {item.horas.toFixed(1)}h
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Alert severity="info">
            Para exibir o radar, sao necessarias pelo menos 3 categorias com horas gastas.
          </Alert>
        )}
      </Card>

      {/* Complexidade por Horas Gastas */}
      <Card sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
          ⏳ Complexidade por Horas Gastas
        </Typography>

        {complexidadeHorasData.data.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Paper sx={{ p: 2, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <Typography variant="body2" sx={{ color: '#1E3A8A' }}>
                <strong>Total de horas:</strong> {complexidadeHorasData.totalHoras.toFixed(1)}h
              </Typography>
            </Paper>

            {complexidadeHorasData.data.map((item) => {
              const widthPercent = complexidadeHorasData.maxHoras > 0
                ? (item.horas / complexidadeHorasData.maxHoras) * 100
                : 0;

              return (
                <Box key={item.complexidade}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600 }}>
                      {item.complexidade}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1E3A8A', fontWeight: 'bold' }}>
                      {item.horas.toFixed(1)}h
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 12, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${widthPercent}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Alert severity="info">Sem dados suficientes para montar complexidade por horas.</Alert>
        )}
      </Card>
      </Box>

      {/* Entregas por Cliente */}
      {Object.keys(entregasPorClienteLocal).length > 0 && (
        <Card sx={{ p: 3, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 2 }}>
            📋 Entregas por Cliente
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1 }}>
            {Object.entries(entregasPorClienteLocal).map(([cliente, count]) => (
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
        <Card sx={{ p: 3, mb: 3, border: '1px solid #E2E8F0', borderRadius: 2 }}>
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
      <Card sx={{ p: 3, mt: 0, backgroundColor: '#EFF6FF', borderLeft: '4px solid #3B82F6', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2C5282', mb: 2 }}>
          💡 Insights & Recomendações
        </Typography>
        <Typography variant="body2" sx={{ color: '#2C5282', mb: 1 }}>
          • <strong>Produtividade:</strong> Você gera em média {produtividadeFinanceira.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de valor por hora trabalhada.
        </Typography>
        <Typography variant="body2" sx={{ color: '#2C5282', mb: 1 }}>
          • <strong>Taxa de Implementação:</strong> {taxaImplementacao.toFixed(1)}% das suas entregas foram implementadas pelos clientes.
        </Typography>
        {totalEntregas > 0 && (
          <Typography variant="body2" sx={{ color: '#2C5282' }}>
            • <strong>Média por Entrega:</strong> Cada entrega gera em média {ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de impacto anual.
          </Typography>
        )}
      </Card>
    </Box>
  );
};

export default KPIsAnalista;

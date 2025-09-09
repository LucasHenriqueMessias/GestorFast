
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { getAccessToken } from '../../utils/storage';



const RelatorioFast = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAccessToken();
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/loja/relatorio-fast`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setData(res.data);
      } catch (err: any) {
        setError('Erro ao buscar dados do relatório Fast.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  // Dados para gráficos simples
  const chamadosData = data ? [
    { name: 'Ativos', value: data.chamados_ativos, color: '#2196F3' },
    { name: 'Finalizados', value: data.chamados_finalizados, color: '#4CAF50' }
  ] : [];

  const prospeccaoData = data ? [
    { name: 'Quente', value: data.prospeccao_quente, color: '#FF9800' },
    { name: 'Fria', value: data.prospeccao_fria, color: '#9E9E9E' }
  ] : [];

  const eventosData = data ? [
    { name: 'Pendentes', value: data.eventos_pendentes, color: '#FFC107' },
    { name: 'Realizados', value: data.eventos_realizados, color: '#4CAF50' }
  ] : [];

  const clientesData = data ? [
    { name: 'Ativos Fast', value: data.clientes_ativos_fast, color: '#4CAF50' },
    { name: 'Funil', value: data.clientes_funil, color: '#2196F3' },
    { name: 'Sinal Amarelo', value: data.clientes_sinal_amarelo, color: '#FFEB3B' }
  ] : [];

  // Componente de barra horizontal
  const SimpleBarChart = ({ data, title }: { data: { name: string; value: number; color: string }[]; title: string }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1);
    return (
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#5C59E8' }}>{title}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((item, idx) => (
            <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ minWidth: 100 }}>{item.name}</Typography>
              <Box sx={{ flex: 1, height: 24, background: '#f5f5f5', borderRadius: 2, position: 'relative' }}>
                <Box sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${(item.value / maxValue) * 100}%`,
                  background: item.color,
                  borderRadius: 2,
                  transition: 'width 0.3s'
                }} />
                <Typography variant="body2" sx={{ position: 'absolute', right: 8, top: 2, fontWeight: 'bold', color: '#333' }}>{item.value}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#E91E63', mb: 4, textAlign: 'center' }}>
        Relatório Fast - Indicadores Gerais
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Carregando dados do relatório...
          </Typography>
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : data ? (
        <>
          {/* Cards Resumo */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #4CAF50' }}>
                <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>Clientes Ativos Fast</Typography>
                <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{data.clientes_ativos_fast}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #2196F3' }}>
                <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>Clientes Funil</Typography>
                <Typography variant="h3" sx={{ color: '#2196F3', fontWeight: 'bold' }}>{data.clientes_funil}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #FF9800' }}>
                <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>Parceiros Fast</Typography>
                <Typography variant="h3" sx={{ color: '#FF9800', fontWeight: 'bold' }}>{data.parceiros_fast}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #9C27B0', minHeight: 120 }}>
                <Typography variant="h6" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>Soma Fatura</Typography>
                <Typography
                  variant="h5"
                  sx={{
                    color: '#9C27B0',
                    fontWeight: 'bold',
                    fontSize: {
                      xs: data.soma_fatura >= 1000000 ? '1.1rem' : '1.5rem',
                      sm: data.soma_fatura >= 1000000 ? '1.3rem' : '2rem',
                      md: data.soma_fatura >= 1000000 ? '1.6rem' : '2.5rem',
                    },
                    wordBreak: 'break-all',
                    lineHeight: 1.1,
                    letterSpacing: '-0.5px',
                    maxWidth: '100%',
                    overflowWrap: 'break-word',
                  }}
                >
                  {`R$ ${Number(data.soma_fatura).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Cards de Indicadores */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #FF9800' }}>
                <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>Prospecção Quente</Typography>
                <Typography variant="h3" sx={{ color: '#FF9800', fontWeight: 'bold' }}>{data.prospeccao_quente}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #9E9E9E' }}>
                <Typography variant="h6" sx={{ color: '#9E9E9E', fontWeight: 'bold' }}>Prospecção Fria</Typography>
                <Typography variant="h3" sx={{ color: '#9E9E9E', fontWeight: 'bold' }}>{data.prospeccao_fria}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #4CAF50' }}>
                <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>Reuniões Realizadas</Typography>
                <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{data.reunioes_realizadas}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #2196F3' }}>
                <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>Ferramentas Desenvolvidas</Typography>
                <Typography variant="h3" sx={{ color: '#2196F3', fontWeight: 'bold' }}>{data.ferramentas_desenvolvidas}</Typography>
              </Paper>
            </Box>
          </Box>

          {/* Cards de Chamados/Eventos/Clientes Sinal Amarelo */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #F44336' }}>
                <Typography variant="h6" sx={{ color: '#F44336', fontWeight: 'bold' }}>Chamados Ativos</Typography>
                <Typography variant="h3" sx={{ color: '#F44336', fontWeight: 'bold' }}>{data.chamados_ativos}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #4CAF50' }}>
                <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>Chamados Finalizados</Typography>
                <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{data.chamados_finalizados}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #2196F3' }}>
                <Typography variant="h6" sx={{ color: '#2196F3', fontWeight: 'bold' }}>Chamados Total</Typography>
                <Typography variant="h3" sx={{ color: '#2196F3', fontWeight: 'bold' }}>{data.chamados_total}</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #FFEB3B' }}>
                <Typography variant="h6" sx={{ color: '#FFEB3B', fontWeight: 'bold' }}>Clientes Sinal Amarelo</Typography>
                <Typography variant="h3" sx={{ color: '#FFEB3B', fontWeight: 'bold' }}>{data.clientes_sinal_amarelo}</Typography>
              </Paper>
            </Box>
          </Box>

          {/* Gráficos Simples */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SimpleBarChart data={chamadosData} title="Chamados - Ativos vs Finalizados" />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SimpleBarChart data={prospeccaoData} title="Prospecção - Quente vs Fria" />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SimpleBarChart data={eventosData} title="Eventos - Pendentes vs Realizados" />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SimpleBarChart data={clientesData} title="Clientes - Ativos, Funil, Sinal Amarelo" />
            </Box>
          </Box>
        </>
      ) : null}
    </Box>
  );
}

export default RelatorioFast;
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Card, 
  CardContent, 
  CircularProgress,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import { 
  ArrowBack, 
  People, 
  PersonOff, 
  Camera, 
  CalendarToday,
  TrendingUp,
  AccessTime,
  Business
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';

interface ConsultorData {
  "clientes ativos": number;
  "clientes inativos": number;
  "total reunioes clientes ativos": number;
  "ticket medio clientes ativos": number;
  "clientes indicados": number;
  "fotografias realizadas": number;
  "fotografias iniciais realizadas": number;
  "data de inicio na Fast": string;
  "tempo de Fast": string;
  "total reunioes realizadas": number;
  "RD": number;
  "RE": number;
  "RC": number;
  "RI": number;
  "RP": number;
  "RAE": number;
  "RA": number;
}

const RelatorioConsultor = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ConsultorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const username = getUsername();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/relatorio-consultor/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        
        // Fallback para dados mock em caso de erro
        const mockData: ConsultorData = {
          "clientes ativos": 5,
          "clientes inativos": 2,
          "total reunioes clientes ativos": 12,
          "ticket medio clientes ativos": 2500,
          "clientes indicados": 3,
          "fotografias realizadas": 8,
          "fotografias iniciais realizadas": 4,
          "data de inicio na Fast": "05/10/2024",
          "tempo de Fast": "9 mês(es)",
          "total reunioes realizadas": 15,
          "RD": 3,
          "RE": 2,
          "RC": 4,
          "RI": 1,
          "RP": 2,
          "RAE": 1,
          "RA": 2
        };
        
        setData(mockData);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError('Token de acesso inválido ou expirado');
          } else if (err.response?.status === 404) {
            setError('Endpoint não encontrado - usando dados simulados');
          } else {
            setError(`Erro na API: ${err.response?.status} - usando dados simulados`);
          }
        } else {
          setError('Erro de conexão - usando dados simulados');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary">
            Carregando dados do consultor...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity={error.includes('simulados') ? 'info' : 'error'} sx={{ mb: 2 }}>
          {error}
        </Alert>
        {!error.includes('simulados') && (
          <Box 
            component="button"
            onClick={() => navigate('/Relatorios')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 3,
              py: 1.5,
              backgroundColor: '#5C59E8',
              color: 'white',
              border: 'none',
              borderRadius: 2,
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: '#4A47D1',
              }
            }}
          >
            <ArrowBack />
            Voltar aos Relatórios
          </Box>
        )}
      </Container>
    );
  }

  const clientesData = [
    { name: 'Ativos', value: data?.["clientes ativos"] || 0, color: '#4CAF50' },
    { name: 'Inativos', value: data?.["clientes inativos"] || 0, color: '#FF5722' }
  ];

  const reunioesData = [
    { name: 'RD', value: data?.RD || 0 },
    { name: 'RE', value: data?.RE || 0 },
    { name: 'RC', value: data?.RC || 0 },
    { name: 'RI', value: data?.RI || 0 },
    { name: 'RP', value: data?.RP || 0 },
    { name: 'RAE', value: data?.RAE || 0 },
    { name: 'RA', value: data?.RA || 0 }
  ];

  const MetricCard = ({ title, value, icon, color = '#5C59E8' }: { title: string; value: number | string; icon: React.ReactNode; color?: string }) => (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ color, fontSize: '2rem' }}>
            {icon}
          </Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color }}>
            {value}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const SimpleBarChart = ({ data, title }: { data: { name: string; value: number }[]; title: string }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#5C59E8' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((item, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.value}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={maxValue > 0 ? (item.value / maxValue) * 100 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#E0E0E0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#5C59E8',
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    );
  };

  const SimplePieChart = ({ data, title }: { data: { name: string; value: number; color: string }[]; title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#5C59E8' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          {/* Pie Chart Visual */}
          <Box sx={{ position: 'relative', width: 200, height: 200, mb: 2 }}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: total > 0 ? `conic-gradient(
                  ${data.map((item, index) => {
                    const percentage = (item.value / total) * 100;
                    const prevPercentage = data.slice(0, index).reduce((acc, prev) => acc + ((prev.value / total) * 100), 0);
                    return `${item.color} ${prevPercentage}% ${prevPercentage + percentage}%`;
                  }).join(', ')}
                )` : '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: '60%',
                  height: '60%',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  zIndex: 1
                }
              }}
            >
              <Box sx={{ 
                position: 'relative', 
                zIndex: 2, 
                textAlign: 'center' 
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                  {total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Box>
          </Box>
          
          {/* Legend */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
            {data.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              return (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      backgroundColor: item.color, 
                      borderRadius: '50%' 
                    }} 
                  />
                  <Typography variant="body2">
                    {item.name}: {item.value} ({percentage}%)
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Box 
          component="button"
          onClick={() => navigate('/Relatorios')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            backgroundColor: '#5C59E8',
            color: 'white',
            border: 'none',
            borderRadius: 2,
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            mr: 3,
            '&:hover': {
              backgroundColor: '#4A47D1',
            }
          }}
        >
          <ArrowBack />
          Voltar
        </Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
          Relatório do Consultor
        </Typography>
        {error && error.includes('simulados') && (
          <Chip 
            label="Dados Demo" 
            size="small" 
            sx={{ ml: 2, bgcolor: '#FFF3E0', color: '#E65100' }} 
          />
        )}
      </Box>

      {/* Informações Gerais */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#5C59E8' }}>
          Informações Gerais
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip 
            icon={<CalendarToday />} 
            label={`Data de Início Fast: ${data?.["data de inicio na Fast"]}`} 
            sx={{ bgcolor: '#E3F2FD', color: '#1976D2' }} 
          />
          <Chip 
            icon={<AccessTime />} 
            label={`Tempo de Fast: ${data?.["tempo de Fast"]}`} 
            sx={{ bgcolor: '#F3E5F5', color: '#7B1FA2' }} 
          />
          <Chip 
            icon={<Business />} 
            label={`Ticket Médio: R$ ${data?.["ticket medio clientes ativos"]}`} 
            sx={{ bgcolor: '#E8F5E8', color: '#2E7D32' }} 
          />
        </Box>
      </Paper>

      {/* Métricas Principais */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
        <MetricCard 
          title="Clientes Ativos" 
          value={data?.["clientes ativos"] || 0} 
          icon={<People />} 
          color="#4CAF50" 
        />
        <MetricCard 
          title="Clientes Inativos" 
          value={data?.["clientes inativos"] || 0} 
          icon={<PersonOff />} 
          color="#FF5722" 
        />
        <MetricCard 
          title="Clientes Indicados" 
          value={data?.["clientes indicados"] || 0} 
          icon={<TrendingUp />} 
          color="#FF9800" 
        />
        <MetricCard 
          title="Fotografias Realizadas" 
          value={data?.["fotografias realizadas"] || 0} 
          icon={<Camera />} 
          color="#9C27B0" 
        />
      </Box>

      {/* Gráficos */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
        <SimplePieChart data={clientesData} title="Distribuição de Clientes" />
        <SimpleBarChart data={reunioesData} title="Reuniões por Tipo" />
      </Box>

      {/* Métricas de Reuniões */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#5C59E8' }}>
          Detalhes das Reuniões
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Total de Reuniões:</strong> {data?.["total reunioes realizadas"] || 0}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Reuniões Clientes Ativos:</strong> {data?.["total reunioes clientes ativos"] || 0}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Fotografias Iniciais:</strong> {data?.["fotografias iniciais realizadas"] || 0}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Tipos de Reuniões:</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {reunioesData.map((reuniao) => (
                <Chip 
                  key={reuniao.name}
                  label={`${reuniao.name}: ${reuniao.value}`}
                  size="small"
                  sx={{ bgcolor: '#F5F5F5' }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RelatorioConsultor;
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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { 
  ArrowBack, 
  People, 
  PersonOff, 
  Camera, 
  CalendarToday,
  TrendingUp,
  AccessTime
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
  "DRE": {
    "receita bruta": number;
    "dedução de receita bruta": number;
    "receita líquida": number;
    "lucro bruto": number;
    "cmv/cpv/csv": number;
    "margem de contribuição": number;
    "despesas administrativas": number;
    "despesas rh": number;
    "despesas operacionais": number;
    "despesas de vendas": number;
    "despesas de marketing": number;
    "total de despesas gerais": number;
    "resultado operacional": number;
    "despesas financeiras": number;
    "receitas financeiras": number;
    "empréstimos": number;
    "investimentos e aquisições": number;
    "lucro líquido": number;
    "retirada sócios": number;
    "lucro líquido pós retirada": number;
  };
  "core": {
    "maquina_cartao": number;
    "emprestimos_financiamentos": number;
    "telefonia": number;
    "contabilidade": number;
    "taxas_bancarias": number;
    "taxas_administrativas": number;
  };
  "overdelivery": {
    "investimentos": number;
    "ferias": number;
    "cultura_empresarial": number;
    "ecossistema_fast": number;
    "carta_valores": number;
    "organograma": number;
    "manuais": number;
    "mips": number;
    "codigo_cultura": number;
  };
}

interface ConsultorUser {
  user: string;
  nome?: string;
}

const RelatorioConsultor = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ConsultorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultors, setConsultors] = useState<ConsultorUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loadingConsultors, setLoadingConsultors] = useState(false);
  const [hasDataLoaded, setHasDataLoaded] = useState(false);

  // Fetch consultors from department API
  useEffect(() => {
    const fetchConsultors = async () => {
      setLoadingConsultors(true);
      try {
        const token = getAccessToken();
        const currentUsername = getUsername();
        
        if (!token || !currentUsername) {
          throw new Error('Token ou username não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/login/department/username/Consultor`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const consultorsList = response.data || [];
        setConsultors(consultorsList);
        
        // Don't auto-select user - let user choose
      } catch (err) {
        console.error('Erro ao buscar consultores:', err);
        // Fallback to current user
        const currentUsername = getUsername();
        if (currentUsername) {
          setConsultors([{ user: currentUsername }]);
        }
      } finally {
        setLoadingConsultors(false);
      }
    };

    fetchConsultors();
  }, []);

  // Fetch consultant data only when user is selected
  useEffect(() => {
    if (!selectedUser) {
      setData(null);
      setHasDataLoaded(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/relatorio-consultor/${selectedUser}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setData(response.data);
        setHasDataLoaded(true);
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
          "RA": 2,
          "DRE": {
            "receita bruta": 1500,
            "dedução de receita bruta": 0,
            "receita líquida": 1561,
            "lucro bruto": 1561,
            "cmv/cpv/csv": 0,
            "margem de contribuição": 0,
            "despesas administrativas": 0,
            "despesas rh": 0,
            "despesas operacionais": 0,
            "despesas de vendas": 0,
            "despesas de marketing": 0,
            "total de despesas gerais": 0,
            "resultado operacional": 0,
            "despesas financeiras": 0,
            "receitas financeiras": 0,
            "empréstimos": 0,
            "investimentos e aquisições": 0,
            "lucro líquido": 0,
            "retirada sócios": 0,
            "lucro líquido pós retirada": 0
          },
          "core": {
            "maquina_cartao": 100,
            "emprestimos_financiamentos": 50,
            "telefonia": 75,
            "contabilidade": 200,
            "taxas_bancarias": 30,
            "taxas_administrativas": 45
          },
          "overdelivery": {
            "investimentos": 80,
            "ferias": 120,
            "cultura_empresarial": 90,
            "ecossistema_fast": 110,
            "carta_valores": 60,
            "organograma": 40,
            "manuais": 70,
            "mips": 85,
            "codigo_cultura": 95
          }
        };
        
        setData(mockData);
        setHasDataLoaded(true);
        
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
  }, [selectedUser]);

  const handleUserChange = (event: SelectChangeEvent<string>) => {
    setSelectedUser(event.target.value);
  };

  // Show loading while fetching data
  if (loading) {
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
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={60} />
            <Typography variant="body1" color="text.secondary">
              Carregando dados do consultor...
            </Typography>
          </Box>
        </Box>
      </Container>
    );
  }

  // Show error if not related to simulation
  if (error && !error.includes('simulados')) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
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

  const CoreBarChart = ({ data: coreData, title }: { data: ConsultorData["core"]; title: string }) => {
    const coreItems = [
      { name: 'Máquina de Cartão', value: coreData["maquina_cartao"] || 0 },
      { name: 'Empréstimos/Financiamentos', value: coreData["emprestimos_financiamentos"] || 0 },
      { name: 'Telefonia', value: coreData["telefonia"] || 0 },
      { name: 'Contabilidade', value: coreData["contabilidade"] || 0 },
      { name: 'Taxas Bancárias', value: coreData["taxas_bancarias"] || 0 },
      { name: 'Taxas Administrativas', value: coreData["taxas_administrativas"] || 0 }
    ];

    const maxValue = Math.max(...coreItems.map(item => item.value));
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#FF9800' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {coreItems.map((item, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.value.toLocaleString('pt-BR')}
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
                    backgroundColor: '#FF9800',
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

  const OverdeliveryBarChart = ({ data: overdeliveryData, title }: { data: ConsultorData["overdelivery"]; title: string }) => {
    const overdeliveryItems = [
      { name: 'Investimentos', value: overdeliveryData["investimentos"] || 0 },
      { name: 'Férias', value: overdeliveryData["ferias"] || 0 },
      { name: 'Cultura Empresarial', value: overdeliveryData["cultura_empresarial"] || 0 },
      { name: 'Ecossistema Fast', value: overdeliveryData["ecossistema_fast"] || 0 },
      { name: 'Carta de Valores', value: overdeliveryData["carta_valores"] || 0 },
      { name: 'Organograma', value: overdeliveryData["organograma"] || 0 },
      { name: 'Manuais', value: overdeliveryData["manuais"] || 0 },
      { name: 'MIPs', value: overdeliveryData["mips"] || 0 },
      { name: 'Código de Cultura', value: overdeliveryData["codigo_cultura"] || 0 }
    ];

    const maxValue = Math.max(...overdeliveryItems.map(item => item.value));
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {overdeliveryItems.map((item, index) => (
            <Box key={index}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.value.toLocaleString('pt-BR')}
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
                    backgroundColor: '#4CAF50',
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

  const RadarChart = ({ data: dreData, title }: { data: ConsultorData["DRE"]; title: string }) => {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    
    const highlights = [
      { name: 'Receita Bruta', value: dreData["receita bruta"] || 0 },
      { name: 'Dedução de Receita Bruta', value: dreData["dedução de receita bruta"] || 0 },
      { name: 'Receita Líquida', value: dreData["receita líquida"] || 0 },
      { name: 'Lucro Bruto', value: dreData["lucro bruto"] || 0 },
      { name: 'CMV/CPV/CSV', value: dreData["cmv/cpv/csv"] || 0 },
      { name: 'Margem de Contribuição', value: dreData["margem de contribuição"] || 0 },
      { name: 'Despesas Administrativas', value: dreData["despesas administrativas"] || 0 },
      { name: 'Despesas rh', value: dreData["despesas rh"] || 0 },
      { name: 'Despesas Operacionais', value: dreData["despesas operacionais"] || 0 },
      { name: 'Despesas de Vendas', value: dreData["despesas de vendas"] || 0 },
      { name: 'Despesas de Marketing', value: dreData["despesas de marketing"] || 0 },
      { name: 'Total de Despesas Gerais', value: dreData["total de despesas gerais"] || 0 },
      { name: 'Resultado Operacional', value: dreData["resultado operacional"] || 0 },
      { name: 'Despesas Financeiras', value: dreData["despesas financeiras"] || 0 },
      { name: 'Receitas Financeiras', value: dreData["receitas financeiras"] || 0 },
      { name: 'Empréstimos', value: dreData["empréstimos"] || 0 },
      { name: 'Investimentos e Aquisições', value: dreData["investimentos e aquisições"] || 0 },
      { name: 'Lucro Líquido', value: dreData["lucro líquido"] || 0 },
      { name: 'Retirada Sócios', value: dreData["retirada sócios"] || 0 },
      { name: 'Lucro Líquido Pós Retirada', value: dreData["lucro líquido pós retirada"] || 0 }
    ];

    const maxValue = Math.max(...highlights.map(item => Math.abs(item.value)), 1000);
    const centerX = 200;
    const centerY = 200;
    const radius = 120;
    const angleStep = (2 * Math.PI) / highlights.length;

    const handleMouseEnter = (index: number, event: React.MouseEvent) => {
      setHoveredPoint(index);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: event.clientX - rect.left + 10,
        y: event.clientY - rect.top - 10
      });
    };

    const handleMouseLeave = () => {
      setHoveredPoint(null);
    };

    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#5C59E8' }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <svg width="400" height="400" viewBox="0 0 400 400">
              {/* Grid circles */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
                <circle
                  key={index}
                  cx={centerX}
                  cy={centerY}
                  r={radius * scale}
                  fill="none"
                  stroke="#E0E0E0"
                  strokeWidth="1"
                />
              ))}
              
              {/* Grid lines */}
              {highlights.map((_, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                return (
                  <line
                    key={index}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="#E0E0E0"
                    strokeWidth="1"
                  />
                );
              })}
              
              {/* Data polygon */}
              <polygon
                points={highlights.map((item, index) => {
                  const angle = index * angleStep - Math.PI / 2;
                  const normalizedValue = Math.abs(item.value) / maxValue;
                  const x = centerX + radius * normalizedValue * Math.cos(angle);
                  const y = centerY + radius * normalizedValue * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ')}
                fill="rgba(92, 89, 232, 0.3)"
                stroke="#5C59E8"
                strokeWidth="2"
              />
              
              {/* Data points with hover effects */}
              {highlights.map((item, index) => {
                const angle = index * angleStep - Math.PI / 2;
                const normalizedValue = Math.abs(item.value) / maxValue;
                const x = centerX + radius * normalizedValue * Math.cos(angle);
                const y = centerY + radius * normalizedValue * Math.sin(angle);
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r={hoveredPoint === index ? "6" : "4"}
                    fill="#5C59E8"
                    stroke="#fff"
                    strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => handleMouseEnter(index, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
            </svg>
            
            {/* Tooltip */}
            {hoveredPoint !== null && (
              <Box
                sx={{
                  position: 'absolute',
                  left: tooltipPosition.x,
                  top: tooltipPosition.y,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  pointerEvents: 'none',
                  zIndex: 1000,
                  whiteSpace: 'nowrap',
                  maxWidth: '200px'
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                  {highlights[hoveredPoint].name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  R$ {(highlights[hoveredPoint].value || 0).toLocaleString('pt-BR')}
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Legend - Show only non-zero values */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center', maxHeight: 200, overflow: 'auto' }}>
            {highlights.filter(item => item.value !== 0).map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    backgroundColor: '#5C59E8', 
                    borderRadius: '50%' 
                  }} 
                />
                <Typography variant="body2">
                  {item.name}: R$ {(item.value || 0).toLocaleString('pt-BR')}
                </Typography>
              </Box>
            ))}
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
      </Box>

      {/* User selection */}
      <FormControl fullWidth variant="outlined" sx={{ mb: 4 }}>
        <InputLabel id="select-consultor-label">Selecionar Consultor</InputLabel>
        <Select
          labelId="select-consultor-label"
          value={selectedUser}
          onChange={handleUserChange}
          label="Selecionar Consultor"
          disabled={loadingConsultors}
        >
          {loadingConsultors ? (
            <MenuItem disabled>
              <CircularProgress size={24} />
            </MenuItem>
          ) : (
            consultors.length > 0 ? (
              consultors.map((consultor) => (
                <MenuItem key={consultor.user} value={consultor.user}>
                  {consultor.nome || consultor.user}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                Nenhum consultor encontrado
              </MenuItem>
            )
          )}
        </Select>
      </FormControl>

      {/* Show report only when user is selected and data is loaded */}
      {selectedUser && hasDataLoaded && data && (
        <>
          {/* Metrics overview */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <MetricCard 
              title="Clientes Ativos" 
              value={data["clientes ativos"]} 
              icon={<People />} 
              color="#4CAF50"
            />
            <MetricCard 
              title="Clientes Inativos" 
              value={data["clientes inativos"]} 
              icon={<PersonOff />} 
              color="#FF5722"
            />
            <MetricCard 
              title="Total de Reuniões" 
              value={data["total reunioes realizadas"]} 
              icon={<CalendarToday />} 
            />
            <MetricCard 
              title="Ticket Médio" 
              value={`R$ ${Number(data["ticket medio clientes ativos"]).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
              icon={<TrendingUp />} 
            />
            <MetricCard 
              title="Fotografias Realizadas" 
              value={data["fotografias realizadas"]} 
              icon={<Camera />} 
            />
            <MetricCard 
              title="Tempo na Fast" 
              value={data["tempo de Fast"]} 
              icon={<AccessTime />} 
            />
          </Box>

          {/* Gráficos */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
            <SimplePieChart data={clientesData} title="Distribuição de Clientes" />
            <SimpleBarChart data={reunioesData} title="Reuniões por Tipo" />
            <RadarChart data={data.DRE} title="Highlights" />
          </Box>

          {/* Gráficos Core e Overdelivery */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
            <CoreBarChart data={data.core} title="Core Services" />
            <OverdeliveryBarChart data={data.overdelivery} title="Overdelivery Services" />
          </Box>
        </>
      )}
    </Container>
  );
};

export default RelatorioConsultor;

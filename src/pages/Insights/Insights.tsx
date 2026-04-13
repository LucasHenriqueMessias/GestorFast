import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Button,
  Dialog,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
} from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAccessToken, getDepartment, getUsername } from '../../utils/storage';
import ListaEntregas from './ListaEntregas';
import NovaEntrega from './NovaEntrega';
import KPIsAnalista from './KPIsAnalista';

interface EntregaData {
  id?: number;
  razao_social: string;
  analista: string;
  consultor: string;
  data: string;
  categoria: string;
  tipo_impacto: string;
  impacto_mensal_r: number;
  impacto_anual_r: number;
  impacto_percentual: number;
  complexidade: string;
  horas_gastas: number;
  descricao_tecnica: {
    situacao_encontrada: string;
    problema_identificado: string;
    acao_recomendada: string;
    resultado_esperado: string;
  };
  status: string;
}

const Insights = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [entregas, setEntregas] = useState<EntregaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const username = getUsername() || '';
  const department = getDepartment();

  const fetchEntregas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Token de acesso não encontrado');
      }

      let endpoint = `${process.env.REACT_APP_API_URL}/insights-analista`;

      // Analista ve somente suas entregas.
      if (department === 'Analista') {
        endpoint = `${process.env.REACT_APP_API_URL}/insights-analista?analista=${username}`;
      } else if (department === 'Financeiro') {
        // Financeiro permanece restrito aos clientes vinculados ao consultor logado.
        endpoint = `${process.env.REACT_APP_API_URL}/insights-analista?consultor=${username}`;
      } else if (department === 'Consultor') {
        // Consultor tem filtro global de clientes (sem restricao por consultor).
        endpoint = `${process.env.REACT_APP_API_URL}/insights-analista`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setEntregas(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar entregas:', err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setError('Token de acesso inválido ou expirado');
        } else if (err.response?.status === 404) {
          setError('Nenhuma entrega encontrada');
        } else {
          setError(`Erro na API: ${err.response?.status}`);
        }
      } else {
        setError('Erro de conexão');
      }
      setEntregas([]);
    } finally {
      setLoading(false);
    }
  }, [department, username]);

  useEffect(() => {
    fetchEntregas();
  }, [fetchEntregas]);

  const handleAddEntrega = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitEntrega = async (formData: EntregaData) => {
    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('Token de acesso não encontrado');
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/insights-analista`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccessMessage('Entrega registrada com sucesso!');
      setOpenDialog(false);
      fetchEntregas();

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar entrega:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao salvar: ${err.response?.status} - ${err.response?.data?.message || 'Erro desconhecido'}`);
      } else {
        setError('Erro ao salvar entrega');
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, pl: 0, pr: { xs: 2, sm: 3 }, overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, pl: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            onClick={() => navigate(-1)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: '#1E3A8A',
              color: 'white',
              borderRadius: 2,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              px: 2,
              py: 1,
              transition: 'all 0.3s ease',
              mr: 3,
              '&:hover': {
                backgroundColor: '#1D4ED8',
              },
            }}
          >
            <ArrowBack />
            Voltar
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
            Entregas do Analista
          </Typography>
        </Box>
        {department === 'Analista' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddEntrega}
            sx={{
              backgroundColor: '#3B82F6',
              '&:hover': {
                backgroundColor: '#2563EB',
              },
            }}
          >
            Nova Entrega
          </Button>
        )}
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, ml: { xs: 2, sm: 3 } }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, ml: { xs: 2, sm: 3 } }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {department === 'Financeiro' && (
        <Alert severity="info" sx={{ mb: 3, ml: { xs: 2, sm: 3 } }}>
          📌 Você está visualizando as entregas apenas dos seus clientes.
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ pl: { xs: 2, sm: 3 }, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            borderBottom: '2px solid #E5E7EB',
            '& .MuiTab-root': {
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#6B7280',
              '&.Mui-selected': {
                color: '#1E3A8A',
              }
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1E3A8A',
            }
          }}
        >
          <Tab label="📋 Entregas" />
          <Tab label="📊 KPIs" />
        </Tabs>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, pl: { xs: 2, sm: 3 } }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Carregando entregas...
          </Typography>
        </Box>
      ) : tabValue === 0 ? (
        <ListaEntregas entregas={entregas} loading={loading} onRefresh={fetchEntregas} />
      ) : (
        <KPIsAnalista analista={username} entregas={entregas} />
      )}

      {/* Dialog Nova Entrega */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <NovaEntrega onClose={handleCloseDialog} onSubmit={handleSubmitEntrega} analista={username} />
      </Dialog>
    </Container>
  );
};

export default Insights;
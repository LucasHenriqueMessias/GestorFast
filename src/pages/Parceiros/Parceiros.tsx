import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { ArrowBack, Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getAccessToken, getDepartment } from '../../utils/storage';
import { DataGridPro, GridColDef, GridActionsCellItem } from '@mui/x-data-grid-pro';

interface ParceriaFastData {
  id: number;
  data_criacao: string;
  parceiro: string;
  resultado: string;
  area_atuacao: string;
  observacoes: string;
  padrinho: string;
  contato: string;
}

const Parceiros = () => {
  const navigate = useNavigate();
  const [parcerias, setParcerias] = useState<ParceriaFastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingParceria, setEditingParceria] = useState<ParceriaFastData | null>(null);
  const [formData, setFormData] = useState({
    parceiro: '',
    resultado: '',
    area_atuacao: '',
    observacoes: '',
    padrinho: '',
    contato: ''
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const department = getDepartment();
  const canEdit = department === 'Developer' || department === 'Diretor';

  const columns: GridColDef[] = [
    { 
      field: 'parceiro', 
      headerName: 'Parceiro', 
      flex: 1,
      minWidth: 150,
      headerClassName: 'header-style'
    },
    { 
      field: 'area_atuacao', 
      headerName: 'Área de Atuação', 
      flex: 1,
      minWidth: 130,
      headerClassName: 'header-style'
    },
    { 
      field: 'padrinho', 
      headerName: 'Padrinho', 
      flex: 0.8,
      minWidth: 120,
      headerClassName: 'header-style'
    },
    { 
      field: 'contato', 
      headerName: 'Contato', 
      flex: 1,
      minWidth: 130,
      headerClassName: 'header-style'
    },
    { 
      field: 'data_criacao', 
      headerName: 'Data Criação', 
      width: 110,
      headerClassName: 'header-style',
      valueFormatter: (params) => {
        return new Date(params).toLocaleDateString('pt-BR');
      }
    },
  ];

  if (canEdit) {
    columns.push({
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 80,
      headerClassName: 'header-style',
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Edit style={{ color: '#2563EB' }} />}
          label="Editar"
          onClick={() => handleOpenDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<Delete style={{ color: '#DC2626' }} />}
          label="Excluir"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    });
  }

  const getDetailPanelContent = React.useCallback(
    ({ row }: { row: ParceriaFastData }) => (
      <Box sx={{ p: 3, backgroundColor: '#F8FAFC' }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1E3A8A', fontWeight: 'bold' }}>
          📋 Resultados Obtidos
        </Typography>
        <Paper sx={{ p: 3, mb: 2, backgroundColor: 'white', borderLeft: '4px solid #10B981' }}>
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: 1.8,
              color: '#475569'
            }}
          >
            {row.resultado || 'Nenhum resultado cadastrado'}
          </Typography>
        </Paper>
        {row.observacoes && (
          <>
            <Typography variant="h6" sx={{ mb: 2, color: '#1E3A8A', fontWeight: 'bold' }}>
              📝 Observações
            </Typography>
            <Paper sx={{ p: 3, backgroundColor: 'white', borderLeft: '4px solid #F59E0B' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: 1.8,
                  color: '#475569'
                }}
              >
                {row.observacoes}
              </Typography>
            </Paper>
          </>
        )}
      </Box>
    ),
    []
  );

  const getDetailPanelHeight = React.useCallback(() => 'auto' as const, []);

  useEffect(() => {
    const fetchParcerias = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAccessToken();
        
        if (!token) {
          throw new Error('Token de acesso não encontrado');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-parceria-fast`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setParcerias(response.data || []);
        
      } catch (err) {
        console.error('Erro ao buscar parcerias:', err);
        
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError('Token de acesso inválido ou expirado');
          } else if (err.response?.status === 404) {
            setError('Endpoint não encontrado');
          } else {
            setError(`Erro na API: ${err.response?.status}`);
          }
        } else {
          setError('Erro de conexão');
        }
        
        setParcerias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchParcerias();
  }, []);

  const handleOpenDialog = (parceria?: ParceriaFastData) => {
    if (parceria) {
      setEditingParceria(parceria);
      setFormData({
        parceiro: parceria.parceiro,
        resultado: parceria.resultado,
        area_atuacao: parceria.area_atuacao,
        observacoes: parceria.observacoes,
        padrinho: parceria.padrinho,
        contato: parceria.contato
      });
    } else {
      setEditingParceria(null);
      setFormData({
        parceiro: '',
        resultado: '',
        area_atuacao: '',
        observacoes: '',
        padrinho: '',
        contato: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingParceria(null);
    setFormData({
      parceiro: '',
      resultado: '',
      area_atuacao: '',
      observacoes: '',
      padrinho: '',
      contato: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('Token de acesso não encontrado');
      }

      if (editingParceria) {
        // PATCH - Atualizar
        await axios.patch(
          `${process.env.REACT_APP_API_URL}/tab-parceria-fast/${editingParceria.id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccessMessage('Parceria atualizada com sucesso!');
      } else {
        // POST - Criar
        await axios.post(
          `${process.env.REACT_APP_API_URL}/tab-parceria-fast`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setSuccessMessage('Parceria criada com sucesso!');
      }

      handleCloseDialog();
      // Recarregar lista
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-parceria-fast`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setParcerias(response.data || []);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar parceria:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao salvar: ${err.response?.status}`);
      } else {
        setError('Erro ao salvar parceria');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta parceria?')) {
      return;
    }

    try {
      const token = getAccessToken();
      
      if (!token) {
        throw new Error('Token de acesso não encontrado');
      }

      await axios.delete(`${process.env.REACT_APP_API_URL}/tab-parceria-fast/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setSuccessMessage('Parceria excluída com sucesso!');
      setParcerias(prev => prev.filter(p => p.id !== id));
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao excluir parceria:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao excluir: ${err.response?.status}`);
      } else {
        setError('Erro ao excluir parceria');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, pl: 0, pr: { xs: 2, sm: 3 }, overflowX: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, pl: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            component="button"
            onClick={() => navigate(-1)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: '#1E3A8A',
              color: 'white',
              border: 'none',
              borderRadius: 2,
              cursor: 'pointer',
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
          </Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1E3A8A' }}>
            Parceiros da Fast
          </Typography>
        </Box>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#10B981',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            Nova Parceria
          </Button>
        )}
      </Box>

      {/* Show error if exists */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, ml: { xs: 2, sm: 3 } }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Show success message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3, ml: { xs: 2, sm: 3 } }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8, pl: { xs: 2, sm: 3 } }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Carregando parcerias...
          </Typography>
        </Box>
      ) : parcerias.length > 0 ? (
        <Box sx={{ width: '100%', overflowX: 'auto', pl: { xs: 2, sm: 3 } }}>
          <DataGridPro
            rows={parcerias}
            columns={columns}
            getDetailPanelContent={getDetailPanelContent}
            getDetailPanelHeight={getDetailPanelHeight}
            pagination
            autoHeight
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            sx={{
              '& .header-style': {
                backgroundColor: '#1E3A8A',
                color: 'white',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-row:nth-of-type(odd)': {
                backgroundColor: '#F1F5F9',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#E0F2FE',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #E5E7EB',
              },
              border: 'none',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              minWidth: 0,
            }}
          />
        </Box>
      ) : (
        !loading && (
          <Alert severity="info" sx={{ ml: { xs: 2, sm: 3 } }}>
            Nenhuma parceria encontrada.
          </Alert>
        )
      )}

      {/* Dialog para Criar/Editar Parceria */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1E3A8A', color: 'white', fontWeight: 'bold' }}>
          {editingParceria ? 'Editar Parceria' : 'Nova Parceria'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Parceiro"
              value={formData.parceiro}
              onChange={(e) => handleInputChange('parceiro', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Área de Atuação"
              value={formData.area_atuacao}
              onChange={(e) => handleInputChange('area_atuacao', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Resultado"
              value={formData.resultado}
              onChange={(e) => handleInputChange('resultado', e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
            />
            <TextField
              label="Padrinho"
              value={formData.padrinho}
              onChange={(e) => handleInputChange('padrinho', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Contato"
              value={formData.contato}
              onChange={(e) => handleInputChange('contato', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Observações"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            sx={{
              backgroundColor: '#10B981',
              '&:hover': {
                backgroundColor: '#059669',
              },
            }}
          >
            {editingParceria ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Parceiros
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Alert
} from '@mui/material';
import { ArrowBack, Save, PersonAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, getUsername } from '../../utils/storage';
import axios from 'axios';

interface NovoChamadoData {
  Solicitante: string;
  Responsavel: string;
  Setor: string;
  Titulo: string;
  Descricao: string;
  Expectativa_Conclusao: string;
}

interface UserData {
  id: string;
  user: string;
  password: string;
  active: boolean;
  role: string;
  department: string;
  nivel: string;
  data_inicio_fast: string;
  lider_educador: string;
  padrinho: string;
  analista: string;
}

const NovoChamado = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<NovoChamadoData>({
    Solicitante: '',
    Responsavel: '',
    Setor: '',
    Titulo: '',
    Descricao: '',
    Expectativa_Conclusao: ''
  });
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    // Preencher automaticamente o solicitante com o usuário logado
    const username = getUsername();
    if (username) {
      setFormData(prev => ({ ...prev, Solicitante: username }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchUsersByDepartment = async (department: string) => {
    if (!department) {
      setUsers([]);
      return;
    }

    setLoadingUsers(true);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/login/department/${department}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(response.data || []);
      // Reset responsavel if it's not in the new list
      const usernames = response.data?.map((userData: UserData) => userData.user) || [];
      if (formData.Responsavel && !usernames.includes(formData.Responsavel)) {
        setFormData(prev => ({ ...prev, Responsavel: '' }));
      }
    } catch (error) {
      console.error('Erro ao buscar usuários do departamento:', error);
      setUsers([]);
      setAlert({ type: 'error', message: 'Erro ao carregar usuários do departamento.' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSelectChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'Setor') {
      await fetchUsersByDepartment(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = getAccessToken();
      const dataToSend = {
        ...formData,
        Kanban: 'BackLog',
        Anotacao: '', // Add empty annotation field
        Data_Conclusao: null, // Set completion date as null for new tickets
        Expectativa_Conclusao: formData.Expectativa_Conclusao ? new Date(formData.Expectativa_Conclusao).toISOString() : null
      };

      console.log('Dados enviados:', dataToSend); // Debug log

      await axios.post(`${process.env.REACT_APP_API_URL}/tab-helpdesk`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setAlert({ type: 'success', message: 'Chamado criado com sucesso!' });
      
      // Limpar formulário após sucesso
      setTimeout(() => {
        navigate('/home');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao criar chamado:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Erro ao criar chamado. Tente novamente.';
      
      setAlert({ type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.Solicitante && 
           formData.Responsavel && 
           formData.Setor && 
           formData.Titulo && 
           formData.Descricao;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            sx={{ mr: 2 }}
          >
            Voltar
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
            <PersonAdd sx={{ mr: 1, verticalAlign: 'middle' }} />
            Novo Chamado
          </Typography>
        </Box>

        {alert && (
          <Alert 
            severity={alert.type} 
            sx={{ mb: 3 }}
            onClose={() => setAlert(null)}
          >
            {alert.message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Setor</InputLabel>
              <Select
                value={formData.Setor}
                label="Setor"
                onChange={(e) => handleSelectChange('Setor', e.target.value)}
              >
                <MenuItem value="Financeiro">Financeiro</MenuItem>
                <MenuItem value="Comercial">Comercial</MenuItem>
                <MenuItem value="Analista">Analista</MenuItem>
                <MenuItem value="Developer">Developer</MenuItem>
                <MenuItem value="Diretor">Diretor</MenuItem>
                <MenuItem value="Gestor">Gestor</MenuItem>
                <MenuItem value="Consultor">Consultor</MenuItem>
                <MenuItem value="CS">CS</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required sx={{ mb: 2 }}>
              <InputLabel>Responsável</InputLabel>
              <Select
                value={formData.Responsavel}
                label="Responsável"
                onChange={(e) => handleSelectChange('Responsavel', e.target.value)}
                disabled={!formData.Setor || loadingUsers}
              >
                {loadingUsers ? (
                  <MenuItem disabled>Carregando usuários...</MenuItem>
                ) : users.length === 0 ? (
                  <MenuItem disabled>
                    {formData.Setor ? 'Nenhum usuário encontrado' : 'Selecione um setor primeiro'}
                  </MenuItem>
                ) : (
                  users.map((userData) => (
                    <MenuItem key={userData.id} value={userData.user}>
                      {userData.user}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            label="Título do Chamado"
            name="Titulo"
            value={formData.Titulo}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Descrição"
            name="Descricao"
            value={formData.Descricao}
            onChange={handleChange}
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Expectativa de Conclusão"
            name="Expectativa_Conclusao"
            type="date"
            value={formData.Expectativa_Conclusao}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={!isFormValid() || loading}
              sx={{
                backgroundColor: '#FF5722',
                '&:hover': {
                  backgroundColor: '#E64A19',
                }
              }}
            >
              {loading ? 'Criando...' : 'Criar Chamado'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => navigate('/home')}
              disabled={loading}
            >
              Cancelar
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NovoChamado;
import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Autocomplete } from '@mui/material';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';

const CadastrarFerramentas = () => {
  const [clientes, setClientes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome_ferramenta: '',
    cliente: '',
    descricao: '',
    url: '',
    usuario_criacao: '',
  });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const token = getAccessToken();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/razaosocial`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && Array.isArray(response.data)) {
          const razoesSociais = response.data.map((item: { razao_social: string }) => item.razao_social);
          setClientes(razoesSociais);
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    };

    const usuario = getUsername() || '';
    setFormData((prevData) => ({ ...prevData, usuario_criacao: usuario }));
    fetchClientes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = getAccessToken();
      
      // Criar objeto com as datas atuais
      const dataToSend = {
        nome_ferramenta: formData.nome_ferramenta,
        cliente: formData.cliente,
        descricao: formData.descricao,
        url: formData.url,
        usuario_criacao: formData.usuario_criacao,
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString()
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/tab-ferramentas`, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      alert('Ferramenta cadastrada com sucesso!');
      
      // Limpar formulário
      setFormData({
        nome_ferramenta: '',
        cliente: '',
        descricao: '',
        url: '',
        usuario_criacao: getUsername() || '',
      });
      
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error('Erro ao cadastrar ferramenta:', error);
      alert('Erro ao cadastrar ferramenta.');
    }
  };

  return (
    <Container>
      <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
        <TextField
          margin="dense"
          name="nome_ferramenta"
          label="Nome da Ferramenta"
          type="text"
          fullWidth
          required
          value={formData.nome_ferramenta}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        
        <Autocomplete
          options={clientes}
          freeSolo
          value={formData.cliente}
          onChange={(event, newValue) => {
            setFormData({ ...formData, cliente: newValue || '' });
          }}
          onInputChange={(event, newInputValue) => {
            setFormData({ ...formData, cliente: newInputValue });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              margin="dense"
              label="Cliente"
              fullWidth
              required
              sx={{ mb: 2 }}
            />
          )}
        />
        
        <TextField
          margin="dense"
          name="descricao"
          label="Descrição"
          type="text"
          fullWidth
          multiline
          rows={3}
          required
          value={formData.descricao}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          name="url"
          label="URL da Ferramenta"
          type="url"
          fullWidth
          required
          placeholder="https://exemplo.com/ferramenta"
          value={formData.url}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        
        <TextField
          margin="dense"
          name="usuario_criacao"
          label="Usuário Criação"
          type="text"
          fullWidth
          disabled
          value={formData.usuario_criacao}
          sx={{ mb: 3 }}
        />
        
        <Box sx={{ textAlign: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={!formData.nome_ferramenta || !formData.cliente || !formData.descricao}
            sx={{ px: 4, py: 1 }}
          >
            Cadastrar Ferramenta
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CadastrarFerramentas;

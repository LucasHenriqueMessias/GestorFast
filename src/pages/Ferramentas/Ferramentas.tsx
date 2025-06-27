import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { Container, Typography, Button, Box, TextField, Autocomplete } from '@mui/material';
import { getAccessToken } from '../../utils/storage';
import axios from 'axios';
import CadastrarFerramentas from './CadastrarFerramentas';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface Ferramenta {
  id: number;
  nome_ferramenta: string;
  data_criacao: Date;
  data_alteracao: Date;
  usuario_criacao: string;
  cliente: string;
  descricao: string;
  url: string;
}

const Ferramentas = () => {
  const [ferramentasData, setFerramentasData] = useState<Ferramenta[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Ferramenta>>({});
  const [clientes, setClientes] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-ferramentas`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFerramentasData(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }, []);

  const fetchClientes = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
    fetchClientes();
  }, [fetchData, fetchClientes]);

  const handleOpenUrl = useCallback((url: string) => {
    if (url) {
      // Adiciona protocolo se não tiver
      const fullUrl = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      window.open(fullUrl, '_blank');
    }
  }, []);

  const handleEdit = useCallback(async (ferramenta: Ferramenta) => {
    await fetchClientes();
    setEditingId(ferramenta.id);
    setEditData({
      nome_ferramenta: ferramenta.nome_ferramenta,
      cliente: ferramenta.cliente,
      descricao: ferramenta.descricao,
      url: ferramenta.url,
    });
  }, [fetchClientes]);

  const handleSave = useCallback(async () => {
    if (editingId && editData) {
      try {
        const token = getAccessToken();
        const updateData = {
          ...editData,
          data_alteracao: new Date().toISOString()
        };
        
        await axios.patch(`${process.env.REACT_APP_API_URL}/tab-ferramentas/${editingId}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setEditingId(null);
        setEditData({});
        fetchData();
        alert('Ferramenta atualizada com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar ferramenta:', error);
        alert('Erro ao atualizar ferramenta.');
      }
    }
  }, [editingId, editData, fetchData]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setEditData({});
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      try {
        const token = getAccessToken();
        await axios.delete(`${process.env.REACT_APP_API_URL}/tab-ferramentas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchData();
        alert('Ferramenta excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir ferramenta:', error);
        alert('Erro ao excluir ferramenta.');
      }
    }
  }, [fetchData]);

  const handleEditChange = useCallback((field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  const columns: GridColDef[] = useMemo(() => [
    { field: 'nome_ferramenta', headerName: 'Nome da Ferramenta', flex: 1 },
    { field: 'cliente', headerName: 'Cliente', flex: 1 },
    { field: 'usuario_criacao', headerName: 'Criado por', flex: 1 },
    { 
      field: 'data_criacao', 
      headerName: 'Data Criação', 
      flex: 1,
      renderCell: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('pt-BR');
      }
    },
    {
      field: 'url',
      headerName: 'Acesso',
      width: 120,
      renderCell: (params) => {
        return params.value ? (
          <Button 
            variant="contained" 
            color="primary" 
            size="small"
            onClick={() => handleOpenUrl(params.value)}
          >
            Acessar
          </Button>
        ) : (
          <Typography variant="body2" color="textSecondary">-</Typography>
        );
      }
    }
  ], [handleOpenUrl]);

  const getDetailPanelContent = React.useCallback((params: any) => {
    const row = params.row;
    const isEditing = editingId === row.id;
    
    return (
      <Box sx={{ p: 2, background: '#f9f9f9' }}>
        {isEditing ? (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Nome da Ferramenta"
                value={editData.nome_ferramenta || ''}
                onChange={(e) => handleEditChange('nome_ferramenta', e.target.value)}
                size="small"
                sx={{ minWidth: 250 }}
              />
              <Autocomplete
                options={clientes}
                freeSolo
                value={editData.cliente || ''}
                onChange={(event, newValue) => {
                  handleEditChange('cliente', newValue || '');
                }}
                onInputChange={(event, newInputValue) => {
                  handleEditChange('cliente', newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cliente"
                    size="small"
                    sx={{ minWidth: 200 }}
                  />
                )}
              />
              <TextField
                label="URL"
                value={editData.url || ''}
                onChange={(e) => handleEditChange('url', e.target.value)}
                size="small"
                sx={{ minWidth: 300 }}
                placeholder="https://exemplo.com"
              />
              <TextField
                label="Descrição"
                value={editData.descricao || ''}
                onChange={(e) => handleEditChange('descricao', e.target.value)}
                multiline
                rows={3}
                sx={{ minWidth: '100%' }}
              />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Salvar
              </Button>
              <Button variant="outlined" onClick={handleCancel}>
                Cancelar
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography><strong>Descrição:</strong> {row.descricao}</Typography>
            <Typography><strong>URL:</strong> {row.url}</Typography>
            <Typography><strong>Data de Criação:</strong> {new Date(row.data_criacao).toLocaleDateString('pt-BR')}</Typography>
            <Typography><strong>Última Atualização:</strong> {new Date(row.data_alteracao).toLocaleDateString('pt-BR')}</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => handleEdit(row)}>
                Editar
              </Button>
              <Button variant="outlined" color="error" onClick={() => handleDelete(row.id)}>
                Excluir
              </Button>
            </Box>
          </>
        )}
      </Box>
    );
  }, [editingId, editData, handleSave, handleCancel, handleEdit, handleDelete, handleEditChange]);

  const getDetailPanelHeight = React.useCallback(() => 300, []);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Ferramentas Desenvolvidas
      </Typography>
      <Button variant="contained" color="primary" onClick={handleClickOpen} sx={{ mb: 2 }}>
        Cadastrar Nova Ferramenta
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cadastrar Nova Ferramenta</DialogTitle>
        <DialogContent>
          <CadastrarFerramentas />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancelar</Button>
        </DialogActions>
      </Dialog>
      <Box display="flex" justifyContent="center">
        <div style={{ height: 600, width: '100%' }}>
          <DataGridPro 
            rows={ferramentasData} 
            columns={columns} 
            autoPageSize
            getDetailPanelContent={getDetailPanelContent}
            getDetailPanelHeight={getDetailPanelHeight}
            disableRowSelectionOnClick={true}
          />
        </div>
      </Box>
    </Container>
  );
};

export default Ferramentas;
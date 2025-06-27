import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';
import EditIcon from '@mui/icons-material/Edit';

const Funil = () => {
  const [prospeccaoData, setProspeccaoData] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);

  const columns: GridColDef[] = [
    { field: 'id_loja', headerName: 'ID', width: 90 },
    { field: 'cnpj', headerName: 'CNPJ', width: 150 },
    { field: 'razao_social', headerName: 'Cliente', width: 180 },
    { field: 'prospeccao', headerName: 'Prospecção', width: 120, type: 'boolean' },
    { field: 'responsavel_prospeccao', headerName: 'Responsável', width: 150 },
    { field: 'temperatura', headerName: 'Temperatura', width: 120 },
    { 
      field: 'data_previsao_fechamento', 
      headerName: 'Previsão Fechamento', 
      width: 170,
      renderCell: (params) => {
        if (!params.value) return '';
        // Usar UTC para evitar problemas de fuso horário
        const date = new Date(params.value);
        const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        return utcDate.toLocaleDateString('pt-BR');
      }
    },
    { 
      field: 'data_retorno', 
      headerName: 'Data Retorno', 
      width: 140,
      renderCell: (params) => {
        if (!params.value) return '';
        // Usar UTC para evitar problemas de fuso horário
        const date = new Date(params.value);
        const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        return utcDate.toLocaleDateString('pt-BR');
      }
    },
    { field: 'status_prospeccao', headerName: 'Status', width: 150 },
    { field: 'cliente_fast', headerName: 'Cliente Fast', width: 120, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      renderCell: (params) => (
        <IconButton onClick={() => handleEditClick(params.row)}>
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/prospeccao`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProspeccaoData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const handleEditClick = (row: any) => {
    // Formatar as datas para exibição no formulário (formato YYYY-MM-DD para input date)
    const formattedRow = {
      ...row,
      data_previsao_fechamento: formatDateForInput(row.data_previsao_fechamento),
      data_retorno: formatDateForInput(row.data_retorno)
    };
    setEditRecord(formattedRow);
    setEditOpen(true);
  };

  const handleEditChange = (e: any) => {
    const name = e.target.name;
    let value = e.target.value;
    
    // Converter valores string para boolean para os campos apropriados
    if (name === 'cliente_fast' || name === 'prospeccao') {
      value = value === 'true';
    }
    
    setEditRecord({ ...editRecord, [name]: value });
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Usar UTC para evitar problemas de fuso horário
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Formato YYYY-MM-DD para input date
  };

  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return null;
    
    // Se está no formato YYYY-MM-DD (input date), converte para UTC ISO
    if (dateString.includes('-') && dateString.length === 10) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return date.toISOString();
    }
    
    // Se já está no formato dd/mm/yyyy, converte para UTC ISO
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number);
      const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return date.toISOString();
    }
    
    // Se já está em formato ISO ou outro formato válido
    return new Date(dateString).toISOString();
  };

  const handleEditSave = async () => {
    try {
      const token = getAccessToken();
      
      // Formatar as datas para timestamptz antes de enviar
      const dataToSend = {
        ...editRecord,
        data_previsao_fechamento: formatDateForAPI(editRecord.data_previsao_fechamento),
        data_retorno: formatDateForAPI(editRecord.data_retorno)
      };
      
      await axios.patch(`${process.env.REACT_APP_API_URL}/loja/update/${editRecord.cnpj}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditOpen(false);
      fetchData();
      alert('Registro atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao editar registro:', error);
      alert('Erro ao editar registro!');
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Funil
      </Typography>
      <div style={{ height: 500, width: '100%', marginTop: 20 }}>
        <DataGrid
          rows={prospeccaoData}
          columns={columns}
          autoPageSize
          getRowId={(row) => row.id_loja}
        />
      </div>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Editar Registro</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Prospecção</InputLabel>
            <Select
              name="prospeccao"
              value={editRecord?.prospeccao?.toString() ?? ''}
              onChange={handleEditChange}
              label="Prospecção"
            >
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="responsavel_prospeccao"
            label="Responsável"
            fullWidth
            value={editRecord?.responsavel_prospeccao || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="temperatura"
            label="Temperatura"
            fullWidth
            value={editRecord?.temperatura || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="data_previsao_fechamento"
            label="Previsão Fechamento"
            type="date"
            fullWidth
            value={editRecord?.data_previsao_fechamento || ''}
            onChange={handleEditChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            name="data_retorno"
            label="Data Retorno"
            type="date"
            fullWidth
            value={editRecord?.data_retorno || ''}
            onChange={handleEditChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            name="status_prospeccao"
            label="Status"
            fullWidth
            value={editRecord?.status_prospeccao || ''}
            onChange={handleEditChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Cliente Fast</InputLabel>
            <Select
              name="cliente_fast"
              value={editRecord?.cliente_fast?.toString() ?? ''}
              onChange={handleEditChange}
              label="Cliente Fast"
            >
              <MenuItem value="true">Sim</MenuItem>
              <MenuItem value="false">Não</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="primary">Cancelar</Button>
          <Button onClick={handleEditSave} color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Funil;
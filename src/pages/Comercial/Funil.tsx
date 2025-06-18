import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
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
    { field: 'nome_fantasia', headerName: 'Nome Fantasia', width: 180 },
    { field: 'prospeccao', headerName: 'Prospecção', width: 120, type: 'boolean' },
    { field: 'responsavel_prospeccao', headerName: 'Responsável', width: 150 },
    { field: 'temperatura', headerName: 'Temperatura', width: 120 },
    { field: 'data_previsao_fechamento', headerName: 'Previsão Fechamento', width: 170 },
    { field: 'data_retorno', headerName: 'Data Retorno', width: 140 },
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
    setEditRecord(row);
    setEditOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditRecord({ ...editRecord, [e.target.name]: e.target.value });
  };

  const handleEditSave = async () => {
    try {
      const token = getAccessToken();
      await axios.patch(`${process.env.REACT_APP_API_URL}/loja/update/${editRecord.cnpj}`, editRecord, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditOpen(false);
      fetchData();
    } catch (error) {
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
          <TextField
            margin="dense"
            name="prospeccao"
            label="Prospecção (true/false)"
            fullWidth
            value={editRecord?.prospeccao ?? ''}
            onChange={handleEditChange}
          />
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
            fullWidth
            value={editRecord?.data_previsao_fechamento || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="data_retorno"
            label="Data Retorno"
            fullWidth
            value={editRecord?.data_retorno || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="status_prospeccao"
            label="Status"
            fullWidth
            value={editRecord?.status_prospeccao || ''}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="cliente_fast"
            label="Cliente Fast (true/false)"
            fullWidth
            value={editRecord?.cliente_fast ?? ''}
            onChange={handleEditChange}
          />
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
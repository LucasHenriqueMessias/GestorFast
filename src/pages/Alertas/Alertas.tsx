import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Select, MenuItem, SelectChangeEvent, Autocomplete } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';

interface Cliente {
  razao_social: string;
}

const Alertas = () => {
  const [sinalAmareloData, setSinalAmareloData] = useState([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [open, setOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({ usuario: '', cliente: '', status: '', motivoSinal: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState({ id: '', cliente: '', status: '', data_criacao: '', motivoSinal: '' });
 
  const handleStatusChange = (record: any) => {
    setEditRecord(record);
    setEditOpen(true);
    fetchClientes(); // Buscar clientes ao abrir o formulário de edição
  };

  const columns: GridColDef[] = [
    { 
      field: 'data_criacao', 
      headerName: 'Data de Criação', 
      width: 180 
    },
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'usuario', headerName: 'Colaborador', width: 200 },
    { field: 'cliente', headerName: 'Cliente', width: 250 },
    { field: 'status', headerName: 'Status', width: 250 },
    { field: 'motivoSinal', headerName: 'Motivo do Sinal', width: 300 },
    {
      
      field: 'alterar_status',
      headerName: '',
      width: 170,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <IconButton onClick={() => handleStatusChange(params.row)}>
            <EditIcon />
          </IconButton>
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-sinal-amarelo`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSinalAmareloData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const fetchClientes = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/razaosocial`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleClickOpen = () => {
    setNewRecord({ ...newRecord, usuario: getUsername() || '' });
    setOpen(true);
    fetchClientes(); // Buscar clientes ao abrir o formulário
  };

  const handleClose = () => {
    setOpen(false);
  };



  const handleNewRecordChange = (e: React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name as string]: value });
  };

  const handleClienteChangeNew = (event: any, newValue: string | null) => {
    setNewRecord({ ...newRecord, cliente: newValue || '' });
  };

  const handleClienteChangeEdit = (event: any, newValue: string | null) => {
    setEditRecord({ ...editRecord, cliente: newValue || '' });
  };

  const handleSubmit = async () => {
    try {
      const token = getAccessToken();
      const { usuario, cliente, status, motivoSinal } = newRecord;
      await axios.post(`${process.env.REACT_APP_API_URL}/tab-sinal-amarelo`, { usuario, cliente, status, motivoSinal }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
    }
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditChange = (e: React.ChangeEvent<{ name?: string; value: unknown }> | SelectChangeEvent<string>) => {
      const { name, value } = e.target;
      setEditRecord({ ...editRecord, [name as string]: value });
    };

  const handleEditSubmit = async () => {
    try {
      const token = getAccessToken();
      await axios.patch(`${process.env.REACT_APP_API_URL}/tab-sinal-amarelo/${editRecord.id}`, editRecord, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchData();
      handleEditClose();
    } catch (error) {
      console.error('Erro ao editar registro:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Alertas
      </Typography>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Adicionar Registro
      </Button>
      <div style={{ height: 400, width: '100%', marginTop: 20 }}>
        <DataGrid rows={sinalAmareloData} columns={columns} autoPageSize/>
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Adicionar Novo Registro</DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={clientes.map((cliente) => cliente.razao_social)}
            value={newRecord.cliente}
            onChange={handleClienteChangeNew}
            onInputChange={(event, newInputValue) => {
              setNewRecord({ ...newRecord, cliente: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                label="Cliente"
                fullWidth
                placeholder="Digite ou selecione um cliente"
              />
            )}
          />
          <Select
            margin="dense"
            name="status"
            label="Status"
            fullWidth
            value={newRecord.status}
            onChange={handleNewRecordChange}
            displayEmpty
          >
            <MenuItem value="" disabled>Status</MenuItem>
            <MenuItem value="Sinal Verde">Sinal Verde</MenuItem>
            <MenuItem value="Sinal Amarelo">Sinal Amarelo</MenuItem>
            <MenuItem value="Sinal Vermelho">Sinal Vermelho</MenuItem>
            <MenuItem value="Pendente">Pendente</MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="motivoSinal"
            label="Motivo do Sinal"
            type="text"
            fullWidth
            value={newRecord.motivoSinal}
            onChange={handleNewRecordChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Editar Registro</DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={clientes.map((cliente) => cliente.razao_social)}
            value={editRecord.cliente}
            onChange={handleClienteChangeEdit}
            onInputChange={(event, newInputValue) => {
              setEditRecord({ ...editRecord, cliente: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="dense"
                label="Cliente"
                fullWidth
                placeholder="Digite ou selecione um cliente"
              />
            )}
          />
          <Select
            margin="dense"
            name="status"
            label="Status"
            fullWidth
            value={editRecord.status}
            onChange={handleEditChange}
            displayEmpty
          >
            <MenuItem value="Sinal Verde">Sinal Verde</MenuItem>
            <MenuItem value="Sinal Amarelo">Sinal Amarelo</MenuItem>
            <MenuItem value="Sinal Vermelho">Sinal Vermelho</MenuItem>
            <MenuItem value="Pendente">Pendente</MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="motivoSinal"
            label="Motivo do Sinal"
            type="text"
            fullWidth
            value={editRecord.motivoSinal}
            onChange={handleEditChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Alertas;
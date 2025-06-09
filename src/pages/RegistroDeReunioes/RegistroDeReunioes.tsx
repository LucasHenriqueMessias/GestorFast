import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridEventListener } from '@mui/x-data-grid';
import { Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, useTheme, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';


const RegistroDeReunioes = () => {
  const [reuniaoData, setReuniaoData] = useState([]);
  const [open, setOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    user: '',
    cliente: '',
    status: '',
    tipo_reuniao: '',
    local_reuniao: '',
    Ata_reuniao: '',
    data_realizada: '',
    nps_reuniao: '',
  });

  const columns: GridColDef[] = [
    { field: 'user', headerName: 'Colaborador', width: 150 },
    { field: 'cliente', headerName: 'Cliente', width: 150 },
    { field: 'status', headerName: 'Status', width: 150 },
    { field: 'tipo_reuniao', headerName: 'Tipo de Reunião', width: 150 },
    { field: 'local_reuniao', headerName: 'Local da Reunião', width: 150 },
    {
      field: 'Ata_reuniao',
      headerName: 'Ata da Reunião',
      width: 200,
      renderCell: (params) => (
        <span style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
          {params.value}
        </span>
      ),
    },
    { field: 'data_realizada', headerName: 'Data Realizada', width: 150 },
    { field: 'nps_reuniao', headerName: 'NPS', width: 150, type: 'number' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-reuniao`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReuniaoData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const token = getAccessToken();

      newRecord.user = getUsername() ?? '';
      await axios.post(`${process.env.REACT_APP_API_URL}/tab-reuniao`, newRecord, {
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

  const handleCellDoubleClick: GridEventListener<'cellDoubleClick'> = (params) => {
    if (params.field === 'Ata_reuniao' && params.value) {
      const url = typeof params.value === 'string' && params.value.startsWith('http') 
        ? params.value 
        : `https://${params.value}`;
      window.open(url, '_blank');
    }
  };

  const theme = useTheme();
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Registros de Reuniões
      </Typography>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Adicionar Registro
      </Button>
      <div style={{ height: 400, width: '100%', marginTop: 20 }}>
        <DataGrid
          rows={reuniaoData}
          columns={columns}
          autoPageSize
          onCellDoubleClick={handleCellDoubleClick}
         
        />
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Adicionar Novo Registro</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="cliente"
            label="Cliente"
            type="text"
            fullWidth
            value={newRecord.cliente}
            onChange={handleTextFieldChange}
          />
          <Select
            margin="dense"
            name="status"
            value={newRecord.status}
            onChange={handleSelectChange}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Status
            </MenuItem>
            <MenuItem value="Pendente">Pendente</MenuItem>
            <MenuItem value="Realizado">Realizado</MenuItem>
            <MenuItem value="NA">Não Aplicável</MenuItem>
          </Select>
          <Select
            margin="dense"
            name="tipo_reuniao"
            value={newRecord.tipo_reuniao}
            onChange={handleSelectChange}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecione o Tipo de Reunião
            </MenuItem>
            <MenuItem value="RD">RD</MenuItem>
            <MenuItem value="RE">RE</MenuItem>
            <MenuItem value="RC">RC</MenuItem>
            <MenuItem value="RI">RI</MenuItem>
            <MenuItem value="RP">RP</MenuItem>
            <MenuItem value="RAE">RAE</MenuItem>
            <MenuItem value="RA">RA</MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="local_reuniao"
            label="Local da Reunião"
            type="text"
            fullWidth
            value={newRecord.local_reuniao}
            onChange={handleTextFieldChange}
          />
          <TextField
            margin="dense"
            name="Ata_reuniao"
            label="Ata da Reunião"
            type="text"
            fullWidth
            value={newRecord.Ata_reuniao}
            onChange={handleTextFieldChange}
          />
          <TextField
            margin="dense"
            name="data_realizada"
            label="Data Realizada"
            type="date"
            fullWidth
            value={newRecord.data_realizada}
            onChange={handleTextFieldChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            name="nps_reuniao"
            label="NPS"
            type="number"
            fullWidth
            value={newRecord.nps_reuniao}
            onChange={handleTextFieldChange}
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
    </Container>
  );
};

export default RegistroDeReunioes
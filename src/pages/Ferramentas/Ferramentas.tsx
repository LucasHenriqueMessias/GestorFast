import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Typography, Button, Box } from '@mui/material';
import { getAccessToken } from '../../utils/storage';
import axios from 'axios';
import CadastrarFerramentas from './CadastrarFerramentas';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

interface Ferramenta {
  id: number;
  name: string;
  description: string;
  usuario: string;
}

const Ferramentas = () => {
  const [ferramentasData, setFerramentasData] = useState<Ferramenta[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-upload/file/tipo/xlsx`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFerramentasData(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const handleDownload = async (id: number) => {
    const ferramenta = ferramentasData.find((f: any) => f.id === id);
    if (ferramenta) {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tab-upload/file/download/${ferramenta.id}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });

      if (!response.ok) {
        console.error(`Error: ${response.statusText}`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ferramenta.name}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    
  };
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome da Ferramenta', flex: 1 },
    { field: 'description', headerName: 'Descrição', flex: 1 },
    { field: 'usuario', headerName: 'Colaborador Responsável', flex: 1 },
    {
      field: 'download',
      headerName: '',
      renderCell: (params) => (
        <Button variant="contained" color="primary" onClick={() => handleDownload(params.row.id)}>
          Baixar
        </Button>
      ),
      width: 110
    }
  ];

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Ferramentas e Serviços desenvolvidos pelos analistas aos clientes Fast
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
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid 
            rows={ferramentasData} 
            columns={columns} 
            autoPageSize/>
        </div>
      </Box>
    </Container>
  );
};

export default Ferramentas;
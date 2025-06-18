import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Typography, Button } from '@mui/material';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import CadastrarLivro from './CadastrarLivro';


interface Bibliotecas {
  id: number;
  name: string;
  description: string;
  usuario: string;
}



const Biblioteca = () => {
  const [BibliotecaData, setBibliotecaData] = useState<Bibliotecas[]>([]);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-upload/file/tipo/Livro`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBibliotecaData(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const handleDownload = async (id: number) => {
    const bibliotecas = BibliotecaData.find((f: any) => f.id === id);
    if (bibliotecas) {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tab-upload/file/download/${bibliotecas.id}`, {
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
      a.download = `${bibliotecas.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    
  };
  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome do Livro', flex: 1 },
    { field: 'description', headerName: 'Descrição do Livro', flex: 1 },
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Biblioteca De Livros Fast Assessoria
      </Typography>
      <Button
        variant="contained"
        onClick={handleClickOpen}
      >
        Cadastrar Novo Livro
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Cadastrar Novo Livro</DialogTitle>
        <DialogContent>
          <CadastrarLivro onClose={handleClose} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ height: 400, width: '100%' }}>
        <DataGrid rows={BibliotecaData} columns={columns} autoPageSize/>
      </div>
    </Container>
  );
};

export default Biblioteca;
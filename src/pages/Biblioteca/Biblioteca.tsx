import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Typography, Button, TextField, Box, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';


interface Bibliotecas {
  id: number;
  nome_livro: string;
  resenha_livro: string;
  genero_livro: string;
  link_livro: string;
  usuario: string;
}



const Biblioteca = () => {
  const [BibliotecaData, setBibliotecaData] = useState<Bibliotecas[]>([]);
  const [open, setOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [newLivro, setNewLivro] = useState<Omit<Bibliotecas, 'id'>>({
    nome_livro: '',
    resenha_livro: '',
    genero_livro: '',
    link_livro: '',
    usuario: '',
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewLivro({
      nome_livro: '',
      resenha_livro: '',
      genero_livro: '',
      link_livro: '',
      usuario: '',
    });
  };

  const handleInputChange = (field: keyof Omit<Bibliotecas, 'id'>, value: string) => {
    setNewLivro(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleRowExpansion = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    try {
      const token = getAccessToken();
      const livroData = {
        ...newLivro,
        usuario: getUsername() || ''
      };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/tab-biblioteca`, livroData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setBibliotecaData(prev => [...prev, response.data]);
      handleClose();
      alert('Livro cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao cadastrar livro:', error);
      alert('Erro ao cadastrar livro.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-biblioteca`, {
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

  const handleOpenLink = (link_livro: string) => {
    if (link_livro) {
      // Verifica se a URL já tem protocolo, se não tiver adiciona https://
      const url = link_livro.startsWith('http://') || link_livro.startsWith('https://') 
        ? link_livro 
        : `https://${link_livro}`;
      
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  const columns: GridColDef[] = [
    { field: 'nome_livro', headerName: 'Nome do Livro', flex: 1 },
    { 
      field: 'resenha_livro', 
      headerName: 'Resenha', 
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <IconButton 
            size="small" 
            onClick={() => toggleRowExpansion(params.row.id)}
            sx={{ mr: 1 }}
          >
            {expandedRows.has(params.row.id) ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          <Typography variant="body2" sx={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}>
            {params.value ? params.value.substring(0, 50) + (params.value.length > 50 ? '...' : '') : ''}
          </Typography>
        </Box>
      )
    },
    { field: 'genero_livro', headerName: 'Gênero', width: 150 },
    {
      field: 'actions',
      headerName: 'Ações',
      renderCell: (params) => (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleOpenLink(params.row.link_livro)}
          disabled={!params.row.link_livro}
        >
          Acessar
        </Button>
      ),
      width: 110
    }
  ];

  const renderDetailPanel = (livro: Bibliotecas) => (
    <Collapse in={expandedRows.has(livro.id)} timeout="auto" unmountOnExit>
      <Box sx={{ p: 2, backgroundColor: '#f5f5f5', margin: 1, borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Resenha Completa:
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {livro.resenha_livro || 'Nenhuma resenha disponível.'}
        </Typography>
        {livro.link_livro && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              <strong>Link:</strong>{' '}
              <a 
                href={livro.link_livro.startsWith('http://') || livro.link_livro.startsWith('https://') 
                  ? livro.link_livro 
                  : `https://${livro.link_livro}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#1976d2' }}
              >
                {livro.link_livro}
              </a>
            </Typography>
          </Box>
        )}
      </Box>
    </Collapse>
  );

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
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Cadastrar Novo Livro</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nome do Livro"
            type="text"
            fullWidth
            value={newLivro.nome_livro}
            onChange={(e) => handleInputChange('nome_livro', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Resenha do Livro"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={newLivro.resenha_livro}
            onChange={(e) => handleInputChange('resenha_livro', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Gênero do Livro"
            type="text"
            fullWidth
            value={newLivro.genero_livro}
            onChange={(e) => handleInputChange('genero_livro', e.target.value)}
          />
          <TextField
            margin="dense"
            label="Link do Livro"
            type="url"
            fullWidth
            value={newLivro.link_livro}
            onChange={(e) => handleInputChange('link_livro', e.target.value)}
            placeholder="https://exemplo.com/livro"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Cadastrar
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ height: 600, width: '100%' }}>
        <Box>
          {BibliotecaData.map((livro) => (
            <Box key={livro.id} sx={{ mb: 1 }}>
              <DataGrid 
                rows={[livro]} 
                columns={columns} 
                hideFooter
                disableRowSelectionOnClick
                sx={{ 
                  '& .MuiDataGrid-cell:focus': { outline: 'none' },
                  '& .MuiDataGrid-row:hover': { backgroundColor: '#f5f5f5' }
                }}
              />
              {renderDetailPanel(livro)}
            </Box>
          ))}
        </Box>
      </div>
    </Container>
  );
};

export default Biblioteca;
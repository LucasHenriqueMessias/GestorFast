import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Box, Container, Typography, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Chip, Autocomplete } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getAccessToken } from '../../utils/storage';

interface PesquisaICR {
  id: number;
  data_pesquisa: string;
  razao_social: string;
  icr: string;
  pesquisa_satisfacao_icr: string;
}

const PesquisaICRPage: React.FC = () => {
  const [data, setData] = useState<PesquisaICR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<PesquisaICR, 'id'>>({
    data_pesquisa: '',
    razao_social: '',
    icr: '',
    pesquisa_satisfacao_icr: '',
  });
  const [clientes, setClientes] = useState<string[]>([]);

  const fetchClientes = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/razaosocial`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && Array.isArray(response.data)) {
        const razoesSociais = response.data.map((item: { razao_social: string }) => item.razao_social);
        setClientes(razoesSociais);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-pesquisa-icr-cs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err: any) {
      setError('Erro ao buscar dados da pesquisa ICR.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const handleOpenDialog = (row?: PesquisaICR) => {
    if (row) {
      setForm({
        data_pesquisa: row.data_pesquisa,
        razao_social: row.razao_social,
        icr: row.icr,
        pesquisa_satisfacao_icr: row.pesquisa_satisfacao_icr,
      });
      setEditId(row.id);
    } else {
      setForm({ data_pesquisa: '', razao_social: '', icr: '', pesquisa_satisfacao_icr: '' });
      setEditId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => { setOpenDialog(false); };

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    try {
      if (editId) {
        await axios.patch(`${process.env.REACT_APP_API_URL}/tab-pesquisa-icr-cs/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/tab-pesquisa-icr-cs`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      alert('Erro ao salvar pesquisa.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pesquisa?')) return;
    const token = getAccessToken();
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/tab-pesquisa-icr-cs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      alert('Erro ao excluir pesquisa.');
    }
  };

  const columns: GridColDef[] = [
    { field: 'data_pesquisa', headerName: 'Data Da Pesquisa', flex: 1, renderCell: (params: GridRenderCellParams) => {
      const value = params.row?.data_pesquisa;
      if (!value) return '';
      const date = value.length === 10 ? new Date(value + 'T00:00:00') : new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
    } },
    { field: 'razao_social', headerName: 'Cliente', flex: 2 },
    { field: 'icr', headerName: 'ICR', flex: 1 },
    { field: 'pesquisa_satisfacao_icr', headerName: 'Pesquisa de satisfação ICR (Principais Pontos)', flex: 2, renderCell: (params: GridRenderCellParams) => <Chip label={params.value} size="small" /> },
    {
      field: 'actions',
      headerName: 'Ações',
      minWidth: 180,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" color="primary" size="small" onClick={() => handleOpenDialog(params.row)}>Editar</Button>
          <Button variant="outlined" color="secondary" size="small" onClick={() => handleDelete(params.row.id)}>Excluir</Button>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Pesquisa ICR</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Adicionar Pesquisa
      </Button>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSizeOptions={[10, 20, 50, 100]}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            autoHeight
          />
        </Box>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog} disableEnforceFocus={false}>
        <DialogTitle>{editId ? 'Editar' : 'Adicionar'} Pesquisa ICR</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="dense"
              name="data_pesquisa"
              label="Data da Pesquisa"
              type="date"
              fullWidth
              variant="outlined"
              value={form.data_pesquisa}
              onChange={handleFormChange}
              InputLabelProps={{ shrink: true }}
            />
            <Autocomplete
              options={clientes}
              freeSolo
              value={form.razao_social}
              onChange={(_event, newValue) => {
                setForm((prev) => ({ ...prev, razao_social: newValue || '' }));
              }}
              onInputChange={(_event, newInputValue) => {
                setForm((prev) => ({ ...prev, razao_social: newInputValue }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="dense"
                  name="razao_social"
                  label="Razão Social"
                  fullWidth
                  variant="outlined"
                />
              )}
            />
            <TextField
              margin="dense"
              name="icr"
              label="ICR"
              type="text"
              fullWidth
              variant="outlined"
              value={form.icr}
              onChange={handleFormChange}
            />
            <TextField
              margin="dense"
              name="pesquisa_satisfacao_icr"
              label="Satisfação"
              type="text"
              fullWidth
              variant="outlined"
              value={form.pesquisa_satisfacao_icr}
              onChange={handleFormChange}
            />
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">Cancelar</Button>
              <Button type="submit" color="primary">{editId ? 'Salvar Alterações' : 'Adicionar'}</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PesquisaICRPage;
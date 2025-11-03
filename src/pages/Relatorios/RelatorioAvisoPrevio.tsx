import React, { useEffect, useState, useCallback } from 'react';
import { Container, Typography, Box, Paper, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, IconButton, CircularProgress, Autocomplete } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowsProp } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';

interface AvisoPrevio {
  id?: number;
  data_pedido_aviso_previvo?: string | null;
  aviso?: string;
  cliente?: string;
  consultor?: string;
  valor_aviso_previo?: number;
  observacao?: string;
}

const emptyForm: AvisoPrevio = {
  data_pedido_aviso_previvo: '',
  aviso: '',
  cliente: '',
  consultor: '',
  valor_aviso_previo: 0,
  observacao: ''
};

const RelatorioAvisoPrevio = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<AvisoPrevio>(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [clientes, setClientes] = useState<string[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const resp = await axios.get(`${process.env.REACT_APP_API_URL}/tab-aviso-previo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(resp.data) ? resp.data : resp.data || [];
      // normalize rows
      const mapped = (data as any[]).map((r, i) => ({
        id: r.id ?? i,
        data_pedido_aviso_previvo: r.data_pedido_aviso_previvo,
        aviso: r.aviso,
        cliente: r.cliente,
        consultor: r.consultor,
        valor_aviso_previo: r.valor_aviso_previo,
        observacao: r.observacao
      }));
      setRows(mapped);
    } catch (err) {
      console.error('Erro ao buscar avisos:', err);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const fetchClientes = useCallback(async () => {
    setLoadingClientes(true);
    try {
      const token = getAccessToken();
      const resp = await axios.get(`${process.env.REACT_APP_API_URL}/loja/razaosocial`, { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(resp.data) ? resp.data : resp.data || [];
      const mapped = (data as any[]).map(x => x.razao_social).filter(Boolean);
      setClientes(mapped);
    } catch (err) {
      console.error('Erro ao buscar lista de clientes:', err);
    } finally {
      setLoadingClientes(false);
    }
  }, []);

  useEffect(() => { fetchClientes(); }, [fetchClientes]);

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setEditMode(false);
    setEditId(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (row: any) => {
    setForm({
      data_pedido_aviso_previvo: row.data_pedido_aviso_previvo || '',
      aviso: row.aviso || '',
      cliente: row.cliente || '',
      consultor: row.consultor || '',
      valor_aviso_previo: row.valor_aviso_previo ?? 0,
      observacao: row.observacao || ''
    });
    setEditMode(true);
    setEditId(row.id);
    setOpenDialog(true);
  };

  const handleDelete = async (id?: number) => {
    if (id === undefined) return;
    if (!window.confirm('Deseja realmente excluir este aviso prévio?')) return;
    setLoading(true);
    try {
      const token = getAccessToken();
      await axios.delete(`${process.env.REACT_APP_API_URL}/tab-aviso-previo/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setRows(prev => prev.filter((r: any) => r.id !== id));
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Erro ao excluir registro');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // basic validation
    if (!form.cliente || !form.consultor) { alert('Preencha cliente e consultor'); return; }
    setLoading(true);
    try {
      const token = getAccessToken();
      if (editMode && editId != null) {
        await axios.patch(`${process.env.REACT_APP_API_URL}/tab-aviso-previo/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } });
        setRows(prev => prev.map((r: any) => r.id === editId ? { ...r, ...form } : r));
      } else {
        const resp = await axios.post(`${process.env.REACT_APP_API_URL}/tab-aviso-previo`, form, { headers: { Authorization: `Bearer ${token}` } });
        const created = resp.data;
        const newRow = {
          id: created.id ?? Math.random(),
          data_pedido_aviso_previvo: created.data_pedido_aviso_previvo || form.data_pedido_aviso_previvo,
          aviso: created.aviso || form.aviso,
          cliente: created.cliente || form.cliente,
          consultor: created.consultor || form.consultor,
          valor_aviso_previo: created.valor_aviso_previo ?? form.valor_aviso_previo,
          observacao: created.observacao || form.observacao
        };
        setRows(prev => [newRow, ...prev]);
      }
      setOpenDialog(false);
    } catch (err) {
      console.error('Erro ao salvar aviso:', err);
      alert('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'data_pedido_aviso_previvo', headerName: 'Data Pedido', flex: 1, minWidth: 140, renderCell: (params: GridRenderCellParams) => params.value ? new Date(params.value as string).toLocaleDateString('pt-BR') : '-' },
    { field: 'aviso', headerName: 'Aviso', flex: 1, minWidth: 140 },
    { field: 'cliente', headerName: 'Cliente', flex: 1.5, minWidth: 200 },
    { field: 'consultor', headerName: 'Consultor', flex: 1, minWidth: 160 },
    { field: 'valor_aviso_previo', headerName: 'Valor', flex: 0.7, minWidth: 120, align: 'right', headerAlign: 'right', renderCell: (p: GridRenderCellParams) => (p.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
    { field: 'observacao', headerName: 'Observação', flex: 1.5, minWidth: 200 },
    {
      field: 'actions', headerName: 'Ações', sortable: false, filterable: false, minWidth: 140, renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => handleOpenEdit(params.row)}><Edit fontSize="small"/></IconButton>
          <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}><Delete fontSize="small"/></IconButton>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Aviso Prévio</Typography>
        <Typography variant="body2" color="text.secondary">Gerenciamento de clientes em aviso prévio.</Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>Adicionar Aviso</Button>
          <Button variant="outlined" onClick={fetchAll}>Atualizar</Button>
        </Box>
      </Paper>

      <Paper sx={{ height: 600 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} getRowId={(r: any) => r.id} pageSizeOptions={[10,25,50]} initialState={{ pagination: { paginationModel: { pageSize: 25 } } }} disableRowSelectionOnClick />
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Editar Aviso Prévio' : 'Adicionar Aviso Prévio'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2, mt: 1 }}>
            <TextField label="Data Pedido" type="date" InputLabelProps={{ shrink: true }} value={form.data_pedido_aviso_previvo ? form.data_pedido_aviso_previvo.split('T')[0] : ''} onChange={e => setForm(f => ({ ...f, data_pedido_aviso_previvo: e.target.value }))} />
            <TextField label="Aviso" value={form.aviso || ''} onChange={e => setForm(f => ({ ...f, aviso: e.target.value }))} />
            <Autocomplete
              options={clientes}
              loading={loadingClientes}
              value={form.cliente || ''}
              onChange={(e, v) => setForm(f => ({ ...f, cliente: v || '' }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cliente"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingClientes ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
            <TextField label="Consultor" value={form.consultor || ''} onChange={e => setForm(f => ({ ...f, consultor: e.target.value }))} />
            <TextField label="Valor" type="number" value={form.valor_aviso_previo ?? 0} onChange={e => setForm(f => ({ ...f, valor_aviso_previo: Number(e.target.value) }))} />
            <TextField label="Observação" value={form.observacao || ''} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>{editMode ? 'Salvar' : 'Cadastrar'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RelatorioAvisoPrevio;
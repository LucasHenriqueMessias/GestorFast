import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Container, Typography, CircularProgress, Chip, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControlLabel, Checkbox, MenuItem } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getAccessToken } from '../../utils/storage';

interface Checklist {
  id: number;
  empresa: string;
  responsável: string;
  data_fechamento_contrato: string;
  possui_ponto_apoio: boolean;
  contrato_assinado: string;
  data_onboarding: string;
  consultor: string;
  envio_briefing_para_consultor: boolean;
  grupo_wa: boolean;
  data_dossie: string;
  feedback_dossie: string;
  instalacao_dropbox: boolean;
  plano_de_contas: boolean;
  treinamento_equipe_operacional: string;
}

const ChecklistAcompanhamento: React.FC = () => {
  const [data, setData] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Checklist, 'id'>>({
    empresa: '',
    responsável: '',
    data_fechamento_contrato: '',
    possui_ponto_apoio: false,
    contrato_assinado: 'Ainda Não Enviado',
    data_onboarding: '',
    consultor: '',
    envio_briefing_para_consultor: false,
    grupo_wa: false,
    data_dossie: '',
    feedback_dossie: '',
    instalacao_dropbox: false,
    plano_de_contas: false,
    treinamento_equipe_operacional: 'A ser agendado',
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-checklist-cliente-cs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err: any) {
      setError('Erro ao buscar dados do checklist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleOpenDialog = (row?: Checklist) => {
    if (row) {
      const { id, ...rest } = row;
      setForm(rest);
      setEditId(id);
    } else {
      setForm({
        empresa: '',
        responsável: '',
        data_fechamento_contrato: '',
        possui_ponto_apoio: false,
        contrato_assinado: 'Ainda Não Enviado',
        data_onboarding: '',
        consultor: '',
        envio_briefing_para_consultor: false,
        grupo_wa: false,
        data_dossie: '',
        feedback_dossie: '',
        instalacao_dropbox: false,
        plano_de_contas: false,
        treinamento_equipe_operacional: 'A ser agendado'
      });
      setEditId(null);
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => { setOpenDialog(false); setEditId(null); };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    try {
      if (editId) {
        // PATCH
        await axios.patch(`${process.env.REACT_APP_API_URL}/tab-checklist-cliente-cs/${editId}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // POST
        await axios.post(`${process.env.REACT_APP_API_URL}/tab-checklist-cliente-cs`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      alert('Erro ao salvar checklist.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este checklist?')) return;
    const token = getAccessToken();
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/tab-checklist-cliente-cs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      alert('Erro ao excluir checklist.');
    }
  };

  const renderBool = (value: boolean) => (
    value ? <Chip label="Sim" color="success" size="small" /> : <Chip label="Não" color="default" size="small" />
  );

  // Definição das colunas para o DataGrid
  const columns: GridColDef[] = [
    { field: 'empresa', headerName: 'Empresa', flex: 1 },
    { field: 'responsável', headerName: 'Responsável', flex: 1 },
    { field: 'data_fechamento_contrato', headerName: 'Data Fechamento Contrato', flex: 1, renderCell: (params: GridRenderCellParams) => {
      const value = params.row?.data_fechamento_contrato;
      if (!value) return '';
      // Se vier só yyyy-mm-dd, tratar como local
      const date = value.length === 10 ? new Date(value + 'T00:00:00') : new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
    } },
    { field: 'possui_ponto_apoio', headerName: 'Possui Ponto Apoio', flex: 1, renderCell: (params: GridRenderCellParams) => renderBool(params.value) },
    { field: 'contrato_assinado', headerName: 'Contrato Assinado', flex: 1, renderCell: (params: GridRenderCellParams) => {
      if (params.value === 'Sim') return <Chip label="Sim" color="success" size="small" />;
      if (params.value === 'Em Análise') return <Chip label="Em Análise" color="warning" size="small" />;
      if (params.value === 'Ainda Não Enviado') return <Chip label="Ainda Não Enviado" color="default" size="small" />;
      return <Chip label={params.value} size="small" />;
    } },
    { field: 'data_onboarding', headerName: 'Data Onboarding', flex: 1, renderCell: (params: GridRenderCellParams) => {
      const value = params.row?.data_onboarding;
      if (!value) return '';
      const date = value.length === 10 ? new Date(value + 'T00:00:00') : new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
    } },
    { field: 'consultor', headerName: 'Consultor', flex: 1 },
    { field: 'envio_briefing_para_consultor', headerName: 'Envio Briefing', flex: 1, renderCell: (params: GridRenderCellParams) => renderBool(params.value) },
    { field: 'grupo_wa', headerName: 'Grupo WhatsApp', flex: 1, renderCell: (params: GridRenderCellParams) => renderBool(params.value) },
    { field: 'data_dossie', headerName: 'Data Dossiê', flex: 1, renderCell: (params: GridRenderCellParams) => {
      const value = params.row?.data_dossie;
      if (!value) return '';
      const date = value.length === 10 ? new Date(value + 'T00:00:00') : new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
    } },
    { field: 'feedback_dossie', headerName: 'Feedback Dossiê', flex: 1 },
    { field: 'instalacao_dropbox', headerName: 'Instalação Dropbox', flex: 1, renderCell: (params: GridRenderCellParams) => renderBool(params.value) },
    { field: 'plano_de_contas', headerName: 'Plano de Contas', flex: 1, renderCell: (params: GridRenderCellParams) => renderBool(params.value) },
    { field: 'treinamento_equipe_operacional', headerName: 'Treinamento Equipe Operacional', flex: 1, renderCell: (params: GridRenderCellParams) => {
      const value = params.value;
      let color: 'default' | 'warning' | 'success' | 'info' = 'default';
      if (value === 'realizado') color = 'success';
      else if (value === 'agendado') color = 'info';
      else if (value === 'A ser agendado') color = 'warning';
      return <Chip label={value} color={color} size="small" />;
    } },
    {
      field: 'actions',
      headerName: 'Ações',
      minWidth: 180,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: (params: GridRenderCellParams) => {
        // Garante que params.row existe e tem id
        if (!params.row || typeof params.row.id === 'undefined') return null;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" color="primary" size="small" onClick={() => handleOpenDialog(params.row)}>
              Editar
            </Button>
            <Button variant="outlined" color="secondary" size="small" onClick={() => handleDelete(params.row.id)}>
              Excluir
            </Button>
          </Box>
        );
      },
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Checklist de Acompanhamento de Cliente</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Adicionar Checklist
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
        <DialogTitle>{editId ? 'Editar' : 'Adicionar'} Checklist</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="empresa"
            label="Empresa"
            type="text"
            fullWidth
            variant="outlined"
            value={form.empresa}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="responsável"
            label="Responsável"
            type="text"
            fullWidth
            variant="outlined"
            value={form.responsável}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            name="data_fechamento_contrato"
            label="Data Fechamento Contrato"
            type="date"
            fullWidth
            variant="outlined"
            value={form.data_fechamento_contrato}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="possui_ponto_apoio"
                checked={form.possui_ponto_apoio}
                onChange={handleFormChange}
                color="primary"
              />
            }
            label="Possui Ponto Apoio"
          />
          <TextField
            select
            margin="dense"
            name="contrato_assinado"
            label="Contrato Assinado"
            fullWidth
            variant="outlined"
            value={form.contrato_assinado}
            onChange={handleFormChange}
          >
            {['Sim', 'Em Análise', 'Ainda Não Enviado'].map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            name="data_onboarding"
            label="Data Onboarding"
            type="date"
            fullWidth
            variant="outlined"
            value={form.data_onboarding}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            name="consultor"
            label="Consultor"
            type="text"
            fullWidth
            variant="outlined"
            value={form.consultor}
            onChange={handleFormChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="envio_briefing_para_consultor"
                checked={form.envio_briefing_para_consultor}
                onChange={handleFormChange}
                color="primary"
              />
            }
            label="Envio Briefing para Consultor"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="grupo_wa"
                checked={form.grupo_wa}
                onChange={handleFormChange}
                color="primary"
              />
            }
            label="Grupo WhatsApp"
          />
          <TextField
            margin="dense"
            name="data_dossie"
            label="Data Dossiê"
            type="date"
            fullWidth
            variant="outlined"
            value={form.data_dossie}
            onChange={handleFormChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="dense"
            name="feedback_dossie"
            label="Feedback Dossiê"
            type="text"
            fullWidth
            variant="outlined"
            value={form.feedback_dossie}
            onChange={handleFormChange}
          />
          <FormControlLabel
            control={
              <Checkbox
                name="instalacao_dropbox"
                checked={form.instalacao_dropbox}
                onChange={handleFormChange}
                color="primary"
              />
            }
            label="Instalação Dropbox"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="plano_de_contas"
                checked={form.plano_de_contas}
                onChange={handleFormChange}
                color="primary"
              />
            }
            label="Plano de Contas"
          />
          <TextField
            select
            margin="dense"
            name="treinamento_equipe_operacional"
            label="Treinamento Equipe Operacional"
            fullWidth
            variant="outlined"
            value={form.treinamento_equipe_operacional}
            onChange={handleFormChange}
          >
            {['A ser agendado', 'agendado', 'realizado', 'não se aplica'].map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {editId ? 'Salvar Alterações' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ChecklistAcompanhamento;
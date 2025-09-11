import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Container, Typography, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControlLabel, Checkbox, MenuItem, Autocomplete } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getAccessToken } from '../../utils/storage';

interface Checklist {
  id: number;
  empresa: string;
  responsável: string;
  data_fechamento_contrato: string | null;
  possui_ponto_apoio: boolean;
  contrato_assinado: string;
  data_onboarding: string | null;
  consultor: string;
  envio_briefing_para_consultor: boolean;
  grupo_wa: boolean;
  data_dossie: string | null;
  feedback_dossie: string;
  instalacao_dropbox: boolean;
  plano_de_contas: boolean;
  treinamento_equipe_operacional: string;
  descricao_atividades_cs: string;
  faturamento?: number;
  principais_dores_cliente?: string;
  informacoes_relevantes?: string;
}

const ChecklistAcompanhamento: React.FC = () => {
  // Estado para lista de clientes
  const [clientes, setClientes] = useState<{ razao_social: string }[]>([]);
  // Buscar clientes para o select de empresa
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
  const [data, setData] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  // Para o input tipo calculadora, armazenar string de dígitos para faturamento
  const [moneyDigits, setMoneyDigits] = useState<string>('');
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
    descricao_atividades_cs: '',
    faturamento: undefined,
    principais_dores_cliente: '',
    informacoes_relevantes: '',
  });
  const [detailRow, setDetailRow] = useState<Checklist | null>(null);

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

  useEffect(() => {
    fetchData();
    fetchClientes();
  }, []);

  const handleOpenDialog = (row?: Checklist) => {
    if (row) {
      const { id, ...rest } = row;
      setForm(rest);
      setEditId(id);
      // Preencher moneyDigits a partir do valor existente
      if (rest.faturamento !== undefined && rest.faturamento !== null) {
        // Ex: 12.34 -> '1234'
        setMoneyDigits(Math.round(rest.faturamento * 100).toString());
      } else {
        setMoneyDigits('');
      }
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
        treinamento_equipe_operacional: 'A ser agendado',
        descricao_atividades_cs: '',
        faturamento: undefined,
        principais_dores_cliente: '',
        informacoes_relevantes: '',
      });
      setMoneyDigits('');
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
    // Corrigir campos de data vazios para null
    const dateFields: (keyof typeof form)[] = [
      'data_fechamento_contrato',
      'data_onboarding',
      'data_dossie'
    ];
    const formToSend = { ...form };
    dateFields.forEach(field => {
      if (formToSend[field] === '') {
        // Type guard: only assign null to fields that are string | null
        if (field === 'data_fechamento_contrato' || field === 'data_onboarding' || field === 'data_dossie') {
          (formToSend as any)[field] = null;
        }
      }
    });
    try {
      if (editId) {
        // PATCH
        await axios.patch(`${process.env.REACT_APP_API_URL}/tab-checklist-cliente-cs/${editId}`, formToSend, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        // POST
        await axios.post(`${process.env.REACT_APP_API_URL}/tab-checklist-cliente-cs`, formToSend, { headers: { Authorization: `Bearer ${token}` } });
      }
      handleCloseDialog();
      fetchData();
    } catch (err) {
      alert('Erro ao salvar checklist.');
    }
  };

  // Funções handleDelete e renderBool removidas pois não estão em uso.

  // Definição das colunas para o DataGrid
  const columns: GridColDef[] = [
    { field: 'empresa', headerName: 'Empresa', flex: 1 },
    { field: 'data_fechamento_contrato', headerName: 'Data Fechamento Contrato', flex: 1, renderCell: (params: GridRenderCellParams) => {
      const value = params.row?.data_fechamento_contrato;
      if (!value) return '';
      const date = value.length === 10 ? new Date(value + 'T00:00:00') : new Date(value);
      return isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-BR');
    } },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Checklist de Acompanhamento de Cliente</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Adicionar Checklist
      </Button>
      <>
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
              onRowClick={(params) => setDetailRow(params.row)}
            />
          </Box>
        )}
        {/* Master-detail dialog */}
        <Dialog open={!!detailRow} onClose={() => setDetailRow(null)} maxWidth="md" fullWidth>
          <DialogTitle>Relatório do Cliente</DialogTitle>
          <DialogContent dividers>
            {detailRow && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle1"><b>Empresa:</b> {detailRow.empresa}</Typography>
                <Typography variant="subtitle1"><b>Principal Contato na Empresa:</b> {detailRow.responsável}</Typography>
                <Typography variant="subtitle1"><b>Data Fechamento Contrato:</b> {detailRow.data_fechamento_contrato ? (detailRow.data_fechamento_contrato.length === 10 ? new Date(detailRow.data_fechamento_contrato + 'T00:00:00').toLocaleDateString('pt-BR') : new Date(detailRow.data_fechamento_contrato).toLocaleDateString('pt-BR')) : ''}</Typography>
                <Typography variant="subtitle1"><b>Possui Ponto Apoio:</b> {detailRow.possui_ponto_apoio ? 'Sim' : 'Não'}</Typography>
                <Typography variant="subtitle1"><b>Contrato Assinado:</b> {detailRow.contrato_assinado}</Typography>
                <Typography variant="subtitle1"><b>Data Onboarding:</b> {detailRow.data_onboarding ? (detailRow.data_onboarding.length === 10 ? new Date(detailRow.data_onboarding + 'T00:00:00').toLocaleDateString('pt-BR') : new Date(detailRow.data_onboarding).toLocaleDateString('pt-BR')) : ''}</Typography>
                <Typography variant="subtitle1"><b>Consultor:</b> {detailRow.consultor}</Typography>
                <Typography variant="subtitle1"><b>Envio Briefing para Consultor:</b> {detailRow.envio_briefing_para_consultor ? 'Sim' : 'Não'}</Typography>
                <Typography variant="subtitle1"><b>Grupo WhatsApp:</b> {detailRow.grupo_wa ? 'Sim' : 'Não'}</Typography>
                <Typography variant="subtitle1"><b>Data Dossiê:</b> {detailRow.data_dossie ? (detailRow.data_dossie.length === 10 ? new Date(detailRow.data_dossie + 'T00:00:00').toLocaleDateString('pt-BR') : new Date(detailRow.data_dossie).toLocaleDateString('pt-BR')) : ''}</Typography>
                <Typography variant="subtitle1"><b>Feedback Dossiê:</b> {detailRow.feedback_dossie}</Typography>
                <Typography variant="subtitle1"><b>Instalação Dropbox:</b> {detailRow.instalacao_dropbox ? 'Sim' : 'Não'}</Typography>
                <Typography variant="subtitle1"><b>Plano de Contas:</b> {detailRow.plano_de_contas ? 'Sim' : 'Não'}</Typography>
                <Typography variant="subtitle1"><b>Treinamento Equipe Operacional:</b> {detailRow.treinamento_equipe_operacional}</Typography>
                <Typography variant="subtitle1"><b>Descrição das Atividades CS:</b></Typography>
                <Box sx={{ whiteSpace: 'pre-line', border: '1px solid #eee', borderRadius: 1, p: 2, bgcolor: '#fafafa' }}>
                  {detailRow.descricao_atividades_cs || <i>Sem informações</i>}
                </Box>
                <Typography variant="subtitle1"><b>Faturamento:</b> {detailRow.faturamento !== undefined && detailRow.faturamento !== null
                  ? detailRow.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : <i>Não informado</i>}</Typography>
                <Typography variant="subtitle1"><b>Principais Dores do Cliente:</b></Typography>
                <Box sx={{ whiteSpace: 'pre-line', border: '1px solid #eee', borderRadius: 1, p: 2, bgcolor: '#fafafa' }}>
                  {detailRow.principais_dores_cliente || <i>Sem informações</i>}
                </Box>
                <Typography variant="subtitle1"><b>Informações Relevantes:</b></Typography>
                <Box sx={{ whiteSpace: 'pre-line', border: '1px solid #eee', borderRadius: 1, p: 2, bgcolor: '#fafafa' }}>
                  {detailRow.informacoes_relevantes || <i>Sem informações</i>}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailRow(null)} color="primary">Fechar</Button>
            {detailRow && (
              <Button
                color="primary"
                variant="outlined"
                onClick={() => {
                  handleOpenDialog(detailRow);
                  setDetailRow(null);
                }}
              >
                Editar
              </Button>
            )}
          </DialogActions>
        </Dialog>
        <Dialog open={openDialog} onClose={handleCloseDialog} disableEnforceFocus={false}>
        <DialogTitle>{editId ? 'Editar' : 'Adicionar'} Checklist</DialogTitle>
        <DialogContent>
          <Autocomplete
            autoFocus
            options={clientes.map((c) => c.razao_social)}
            value={form.empresa}
            onChange={(_event, newValue) => {
              setForm((prev) => ({ ...prev, empresa: newValue || '' }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                name="empresa"
                label="Empresa"
                variant="outlined"
                fullWidth
              />
            )}
            isOptionEqualToValue={(option, value) => option === value}
            freeSolo={false}
          />
          <TextField
            margin="dense"
            name="responsável"
            label="Principal Contato na Empresa"
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
            multiline
            minRows={3}
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
          <TextField
            margin="dense"
            name="descricao_atividades_cs"
            label="Descrição das Atividades CS"
            type="text"
            fullWidth
            variant="outlined"
            value={form.descricao_atividades_cs}
            onChange={handleFormChange}
            multiline
            minRows={3}
          />
          <TextField
            margin="dense"
            name="faturamento"
            label="Faturamento (R$)"
            fullWidth
            variant="outlined"
            value={(() => {
              // Formatar moneyDigits para moeda
              let digits = moneyDigits.replace(/\D/g, '');
              if (!digits) return 'R$ 0,00';
              let intVal = parseInt(digits, 10);
              let cents = intVal % 100;
              let reais = Math.floor(intVal / 100);
              return `R$ ${reais.toLocaleString('pt-BR')},${cents.toString().padStart(2, '0')}`;
            })()}
            inputProps={{
              style: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
              inputMode: 'numeric',
              pattern: '[0-9]*',
              maxLength: 15
            }}
            onChange={e => {
              // Não permitir digitação manual, só via teclado numérico
            }}
            onKeyDown={e => {
              if (e.ctrlKey || e.metaKey || e.altKey) return;
              if (e.key === 'Backspace') {
                setMoneyDigits(prev => prev.slice(0, -1));
                setForm(prev => ({ ...prev, faturamento: moneyDigits.length > 1 ? parseInt(moneyDigits.slice(0, -1), 10) / 100 : undefined }));
                e.preventDefault();
                return;
              }
              if (/^[0-9]$/.test(e.key)) {
                if (moneyDigits.length < 13) { // até trilhões
                  const newDigits = moneyDigits + e.key;
                  setMoneyDigits(newDigits);
                  setForm(prev => ({ ...prev, faturamento: parseInt(newDigits, 10) / 100 }));
                }
                e.preventDefault();
                return;
              }
              // Bloquear qualquer outra tecla
              e.preventDefault();
            }}
          />
          <TextField
            margin="dense"
            name="principais_dores_cliente"
            label="Principais Dores do Cliente"
            type="text"
            fullWidth
            variant="outlined"
            value={form.principais_dores_cliente}
            onChange={handleFormChange}
            multiline
            minRows={2}
          />
          <TextField
            margin="dense"
            name="informacoes_relevantes"
            label="Informações Relevantes"
            type="text"
            fullWidth
            variant="outlined"
            value={form.informacoes_relevantes}
            onChange={handleFormChange}
            multiline
            minRows={2}
          />
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
      </>
    </Container>
  );
};

export default ChecklistAcompanhamento;
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';

type TabFunilVenda = {
  id: number;
  colaborador: string;
  contato: number;
  qualificacoes: number;
  visitas: number;
  propostas: number;
  contratos: number;
  data: string;
  naoFechados: number;
  semPerfil: number;
  nutricao: number;
};

type TabFunilVendaPayload = Omit<TabFunilVenda, 'id'>;

type TabFunilVendaForm = {
  colaborador: string;
  contato: string;
  qualificacoes: string;
  visitas: string;
  propostas: string;
  contratos: string;
  data: string;
  naoFechados: string;
  semPerfil: string;
  nutricao: string;
};

const initialForm: TabFunilVendaForm = {
  colaborador: '',
  contato: '',
  qualificacoes: '',
  visitas: '',
  propostas: '',
  contratos: '',
  data: '',
  naoFechados: '',
  semPerfil: '',
  nutricao: '',
};

const Funil = () => {
  const colaboradorUsuario = useMemo(() => getUsername() ?? '', []);
  const [rows, setRows] = useState<TabFunilVenda[]>([]);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<TabFunilVendaForm>({
    ...initialForm,
    colaborador: colaboradorUsuario,
  });
  const [selectedId, setSelectedId] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const apiBaseUrl = process.env.REACT_APP_API_URL;

  const authConfig = useMemo(
    () => () => ({
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }),
    [],
  );

  const buildPayload = (): TabFunilVendaPayload => ({
    colaborador: colaboradorUsuario,
    contato: Number(form.contato),
    qualificacoes: Number(form.qualificacoes),
    visitas: Number(form.visitas),
    propostas: Number(form.propostas),
    contratos: Number(form.contratos),
    data: form.data ? new Date(form.data).toISOString() : new Date().toISOString(),
    naoFechados: Number(form.naoFechados),
    semPerfil: Number(form.semPerfil),
    nutricao: Number(form.nutricao),
  });

  const showError = (message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  };

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  };

  const loadAll = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/tab-funil-vendas`, authConfig());
      setRows(Array.isArray(response.data) ? response.data : []);
    } catch {
      showError('Erro ao carregar tab-funil-vendas.');
    }
  }, [apiBaseUrl, authConfig]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleFieldChange = (field: keyof TabFunilVendaPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${apiBaseUrl}/tab-funil-vendas`, buildPayload(), {
        ...authConfig(),
        headers: {
          ...authConfig().headers,
          'Content-Type': 'application/json',
        },
      });
      showSuccess('Registro criado com sucesso.');
      await loadAll();
      setForm({
        ...initialForm,
        colaborador: colaboradorUsuario,
      });
      setFormMode(null);
    } catch {
      showError('Erro ao criar registro.');
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) {
      showError('Informe um ID para atualizar.');
      return;
    }

    try {
      await axios.patch(`${apiBaseUrl}/tab-funil-vendas/${selectedId}`, buildPayload(), {
        ...authConfig(),
        headers: {
          ...authConfig().headers,
          'Content-Type': 'application/json',
        },
      });
      showSuccess('Registro atualizado com sucesso.');
      await loadAll();
      setFormMode(null);
    } catch {
      showError('Erro ao atualizar registro.');
    }
  };

  const handleDelete = async () => {
    if (!selectedId) {
      showError('Informe um ID para excluir.');
      return;
    }

    try {
      await axios.delete(`${apiBaseUrl}/tab-funil-vendas/${selectedId}`, authConfig());
      showSuccess('Registro excluído com sucesso.');
      await loadAll();
      setForm({
        ...initialForm,
        colaborador: colaboradorUsuario,
      });
      setFormMode(null);
      setSelectedId('');
    } catch {
      showError('Erro ao excluir registro.');
    }
  };

  const handleNovoItem = () => {
    setSelectedId('');
    setForm({
      ...initialForm,
      colaborador: colaboradorUsuario,
    });
    setFormMode('create');
  };

  const preencherFormulario = (item: TabFunilVenda) => {
    setSelectedId(String(item.id));
    setForm({
      colaborador: colaboradorUsuario,
      contato: String(item.contato ?? ''),
      qualificacoes: String(item.qualificacoes ?? ''),
      visitas: String(item.visitas ?? ''),
      propostas: String(item.propostas ?? ''),
      contratos: String(item.contratos ?? ''),
      data: item.data ? new Date(item.data).toISOString().slice(0, 10) : '',
      naoFechados: String(item.naoFechados ?? ''),
      semPerfil: String(item.semPerfil ?? ''),
      nutricao: String(item.nutricao ?? ''),
    });
    setFormMode('edit');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Funil de Vendas
          </Typography>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Button variant="contained" color="success" onClick={handleNovoItem}>
              Adicionar novo item
            </Button>
          </Stack>
        </Paper>

        {formMode && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {formMode === 'create' ? 'Criar novo item' : 'Atualizar item selecionado'}
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
              <TextField
                fullWidth
                type="number"
                label="Contato"
                value={form.contato}
                onChange={(e) => handleFieldChange('contato', e.target.value)}
              />
              <TextField
                fullWidth
                type="number"
                label="Qualificações"
                value={form.qualificacoes}
                onChange={(e) => handleFieldChange('qualificacoes', e.target.value)}
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
              <TextField
                fullWidth
                type="number"
                label="Visitas"
                value={form.visitas}
                onChange={(e) => handleFieldChange('visitas', e.target.value)}
              />
              <TextField
                fullWidth
                type="number"
                label="Propostas"
                value={form.propostas}
                onChange={(e) => handleFieldChange('propostas', e.target.value)}
              />
              <TextField
                fullWidth
                type="number"
                label="Contratos"
                value={form.contratos}
                onChange={(e) => handleFieldChange('contratos', e.target.value)}
              />
              <TextField
                fullWidth
                type="date"
                label="Data"
                InputLabelProps={{ shrink: true }}
                value={form.data}
                onChange={(e) => handleFieldChange('data', e.target.value)}
              />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={2}>
              <TextField
                fullWidth
                type="number"
                label="Não fechados"
                value={form.naoFechados}
                onChange={(e) => handleFieldChange('naoFechados', e.target.value)}
              />
              <TextField
                fullWidth
                type="number"
                label="Sem perfil"
                value={form.semPerfil}
                onChange={(e) => handleFieldChange('semPerfil', e.target.value)}
              />
              <TextField
                fullWidth
                type="number"
                label="Nutrição"
                value={form.nutricao}
                onChange={(e) => handleFieldChange('nutricao', e.target.value)}
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              {formMode === 'create' ? (
                <Button variant="contained" onClick={handleCreate}>
                  Criar
                </Button>
              ) : (
                <>
                  <Button variant="outlined" onClick={handleUpdate}>
                    Atualizar por ID
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleDelete}>
                    Excluir por ID
                  </Button>
                </>
              )}
              <Button
                variant="text"
                onClick={() => {
                  setFormMode(null);
                  setForm({
                    ...initialForm,
                    colaborador: colaboradorUsuario,
                  });
                }}
              >
                Cancelar
              </Button>
            </Stack>
          </Paper>
        )}

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Colaborador</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell>Qualificações</TableCell>
                <TableCell>Visitas</TableCell>
                <TableCell>Propostas</TableCell>
                <TableCell>Contratos</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Não fechados</TableCell>
                <TableCell>Sem perfil</TableCell>
                <TableCell>Nutrição</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.colaborador}</TableCell>
                  <TableCell>{row.contato}</TableCell>
                  <TableCell>{row.qualificacoes}</TableCell>
                  <TableCell>{row.visitas}</TableCell>
                  <TableCell>{row.propostas}</TableCell>
                  <TableCell>{row.contratos}</TableCell>
                  <TableCell>{row.data ? new Date(row.data).toLocaleDateString('pt-BR') : ''}</TableCell>
                  <TableCell>{row.naoFechados}</TableCell>
                  <TableCell>{row.semPerfil}</TableCell>
                  <TableCell>{row.nutricao}</TableCell>
                  <TableCell>
                    <Button size="small" onClick={() => preencherFormulario(row)}>
                      Preencher
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Funil;

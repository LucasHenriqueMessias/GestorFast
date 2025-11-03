import React, { useEffect, useState, useCallback } from 'react';
import { Container, Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';

interface Cliente {
  razao_social: string;
  valor_fatura_cliente: number;
  data_reajuste_financeiro?: string | null;
  vencimento_fatura_1?: number | null;
  vencimento_fatura_2?: number | null;
}

const RelatorioGeralFaturamentoConsultor = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [somaFaturamento, setSomaFaturamento] = useState<number>(0);
  const [totalClientes, setTotalClientes] = useState<number>(0);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const token = getAccessToken();
      const resp = await axios.get(`${process.env.REACT_APP_API_URL}/login/department/username/Consultor`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(resp.data) ? resp.data : [];
      const list = data.map((it: any) => it.user).filter(Boolean);
      setUsers(list);
    } catch (err) {
      console.error('Erro ao carregar usuários consultor:', err);
      alert('Erro ao carregar lista de consultores');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchReportForUser = useCallback(async (user: string) => {
    if (!user) return;
    setLoadingReport(true);
    try {
      const token = getAccessToken();
      const resp = await axios.get(`${process.env.REACT_APP_API_URL}/loja/relatorio-clientes-consultor/${encodeURIComponent(user)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = resp.data || {};
      setClientes(Array.isArray(data.clientes) ? data.clientes : []);
      setSomaFaturamento(typeof data.soma_faturamento_consultor === 'number' ? data.soma_faturamento_consultor : 0);
      setTotalClientes(typeof data.total_clientes_consultor === 'number' ? data.total_clientes_consultor : (Array.isArray(data.clientes) ? data.clientes.length : 0));
    } catch (err) {
      console.error('Erro ao carregar relatório do consultor:', err);
      alert('Erro ao carregar relatório do consultor');
    } finally {
      setLoadingReport(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser) fetchReportForUser(selectedUser);
  }, [selectedUser, fetchReportForUser]);

  const columns: GridColDef[] = React.useMemo(() => [
    { field: 'razao_social', headerName: 'Razão Social', flex: 2, minWidth: 220 },
    {
      field: 'valor_fatura_cliente',
      headerName: 'Valor Fatura',
      flex: 0.8,
      minWidth: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => (params.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
    { field: 'data_reajuste_financeiro', headerName: 'Data Reajuste', flex: 0.8, minWidth: 140, renderCell: (p: GridRenderCellParams) => (p.value ? new Date(p.value as string).toLocaleDateString('pt-BR') : '-') },
    { field: 'vencimento_fatura_1', headerName: 'Vencimento 1', flex: 0.4, minWidth: 120 },
    { field: 'vencimento_fatura_2', headerName: 'Vencimento 2', flex: 0.4, minWidth: 120 }
  ], []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Relatório de Faturamento por Consultor</Typography>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <FormControl sx={{ minWidth: 260 }} size="small">
          <InputLabel id="select-consultor-label">Consultor</InputLabel>
          <Select
            labelId="select-consultor-label"
            value={selectedUser}
            label="Consultor"
            onChange={(e) => setSelectedUser(e.target.value as string)}
          >
            <MenuItem value="">-- Selecione --</MenuItem>
            {loadingUsers ? (
              <MenuItem disabled>Carregando...</MenuItem>
            ) : (
              users.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)
            )}
          </Select>
        </FormControl>

        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" color="text.secondary">Total Clientes</Typography>
          <Typography variant="h6" fontWeight="bold">{loadingReport ? <CircularProgress size={18} /> : totalClientes}</Typography>
        </Paper>

        <Paper sx={{ p: 2, minWidth: 220 }}>
          <Typography variant="subtitle2" color="text.secondary">Soma Faturamento</Typography>
          <Typography variant="h6" fontWeight="bold">{loadingReport ? <CircularProgress size={18} /> : somaFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ height: 600 }}>
        {loadingReport ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : (
          <DataGrid
            rows={(clientes || []).map((c, i) => ({ id: i, ...c }))}
            columns={columns}
            pageSizeOptions={[10,25,50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
          />
        )}
      </Paper>
    </Container>
  );
};

export default RelatorioGeralFaturamentoConsultor;
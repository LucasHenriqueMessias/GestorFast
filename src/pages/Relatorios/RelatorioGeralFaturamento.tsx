import React, { useEffect, useState, useCallback } from 'react';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';

interface Cliente {
  razao_social: string;
  consultor_financeiro: string;
  valor_fatura_cliente: number;
  data_reajuste_financeiro?: string | null;
  vencimento_fatura_1?: number | null;
  vencimento_fatura_2?: number | null;
}

const RelatorioGeralFaturamento = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [somaFaturamento, setSomaFaturamento] = useState<number>(0);
  const [totalClientes, setTotalClientes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchRelatorio = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      const resp = await axios.get(`${process.env.REACT_APP_API_URL}/loja/relatorio-clientes-faturamento-fast`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = resp.data || {};
      setClientes(Array.isArray(data.clientes) ? data.clientes : []);
      setSomaFaturamento(typeof data.soma_faturamento_fast === 'number' ? data.soma_faturamento_fast : 0);
      setTotalClientes(typeof data.total_clientes_fast === 'number' ? data.total_clientes_fast : (Array.isArray(data.clientes) ? data.clientes.length : 0));
    } catch (err) {
      console.error('Erro ao buscar relatório de faturamento:', err);
      alert('Erro ao carregar o relatório de faturamento');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRelatorio();
  }, [fetchRelatorio]);

  const columns: GridColDef[] = React.useMemo(() => [
    { field: 'razao_social', headerName: 'Razão Social', flex: 2, minWidth: 250 },
    { field: 'consultor_financeiro', headerName: 'Consultor Financeiro', flex: 1, minWidth: 160 },
    {
      field: 'valor_fatura_cliente',
      headerName: 'Valor Fatura',
      flex: 0.8,
      minWidth: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) =>
        (params.value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
    {
      field: 'data_reajuste_financeiro',
      headerName: 'Data Reajuste',
      flex: 0.8,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => (
        params.value ? new Date(params.value as string).toLocaleDateString('pt-BR') : '-'
      )
    },
    { field: 'vencimento_fatura_1', headerName: 'Vencimento 1', flex: 0.4, minWidth: 120 },
    { field: 'vencimento_fatura_2', headerName: 'Vencimento 2', flex: 0.4, minWidth: 120 }
  ], []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Relatório Geral de Faturamento </Typography>

      <Box sx={{ display: 'flex', gap: 3, mb: 2, alignItems: 'center' }}>
        <Paper sx={{ p: 2, minWidth: 220 }}>
          <Typography variant="subtitle2" color="text.secondary">Total de Clientes</Typography>
          <Typography variant="h5" fontWeight="bold">{loading ? <CircularProgress size={20} /> : totalClientes}</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 220 }}>
          <Typography variant="subtitle2" color="text.secondary">Soma Faturamento</Typography>
          <Typography variant="h5" fontWeight="bold">{loading ? <CircularProgress size={20} /> : somaFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Typography>
        </Paper>
      </Box>

      <Paper sx={{ height: 600 }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={(clientes || []).map((c, i) => ({ id: i, ...c }))}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
          />
        )}
      </Paper>
    </Container>
  );
};

export default RelatorioGeralFaturamento;
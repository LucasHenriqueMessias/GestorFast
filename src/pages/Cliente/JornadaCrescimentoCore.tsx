import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef, GridRowModesModel, GridRowModes, GridRowParams, MuiEvent, GridActionsCellItem, GridRenderEditCellParams } from '@mui/x-data-grid';
import { Container, Typography, Button, TextField, Modal, Box, Autocomplete } from '@mui/material';
import axios from 'axios';
import { getAccessToken, getUsername, getDepartment } from '../../utils/storage';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';

interface coreData {
  id: number;
  cliente: string;
  colaborador: string;
  departamento: string;
  data_criacao: string;
  maquina_cartao: number;
  emprestimos_financiamentos: number;
  telefonia: number;
  contabilidade: number;
  taxas_bancarias: number;
  taxas_administrativas: number;
  core: boolean;
}

interface Cliente {
  razao_social: string;
}

const formatDatePtBr = (value: unknown) => {
  if (!value) {
    return '';
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toLocaleDateString('pt-BR');
  }

  const raw = String(value);

  if (!raw) {
    return '';
  }

  if (raw.includes('/')) {
    return raw;
  }

  const isoLike = raw.includes('T') ? raw : `${raw}T00:00:00`;
  const parsed = new Date(isoLike);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('pt-BR');
  }

  return raw;
};

const JornadaCrescimentoCore = () => {
  const [coreData, setcoreData] = useState<coreData[]>([]);
  const [filteredData, setFilteredData] = useState<coreData[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filterCliente, setFilterCliente] = useState(''); // Estado para o filtro de cliente
  const [open, setOpen] = useState(false);
  const [newRow, setNewRow] = useState({
    cliente: '',
    colaborador: getUsername() || '',
    departamento: getDepartment() || '',
    core: true,
    maquina_cartao: 0,
    emprestimos_financiamentos: 0,
    telefonia: 0,
    contabilidade: 0,
    taxas_bancarias: 0,
    taxas_administrativas: 0,
  });
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const apiUrl = process.env.REACT_APP_API_URL;

  // Opções para os selects com descrições
  const getScoreOptions = () => [
    { value: 0, label: "0 - Não Se aplica: O tema não é pertinente à realidade do cliente" },
    { value: 1, label: "1 - Tema Não Tratado: O consultor ainda não iniciou qualquer abordagem" },
    { value: 2, label: "2 - Tema identificado: Identificado como relevante, mas sem ações concretas" },
    { value: 3, label: "3 - Tema em andamento: Ações iniciadas, mas sem implementação perceptível" },
    { value: 4, label: "4 - Tema Tratado Parcialmente: Houve implementação, mas resultados iniciais" },
    { value: 5, label: "5 - Tema tratado com excelência: Mudança concreta e resultados significativos" }
  ];

  const SelectEditCell = (props: GridRenderEditCellParams) => (
    <TextField select value={props.value ?? 0} onChange={e => props.api.setEditCellValue({ id: props.id, field: props.field, value: Number(e.target.value) }, e)} size="small" fullWidth>
      {getScoreOptions().map(option => (
        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
      ))}
    </TextField>
  );

  const columns: GridColDef[] = [
    {
      field: 'data_criacao',
      headerName: 'Data',
      width: 180,
      valueFormatter: ({ value }) => formatDatePtBr(value),
      renderCell: ({ row }) => <>{formatDatePtBr((row as coreData)?.data_criacao)}</>,
    },
    { field: 'cliente', headerName: 'Cliente', width: 150, editable: true },
    { field: 'colaborador', headerName: 'Consultor', width: 150, editable: false },
    { field: 'departamento', headerName: 'Departamento', width: 150, editable: false },
    { field: 'maquina_cartao', headerName: 'Máquina de Cartão', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'emprestimos_financiamentos', headerName: 'Empréstimos/Financiamentos', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'telefonia', headerName: 'Telefonia', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'contabilidade', headerName: 'Contabilidade', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'taxas_bancarias', headerName: 'Taxas Bancárias', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'taxas_administrativas', headerName: 'Taxas Administrativas', width: 150, editable: true, renderEditCell: SelectEditCell },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem icon={<EditIcon />} label="Editar" onClick={handleEditClick(params.id as number)} />
      ],
    },
  ];

  const fetchData = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${apiUrl}/tab-roi/core`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const dataWithCore = response.data.map((item: coreData) => ({
        ...item,
        core: true,
      }));
      setcoreData(dataWithCore);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }, [apiUrl]);

  const fetchClientes = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${apiUrl}/loja/razaosocial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Buscar clientes quando o modal for aberto
  useEffect(() => {
    if (open) {
      fetchClientes();
      setNewRow((prev) => ({
        ...prev,
        colaborador: getUsername() || '',
        departamento: getDepartment() || '',
        core: true, // Garante que o novo registro seja marcado como core
      }));
    }
  }, [open, fetchClientes]);

  useEffect(() => {
    // Filtrar os dados conforme o valor digitado no campo de filtro
    if (filterCliente) {
      setFilteredData(
        coreData.filter((row) =>
          row.colaborador.toLowerCase().includes(filterCliente.toLowerCase())
        )
      );
    } else {
      setFilteredData(coreData); // Restaurar todos os dados quando o filtro estiver vazio
    }
  }, [filterCliente, coreData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRow({ ...newRow, [e.target.name]: e.target.value });
  };

  const handleClienteChange = (event: any, newValue: string | null) => {
    setNewRow({ ...newRow, cliente: newValue || '' });
  };

  const handleAdd = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.post(`${apiUrl}/tab-roi`, newRow, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setcoreData((prev) => [...prev, response.data]);
      setOpen(false);
      setNewRow({
        cliente: '',
        colaborador: getUsername() || '',
        departamento: getDepartment() || '',
        core: true,
        maquina_cartao: 0,
        emprestimos_financiamentos: 0,
        telefonia: 0,
        contabilidade: 0,
        taxas_bancarias: 0,
        taxas_administrativas: 0,
      });
    } catch (error) {
      alert('Erro ao adicionar registro!');
    }
  };

  const handleRowEditStart = (params: GridRowParams, event: MuiEvent) => {
    event.defaultMuiPrevented = true;
  };
  const handleRowEditStop = (params: GridRowParams, event: MuiEvent) => {
    event.defaultMuiPrevented = true;
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [params.id]: { mode: GridRowModes.View },
    }));
  };
  const processRowUpdate = async (newRow: coreData, oldRow: coreData) => {
    try {
      const token = getAccessToken();
      const response = await axios.patch(`${apiUrl}/tab-roi/${newRow.id}`, newRow, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setcoreData((prev: coreData[]) => prev.map((row) => (row.id === newRow.id ? response.data : row)));
      setFilteredData((prev: coreData[]) => prev.map((row) => (row.id === newRow.id ? response.data : row)));
      return response.data;
    } catch (error) {
      console.error('Erro ao editar registro:', error);
      return oldRow;
    }
  };
  const handleEditClick = (id: number) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  const handleRowModesModelChange = (newModel: GridRowModesModel) => {
    setRowModesModel(newModel);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Jornada de Crescimento Core
      </Typography>
      <br />
      <TextField
        margin="normal"
        label="Filtrar por Colaborador"
        variant="outlined"
        fullWidth
        value={filterCliente}
        onChange={(e) => setFilterCliente(e.target.value)} // Atualiza o estado do filtro
      />
      <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
        Adicionar Registro
      </Button>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          p: { xs: 2, sm: 4 },
          background: '#fff',
          margin: '10vh auto',
          width: { xs: '90vw', sm: 400 },
          maxWidth: 500,
          borderRadius: 2,
          boxShadow: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'relative',
        }}>
          <Autocomplete
            freeSolo
            options={clientes.map((cliente) => cliente.razao_social)}
            value={newRow.cliente}
            onChange={handleClienteChange}
            onInputChange={(event, newInputValue) => {
              setNewRow({ ...newRow, cliente: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                fullWidth
                size="small"
                placeholder="Digite ou selecione um cliente"
              />
            )}
          />
          <TextField select label="Máquina de Cartão" name="maquina_cartao" value={newRow.maquina_cartao} onChange={handleChange} fullWidth size="small">
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Empréstimos/Financiamentos" name="emprestimos_financiamentos" value={newRow.emprestimos_financiamentos} onChange={handleChange} fullWidth size="small">
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Telefonia" name="telefonia" value={newRow.telefonia} onChange={handleChange} fullWidth size="small">
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Contabilidade" name="contabilidade" value={newRow.contabilidade} onChange={handleChange} fullWidth size="small">
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Taxas Bancárias" name="taxas_bancarias" value={newRow.taxas_bancarias} onChange={handleChange} fullWidth size="small">
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Taxas Administrativas" name="taxas_administrativas" value={newRow.taxas_administrativas} onChange={handleChange} fullWidth size="small">
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" color="primary" onClick={handleAdd} sx={{ mt: 2 }}>Salvar</Button>
        </Box>
      </Modal>
      <div style={{ height: 400, width: '100%', marginTop: 20 }}>
        <DataGrid
          rows={filteredData}
          columns={columns}
          autoPageSize
          editMode="row"
          rowModesModel={rowModesModel}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onRowModesModelChange={handleRowModesModelChange}
        />
      </div>
    </Container>
  );
}

export default JornadaCrescimentoCore;
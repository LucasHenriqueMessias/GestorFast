import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef, GridRowModesModel, GridRowModes, GridRowParams, MuiEvent, GridActionsCellItem, GridRenderEditCellParams } from '@mui/x-data-grid';
import { Container, Typography, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Autocomplete } from '@mui/material';
import axios from 'axios';
import { getAccessToken, getDepartment, getUsername } from '../../utils/storage';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';

interface OverDeliveryData {
  id: number;
  cliente: string;
  colaborador: string;
  departamento: string;
  data_criacao: string;
  investimentos: number;
  ferias: number;
  cultura_empresarial: number;
  ecossistema_fast: number;
  carta_valores: number;
  organograma: number;
  manuais: number;
  mips: number;
  codigo_cultura: number;
  overdelivery: boolean;
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

const JornadaCrescimentoOverDelivery = () => {
  const [OverDeliveryData, setOverDeliveryData] = useState<OverDeliveryData[]>([]);
  const [filteredData, setFilteredData] = useState<OverDeliveryData[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filterUsuario, setFilterUsuario] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newRow, setNewRow] = useState<OverDeliveryData>({
    id: 0,
    cliente: '',
    colaborador: '',
    departamento: '',
    data_criacao: new Date().toISOString(),
    investimentos: 0,
    ferias: 0,
    cultura_empresarial: 0,
    ecossistema_fast: 0,
    carta_valores: 0,
    organograma: 0,
    manuais: 0,
    mips: 0,
    codigo_cultura: 0,
    overdelivery: true,
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

  const fetchData = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${apiUrl}/tab-roi/overdelivery`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    setOverDeliveryData(response.data);
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

  useEffect(() => {
    if (filterUsuario) {
      setFilteredData(
        OverDeliveryData.filter((row) =>
          row.colaborador.toLowerCase().includes(filterUsuario.toLowerCase())
        )
      );
    } else {
      setFilteredData(OverDeliveryData);
    }
  }, [filterUsuario, OverDeliveryData]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    fetchClientes(); // Buscar clientes ao abrir o formulário
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewRow({
      id: 0,
      cliente: '',
      colaborador: '',
      departamento: '',
      data_criacao: new Date().toISOString(),
      investimentos: 0,
      ferias: 0,
      cultura_empresarial: 0,
      ecossistema_fast: 0,
      carta_valores: 0,
      organograma: 0,
      manuais: 0,
      mips: 0,
      codigo_cultura: 0,
      overdelivery: true,
    });
  };

  const handleSave = async () => {
    try {
      const token = getAccessToken();

      console.log(newRow)

      newRow.colaborador = getUsername() ?? '';
      newRow.departamento = getDepartment() ?? '' // Adiciona o colaborador ao novo registro com fallback para string vazia
      newRow.overdelivery = true; // Define o valor de overdelivery como true
      const response = await axios.post(`${apiUrl}/tab-roi`, newRow, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      setOverDeliveryData((prevData) => [...prevData, response.data]);
      setFilteredData((prevData) => [...prevData, response.data]);
      handleCloseDialog();
      alert('Registro salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar o registro:', error);
      alert('Erro ao salvar o registro.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRow((prevRow) => ({
      ...prevRow,
      [name]: name === 'investimentos' || name === 'ferias' || name === 'cultura_empresarial' ? Number(value) : value,
    }));
  };

  const handleClienteChange = (event: any, newValue: string | null) => {
    setNewRow((prevRow) => ({
      ...prevRow,
      cliente: newValue || '',
    }));
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
  const processRowUpdate = async (newRow: OverDeliveryData, oldRow: OverDeliveryData) => {
    try {
      const token = getAccessToken();
      const response = await axios.patch(`${apiUrl}/tab-roi/${newRow.id}`, newRow, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverDeliveryData((prev: OverDeliveryData[]) => prev.map((row) => (row.id === newRow.id ? response.data : row)));
      setFilteredData((prev: OverDeliveryData[]) => prev.map((row) => (row.id === newRow.id ? response.data : row)));
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

  // SelectEditCell precisa ser declarado antes do array columns para evitar erro de hoisting
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
      renderCell: ({ row }) => <>{formatDatePtBr((row as OverDeliveryData)?.data_criacao)}</>,
    },
    { field: 'cliente', headerName: 'Cliente', width: 150, editable: true },
    { field: 'colaborador', headerName: 'Colaborador', width: 150, editable: false },
    { field: 'departamento', headerName: 'Departamento', width: 150, editable: false },
    { field: 'investimentos', headerName: 'Investimentos', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'ferias', headerName: 'Férias', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'ecossistema_fast', headerName: 'Ecossistema Fast', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'carta_valores', headerName: 'Carta de Valores', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'cultura_empresarial', headerName: 'Cultura Empresarial', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'organograma', headerName: 'Organograma', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'manuais', headerName: 'Manuais', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'mips', headerName: 'MIPS', width: 150, editable: true, renderEditCell: SelectEditCell },
    { field: 'codigo_cultura', headerName: 'Código de Cultura', width: 150, editable: true, renderEditCell: SelectEditCell },
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

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Jornada de Crescimento OverDelivery
      </Typography>
      <TextField
        margin="normal"
        label="Filtrar por Usuário"
        variant="outlined"
        fullWidth
        value={filterUsuario}
        onChange={(e) => setFilterUsuario(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleOpenDialog}>
        Adicionar Registro
      </Button>
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Adicionar Registro</DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={clientes.map((cliente) => cliente.razao_social)}
            value={newRow.cliente}
            onChange={handleClienteChange}
            onInputChange={(event, newInputValue) => {
              setNewRow((prevRow) => ({
                ...prevRow,
                cliente: newInputValue,
              }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Cliente"
                fullWidth
                placeholder="Digite ou selecione um cliente"
              />
            )}
          />
          <TextField
            select
            margin="dense"
            label="Investimentos"
            name="investimentos"
            fullWidth
            value={newRow.investimentos}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Férias"
            name="ferias"
            fullWidth
            value={newRow.ferias}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Cultura Empresarial"
            name="cultura_empresarial"
            fullWidth
            value={newRow.cultura_empresarial}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Ecossistema Fast"
            name="ecossistema_fast"
            fullWidth
            value={newRow.ecossistema_fast}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Carta de Valores"
            name="carta_valores"
            fullWidth
            value={newRow.carta_valores}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Organograma"
            name="organograma"
            fullWidth
            value={newRow.organograma}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Manuais"
            name="manuais"
            fullWidth
            value={newRow.manuais}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="MIPS"
            name="mips"
            fullWidth
            value={newRow.mips}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            margin="dense"
            label="Código de Cultura"
            name="codigo_cultura"
            fullWidth
            value={newRow.codigo_cultura}
            onChange={handleInputChange}
          >
            {getScoreOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSave} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JornadaCrescimentoOverDelivery;
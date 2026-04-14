import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridEventListener, GridRowModesModel, GridRowModes, GridRowParams, MuiEvent, GridActionsCellItem, GridRenderEditCellParams, GridRowEditStopReasons, GridRowEditStopParams } from '@mui/x-data-grid';
import { Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Autocomplete, Box } from '@mui/material';
import axios from 'axios';
import { getAccessToken, getDepartment, getUsername } from '../../utils/storage';
import EditIcon from '@mui/icons-material/Edit';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


interface Reuniao {
  id: number;
  user: string;
  cliente: string;
  status: string;
  tipo_reuniao: string;
  local_reuniao: string;
  Ata_reuniao: string;
  data_realizada: string;
  nps_reuniao: string | number;
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

  // Avoid timezone shift by formatting the date-only portion directly.
  const datePart = raw.split('T')[0];
  const ymdMatch = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  return raw;
};

const toDateInputValue = (value: unknown) => {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value.includes('T') ? value.split('T')[0] : value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return '';
};

const RegistroDeReunioes = () => {
  const navigate = useNavigate();
  const [reuniaoData, setReuniaoData] = useState<Reuniao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingReuniaoId, setEditingReuniaoId] = useState<number | null>(null);
  const [clienteInputValue, setClienteInputValue] = useState('');
  const [newRecord, setNewRecord] = useState({
    user: '',
    cliente: '',
    status: '',
    tipo_reuniao: '',
    local_reuniao: '',
    Ata_reuniao: '',
    data_realizada: '',
    nps_reuniao: '',
  });
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});

  const blurActiveElement = () => {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
  };

  const TipoReuniaoEditCell = (props: GridRenderEditCellParams) => {
    return (
      <TextField
        select
        value={props.value || ''}
        onChange={(e) => props.api.setEditCellValue({ id: props.id, field: props.field, value: e.target.value }, e)}
        fullWidth
        size="small"
      >
        {getDepartment() === 'Analista' ? (
          <>
            <MenuItem value="Reunião de Atendimento">Reunião de Atendimento</MenuItem>
            <MenuItem value="Treinamento de Fluxo de Caixa">Treinamento de Fluxo de Caixa</MenuItem>
            <MenuItem value="Apresentação de análise financeira">Apresentação de análise financeira</MenuItem>
            <MenuItem value="Reunião estratégica Analista x Consultor">Reunião estratégica Analista x Consultor</MenuItem>
          </>
        ) : (
          <>
            <MenuItem value="RD">RD</MenuItem>
            <MenuItem value="RE">RE</MenuItem>
            <MenuItem value="RC">RC</MenuItem>
            <MenuItem value="RI">RI</MenuItem>
            <MenuItem value="RP">RP</MenuItem>
            <MenuItem value="RAE">RAE</MenuItem>
            <MenuItem value="RA">RA</MenuItem>
          </>
        )}
      </TextField>
    );
  };

  const columns: GridColDef[] = [
    { field: 'user', headerName: 'Colaborador', width: 150, editable: true },
    { field: 'cliente', headerName: 'Cliente', width: 150, editable: true },
    { field: 'status', headerName: 'Status', width: 150, editable: true },
    {
      field: 'tipo_reuniao',
      headerName: 'Tipo de Reunião',
      width: 150,
      editable: true,
      renderEditCell: (params) => <TipoReuniaoEditCell {...params} />,
    },
    { field: 'local_reuniao', headerName: 'Local da Reunião', width: 150, editable: true },
    {
      field: 'Ata_reuniao',
      headerName: 'Ata da Reunião',
      width: 200,
      editable: true,
      renderCell: (params) => (
        <span style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
          {params.value}
        </span>
      ),
    },
    {
      field: 'data_realizada',
      headerName: 'Data Realizada',
      width: 150,
      editable: true,
      valueFormatter: ({ value }) => formatDatePtBr(value),
      renderCell: ({ row }) => <>{formatDatePtBr((row as Reuniao)?.data_realizada)}</>,
    },
    { field: 'nps_reuniao', headerName: 'NPS', width: 150, type: 'number', editable: true },
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = getAccessToken();
      const department = getDepartment();
      const username = getUsername();

      let endpoint = `${process.env.REACT_APP_API_URL}/tab-reuniao`;

      if (department === 'Consultor' || department === 'CS' || department === 'Analista') {
        if (!username) {
          setReuniaoData([]);
          return;
        }
        endpoint = `${process.env.REACT_APP_API_URL}/tab-reuniao/consultor/${username}`;
      } else if (department === 'Diretor' || department === 'Developer' || department === 'Gestor' ) {
        endpoint = `${process.env.REACT_APP_API_URL}/tab-reuniao`;
      }

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReuniaoData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

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

  const handleClickOpen = () => {
    setDialogMode('create');
    setEditingReuniaoId(null);
    setClienteInputValue('');
    setNewRecord({
      user: '',
      cliente: '',
      status: '',
      tipo_reuniao: '',
      local_reuniao: '',
      Ata_reuniao: '',
      data_realizada: '',
      nps_reuniao: '',
    });
    setOpen(true);
    fetchClientes(); // Buscar clientes ao abrir o formulário
  };

  const handleEditOpen = (reuniao: Reuniao) => {
    setDialogMode('edit');
    setEditingReuniaoId(reuniao.id);
    setClienteInputValue(reuniao.cliente || '');
    setNewRecord({
      user: reuniao.user || '',
      cliente: reuniao.cliente || '',
      status: reuniao.status || '',
      tipo_reuniao: reuniao.tipo_reuniao || '',
      local_reuniao: reuniao.local_reuniao || '',
      Ata_reuniao: reuniao.Ata_reuniao || '',
      data_realizada: toDateInputValue(reuniao.data_realizada),
      nps_reuniao: reuniao.nps_reuniao !== null && reuniao.nps_reuniao !== undefined ? String(reuniao.nps_reuniao) : '',
    });
    setOpen(true);
    fetchClientes();
  };

  const handleClose = () => {
    blurActiveElement();
    setOpen(false);
    setClienteInputValue('');
    setDialogMode('create');
    setEditingReuniaoId(null);
    // Limpar o formulário ao fechar (importante limpar cliente primeiro para desabilitar campos)
    setNewRecord({
      user: '',
      cliente: '',
      status: '',
      tipo_reuniao: '',
      local_reuniao: '',
      Ata_reuniao: '',
      data_realizada: '',
      nps_reuniao: '',
    });
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({ ...prev, [name]: value }));
  };

  const handleFieldSelectChange = (field: 'status' | 'tipo_reuniao') => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setNewRecord((prev) => ({ ...prev, [field]: value }));
  };

  const handleClienteChange = (event: React.SyntheticEvent, newValue: string | null) => {
    const cliente = newValue || '';
    setClienteInputValue(cliente);
    setNewRecord((prev) => ({ ...prev, cliente }));
  };

  const handleSubmit = async () => {
    try {
      const token = getAccessToken();
      const normalizedNps = newRecord.nps_reuniao === '' ? 0 : Number(newRecord.nps_reuniao);
      const payload = {
        ...newRecord,
        user: getUsername() ?? '',
        nps_reuniao: Number.isNaN(normalizedNps) ? 0 : normalizedNps,
        data_realizada: newRecord.data_realizada ? newRecord.data_realizada : '',
      };

      if (dialogMode === 'edit' && editingReuniaoId !== null) {
        await axios.patch(`${process.env.REACT_APP_API_URL}/tab-reuniao/${editingReuniaoId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/tab-reuniao`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      fetchData();
      blurActiveElement();
      handleClose();
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
      if (axios.isAxiosError(error)) {
        console.error('Resposta da API:', error.response?.data);
      }
    }
  };

  const handleCellDoubleClick: GridEventListener<'cellDoubleClick'> = (params) => {
    if (params.field === 'Ata_reuniao' && params.value) {
      const url = typeof params.value === 'string' && params.value.startsWith('http') 
        ? params.value 
        : `https://${params.value}`;
      window.open(url, '_blank');
    }
  };

  const handleRowEditStart = (params: GridRowParams, event: MuiEvent) => {
    event.defaultMuiPrevented = true;
  };
  const handleRowEditStop = (params: GridRowEditStopParams, event: MuiEvent) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
      return;
    }

    event.defaultMuiPrevented = true;
    // Salva a linha editada ao sair do modo edição.
    setRowModesModel((prevModel) => ({
      ...prevModel,
      [params.id]: { mode: GridRowModes.View },
    }));
  };
  const processRowUpdate = async (newRow: Reuniao, oldRow: Reuniao) => {
    try {
      const token = getAccessToken();
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/tab-reuniao/${newRow.id}`, newRow, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Atualiza o estado local para refletir a alteração imediatamente
      setReuniaoData((prev: Reuniao[]) => prev.map((row) => (row.id === newRow.id ? response.data : row)));
      return response.data;
    } catch (error) {
      console.error('Erro ao editar registro:', error);
      return oldRow;
    }
  };
  const handleEditClick = (id: number) => () => {
    const reuniao = reuniaoData.find((row) => row.id === id);
    if (!reuniao) {
      return;
    }

    handleEditOpen(reuniao);
  };
  const handleRowModesModelChange = (newModel: GridRowModesModel) => {
    setRowModesModel(newModel);
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          onClick={() => navigate(-1)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: '#1E3A8A',
            color: 'white',
            borderRadius: 2,
            fontSize: '0.9rem',
            fontWeight: 'bold',
            px: 2,
            py: 1,
            '&:hover': {
              backgroundColor: '#1D4ED8',
            },
          }}
        >
          <ArrowBack />
          Voltar
        </Button>
        <Typography variant="h4" sx={{ margin: 0 }}>
          Registros de Reuniões
        </Typography>
      </Box>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Adicionar Registro
      </Button>
      <div style={{ height: 400, width: '100%', marginTop: 20 }}>
        <DataGrid
          rows={reuniaoData}
          columns={columns}
          autoPageSize
          onCellDoubleClick={handleCellDoubleClick}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowEditStart={handleRowEditStart}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          onRowModesModelChange={handleRowModesModelChange}
        />
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{dialogMode === 'edit' ? 'Editar Registro' : 'Adicionar Novo Registro'}</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={clientes.map((cliente) => cliente.razao_social)}
            value={newRecord.cliente || null}
            inputValue={clienteInputValue}
            onChange={handleClienteChange}
            onInputChange={(_, newInputValue) => setClienteInputValue(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cliente"
                margin="dense"
                fullWidth
                placeholder="Digite para buscar um cliente..."
              />
            )}
            freeSolo
            filterOptions={(options, params) => {
              const filtered = options.filter((option) =>
                option.toLowerCase().includes(params.inputValue.toLowerCase())
              );
              return filtered;
            }}
          />
          <TextField
            select
            fullWidth
            margin="dense"
            label="Status"
            value={newRecord.status}
            onChange={handleFieldSelectChange('status')}
            disabled={!newRecord.cliente}
            SelectProps={{ native: true }}
          >
            <option value="" />
            <option value="Pendente">Pendente</option>
            <option value="Realizado">Realizado</option>
            <option value="NA">Não Aplicável</option>
          </TextField>
          <TextField
            select
            fullWidth
            margin="dense"
            label="Tipo de Reunião"
            value={newRecord.tipo_reuniao}
            onChange={handleFieldSelectChange('tipo_reuniao')}
            disabled={!newRecord.cliente}
            SelectProps={{ native: true }}
          >
            <option value="" />
            {getDepartment() === 'Analista' ? (
              <>
                <option value="Reunião de Atendimento">Reunião de Atendimento</option>
                <option value="Treinamento de Fluxo de Caixa">Treinamento de Fluxo de Caixa</option>
                <option value="Apresentação de análise financeira">Apresentação de análise financeira</option>
                <option value="Reunião estratégica Analista x Consultor">Reunião estratégica Analista x Consultor</option>
              </>
            ) : (
              <>
                <option value="RD">RD</option>
                <option value="RE">RE</option>
                <option value="RC">RC</option>
                <option value="RI">RI</option>
                <option value="RP">RP</option>
                <option value="RAE">RAE</option>
                <option value="RA">RA</option>
              </>
            )}
          </TextField>
          <TextField
            margin="dense"
            name="local_reuniao"
            label="Local da Reunião"
            type="text"
            fullWidth
            value={newRecord.local_reuniao}
            onChange={handleTextFieldChange}
            disabled={!newRecord.cliente}
          />
          <TextField
            margin="dense"
            name="Ata_reuniao"
            label="Ata da Reunião"
            type="text"
            fullWidth
            value={newRecord.Ata_reuniao}
            onChange={handleTextFieldChange}
            disabled={!newRecord.cliente}
          />
          <TextField
            margin="dense"
            name="data_realizada"
            label="Data Realizada"
            type="date"
            fullWidth
            value={newRecord.data_realizada}
            onChange={handleTextFieldChange}
            disabled={!newRecord.cliente}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            margin="dense"
            name="nps_reuniao"
            label="NPS"
            type="number"
            fullWidth
            value={newRecord.nps_reuniao}
            onChange={handleTextFieldChange}
            disabled={!newRecord.cliente}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {dialogMode === 'edit' ? 'Salvar' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistroDeReunioes
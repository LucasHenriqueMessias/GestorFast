import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridEventListener,  GridRowModesModel, GridRowModes, GridRowParams, MuiEvent, GridActionsCellItem, GridRenderEditCellParams } from '@mui/x-data-grid';
import { Container, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, SelectChangeEvent, Autocomplete } from '@mui/material';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';
import EditIcon from '@mui/icons-material/Edit';


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

const RegistroDeReunioes = () => {
  const [reuniaoData, setReuniaoData] = useState<Reuniao[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [open, setOpen] = useState(false);
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

  const TipoReuniaoEditCell = (props: GridRenderEditCellParams) => {
    return (
      <Select
        value={props.value || ''}
        onChange={(e) => props.api.setEditCellValue({ id: props.id, field: props.field, value: e.target.value }, e)}
        fullWidth
        size="small"
      >
        <MenuItem value="RD">RD</MenuItem>
        <MenuItem value="RE">RE</MenuItem>
        <MenuItem value="RC">RC</MenuItem>
        <MenuItem value="RI">RI</MenuItem>
        <MenuItem value="RP">RP</MenuItem>
        <MenuItem value="RAE">RAE</MenuItem>
        <MenuItem value="RA">RA</MenuItem>
      </Select>
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
    { field: 'data_realizada', headerName: 'Data Realizada', width: 150, editable: true },
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
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-reuniao`, {
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
    setOpen(true);
    fetchClientes(); // Buscar clientes ao abrir o formulário
  };

  const handleClose = () => {
    setOpen(false);
    // Limpar o formulário ao fechar
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
    setNewRecord({ ...newRecord, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewRecord({ ...newRecord, [name]: value });
  };

  const handleAutocompleteChange = (event: any, newValue: string | null) => {
    setNewRecord({ ...newRecord, cliente: newValue || '' });
  };

  const handleSubmit = async () => {
    try {
      const token = getAccessToken();

      newRecord.user = getUsername() ?? '';
      await axios.post(`${process.env.REACT_APP_API_URL}/tab-reuniao`, newRecord, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Erro ao adicionar registro:', error);
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
  const handleRowEditStop = (params: GridRowParams, event: MuiEvent) => {
    event.defaultMuiPrevented = true;
    // Salva a linha editada ao sair do modo edição
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
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  const handleRowModesModelChange = (newModel: GridRowModesModel) => {
    setRowModesModel(newModel);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Registros de Reuniões
      </Typography>
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
        <DialogTitle>Adicionar Novo Registro</DialogTitle>
        <DialogContent>
          <Autocomplete
            freeSolo
            options={clientes.map((cliente) => cliente.razao_social)}
            value={newRecord.cliente}
            onChange={handleAutocompleteChange}
            onInputChange={(event, newInputValue) => {
              setNewRecord({ ...newRecord, cliente: newInputValue });
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
          <Select
            margin="dense"
            name="status"
            value={newRecord.status}
            onChange={handleSelectChange}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Status
            </MenuItem>
            <MenuItem value="Pendente">Pendente</MenuItem>
            <MenuItem value="Realizado">Realizado</MenuItem>
            <MenuItem value="NA">Não Aplicável</MenuItem>
          </Select>
          <Select
            margin="dense"
            name="tipo_reuniao"
            value={newRecord.tipo_reuniao}
            onChange={handleSelectChange}
            fullWidth
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecione o Tipo de Reunião
            </MenuItem>
            <MenuItem value="RD">RD</MenuItem>
            <MenuItem value="RE">RE</MenuItem>
            <MenuItem value="RC">RC</MenuItem>
            <MenuItem value="RI">RI</MenuItem>
            <MenuItem value="RP">RP</MenuItem>
            <MenuItem value="RAE">RAE</MenuItem>
            <MenuItem value="RA">RA</MenuItem>
          </Select>
          <TextField
            margin="dense"
            name="local_reuniao"
            label="Local da Reunião"
            type="text"
            fullWidth
            value={newRecord.local_reuniao}
            onChange={handleTextFieldChange}
          />
          <TextField
            margin="dense"
            name="Ata_reuniao"
            label="Ata da Reunião"
            type="text"
            fullWidth
            value={newRecord.Ata_reuniao}
            onChange={handleTextFieldChange}
          />
          <TextField
            margin="dense"
            name="data_realizada"
            label="Data Realizada"
            type="date"
            fullWidth
            value={newRecord.data_realizada}
            onChange={handleTextFieldChange}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RegistroDeReunioes
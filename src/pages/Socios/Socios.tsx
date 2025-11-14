import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, IconButton, Autocomplete } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { getAccessToken } from '../../utils/storage';

interface SocioData {
  id: number;
  razao_social: string;
  nome_socio: string;
  idade: number;
  cnpj_cpf_do_socio: string;
  telefone: string;
  data_nascimento: string;
  data_entrada_sociedade: string;
  formacao: string;
  disc: string;
  sedirp: string;
  eneagrama: string;
  hobbies: string;
  relatorio_prospeccao: string;
  opcao_pelo_mei: boolean;
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

const Socios = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clientes, setClientes] = useState<string[]>([]);
  const [newSocio, setNewSocio] = useState<SocioData>({
    id: 0,
    razao_social: '',
    nome_socio: '',
    idade: 0,
    cnpj_cpf_do_socio: '',
    telefone: '',
    data_nascimento: new Date().toISOString(),
    data_entrada_sociedade: new Date().toISOString(),
    formacao: '',
    disc: '',
    sedirp: '',
    eneagrama: '',
    hobbies: '',
    relatorio_prospeccao: '',
    opcao_pelo_mei: false,
  });
  const [editSocio, setEditSocio] = useState<SocioData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = getAccessToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-socios`, config);
        const data = response.data.map((item: any) => {
          return {
            id: item.id,
            razao_social: item.razao_social,
            nome_socio: item.nome_socio,
            idade: item.idade,
            cnpj_cpf_do_socio: item.cnpj_cpf_do_socio,
            telefone: item.telefone,
            data_nascimento: item.data_nascimento,
            data_entrada_sociedade: item.data_entrada_sociedade,
            formacao: item.formacao,
            disc: item.disc,
            sedirp: item.sedirp,
            eneagrama: item.eneagrama,
            hobbies: item.hobbies,
            relatorio_prospeccao: item.relatorio_prospeccao,
            opcao_pelo_mei: item.opcao_pelo_mei,
          };
        });
        setRows(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/loja/razaosocial`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && Array.isArray(response.data)) {
        const razoesSociais = response.data.map((item: { razao_social: string }) => item.razao_social);
        setClientes(razoesSociais);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleAddSocio = async () => {
    await fetchClientes();
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditSocio = async (socio: SocioData) => {
    await fetchClientes();
    setIsEditing(true);
    setNewSocio({
      ...socio,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewSocio({
      id: 0,
      razao_social: '',
      nome_socio: '',
      idade: 0,
      cnpj_cpf_do_socio: '',
      telefone: '',
      data_nascimento: new Date().toISOString(),
      data_entrada_sociedade: new Date().toISOString(),
      formacao: '',
      disc: '',
      sedirp: '',
      eneagrama: '',
      hobbies: '',
      relatorio_prospeccao: '',
      opcao_pelo_mei: false,
    });
  };

  const handleSubmitSocio = async () => {
    const token = getAccessToken();
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    try {
      if (isEditing) {
        // Update existing socio
        const response = await axios.patch(`${process.env.REACT_APP_API_URL}/tab-socios/${newSocio.id}`, newSocio, config);
        setRows(rows.map(row => row.id === newSocio.id ? { ...response.data } : row));
      } else {
        // Create new socio
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/tab-socios`, newSocio, config);
        setRows([...rows, { id: response.data.id, ...response.data }]);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setNewSocio({
        id: 0,
        razao_social: '',
        nome_socio: '',
        idade: 0,
        cnpj_cpf_do_socio: '',
        telefone: '',
        data_nascimento: new Date().toISOString(),
        data_entrada_sociedade: new Date().toISOString(),
        formacao: '',
        disc: '',
        sedirp: '',
        eneagrama: '',
        hobbies: '',
        relatorio_prospeccao: '',
        opcao_pelo_mei: false,
      });
    } catch (error) {
      console.error('Erro ao salvar Sócio:', error);
    }
  };

  const handleSaveEditSocio = () => {
    if (editSocio) {
      const updatedQsa = rows.map((socio) => (socio.id === editSocio.id ? editSocio : socio));
      setRows(updatedQsa);
      setEditSocio(null);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'razao_social', headerName: 'Razão Social', width: 200 },
    { field: 'nome_socio', headerName: 'Nome Sócio', width: 150 },
    { field: 'idade', headerName: 'Idade', width: 100 },
    { field: 'cnpj_cpf_do_socio', headerName: 'CNPJ/CPF do Sócio', width: 150 },
    { field: 'telefone', headerName: 'Telefone', width: 130 },
    {
      field: 'data_nascimento',
      headerName: 'Data Nascimento',
      width: 150,
      valueFormatter: ({ value }) => formatDatePtBr(value),
      renderCell: ({ row }) => <>{formatDatePtBr((row as SocioData)?.data_nascimento)}</>,
    },
    {
      field: 'data_entrada_sociedade',
      headerName: 'Data Entrada Sociedade',
      width: 180,
      valueFormatter: ({ value }) => formatDatePtBr(value),
      renderCell: ({ row }) => <>{formatDatePtBr((row as SocioData)?.data_entrada_sociedade)}</>,
    },
    { field: 'formacao', headerName: 'Formação', width: 150 },
    { field: 'disc', headerName: 'DISC', width: 100 },
    { field: 'sedirp', headerName: 'SEDIRP', width: 100 },
    { field: 'eneagrama', headerName: 'Eneagrama', width: 120 },
    { field: 'hobbies', headerName: 'Hobbies', width: 150 },
    { 
      field: 'relatorio_prospeccao', 
      headerName: 'Relatório ', 
      width: 180,
      renderCell: (params) => {
        if (!params.value) return <span>-</span>;
        
        // Verifica se a URL já tem protocolo, se não tiver adiciona https://
        const url = params.value.startsWith('http://') || params.value.startsWith('https://') 
          ? params.value 
          : `https://${params.value}`;
        
        return (
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: '#1976d2', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            {params.value.length > 25 ? `${params.value.substring(0, 25)}...` : params.value}
          </a>
        );
      }
    },
    { field: 'opcao_pelo_mei', headerName: 'Opção pelo MEI', width: 130, type: 'boolean' },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton onClick={() => handleEditSocio(params.row)} color="primary">
          <EditIcon />
        </IconButton>
      ),
    },
  ];
  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>Sócios</h1>
      <Button variant="contained" color="primary" onClick={handleAddSocio} style={{ marginBottom: '16px' }}>
        Cadastrar Sócio
      </Button>
      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogTitle>{isEditing ? 'Editar Sócio' : 'Cadastro de Sócio'}</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={clientes}
            freeSolo
            value={newSocio.razao_social}
            onChange={(event, newValue) => {
              setNewSocio({ ...newSocio, razao_social: newValue || '' });
            }}
            onInputChange={(event, newInputValue) => {
              setNewSocio({ ...newSocio, razao_social: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Razão Social"
                fullWidth
              />
            )}
          />
          <TextField
            margin="dense"
            label="Nome Sócio"
            type="text"
            fullWidth
            value={newSocio.nome_socio}
            onChange={(e) => setNewSocio({ ...newSocio, nome_socio: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Idade"
            type="number"
            fullWidth
            value={newSocio.idade}
            onChange={(e) => setNewSocio({ ...newSocio, idade: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="CNPJ/CPF do Sócio"
            type="text"
            fullWidth
            value={newSocio.cnpj_cpf_do_socio}
            onChange={(e) => setNewSocio({ ...newSocio, cnpj_cpf_do_socio: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Telefone"
            type="tel"
            fullWidth
            value={newSocio.telefone}
            onChange={(e) => setNewSocio({ ...newSocio, telefone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
          <TextField
            margin="dense"
            label="Data Nascimento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newSocio.data_nascimento ? newSocio.data_nascimento.split('T')[0] : ''}
            onChange={(e) => setNewSocio({ ...newSocio, data_nascimento: e.target.value ? new Date(e.target.value).toISOString() : '' })}
          />
          <TextField
            margin="dense"
            label="Data Entrada Sociedade"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={newSocio.data_entrada_sociedade ? newSocio.data_entrada_sociedade.split('T')[0] : ''}
            onChange={(e) => setNewSocio({ ...newSocio, data_entrada_sociedade: e.target.value ? new Date(e.target.value).toISOString() : '' })}
          />
          <TextField
            margin="dense"
            label="Formação"
            type="text"
            fullWidth
            value={newSocio.formacao}
            onChange={(e) => setNewSocio({ ...newSocio, formacao: e.target.value })}
          />
          <TextField
            margin="dense"
            label="DISC"
            type="text"
            fullWidth
            value={newSocio.disc}
            onChange={(e) => setNewSocio({ ...newSocio, disc: e.target.value })}
          />
          <TextField
            margin="dense"
            label="SEDIRP"
            type="text"
            fullWidth
            value={newSocio.sedirp}
            onChange={(e) => setNewSocio({ ...newSocio, sedirp: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Eneagrama"
            type="text"
            fullWidth
            value={newSocio.eneagrama}
            onChange={(e) => setNewSocio({ ...newSocio, eneagrama: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Hobbies"
            type="text"
            fullWidth
            value={newSocio.hobbies}
            onChange={(e) => setNewSocio({ ...newSocio, hobbies: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Relatório "
            type="text"
            fullWidth
            value={newSocio.relatorio_prospeccao}
            onChange={(e) => setNewSocio({ ...newSocio, relatorio_prospeccao: e.target.value })}
          />
          <label>Opção pelo MEI</label>
          <input
            type="checkbox"
            checked={newSocio.opcao_pelo_mei}
            onChange={(e) => setNewSocio({ ...newSocio, opcao_pelo_mei: e.target.checked })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmitSocio} color="primary">
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid
        rows={rows}
        columns={columns}
        autoPageSize={true}
        processRowUpdate={(newRow) => {
          handleSaveEditSocio();
          return newRow;
        }}
        getRowId={(row) => row.id}

      />
    </div>
  );
};

export default Socios;
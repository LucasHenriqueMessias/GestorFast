import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem, Autocomplete } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getAccessToken, getUsername } from '../../utils/storage';


interface HighlightsData {
  id: number;
  Data: Date;
  Descricao: string;
  Valor: number;
  AnaliseVertical: number;
  AnaliseHorizontal: number;
  Cliente: string;
  Usuario: string;
}

const Highlights = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clientes, setClientes] = useState<string[]>([]);
  const [newHighlights, setNewHighlights] = useState<HighlightsData>({
    id: 0,
    Data: new Date(),
    Descricao: '',
    Valor: 0,
    AnaliseVertical: 0,
    AnaliseHorizontal: 0,
    Cliente: '',
    Usuario: '',
  });

  const token = getAccessToken(); // Replace with your actual token

  // Opções disponíveis para o campo "Descrição"
  const descricaoOptions = [
    'Receita Bruta',
    'Deduções da Receita',
    'Receita Líquida',
    'Custo dos Produtos Vendidos',
    'Lucro Bruto',
    'Despesas Operacionais',
    'Resultado Operacional',
    'Receitas Financeiras',
    'Despesas Financeiras',
    'Resultado Antes dos Impostos',
    'Impostos',
    'Lucro Líquido',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-dre`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.map((item: HighlightsData) => ({
          id: item.id,
          Data: new Date(item.Data).toLocaleDateString(),
          Descricao: item.Descricao,
          Valor: item.Valor,
          AnaliseVertical: item.AnaliseVertical,
          AnaliseHorizontal: item.AnaliseHorizontal,
          Cliente: item.Cliente,
          Usuario: item.Usuario,
        }));
        setRows(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [token]);

  const fetchClientes = async () => {
    try {
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

  const handleAddHighlights = async () => {
    await fetchClientes();
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewHighlights({
      id: 0,
      Data: new Date(),
      Descricao: '',
      Valor: 0,
      AnaliseVertical: 0,
      AnaliseHorizontal: 0,
      Cliente: '',
      Usuario: '',
    });
  };
  const handleSubmitHighlights = async () => {
    try {
      const payload = { ...newHighlights, Usuario: getUsername() || '' };
      
      if (isEditing) {
        // Atualizar registro existente
        const response = await axios.patch(`${process.env.REACT_APP_API_URL}/tab-dre/${newHighlights.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Atualizar a linha na tabela
        setRows(rows.map(row => 
          row.id === newHighlights.id 
            ? { ...response.data, Data: new Date(response.data.Data).toLocaleDateString() }
            : row
        ));
      } else {
        // Criar novo registro
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/tab-dre`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRows([...rows, { ...response.data, Data: new Date(response.data.Data).toLocaleDateString() }]);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setNewHighlights({
        id: 0,
        Data: new Date(),
        Descricao: '',
        Valor: 0,
        AnaliseVertical: 0,
        AnaliseHorizontal: 0,
        Cliente: '',
        Usuario: '',
      });
    } catch (error) {
      console.error('Erro ao salvar Highlights:', error);
    }
  };

  const handleEditHighlights = async (row: any) => {
    await fetchClientes();
    setNewHighlights({
      id: row.id,
      Data: new Date(row.Data.split('/').reverse().join('-')), // Converter de DD/MM/YYYY para Date
      Descricao: row.Descricao,
      Valor: row.Valor,
      AnaliseVertical: row.AnaliseVertical,
      AnaliseHorizontal: row.AnaliseHorizontal,
      Cliente: row.Cliente,
      Usuario: row.Usuario,
    });
    setIsEditing(true);
    setShowForm(true);
  };
  const columns: GridColDef[] = [
    { field: 'Cliente', headerName: 'Cliente', flex: 1 },
    { field: 'Descricao', headerName: 'Descrição', flex: 1 },
    { field: 'Valor', headerName: '(R$) Valor', flex: 1 },
    { field: 'AnaliseVertical', headerName: '(%) Análise Vertical', flex: 1 },
    { field: 'AnaliseHorizontal', headerName: '(%) Análise Horizontal', flex: 1 },
    { field: 'Usuario', headerName: 'Usuário', flex: 1 },    
    { field: 'Data', headerName: 'Data', flex: 1 },
    {
      field: 'actions',
      headerName: 'Ações',
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleEditHighlights(params.row)}
          startIcon={<EditIcon />}
        >
        </Button>
      ),
    },
  ];
   return (
    <div>
      <h1>Highlights</h1>
      <Button variant="contained" color="primary" onClick={handleAddHighlights} sx={{ mb: 3 }}>
        Cadastrar Highlights
      </Button>      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogTitle>{isEditing ? 'Editar Highlights' : 'Cadastro de Highlights'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Data"
            type="date"
            fullWidth
            value={newHighlights.Data.toISOString().split('T')[0]}
            onChange={(e) => setNewHighlights({ ...newHighlights, Data: new Date(e.target.value) })}
          />
          <Select
            margin="dense"
            fullWidth
            value={newHighlights.Descricao}
            onChange={(e) => setNewHighlights({ ...newHighlights, Descricao: e.target.value })}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Selecione uma Descrição
            </MenuItem>
            {descricaoOptions.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
          <TextField
            margin="dense"
            label="Valor"
            type="number"
            fullWidth
            value={newHighlights.Valor}
            onChange={(e) => setNewHighlights({ ...newHighlights, Valor: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Análise Vertical"
            type="number"
            fullWidth
            value={newHighlights.AnaliseVertical}
            onChange={(e) => setNewHighlights({ ...newHighlights, AnaliseVertical: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Análise Horizontal"
            type="number"
            fullWidth
            value={newHighlights.AnaliseHorizontal}
            onChange={(e) => setNewHighlights({ ...newHighlights, AnaliseHorizontal: Number(e.target.value) })}
          />
          <Autocomplete
            options={clientes}
            freeSolo
            value={newHighlights.Cliente}
            onChange={(event, newValue) => {
              setNewHighlights({ ...newHighlights, Cliente: newValue || '' });
            }}
            onInputChange={(event, newInputValue) => {
              setNewHighlights({ ...newHighlights, Cliente: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Cliente"
                fullWidth
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancelar
          </Button>          <Button onClick={handleSubmitHighlights} color="primary">
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ height: 400, width: '80%' }}>
          <DataGrid 
            rows={rows} 
            columns={columns} 
            autoPageSize
            onRowClick={(row) => handleEditHighlights(row.row)} // Adicionando a função de editar ao clicar na linha
          />
        </div>
      </div>
    </div>
  );
};

export default Highlights;
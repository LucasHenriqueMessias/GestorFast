import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Select, MenuItem } from '@mui/material';
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

  const handleAddHighlights = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSubmitHighlights = async () => {
    try {
      const payload = { ...newHighlights, Usuario: getUsername() || '' };
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/tab-dre`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRows([...rows, response.data]);
      setShowForm(false);
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
      console.error('Erro ao cadastrar Highlights:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'Data', headerName: 'Data', flex: 1 },
    { field: 'Descricao', headerName: 'Descrição', flex: 1 },
    { field: 'Valor', headerName: 'Valor', flex: 1 },
    { field: 'AnaliseVertical', headerName: 'Análise Vertical', flex: 1 },
    { field: 'AnaliseHorizontal', headerName: 'Análise Horizontal', flex: 1 },
    { field: 'Cliente', headerName: 'Cliente', flex: 1 },
    { field: 'Usuario', headerName: 'Usuário', flex: 1 },
  ];
   return (
    <div>
      <h1>Highlights</h1>
      <Button variant="contained" color="primary" onClick={handleAddHighlights} sx={{ mb: 3 }}>
        Cadastrar Highlights
      </Button>
      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogTitle>Cadastro de Highlights</DialogTitle>
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
          <TextField
            margin="dense"
            label="Cliente"
            type="text"
            fullWidth
            value={newHighlights.Cliente}
            onChange={(e) => setNewHighlights({ ...newHighlights, Cliente: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmitHighlights} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ height: 400, width: '80%' }}>
          <DataGrid rows={rows} columns={columns} autoPageSize/>
        </div>
      </div>
    </div>
  );
};

export default Highlights;
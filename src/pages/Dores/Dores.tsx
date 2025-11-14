import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Autocomplete, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getAccessToken, getUsername } from '../../utils/storage';

interface DoresData {
  id: number;
  cliente: string;
  consultor: string;
  ausencia_salario: number;
  desconhecimento_lucratividade: number;
  precos_informal: number;
  ausencia_projecao: number;
  centralizacao_decisoes: number;
  ausencia_planejamento: number;
  ausencia_estrategia: number;
  inadequacao_estrutura: number;
  ausencia_controles: number;
  ausencia_processos: number;
  ausencia_tecnologia: number;
  ausencia_inovacao: number;
  ausencia_capital: number;
  utilizacao_linhas_credito: number;
  suporte_contabil_inadequado: number;
}

const scoreOptions = [1, 2, 3] as const;

const scoreFieldConfigs = [
  { key: 'ausencia_salario', label: 'Ausência Salário', width: 150 },
  { key: 'desconhecimento_lucratividade', label: 'Desconhecimento Lucratividade', width: 200 },
  { key: 'precos_informal', label: 'Preços Informal', width: 150 },
  { key: 'ausencia_projecao', label: 'Ausência Projeção', width: 150 },
  { key: 'centralizacao_decisoes', label: 'Centralização Decisões', width: 200 },
  { key: 'ausencia_planejamento', label: 'Ausência Planejamento', width: 200 },
  { key: 'ausencia_estrategia', label: 'Ausência Estratégia', width: 200 },
  { key: 'inadequacao_estrutura', label: 'Inadequação Estrutura', width: 200 },
  { key: 'ausencia_controles', label: 'Ausência Controles', width: 200 },
  { key: 'ausencia_processos', label: 'Ausência Processos', width: 200 },
  { key: 'ausencia_tecnologia', label: 'Ausência Tecnologia', width: 200 },
  { key: 'ausencia_inovacao', label: 'Ausência Inovação', width: 200 },
  { key: 'ausencia_capital', label: 'Ausência Capital', width: 200 },
  { key: 'utilizacao_linhas_credito', label: 'Utilização Linhas Crédito', width: 200 },
  { key: 'suporte_contabil_inadequado', label: 'Suporte Contábil Inadequado', width: 200 },
] as const;

type ScoreFieldKey = typeof scoreFieldConfigs[number]['key'];

const buildDefaultScores = () =>
  scoreFieldConfigs.reduce((acc, { key }) => {
    acc[key] = scoreOptions[0];
    return acc;
  }, {} as Record<ScoreFieldKey, number>);

const Dores = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clientes, setClientes] = useState<string[]>([]);
  const [newDores, setNewDores] = useState<DoresData>({
    id: 0,
    cliente: '',
    consultor: '',
    ...buildDefaultScores(),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAccessToken();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-dores-cliente`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data.map((item: DoresData) => ({
          id: item.id,
          cliente: item.cliente,
          consultor: item.consultor,
          ausencia_salario: item.ausencia_salario,
          desconhecimento_lucratividade: item.desconhecimento_lucratividade,
          precos_informal: item.precos_informal,
          ausencia_projecao: item.ausencia_projecao,
          centralizacao_decisoes: item.centralizacao_decisoes,
          ausencia_planejamento: item.ausencia_planejamento,
          ausencia_estrategia: item.ausencia_estrategia,
          inadequacao_estrutura: item.inadequacao_estrutura,
          ausencia_controles: item.ausencia_controles,
          ausencia_processos: item.ausencia_processos,
          ausencia_tecnologia: item.ausencia_tecnologia,
          ausencia_inovacao: item.ausencia_inovacao,
          ausencia_capital: item.ausencia_capital,
          utilizacao_linhas_credito: item.utilizacao_linhas_credito,
          suporte_contabil_inadequado: item.suporte_contabil_inadequado,
        }));
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

  const handleAddDores = async () => {
    await fetchClientes();
    const username = getUsername();
    setIsEditing(false);
    setNewDores({
      id: 0,
      cliente: '',
      consultor: username ?? '',
      ...buildDefaultScores(),
    });
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewDores({
      id: 0,
      cliente: '',
      consultor: '',
      ...buildDefaultScores(),
    });
  };
  const handleSubmitDores = async () => {
    try {
      const token = getAccessToken();
      
      if (isEditing) {
        // Atualizar registro existente
        const response = await axios.patch(`${process.env.REACT_APP_API_URL}/tab-dores-cliente/${newDores.id}`, newDores, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Atualizar a linha na tabela
        setRows(rows.map(row => 
          row.id === newDores.id ? response.data : row
        ));
      } else {
        // Criar novo registro
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/tab-dores-cliente`, newDores, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRows([...rows, response.data]);
      }
      
      setShowForm(false);
      setIsEditing(false);
      setNewDores({
        id: 0,
        cliente: '',
        consultor: '',
        ...buildDefaultScores(),
      });
    } catch (error) {
      console.error('Erro ao salvar Dores:', error);
    }
  };

  const handleEditDores = async (row: DoresData) => {
    await fetchClientes();
    const mappedScores = scoreFieldConfigs.reduce((acc, { key }) => {
      acc[key] = Number(row[key] ?? scoreOptions[0]);
      return acc;
    }, {} as Record<ScoreFieldKey, number>);
    setNewDores({
      id: row.id,
      cliente: row.cliente,
      consultor: row.consultor,
      ...mappedScores,
    });
    setIsEditing(true);
    setShowForm(true);
  };
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'cliente', headerName: 'Cliente', width: 150 },
    { field: 'consultor', headerName: 'Consultor', width: 150 },
    ...scoreFieldConfigs.map<GridColDef<DoresData>>(({ key, label, width }) => ({
      field: key,
      headerName: label,
      width,
      type: 'number',
    })),
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleEditDores(params.row)}
          startIcon={<EditIcon />}
        >
        </Button>
      ),
    },
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>Dores Cliente</h1>
      <Button variant="contained" color="primary" onClick={handleAddDores} style={{ marginBottom: '16px' }}>
        Cadastrar Dores
      </Button>      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogTitle>{isEditing ? 'Editar Dores' : 'Cadastro de Dores'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Consultor"
            type="text"
            fullWidth
            value={newDores.consultor}
            onChange={(e) => setNewDores({ ...newDores, consultor: e.target.value })}
            disabled
          />
          <Autocomplete
            options={clientes}
            freeSolo
            value={newDores.cliente}
            onChange={(event, newValue) => {
              setNewDores({ ...newDores, cliente: newValue || '' });
            }}
            onInputChange={(event, newInputValue) => {
              setNewDores({ ...newDores, cliente: newInputValue });
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
          {scoreFieldConfigs.map(({ key, label }) => (
            <TextField
              key={key}
              select
              margin="dense"
              label={label}
              fullWidth
              value={newDores[key]}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setNewDores((prev) => ({
                  ...prev,
                  [key]: newValue,
                }));
              }}
            >
              {scoreOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancelar
          </Button>          <Button onClick={handleSubmitDores} color="primary">
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid rows={rows} columns={columns} autoPageSize onCellClick={(params) => {
        if (params.field !== '__check__' && params.field !== 'id') {
          handleEditDores(params.row);
        }
      }} />
    </div>
  );
};

export default Dores;
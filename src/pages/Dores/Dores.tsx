import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, Autocomplete } from '@mui/material';
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

const Dores = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clientes, setClientes] = useState<string[]>([]);
  const [newDores, setNewDores] = useState<DoresData>({
    id: 0,
    cliente: '',
    consultor: '',
    ausencia_salario: 0,
    desconhecimento_lucratividade: 0,
    precos_informal: 0,
    ausencia_projecao: 0,
    centralizacao_decisoes: 0,
    ausencia_planejamento: 0,
    ausencia_estrategia: 0,
    inadequacao_estrutura: 0,
    ausencia_controles: 0,
    ausencia_processos: 0,
    ausencia_tecnologia: 0,
    ausencia_inovacao: 0,
    ausencia_capital: 0,
    utilizacao_linhas_credito: 0,
    suporte_contabil_inadequado: 0,
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
    const username = getUsername(); // Obtém o nome do usuário
  setNewDores({
    ...newDores,
    consultor: username ?? '',
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
      ausencia_salario: 0,
      desconhecimento_lucratividade: 0,
      precos_informal: 0,
      ausencia_projecao: 0,
      centralizacao_decisoes: 0,
      ausencia_planejamento: 0,
      ausencia_estrategia: 0,
      inadequacao_estrutura: 0,
      ausencia_controles: 0,
      ausencia_processos: 0,
      ausencia_tecnologia: 0,
      ausencia_inovacao: 0,
      ausencia_capital: 0,
      utilizacao_linhas_credito: 0,
      suporte_contabil_inadequado: 0,
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
        ausencia_salario: 0,
        desconhecimento_lucratividade: 0,
        precos_informal: 0,
        ausencia_projecao: 0,
        centralizacao_decisoes: 0,
        ausencia_planejamento: 0,
        ausencia_estrategia: 0,
        inadequacao_estrutura: 0,
        ausencia_controles: 0,
        ausencia_processos: 0,
        ausencia_tecnologia: 0,
        ausencia_inovacao: 0,
        ausencia_capital: 0,
        utilizacao_linhas_credito: 0,
        suporte_contabil_inadequado: 0,
      });
    } catch (error) {
      console.error('Erro ao salvar Dores:', error);
    }
  };

  const handleEditDores = async (row: any) => {
    await fetchClientes();
    setNewDores({
      id: row.id,
      cliente: row.cliente,
      consultor: row.consultor,
      ausencia_salario: row.ausencia_salario,
      desconhecimento_lucratividade: row.desconhecimento_lucratividade,
      precos_informal: row.precos_informal,
      ausencia_projecao: row.ausencia_projecao,
      centralizacao_decisoes: row.centralizacao_decisoes,
      ausencia_planejamento: row.ausencia_planejamento,
      ausencia_estrategia: row.ausencia_estrategia,
      inadequacao_estrutura: row.inadequacao_estrutura,
      ausencia_controles: row.ausencia_controles,
      ausencia_processos: row.ausencia_processos,
      ausencia_tecnologia: row.ausencia_tecnologia,
      ausencia_inovacao: row.ausencia_inovacao,
      ausencia_capital: row.ausencia_capital,
      utilizacao_linhas_credito: row.utilizacao_linhas_credito,
      suporte_contabil_inadequado: row.suporte_contabil_inadequado,
    });
    setIsEditing(true);
    setShowForm(true);
  };
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'cliente', headerName: 'Cliente', width: 150 },
    { field: 'consultor', headerName: 'Consultor', width: 150 },
    { field: 'ausencia_salario', headerName: 'Ausência Salário', width: 150 },
    { field: 'desconhecimento_lucratividade', headerName: 'Desconhecimento Lucratividade', width: 200 },
    { field: 'precos_informal', headerName: 'Preços Informal', width: 150 },
    { field: 'ausencia_projecao', headerName: 'Ausência Projeção', width: 150 },
    { field: 'centralizacao_decisoes', headerName: 'Centralização Decisões', width: 200 },
    { field: 'ausencia_planejamento', headerName: 'Ausência Planejamento', width: 200 },
    { field: 'ausencia_estrategia', headerName: 'Ausência Estratégia', width: 200 },
    { field: 'inadequacao_estrutura', headerName: 'Inadequação Estrutura', width: 200 },
    { field: 'ausencia_controles', headerName: 'Ausência Controles', width: 200 },
    { field: 'ausencia_processos', headerName: 'Ausência Processos', width: 200 },
    { field: 'ausencia_tecnologia', headerName: 'Ausência Tecnologia', width: 200 },
    { field: 'ausencia_inovacao', headerName: 'Ausência Inovação', width: 200 },
    { field: 'ausencia_capital', headerName: 'Ausência Capital', width: 200 },
    { field: 'utilizacao_linhas_credito', headerName: 'Utilização Linhas Crédito', width: 200 },
    { field: 'suporte_contabil_inadequado', headerName: 'Suporte Contábil Inadequado', width: 200 },
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
          <TextField
            margin="dense"
            label="Ausência Salário"
            type="number"
            fullWidth
            value={newDores.ausencia_salario}
            onChange={(e) => setNewDores({ ...newDores, ausencia_salario: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Desconhecimento Lucratividade"
            type="number"
            fullWidth
            value={newDores.desconhecimento_lucratividade}
            onChange={(e) => setNewDores({ ...newDores, desconhecimento_lucratividade: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Preços Informal"
            type="number"
            fullWidth
            value={newDores.precos_informal}
            onChange={(e) => setNewDores({ ...newDores, precos_informal: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ausência Projeção"
            type="number"
            fullWidth
            value={newDores.ausencia_projecao}
            onChange={(e) => setNewDores({ ...newDores, ausencia_projecao: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Centralização Decisões"
            type="number"
            fullWidth
            value={newDores.centralizacao_decisoes}
            onChange={(e) => setNewDores({ ...newDores, centralizacao_decisoes: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ausência Planejamento"
            type="number"
            fullWidth
            value={newDores.ausencia_planejamento}
            onChange={(e) => setNewDores({ ...newDores, ausencia_planejamento: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ausência Estratégia"
            type="number"
            fullWidth
            value={newDores.ausencia_estrategia}
            onChange={(e) => setNewDores({ ...newDores, ausencia_estrategia: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Inadequação Estrutura"
            type="number"
            fullWidth
            value={newDores.inadequacao_estrutura}
            onChange={(e) => setNewDores({ ...newDores, inadequacao_estrutura: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ausência Controles"
            type="number"
            fullWidth
            value={newDores.ausencia_controles}
            onChange={(e) => setNewDores({ ...newDores, ausencia_controles: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ausência Processos"
            type="number"
            fullWidth
            value={newDores.ausencia_processos}
            onChange={(e) => setNewDores({ ...newDores, ausencia_processos: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ausência Tecnologia"
            type="number"
            fullWidth
            value={newDores.ausencia_tecnologia}
            onChange={(e) => setNewDores({ ...newDores, ausencia_tecnologia: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ausência Inovação"
            type="number"
            fullWidth
            value={newDores.ausencia_inovacao}
            onChange={(e) => setNewDores({ ...newDores, ausencia_inovacao: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ausência Capital"
            type="number"
            fullWidth
            value={newDores.ausencia_capital}
            onChange={(e) => setNewDores({ ...newDores, ausencia_capital: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Utilização Linhas Crédito"
            type="number"
            fullWidth
            value={newDores.utilizacao_linhas_credito}
            onChange={(e) => setNewDores({ ...newDores, utilizacao_linhas_credito: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Suporte Contábil Inadequado"
            type="number"
            fullWidth
            value={newDores.suporte_contabil_inadequado}
            onChange={(e) => setNewDores({ ...newDores, suporte_contabil_inadequado: Number(e.target.value) })}
          />
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
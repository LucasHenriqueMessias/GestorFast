import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Container, Typography, TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import { getAccessToken, getUsername } from '../../utils/storage';

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

const JornadaCrescimentoOverDelivery = () => {
  const [OverDeliveryData, setOverDeliveryData] = useState<OverDeliveryData[]>([]);
  const [filteredData, setFilteredData] = useState<OverDeliveryData[]>([]);
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

  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchData = useCallback(async () => {
    try {
      const token = getAccessToken();
      const response = await axios.get(`${apiUrl}/tab-roi`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

    setOverDeliveryData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
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

      newRow.colaborador = getUsername() ?? ''; // Adiciona o colaborador ao novo registro com fallback para string vazia
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

  const columns: GridColDef[] = [
    { field: 'data_criacao', headerName: 'Data', width: 180 },
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'cliente', headerName: 'Cliente', width: 150 },
    { field: 'colaborador', headerName: 'colaborador', width: 150 },
    { field: 'departamento', headerName: 'Departamento', width: 150 },
    { field: 'investimentos', headerName: 'Investimentos', width: 150 },
    { field: 'ferias', headerName: 'Férias', width: 150 },
    { field: 'ecossistema_fast', headerName: 'Ecossistema Fast', width: 150 },
    { field: 'carta_valores', headerName: 'Carta de Valores', width: 150 },
    { field: 'cultura_empresarial', headerName: 'Cultura Empresarial', width: 150 },
    { field: 'organograma', headerName: 'Organograma', width: 150 },
    { field: 'manuais', headerName: 'Manuais', width: 150 },
    { field: 'mips', headerName: 'MIPS', width: 150 },
    { field: 'codigo_cultura', headerName: 'Código de Cultura', width: 150 },
  ];

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Jornada de Crescimento OverDelivery
      </Typography>
      <div>
        <p><strong>Descrição de cada Valor a ser preenchido:</strong></p>
        <p>
          <strong>0 Não Se aplica:</strong> O tema não é pertinente à realidade do cliente (ex: o cliente não utiliza máquina de cartão).<br />
          <strong>1 Tema Não Tratado:</strong> O consultor ainda não iniciou qualquer abordagem ou análise sobre o tema.<br />
          <strong>2 Tema identificado:</strong> O consultor identificou o tema como relevante, mas ainda não realizou ações concretas (ex: apenas anotado no plano de ação).<br />
          <strong>3 Tema em andamento:</strong> O consultor já iniciou ações (ex: comparou taxas, levantou dados), mas ainda sem implementação ou resultado perceptível.<br />
          <strong>4 Tema Tratado Parcialmente:</strong> O consultor atuou, houve implementação ou mudança, mas os resultados ainda são iniciais ou abaixo do esperado.<br />
          <strong>5 Tema tratado com excelência:</strong> O consultor atuou de forma estratégica, houve mudança concreta e os resultados foram significativos para o cliente.
        </p>
      </div>
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
        />
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Adicionar Registro</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Cliente"
            name="cliente"
            fullWidth
            value={newRow.cliente}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Departamento"
            name="departamento"
            fullWidth
            value={newRow.departamento}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Investimentos"
            name="investimentos"
            type="number"
            fullWidth
            value={newRow.investimentos}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Férias"
            name="ferias"
            type="number"
            fullWidth
            value={newRow.ferias}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Cultura Empresarial"
            name="cultura_empresarial"
            type="number"
            fullWidth
            value={newRow.cultura_empresarial}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Ecossistema Fast"
            name="ecossistema_fast"
            type="number"
            fullWidth
            value={newRow.ecossistema_fast}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Carta de Valores"
            name="carta_valores"
            type="number"
            fullWidth
            value={newRow.carta_valores}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Organograma"
            name="organograma"
            type="number"
            fullWidth
            value={newRow.organograma}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Manuais"
            name="manuais"
            type="number"
            fullWidth
            value={newRow.manuais}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="MIPS"
            name="mips"
            type="number"
            fullWidth
            value={newRow.mips}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            label="Código de Cultura"
            name="codigo_cultura"
            type="number"
            fullWidth
            value={newRow.codigo_cultura}
            onChange={handleInputChange}
          />
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
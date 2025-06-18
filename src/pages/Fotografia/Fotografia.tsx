import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, FormControlLabel, Checkbox } from '@mui/material';
import { getAccessToken, getUsername } from '../../utils/storage';

interface FotografiaData {
  id: number;
  usuario: string;
  cnpj: string;
  data_criacao: Date;
  ferramentas: string;
  antecipacao_recebiveis: string;
  pagamento_impostos_mes: string;
  faturamento: string;
  novas_fontes_receita: string;
  numero_funcionarios: string;
  numero_clientes: string;
  margem_lucro: string;
  parcelas_mensais: number;
  juros_mensais_pagos: number;
  inadimplencia: number;
  estrutura: string;
  cultura_empresarial: string;
  pro_labore: number;
  fotografia_inicial: boolean; // Added property
}

const Fotografia = () => {
  const [rows, setRows] = useState<GridRowsProp>([]);
  const [showForm, setShowForm] = useState(false);
  const [newFotografia, setNewFotografia] = useState<FotografiaData>({
    id: 0,
    usuario: '',
    cnpj: '',
    data_criacao: new Date(),
    ferramentas: '',
    antecipacao_recebiveis: '',
    pagamento_impostos_mes: '',
    faturamento: '',
    novas_fontes_receita: '',
    numero_funcionarios: '',
    numero_clientes: '',
    margem_lucro: '',
    parcelas_mensais: 0,
    juros_mensais_pagos: 0,
    inadimplencia: 0,
    estrutura: '',
    cultura_empresarial: '',
    pro_labore: 0,
    fotografia_inicial: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAccessToken();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-fotografia-cliente`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data.map((item: FotografiaData) => ({
          id: item.id,
          usuario: item.usuario,
          cnpj: item.cnpj,
          data_criacao: new Date(item.data_criacao).toLocaleDateString(),
          ferramentas: item.ferramentas,
          antecipacao_recebiveis: item.antecipacao_recebiveis,
          pagamento_impostos_mes: item.pagamento_impostos_mes,
          faturamento: item.faturamento,
          novas_fontes_receita: item.novas_fontes_receita,
          numero_funcionarios: item.numero_funcionarios,
          numero_clientes: item.numero_clientes,
          margem_lucro: item.margem_lucro,
          parcelas_mensais: item.parcelas_mensais,
          juros_mensais_pagos: item.juros_mensais_pagos,
          inadimplencia: item.inadimplencia,
          estrutura: item.estrutura,
          cultura_empresarial: item.cultura_empresarial,
          pro_labore: item.pro_labore,
          fotografia_inicial: item.fotografia_inicial,
        }));
        setRows(data);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddFotografia = () => {
    const username = getUsername(); // Obtém o nome do usuário
    setNewFotografia({
      ...newFotografia,
      usuario: username ?? '', // Define o valor do usuário automaticamente, com fallback para string vazia
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSubmitFotografia = async () => {
    try {
      const token = getAccessToken();
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/tab-fotografia-cliente`, newFotografia, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRows([...rows, response.data]);
      setShowForm(false);
      setNewFotografia({
        id: 0,
        usuario: '',
        cnpj: '',
        data_criacao: new Date(),
        ferramentas: '',
        antecipacao_recebiveis: '',
        pagamento_impostos_mes: '',
        faturamento: '',
        novas_fontes_receita: '',
        numero_funcionarios: '',
        numero_clientes: '',
        margem_lucro: '',
        parcelas_mensais: 0,
        juros_mensais_pagos: 0,
        inadimplencia: 0,
        estrutura: '',
        cultura_empresarial: '',
        pro_labore: 0,
        fotografia_inicial: false,
        
      });
    } catch (error) {
      console.error('Erro ao cadastrar Fotografia:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'fotografia_inicial', headerName: 'Fotografia Inicial', width: 150, type: 'boolean' },
    { field: 'usuario', headerName: 'Consultor', width: 150 },
    { field: 'cnpj', headerName: 'CNPJ', width: 150 },
    { field: 'data_criacao', headerName: 'Data Criação', width: 150 },
    { field: 'ferramentas', headerName: 'Ferramentas', width: 150 },
    { field: 'antecipacao_recebiveis', headerName: 'Antecipação Recebíveis', width: 200 },
    { field: 'pagamento_impostos_mes', headerName: 'Pagamento Impostos Mês', width: 200 },
    { field: 'faturamento', headerName: 'Faturamento', width: 150 },
    { field: 'novas_fontes_receita', headerName: 'Novas Fontes Receita', width: 200 },
    { field: 'numero_funcionarios', headerName: 'Número Funcionários', width: 150 },
    { field: 'numero_clientes', headerName: 'Número Clientes', width: 150 },
    { field: 'margem_lucro', headerName: 'Margem Lucro', width: 150 },
    { field: 'parcelas_mensais', headerName: 'Parcelas Mensais', width: 150 },
    { field: 'juros_mensais_pagos', headerName: 'Juros Mensais Pagos', width: 150 },
    { field: 'inadimplencia', headerName: 'Inadimplência', width: 150 },
    { field: 'estrutura', headerName: 'Estrutura', width: 150 },
    { field: 'cultura_empresarial', headerName: 'Cultura Empresarial', width: 200 },
    { field: 'pro_labore', headerName: 'Pro Labore', width: 150 },
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>Fotografia Cliente</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddFotografia}
        style={{ marginBottom: '16px' }} // Adiciona margem inferior
      >
        Cadastrar Fotografia
      </Button>
      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogTitle>Cadastro de Fotografia</DialogTitle>
        <DialogContent>
        <FormControlLabel
            control={
              <Checkbox
                checked={newFotografia.fotografia_inicial}
                onChange={(e) =>
                  setNewFotografia({ ...newFotografia, fotografia_inicial: e.target.checked })
                }
              />
            }
            label="Fotografia Inicial"
          />
          <TextField
            margin="dense"
            label="Usuário"
            type="text"
            fullWidth
            value={newFotografia.usuario}
            onChange={(e) => setNewFotografia({ ...newFotografia, usuario: e.target.value })}
            disabled
          />
          <TextField
            margin="dense"
            label="CNPJ"
            type="text"
            fullWidth
            value={newFotografia.cnpj}
            onChange={(e) => setNewFotografia({ ...newFotografia, cnpj: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Data Criação"
            type="date"
            fullWidth
            value={newFotografia.data_criacao.toISOString().split('T')[0]}
            onChange={(e) => setNewFotografia({ ...newFotografia, data_criacao: new Date(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Ferramentas"
            type="text"
            fullWidth
            value={newFotografia.ferramentas}
            onChange={(e) => setNewFotografia({ ...newFotografia, ferramentas: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Antecipação Recebíveis"
            type="text"
            fullWidth
            value={newFotografia.antecipacao_recebiveis}
            onChange={(e) => setNewFotografia({ ...newFotografia, antecipacao_recebiveis: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Pagamento Impostos Mês"
            type="text"
            fullWidth
            value={newFotografia.pagamento_impostos_mes}
            onChange={(e) => setNewFotografia({ ...newFotografia, pagamento_impostos_mes: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Faturamento"
            type="text"
            fullWidth
            value={newFotografia.faturamento}
            onChange={(e) => setNewFotografia({ ...newFotografia, faturamento: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Novas Fontes Receita"
            type="text"
            fullWidth
            value={newFotografia.novas_fontes_receita}
            onChange={(e) => setNewFotografia({ ...newFotografia, novas_fontes_receita: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Número Funcionários"
            type="text"
            fullWidth
            value={newFotografia.numero_funcionarios}
            onChange={(e) => setNewFotografia({ ...newFotografia, numero_funcionarios: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Número Clientes"
            type="text"
            fullWidth
            value={newFotografia.numero_clientes}
            onChange={(e) => setNewFotografia({ ...newFotografia, numero_clientes: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Margem Lucro"
            type="text"
            fullWidth
            value={newFotografia.margem_lucro}
            onChange={(e) => setNewFotografia({ ...newFotografia, margem_lucro: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Parcelas Mensais"
            type="number"
            fullWidth
            value={newFotografia.parcelas_mensais}
            onChange={(e) => setNewFotografia({ ...newFotografia, parcelas_mensais: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Juros Mensais Pagos"
            type="number"
            fullWidth
            value={newFotografia.juros_mensais_pagos}
            onChange={(e) => setNewFotografia({ ...newFotografia, juros_mensais_pagos: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Inadimplência"
            type="number"
            fullWidth
            value={newFotografia.inadimplencia}
            onChange={(e) => setNewFotografia({ ...newFotografia, inadimplencia: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Estrutura"
            type="text"
            fullWidth
            value={newFotografia.estrutura}
            onChange={(e) => setNewFotografia({ ...newFotografia, estrutura: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Cultura Empresarial"
            type="text"
            fullWidth
            value={newFotografia.cultura_empresarial}
            onChange={(e) => setNewFotografia({ ...newFotografia, cultura_empresarial: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Pro Labore"
            type="number"
            fullWidth
            value={newFotografia.pro_labore}
            onChange={(e) => setNewFotografia({ ...newFotografia, pro_labore: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmitFotografia} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid rows={rows} columns={columns} autoPageSize
       />
    </div>
  );
};

export default Fotografia;
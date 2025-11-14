import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getAccessToken, getUsername } from '../../utils/storage';

interface FotografiaRow {
  id: number;
  usuario: string;
  cliente: string;
  data_criacao: string;
  ferramentas: string;
  antecipacao_recebiveis: string;
  pagamento_impostos_mes: number | string;
  faturamento: number | string;
  novas_fontes_receita: string;
  numero_funcionarios: string;
  numero_clientes: string;
  margem_lucro: string;
  parcelas_mensais: number | string;
  juros_mensais_pagos: number | string;
  inadimplencia: number | string;
  estrutura: string;
  cultura_empresarial: string;
  pro_labore: number | string;
  fotografia_inicial: boolean;
}

interface FotografiaForm {
  id: number;
  usuario: string;
  cliente: string;
  data_criacao: Date;
  ferramentas: string;
  antecipacao_recebiveis: string;
  pagamento_impostos_mes: string;
  faturamento: string;
  novas_fontes_receita: string;
  numero_funcionarios: string;
  numero_clientes: string;
  margem_lucro: string;
  parcelas_mensais: string;
  juros_mensais_pagos: string;
  inadimplencia: string;
  estrutura: string;
  cultura_empresarial: string;
  pro_labore: string;
  fotografia_inicial: boolean;
}

const extractDigits = (value: unknown): string => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return Math.round(value * 100).toString();
  }
  if (typeof value === 'string') {
    const digits = value.replace(/\D/g, '');
    return digits;
  }
  return '';
};

const formatCurrencyValue = (value: unknown): string => {
  const digits = extractDigits(value);
  if (!digits) {
    return 'R$ 0,00';
  }
  const intValue = parseInt(digits, 10);
  const amount = intValue / 100;
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const valueFromDigits = (value: unknown): number => {
  const digits = extractDigits(value);
  if (!digits) {
    return 0;
  }
  return parseInt(digits, 10) / 100;
};

const mapResponseToRow = (item: any): FotografiaRow => ({
  id: item.id,
  usuario: item.usuario,
  cliente: item.cliente,
  data_criacao: new Date(item.data_criacao).toLocaleDateString(),
  ferramentas: item.ferramentas,
  antecipacao_recebiveis: item.antecipacao_recebiveis,
  pagamento_impostos_mes: item.pagamento_impostos_mes ?? '',
  faturamento: item.faturamento ?? '',
  novas_fontes_receita: item.novas_fontes_receita,
  numero_funcionarios: item.numero_funcionarios,
  numero_clientes: item.numero_clientes,
  margem_lucro: item.margem_lucro,
  parcelas_mensais: item.parcelas_mensais ?? '',
  juros_mensais_pagos: item.juros_mensais_pagos ?? '',
  inadimplencia: item.inadimplencia ?? '',
  estrutura: item.estrutura,
  cultura_empresarial: item.cultura_empresarial,
  pro_labore: item.pro_labore ?? '',
  fotografia_inicial: Boolean(item.fotografia_inicial)
});

const parseLocalizedDate = (value: string): Date => {
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const createEmptyForm = (usuario = ''): FotografiaForm => ({
  id: 0,
  usuario,
  cliente: '',
  data_criacao: new Date(),
  ferramentas: '',
  antecipacao_recebiveis: '',
  pagamento_impostos_mes: '',
  faturamento: '',
  novas_fontes_receita: '',
  numero_funcionarios: '',
  numero_clientes: '',
  margem_lucro: '',
  parcelas_mensais: '',
  juros_mensais_pagos: '',
  inadimplencia: '',
  estrutura: '',
  cultura_empresarial: '',
  pro_labore: '',
  fotografia_inicial: false
});

const Fotografia = () => {
  const [rows, setRows] = useState<FotografiaRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clientes, setClientes] = useState<string[]>([]);
  const [newFotografia, setNewFotografia] = useState<FotografiaForm>(createEmptyForm());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAccessToken();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-fotografia-cliente`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = Array.isArray(response.data)
          ? response.data.map(mapResponseToRow)
          : [];
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

  const handleAddFotografia = async () => {
    await fetchClientes();
    const username = getUsername() ?? '';
    setNewFotografia(createEmptyForm(username));
    setIsEditing(false);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewFotografia(createEmptyForm());
  };
  const handleSubmitFotografia = async () => {
    try {
      const token = getAccessToken();
      const payload = {
        ...newFotografia,
        pro_labore: valueFromDigits(newFotografia.pro_labore),
        faturamento: valueFromDigits(newFotografia.faturamento),
        pagamento_impostos_mes: valueFromDigits(newFotografia.pagamento_impostos_mes),
        juros_mensais_pagos: valueFromDigits(newFotografia.juros_mensais_pagos),
        parcelas_mensais: valueFromDigits(newFotografia.parcelas_mensais),
        inadimplencia: valueFromDigits(newFotografia.inadimplencia)
      };
      if (isEditing) {
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/tab-fotografia-cliente/${newFotografia.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const updatedRow = mapResponseToRow(response.data);
        setRows(prev => prev.map(row => (row.id === newFotografia.id ? updatedRow : row)));
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/tab-fotografia-cliente`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        const newRow = mapResponseToRow(response.data);
        setRows(prev => [...prev, newRow]);
      }
      setShowForm(false);
      setIsEditing(false);
      setNewFotografia(createEmptyForm());
    } catch (error) {
      console.error('Erro ao salvar Fotografia:', error);
    }
  };

  const handleEditFotografia = async (row: any) => {
    await fetchClientes();
    setNewFotografia({
      id: row.id,
      usuario: row.usuario,
      cliente: row.cliente,
      data_criacao: parseLocalizedDate(row.data_criacao),
      ferramentas: row.ferramentas,
      antecipacao_recebiveis: row.antecipacao_recebiveis,
      pagamento_impostos_mes: extractDigits(row.pagamento_impostos_mes),
      faturamento: extractDigits(row.faturamento),
      novas_fontes_receita: row.novas_fontes_receita,
      numero_funcionarios: row.numero_funcionarios,
      numero_clientes: row.numero_clientes,
      margem_lucro: row.margem_lucro,
      parcelas_mensais: extractDigits(row.parcelas_mensais),
      juros_mensais_pagos: extractDigits(row.juros_mensais_pagos),
      inadimplencia: extractDigits(row.inadimplencia),
      estrutura: row.estrutura,
      cultura_empresarial: row.cultura_empresarial,
      pro_labore: extractDigits(row.pro_labore),
      fotografia_inicial: row.fotografia_inicial,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  type MoneyField =
    | 'faturamento'
    | 'pagamento_impostos_mes'
    | 'juros_mensais_pagos'
    | 'parcelas_mensais'
    | 'inadimplencia'
    | 'pro_labore';

  const handleMoneyKeyDown = (
    event: React.KeyboardEvent,
    field: MoneyField
  ) => {
    if (event.key === 'Tab' || event.key === 'Enter' || event.key === 'Escape') {
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const currentDigits = extractDigits(newFotografia[field]);
    if (event.key === 'Backspace') {
      const updatedDigits = currentDigits.slice(0, -1);
      setNewFotografia(prev => ({ ...prev, [field]: updatedDigits }));
      event.preventDefault();
      return;
    }
    if (/^[0-9]$/.test(event.key)) {
      if (currentDigits.length < 13) {
        const updatedDigits = currentDigits + event.key;
        setNewFotografia(prev => ({ ...prev, [field]: updatedDigits }));
      }
      event.preventDefault();
      return;
    }
    event.preventDefault();
  };

  const moneyInputProps = {
    style: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
    inputMode: 'numeric',
    pattern: '[0-9]*',
    maxLength: 15
  } as const;
  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'fotografia_inicial', headerName: 'Fotografia Inicial', width: 150, type: 'boolean' },
    { field: 'usuario', headerName: 'Consultor', width: 150 },
    { field: 'cliente', headerName: 'Cliente', width: 150 },
    { field: 'data_criacao', headerName: 'Data Criação', width: 150 },
    { field: 'ferramentas', headerName: 'Ferramentas', width: 150 },
    { field: 'antecipacao_recebiveis', headerName: 'Antecipação Recebíveis', width: 200 },
    {
      field: 'pagamento_impostos_mes',
      headerName: 'Pagamento Impostos Mês',
      width: 200
    },
    {
      field: 'faturamento',
      headerName: 'Faturamento',
      width: 150
    },
    { field: 'novas_fontes_receita', headerName: 'Fontes de Renda', width: 200 },
    { field: 'numero_funcionarios', headerName: 'Número Funcionários', width: 150 },
    { field: 'numero_clientes', headerName: 'Número Clientes', width: 150 },
    { field: 'margem_lucro', headerName: 'Margem de Lucro (%)', width: 150 },
    {
      field: 'parcelas_mensais',
      headerName: 'Valor de Endividamento',
      width: 170
    },
    {
      field: 'juros_mensais_pagos',
      headerName: 'Juros Mensais Pagos',
      width: 150
    },
    {
      field: 'inadimplencia',
      headerName: 'Inadimplência',
      width: 150
    },
    { field: 'estrutura', headerName: 'Estrutura', width: 150 },
    { field: 'cultura_empresarial', headerName: 'Cultura Empresarial', width: 200 },
  {
    field: 'pro_labore',
    headerName: 'Pro Labore (R$)',
      width: 150
  },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 100,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => handleEditFotografia(params.row)}
          startIcon={<EditIcon />}
        >
        </Button>
      ),
    },
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      <h1>Fotografia Cliente</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddFotografia}
        style={{ marginBottom: '16px' }}
      >
        Cadastrar Fotografia
      </Button>
      <Dialog open={showForm} onClose={handleCloseForm}>
        <DialogTitle>{isEditing ? 'Editar Fotografia' : 'Cadastro de Fotografia'}</DialogTitle>
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
          <Autocomplete
            options={clientes}
            freeSolo
            value={newFotografia.cliente}
            onChange={(event, newValue) => {
              setNewFotografia({ ...newFotografia, cliente: newValue || '' });
            }}
            onInputChange={(event, newInputValue) => {
              setNewFotografia({ ...newFotografia, cliente: newInputValue });
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
            select
            margin="dense"
            label="Antecipação Recebíveis"
            fullWidth
            value={newFotografia.antecipacao_recebiveis}
            onChange={(e) => setNewFotografia({ ...newFotografia, antecipacao_recebiveis: e.target.value })}
          >
            <MenuItem value="Sim">Sim</MenuItem>
            <MenuItem value="Não">Não</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Pagamento Impostos Mês"
            fullWidth
            value={formatCurrencyValue(newFotografia.pagamento_impostos_mes)}
            inputProps={moneyInputProps}
            onChange={() => {}}
            onKeyDown={event => handleMoneyKeyDown(event, 'pagamento_impostos_mes')}
          />
          {/* Campo Faturamento com formatação calculadora */}
          <TextField
            margin="dense"
            label="Faturamento"
            fullWidth
            value={formatCurrencyValue(newFotografia.faturamento)}
            inputProps={moneyInputProps}
            onChange={() => {}}
            onKeyDown={event => handleMoneyKeyDown(event, 'faturamento')}
          />
          <TextField
            margin="dense"
            label="Fontes de Renda"
            type="text"
            fullWidth
            value={newFotografia.novas_fontes_receita}
            onChange={(e) => setNewFotografia({ ...newFotografia, novas_fontes_receita: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Número Funcionários"
            type="number"
            fullWidth
            value={newFotografia.numero_funcionarios}
            onChange={(e) => setNewFotografia({ ...newFotografia, numero_funcionarios: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Número Clientes"
            type="number"
            fullWidth
            value={newFotografia.numero_clientes}
            onChange={(e) => setNewFotografia({ ...newFotografia, numero_clientes: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Margem de Lucro (%)"
            type="number"
            fullWidth
            value={newFotografia.margem_lucro}
            onChange={(e) => setNewFotografia({ ...newFotografia, margem_lucro: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Valor de Endividamento"
            fullWidth
            value={formatCurrencyValue(newFotografia.parcelas_mensais)}
            inputProps={moneyInputProps}
            onChange={() => {}}
            onKeyDown={event => handleMoneyKeyDown(event, 'parcelas_mensais')}
          />
          <TextField
            margin="dense"
            label="Juros Mensais Pagos"
            fullWidth
            value={formatCurrencyValue(newFotografia.juros_mensais_pagos)}
            inputProps={moneyInputProps}
            onChange={() => {}}
            onKeyDown={event => handleMoneyKeyDown(event, 'juros_mensais_pagos')}
          />
          <TextField
            margin="dense"
            label="Inadimplência"
            fullWidth
            value={formatCurrencyValue(newFotografia.inadimplencia)}
            inputProps={moneyInputProps}
            onChange={() => {}}
            onKeyDown={event => handleMoneyKeyDown(event, 'inadimplencia')}
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
          {/* Campo Pro Labore com formatação calculadora */}
          <TextField
            margin="dense"
            label="Pro Labore (R$)"
            fullWidth
            value={formatCurrencyValue(newFotografia.pro_labore)}
            inputProps={moneyInputProps}
            onChange={() => {}}
            onKeyDown={event => handleMoneyKeyDown(event, 'pro_labore')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmitFotografia} color="primary">
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
      <DataGrid rows={rows} columns={columns} autoPageSize />
    </div>
  );
};

export default Fotografia;
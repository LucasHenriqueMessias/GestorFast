import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem, Autocomplete, Typography, IconButton, Stack, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAccessToken, getUsername } from '../../utils/storage';

interface HighlightsRow {
  id: number;
  Data: string;
  Descricao: string;
  Valor: number;
  AnaliseVertical: number;
  AnaliseHorizontal: number;
  Cliente: string;
  Usuario: string;
}

interface HighlightEntry {
  id?: number;
  Descricao: string;
  Valor: string;
  AnaliseVertical: number;
  AnaliseHorizontal: number;
}

interface HighlightsForm {
  Data: Date;
  Cliente: string;
  Usuario: string;
  entries: HighlightEntry[];
}

const extractDigits = (value: unknown): string => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return Math.round(value * 100).toString();
  }
  if (typeof value === 'string') {
    return value.replace(/\D/g, '');
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

const normalizeMonetary = (value: unknown): number => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const cleaned = value
      .replace(/\s+/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^0-9.-]/g, '');

    const parsed = Number(cleaned);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
    return valueFromDigits(value);
  }
  return 0;
};

const mapResponseToRow = (item: any): HighlightsRow => ({
  id: item.id,
  Data: new Date(item.Data).toLocaleDateString(),
  Descricao: item.Descricao,
  Valor: normalizeMonetary(item.Valor),
  AnaliseVertical: Number(item.AnaliseVertical ?? 0),
  AnaliseHorizontal: Number(item.AnaliseHorizontal ?? 0),
  Cliente: item.Cliente,
  Usuario: item.Usuario,
});

const parseLocalizedDate = (value: string): Date => {
  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const createEmptyForm = (usuario = ''): HighlightsForm => ({
  Data: new Date(),
  Cliente: '',
  Usuario: usuario,
  entries: [
    {
      Descricao: '',
      Valor: '',
      AnaliseVertical: 0,
      AnaliseHorizontal: 0
    }
  ]
});

const Highlights = () => {
  const [rows, setRows] = useState<HighlightsRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clientes, setClientes] = useState<string[]>([]);
  const [newHighlights, setNewHighlights] = useState<HighlightsForm>(createEmptyForm());

  const token = getAccessToken();

  const descricaoOptions = [
    'receita bruta',
    'dedução de receita bruta',
    'receita líquida',
    'cmv/cpv/csv',
    'margem de contribuição',
    'despesas administrativas',
    'despesas RH',
    'despesas operacionais',
    'despesas de vendas',
    'despesas de marketing',
    'total de despesas gerais',
    'resultado operacional',
    'despesas financeiras',
    'receitas financeiras',
    'empréstimos',
    'investimentos e aquisições',
    'lucro líquido',
    'retirada sócios',
    'lucro líquido pós retirada',
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-dre`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
    const username = getUsername() ?? '';
    setNewHighlights(createEmptyForm(username));
    setIsEditing(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setNewHighlights(createEmptyForm(getUsername() ?? ''));
  };

  const handleEntryDescriptionChange = (index: number, value: string) => {
    setNewHighlights(prev => {
      const entries = prev.entries.map((entry, idx) =>
        idx === index ? { ...entry, Descricao: value } : entry
      );
      return { ...prev, entries };
    });
  };

  const handleEntryNumberChange = (
    index: number,
    field: 'AnaliseVertical' | 'AnaliseHorizontal',
    value: string
  ) => {
    const numericValue = Number(value);
    setNewHighlights(prev => {
      const entries = prev.entries.map((entry, idx) =>
        idx === index
          ? { ...entry, [field]: Number.isNaN(numericValue) ? 0 : numericValue }
          : entry
      );
      return { ...prev, entries };
    });
  };

  const handleRemoveEntry = (index: number) => {
    setNewHighlights(prev => {
      if (prev.entries.length <= 1) {
        return prev;
      }
      const entries = prev.entries.filter((_, idx) => idx !== index);
      return { ...prev, entries };
    });
  };

  const handleAddEntry = () => {
    setNewHighlights(prev => {
      if (prev.entries.length >= descricaoOptions.length) {
        return prev;
      }
      const unusedDescriptions = descricaoOptions.filter(option =>
        !prev.entries.some(entry => entry.Descricao === option)
      );
      if (unusedDescriptions.length === 0) {
        return prev;
      }
      return {
        ...prev,
        entries: [
          ...prev.entries,
          {
            Descricao: '',
            Valor: '',
            AnaliseVertical: 0,
            AnaliseHorizontal: 0
          }
        ]
      };
    });
  };

  const handleSubmitHighlights = async () => {
    try {
      const username = getUsername() || '';
      const { Data, Cliente, entries } = newHighlights;

      if (!Cliente) {
        window.alert('Selecione um cliente para registrar os highlights.');
        return;
      }

      const descriptions = entries.map(entry => entry.Descricao);
      if (descriptions.some(description => !description)) {
        window.alert('Selecione uma descrição para cada highlight.');
        return;
      }

      const uniqueDescriptions = new Set(descriptions);
      if (uniqueDescriptions.size !== descriptions.length) {
        window.alert('Cada descrição deve ser única.');
        return;
      }

      if (isEditing) {
        const entry = entries[0];
        if (!entry.id) {
          console.error('ID do highlight não encontrado para edição.');
          return;
        }
        const payload = {
          Data,
          Cliente,
          Usuario: username,
          Descricao: entry.Descricao,
          Valor: valueFromDigits(entry.Valor),
          AnaliseVertical: entry.AnaliseVertical,
          AnaliseHorizontal: entry.AnaliseHorizontal,
        };
        const response = await axios.patch(
          `${process.env.REACT_APP_API_URL}/tab-dre/${entry.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const updatedRow = mapResponseToRow(response.data);
        setRows(prev => prev.map(row => (row.id === entry.id ? updatedRow : row)));
      } else {
        const responses = await Promise.all(
          entries.map(entry => {
            const payload = {
              Data,
              Cliente,
              Usuario: username,
              Descricao: entry.Descricao,
              Valor: valueFromDigits(entry.Valor),
              AnaliseVertical: entry.AnaliseVertical,
              AnaliseHorizontal: entry.AnaliseHorizontal,
            };
            return axios.post(`${process.env.REACT_APP_API_URL}/tab-dre`, payload, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          })
        );
        const newRows = responses.map(res => mapResponseToRow(res.data));
        setRows(prev => [...prev, ...newRows]);
      }

      setShowForm(false);
      setIsEditing(false);
      setNewHighlights(createEmptyForm(username));
    } catch (error) {
      console.error('Erro ao salvar Highlights:', error);
    }
  };

  const handleEditHighlights = async (row: any) => {
    await fetchClientes();
    setNewHighlights({
      Data: parseLocalizedDate(row.Data),
      Cliente: row.Cliente,
      Usuario: row.Usuario,
      entries: [
        {
          id: row.id,
          Descricao: row.Descricao,
          Valor: extractDigits(row.Valor),
          AnaliseVertical: Number(row.AnaliseVertical ?? 0),
          AnaliseHorizontal: Number(row.AnaliseHorizontal ?? 0),
        }
      ]
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleValorKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
    const navigationKeys = new Set([
      'Tab',
      'Enter',
      'Escape',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End'
    ]);

    if (navigationKeys.has(event.key)) {
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const currentDigits = extractDigits(newHighlights.entries[index]?.Valor ?? '');

    if (event.key === 'Backspace') {
      const updatedDigits = currentDigits.slice(0, -1);
      setNewHighlights(prev => {
        const entries = prev.entries.map((entry, idx) =>
          idx === index ? { ...entry, Valor: updatedDigits } : entry
        );
        return { ...prev, entries };
      });
      event.preventDefault();
      return;
    }

    if (/^[0-9]$/.test(event.key)) {
      if (currentDigits.length < 13) {
        const updatedDigits = currentDigits + event.key;
        setNewHighlights(prev => {
          const entries = prev.entries.map((entry, idx) =>
            idx === index ? { ...entry, Valor: updatedDigits } : entry
          );
          return { ...prev, entries };
        });
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

  const usedDescriptions = newHighlights.entries
    .map(entry => entry.Descricao)
    .filter(description => description);
  const remainingDescriptions = descricaoOptions.filter(option => !usedDescriptions.includes(option));
  const canAddEntry = !isEditing && remainingDescriptions.length > 0 && newHighlights.entries.length < descricaoOptions.length;

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
      </Button>
      <Dialog open={showForm} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle>{isEditing ? 'Editar Highlights' : 'Cadastro de Highlights'}</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={clientes}
            freeSolo
            value={newHighlights.Cliente}
            onChange={(event, newValue) => {
              setNewHighlights(prev => ({ ...prev, Cliente: newValue || '' }));
            }}
            onInputChange={(event, newInputValue) => {
              setNewHighlights(prev => ({ ...prev, Cliente: newInputValue }));
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
            label="Data"
            type="date"
            fullWidth
            value={newHighlights.Data.toISOString().split('T')[0]}
            onChange={(event) => setNewHighlights(prev => ({ ...prev, Data: new Date(event.target.value) }))}
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Registros
          </Typography>
          {newHighlights.entries.map((entry, index) => {
            const otherDescriptions = newHighlights.entries
              .filter((_, idx) => idx !== index)
              .map(item => item.Descricao)
              .filter(description => description);
            const availableDescriptions = descricaoOptions.filter(option =>
              option === entry.Descricao || !otherDescriptions.includes(option)
            );

            return (
              <Box key={index} sx={{ mt: index === 0 ? 1 : 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Highlight {index + 1}</Typography>
                  {newHighlights.entries.length > 1 && !isEditing && (
                    <IconButton
                      aria-label="Remover highlight"
                      size="small"
                      onClick={() => handleRemoveEntry(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                <TextField
                  select
                  margin="dense"
                  label="Descrição"
                  fullWidth
                  value={entry.Descricao}
                  onChange={(event) => handleEntryDescriptionChange(index, event.target.value)}
                >
                  <MenuItem value="" disabled>
                    Selecione uma Descrição
                  </MenuItem>
                  {availableDescriptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  margin="dense"
                  label="Valor"
                  fullWidth
                  value={formatCurrencyValue(entry.Valor)}
                  inputProps={moneyInputProps}
                  onChange={() => {}}
                  onKeyDown={handleValorKeyDown(index)}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    margin="dense"
                    label="Análise Vertical"
                    type="number"
                    fullWidth
                    sx={{ flex: 1 }}
                    value={entry.AnaliseVertical}
                    onChange={(event) => handleEntryNumberChange(index, 'AnaliseVertical', event.target.value)}
                  />
                  <TextField
                    margin="dense"
                    label="Análise Horizontal"
                    type="number"
                    fullWidth
                    sx={{ flex: 1 }}
                    value={entry.AnaliseHorizontal}
                    onChange={(event) => handleEntryNumberChange(index, 'AnaliseHorizontal', event.target.value)}
                  />
                </Stack>
              </Box>
            );
          })}
          {!isEditing && (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddEntry}
              disabled={!canAddEntry}
              sx={{ mt: 2 }}
            >
              Registrar outro highlight
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSubmitHighlights} color="primary">
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
            onRowClick={(row) => handleEditHighlights(row.row)}
          />
        </div>
      </div>
    </div>
  );
};

export default Highlights;

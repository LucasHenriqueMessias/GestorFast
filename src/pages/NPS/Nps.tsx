import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Autocomplete,
  Button,
  Box,
  CircularProgress,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
  Alert as MuiAlert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getAccessToken, getDepartment } from '../../utils/storage';

type NpsType =
  | 'consultant'
  | 'analyst'
  | 'roi'
  | 'trust'
  | 'communication'
  | 'ease'
  | 'implementation';

interface NpsAnswer {
  score: number;
  comment: string;
}

interface NpsEntry {
  id: number;
  companyName: string;
  answers: Partial<Record<NpsType, NpsAnswer>>;
  createdAt?: string;
}

interface NpsApiEntry {
  id: number;
  companyName: string;
  answers?: Partial<Record<NpsType, NpsAnswer>>;
  createdAt?: string;
}

interface NpsFormData {
  companyName: string;
  createdAt: string;
  answers: Record<NpsType, NpsAnswer>;
}

const NPS_TYPES: Array<{
  key: NpsType;
  label: string;
  question: string;
  openQuestion: string;
  objective: string[];
}> = [
  {
    key: 'consultant',
    label: 'Consultor',
    question: 'De 0 a 10, o quanto você recomendaria seu Consultor Financeiro?',
    openQuestion: 'O que mais influencia sua nota em relação ao consultor?',
    objective: ['Relacionamento', 'Postura', 'Clareza estratégica', 'Confiança pessoal'],
  },
  {
    key: 'analyst',
    label: 'Analista',
    question: 'De 0 a 10, o quanto você recomendaria o trabalho técnico realizado pelo nosso Analista Financeiro?',
    openQuestion: 'O que poderia melhorar nas análises e relatórios entregues?',
    objective: ['Qualidade técnica', 'Profundidade das análises', 'Clareza dos relatórios', 'Capacidade de gerar insights'],
  },
  {
    key: 'roi',
    label: 'ROI',
    question: 'De 0 a 10, o quanto você acredita que nossa assessoria gera retorno financeiro real para sua empresa?',
    openQuestion: 'Onde você enxerga maior impacto financeiro gerado por nós?',
    objective: ['Valor percebido', 'Justificativa de contrato', 'Risco de churn por custo'],
  },
  {
    key: 'trust',
    label: 'Confiança',
    question: 'De 0 a 10, o quanto você confia nas recomendações financeiras feitas pela nossa equipe?',
    openQuestion: 'O que aumentaria ainda mais sua confiança nas nossas orientações?',
    objective: ['Autoridade técnica', 'Segurança estratégica', 'Dependência positiva'],
  },
  {
    key: 'communication',
    label: 'Comunicação',
    question: 'De 0 a 10, o quanto você recomendaria nossa comunicação (clareza, objetividade e transparência)?',
    openQuestion: 'Em que ponto nossa comunicação pode melhorar?',
    objective: ['Clareza nas reuniões', 'Explicação de relatórios', 'Organização das informações'],
  },
  {
    key: 'ease',
    label: 'Facilidade',
    question: 'De 0 a 10, o quanto você recomendaria a experiência de trabalhar com nossa metodologia e ferramentas?',
    openQuestion: 'O que tornaria o processo mais simples para você?',
    objective: ['Uso do ambiente', 'Dropbox', 'Fluxo de envio de documentos', 'Experiência geral'],
  },
  {
    key: 'implementation',
    label: 'Implementação',
    question: 'De 0 a 10, o quanto nossas recomendações são aplicáveis e fáceis de implementar na prática?',
    openQuestion: 'O que dificulta a implementação das nossas recomendações?',
    objective: ['Pragmatismo', 'Aderência à realidade do cliente', 'Complexidade excessiva'],
  },
];

const HEALTH_WEIGHTS: Record<'general' | NpsType, number> = {
  general: 0.3,
  roi: 0.2,
  trust: 0.15,
  consultant: 0.1,
  analyst: 0.1,
  implementation: 0.1,
  ease: 0.05,
  communication: 0,
};

const scoreLabel = (score: number | null) => {
  if (score === null) return 'Sem resposta';
  if (score <= 6) return 'Detrator';
  if (score <= 8) return 'Neutro';
  return 'Promotor';
};

const scoreColor = (score: number | null) => {
  if (score === null) return 'default';
  if (score <= 6) return 'error';
  if (score <= 8) return 'warning';
  return 'success';
};

const computeAverage = (scores: number[]) => {
  if (!scores.length) return null;
  const sum = scores.reduce((acc, value) => acc + value, 0);
  return sum / scores.length;
};

const formatScore = (value: number | null, digits = 1) => (value === null ? '-' : value.toFixed(digits));

const createEmptyAnswers = (): Record<NpsType, NpsAnswer> =>
  NPS_TYPES.reduce((acc, type) => {
    acc[type.key] = { score: 0, comment: '' };
    return acc;
  }, {} as Record<NpsType, NpsAnswer>);

const normalizeText = (value?: string | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toFormData = (entry?: NpsEntry | null): NpsFormData => {
  if (!entry) {
    return {
      companyName: '',
      createdAt: new Date().toISOString(),
      answers: createEmptyAnswers(),
    };
  }

  const answers = createEmptyAnswers();
  NPS_TYPES.forEach((type) => {
    const source = entry.answers?.[type.key];
    if (source) {
      answers[type.key] = {
        score: typeof source.score === 'number' ? source.score : 0,
        comment: source.comment || '',
      };
    }
  });

  return {
    companyName: entry.companyName,
    createdAt: entry.createdAt || new Date().toISOString(),
    answers,
  };
};

const Nps = () => {
  const [rows, setRows] = useState<NpsEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<string[]>([]);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<NpsFormData>(toFormData());
  const [openResultDialog, setOpenResultDialog] = useState(false);
  const [resultEntry, setResultEntry] = useState<NpsEntry | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const department = getDepartment();
  const canManageNps = ['Developer', 'Gestor', 'Diretor', 'CS'].includes(department || '');

  const getSortedRows = useCallback((entries: NpsEntry[]) =>
    [...entries].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (bTime !== aTime) return bTime - aTime;
      return b.id - a.id;
    }), []);

  const fetchData = useCallback(async () => {
    if (!apiUrl) {
      setError('REACT_APP_API_URL não configurada.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getAccessToken();
      const response = await axios.get(`${apiUrl}/tab-pesquisa-nps`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload: NpsApiEntry[] = Array.isArray(response.data) ? response.data : [];
      const mapped: NpsEntry[] = payload.map((item) => ({
        id: item.id,
        companyName: item.companyName,
        answers: item.answers ?? {},
        createdAt: item.createdAt,
      }));
      setRows(getSortedRows(mapped));
    } catch (err) {
      setError('Erro ao buscar respostas de NPS.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, getSortedRows]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchClientes = async () => {
      if (!apiUrl) return;
      try {
        const token = getAccessToken();
        const response = await axios.get(`${apiUrl}/loja/razaosocial`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(response.data)) {
          const names = response.data
            .map((item: { razao_social?: string }) => item.razao_social || '')
            .filter(Boolean);
          setClientes(Array.from(new Set(names)));
        }
      } catch {
        // Optional helper list only.
      }
    };

    fetchClientes();
  }, [apiUrl]);

  const openCreateDialog = () => {
    setEditingId(null);
    setFormError(null);
    setFormData(toFormData());
    setOpenDialog(true);
  };

  const openEditDialog = (entry: NpsEntry) => {
    setEditingId(entry.id);
    setFormError(null);
    setFormData(toFormData(entry));
    setOpenDialog(true);
  };

  const closeDialog = () => {
    if (saving) return;
    setOpenDialog(false);
    setFormError(null);
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      return 'Selecione ou informe a empresa.';
    }

    for (const type of NPS_TYPES) {
      const answer = formData.answers[type.key];
      if (!Number.isInteger(answer.score) || answer.score < 0 || answer.score > 10) {
        return `A nota de ${type.label} deve ser um inteiro entre 0 e 10.`;
      }
      if (!answer.comment.trim()) {
        return `Preencha o comentario de ${type.label}.`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!canManageNps) {
      setFormError('Voce nao tem permissao para alterar NPS.');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!apiUrl) {
      setFormError('REACT_APP_API_URL nao configurada.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      companyName: formData.companyName.trim(),
      createdAt: formData.createdAt,
      answers: formData.answers,
    };

    try {
      const token = getAccessToken();
      if (editingId) {
        await axios.patch(`${apiUrl}/tab-pesquisa-nps/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBannerMessage('Feedback NPS atualizado com sucesso.');
      } else {
        await axios.post(`${apiUrl}/tab-pesquisa-nps`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBannerMessage('Feedback NPS criado com sucesso.');
      }

      setOpenDialog(false);
      fetchData();
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setFormError('Somente Developer, Gestor, Diretor e CS podem gerenciar o NPS.');
      } else {
        setFormError('Erro ao salvar feedback NPS.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!canManageNps) {
      setBannerMessage('Voce nao tem permissao para excluir NPS.');
      return;
    }

    if (!apiUrl) {
      setBannerMessage('REACT_APP_API_URL nao configurada.');
      return;
    }

    if (!window.confirm('Deseja realmente excluir este feedback NPS?')) {
      return;
    }

    try {
      const token = getAccessToken();
      await axios.delete(`${apiUrl}/tab-pesquisa-nps/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBannerMessage('Feedback NPS excluido com sucesso.');
      fetchData();
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setBannerMessage('Somente Developer, Gestor, Diretor e CS podem gerenciar o NPS.');
      } else {
        setBannerMessage('Erro ao excluir feedback NPS.');
      }
    }
  };

  const openResult = (entry: NpsEntry) => {
    setResultEntry(entry);
    setOpenResultDialog(true);
  };

  const evaluatedCompanyNames = useMemo(
    () => Array.from(new Set(rows.map((row) => row.companyName).filter((name) => !!name))),
    [rows]
  );

  const neverEvaluatedClients = useMemo(() => {
    const evaluatedSet = new Set(evaluatedCompanyNames.map((name) => normalizeText(name)));
    return Array.from(new Set(clientes))
      .filter((name) => !evaluatedSet.has(normalizeText(name)))
      .sort((a, b) => a.localeCompare(b));
  }, [clientes, evaluatedCompanyNames]);

  const allCompanyOptions = useMemo(() => {
    return Array.from(new Set([...clientes, ...evaluatedCompanyNames])).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [clientes, evaluatedCompanyNames]);

  const selectedEntry = useMemo(
    () => rows.find((row) => row.companyName === selectedCompany) ?? null,
    [rows, selectedCompany]
  );

  const computeHealthScore = (entry: NpsEntry) => {
    const scores = NPS_TYPES.map((type) => ({
      key: type.key,
      value: entry.answers?.[type.key]?.score,
    })).filter((item): item is { key: NpsType; value: number } =>
      typeof item.value === 'number' && !Number.isNaN(item.value)
    );

    const generalAverage = computeAverage(scores.map((item) => item.value));
    const weightedItems: Array<{ weight: number; value: number }> = [];

    if (generalAverage !== null) {
      weightedItems.push({ weight: HEALTH_WEIGHTS.general, value: generalAverage });
    }

    scores.forEach((item) => {
      const weight = HEALTH_WEIGHTS[item.key];
      if (weight) {
        weightedItems.push({ weight, value: item.value });
      }
    });

    const totalWeight = weightedItems.reduce((acc, item) => acc + item.weight, 0);
    if (!totalWeight) return null;

    const weightedSum = weightedItems.reduce((acc, item) => acc + item.value * item.weight, 0);
    const normalized = weightedSum / totalWeight;
    return normalized * 10;
  };

  const tableRows = useMemo(() => {
    return rows.map((row) => {
      const generalAverage = computeAverage(
        NPS_TYPES.map((type) => row.answers?.[type.key]?.score)
          .filter((score): score is number => typeof score === 'number' && !Number.isNaN(score))
      );

      return {
        id: row.id,
        companyName: row.companyName,
        healthScore: computeHealthScore(row),
        generalAverage,
        ...NPS_TYPES.reduce((acc, type) => {
          acc[type.key] = row.answers?.[type.key]?.score ?? null;
          return acc;
        }, {} as Record<NpsType, number | null>),
      };
    });
  }, [rows]);

  const columns: GridColDef[] = [
    { field: 'companyName', headerName: 'Empresa', flex: 1.2, minWidth: 240 },
    {
      field: 'healthScore',
      headerName: 'Health Score',
      flex: 0.6,
      minWidth: 140,
      renderCell: (params: GridRenderCellParams) => (
        <span>{formatScore(params.row.healthScore as number | null, 1)}</span>
      ),
    },
    {
      field: 'generalAverage',
      headerName: 'NPS Geral (0-10)',
      flex: 0.7,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <span>{formatScore(params.row.generalAverage as number | null, 1)}</span>
      ),
    },
    ...NPS_TYPES.map((type) => ({
      field: type.key,
      headerName: type.label,
      flex: 0.5,
      minWidth: 120,
      renderCell: (params: GridRenderCellParams) => (
        <span>{formatScore((params.row as Record<string, number | null>)[type.key], 0)}</span>
      ),
    })),
    ...(canManageNps
      ? [
          {
            field: 'actions',
            headerName: 'Acoes',
            minWidth: 120,
            sortable: false,
            filterable: false,
            renderCell: (params: GridRenderCellParams) => (
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    openEditDialog(params.row as NpsEntry);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete((params.row as NpsEntry).id);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ),
          } as GridColDef,
        ]
      : []),
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          NPS - Pesquisa
        </Typography>
        {canManageNps && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            Novo feedback NPS
          </Button>
        )}
      </Stack>

      {!canManageNps && (
        <MuiAlert severity="info" sx={{ mb: 2 }}>
          Voce possui acesso somente de leitura. Apenas Developer, Gestor, Diretor e CS podem criar, editar ou excluir NPS.
        </MuiAlert>
      )}

      {bannerMessage && (
        <MuiAlert severity="success" sx={{ mb: 2 }} onClose={() => setBannerMessage(null)}>
          {bannerMessage}
        </MuiAlert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Carregando respostas...</Typography>
        </Box>
      )}

      {error && (
        <Typography variant="body2" color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Buscar por cliente
        </Typography>
        <Autocomplete
          options={allCompanyOptions}
          value={selectedCompany}
          onChange={(event, newValue) => setSelectedCompany(newValue)}
          renderOption={(props, option) => {
            const isNeverEvaluated = neverEvaluatedClients.some(
              (name) => normalizeText(name) === normalizeText(option)
            );

            return (
              <Box
                component="li"
                {...props}
                sx={{
                  color: isNeverEvaluated ? 'error.main' : 'text.primary',
                  fontWeight: isNeverEvaluated ? 700 : 400,
                }}
              >
                {option}
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField {...params} label="Selecione uma empresa" placeholder="Digite o nome da empresa" />
          )}
        />
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Relatório geral por cliente
        </Typography>
        <Box sx={{ height: 420 }}>
          <DataGrid
            rows={tableRows}
            columns={columns}
            pageSizeOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            onRowClick={(params) => {
              setSelectedCompany(params.row.companyName);
              const clicked = rows.find((item) => item.id === params.row.id);
              if (clicked) {
                openResult(clicked);
              }
            }}
          />
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Clientes nunca avaliados
        </Typography>

        {neverEvaluatedClients.length > 0 ? (
          <>
            <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
              {neverEvaluatedClients.length} cliente(s) sem nenhuma pesquisa NPS registrada.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {neverEvaluatedClients.map((name) => (
                <Chip
                  key={`never-${name}`}
                  label={name}
                  size="small"
                  sx={{
                    color: '#B91C1C',
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                  }}
                />
              ))}
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Todos os clientes possuem pelo menos uma pesquisa NPS.
          </Typography>
        )}
      </Paper>

      {selectedEntry && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            {selectedEntry.companyName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Health Score: {formatScore(computeHealthScore(selectedEntry), 1)}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={2}>
            {NPS_TYPES.map((type) => {
              const answer = selectedEntry.answers?.[type.key];
              const score = typeof answer?.score === 'number' ? answer.score : null;
              return (
                <Box key={type.key} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{type.label}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {type.question}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Pergunta aberta:</strong> {type.openQuestion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.objective.join(' • ')}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 180 }}>
                      <Typography variant="body2" color="text.secondary">Nota</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{score === null ? '-' : score}</Typography>
                      <Chip
                        label={scoreLabel(score)}
                        color={scoreColor(score)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Comentário
                  </Typography>
                  <Typography variant="body1">
                    {answer?.comment || 'Sem comentário registrado.'}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Editar Feedback NPS' : 'Novo Feedback NPS'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Autocomplete
              options={clientes}
              freeSolo
              value={formData.companyName}
              onChange={(_event, newValue) =>
                setFormData((prev) => ({ ...prev, companyName: newValue || '' }))
              }
              onInputChange={(_event, newValue) =>
                setFormData((prev) => ({ ...prev, companyName: newValue || '' }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Empresa" placeholder="Selecione ou digite a empresa" />
              )}
            />

            {NPS_TYPES.map((type) => (
              <Paper key={type.key} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {type.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {type.question}
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Nota (0 a 10)"
                    type="number"
                    inputProps={{ min: 0, max: 10, step: 1 }}
                    value={formData.answers[type.key].score}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        answers: {
                          ...prev.answers,
                          [type.key]: {
                            ...prev.answers[type.key],
                            score: Number.isNaN(value) ? 0 : value,
                          },
                        },
                      }));
                    }}
                    sx={{ width: { xs: '100%', md: 180 } }}
                  />
                  <TextField
                    fullWidth
                    label="Comentario"
                    value={formData.answers[type.key].comment}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        answers: {
                          ...prev.answers,
                          [type.key]: {
                            ...prev.answers[type.key],
                            comment: event.target.value,
                          },
                        },
                      }))
                    }
                  />
                </Stack>
              </Paper>
            ))}

            {formError && <MuiAlert severity="error">{formError}</MuiAlert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Salvando...' : editingId ? 'Salvar alteracoes' : 'Criar feedback'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openResultDialog} onClose={() => setOpenResultDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Resultado do Feedback NPS</DialogTitle>
        <DialogContent>
          {resultEntry && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Empresa" value={resultEntry.companyName} fullWidth InputProps={{ readOnly: true }} />

              {NPS_TYPES.map((type) => {
                const answer = resultEntry.answers?.[type.key];
                return (
                  <Paper key={`result-${type.key}`} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{type.label}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {type.question}
                    </Typography>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <TextField
                        label="Nota"
                        value={typeof answer?.score === 'number' ? answer.score : '-'}
                        sx={{ width: { xs: '100%', md: 160 } }}
                        InputProps={{ readOnly: true }}
                      />
                      <TextField
                        fullWidth
                        label="Comentário"
                        value={answer?.comment || 'Sem comentário registrado.'}
                        InputProps={{ readOnly: true }}
                      />
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResultDialog(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Nps;
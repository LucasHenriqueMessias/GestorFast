import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Autocomplete,
  Box,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { getAccessToken } from '../../utils/storage';

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

const computeNpsScore = (scores: number[]) => {
  if (!scores.length) return null;
  const promoters = scores.filter((score) => score >= 9).length;
  const detractors = scores.filter((score) => score <= 6).length;
  const total = scores.length;
  return ((promoters - detractors) / total) * 100;
};

const formatScore = (value: number | null, digits = 1) => (value === null ? '-' : value.toFixed(digits));

const Nps = () => {
  const [rows, setRows] = useState<NpsEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAccessToken();
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-pesquisa-nps`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const payload = Array.isArray(response.data) ? response.data : [];
        const mapped = payload.map((item: any) => ({
          id: item.id,
          companyName: item.companyName,
          answers: item.answers ?? {},
          createdAt: item.createdAt,
        }));
        setRows(mapped);
      } catch (err) {
        setError('Erro ao buscar respostas de NPS.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const companyNames = useMemo(
    () => rows.map((row) => row.companyName).filter((name) => !!name),
    [rows]
  );

  const selectedEntry = useMemo(
    () => rows.find((row) => row.companyName === selectedCompany) ?? null,
    [rows, selectedCompany]
  );

  const categoryStats = useMemo(() => {
    return NPS_TYPES.map((type) => {
      const scores = rows
        .map((row) => row.answers?.[type.key]?.score)
        .filter((score): score is number => typeof score === 'number' && !Number.isNaN(score));
      return {
        key: type.key,
        label: type.label,
        average: computeAverage(scores),
        nps: computeNpsScore(scores),
        total: scores.length,
      };
    });
  }, [rows]);

  const overallStats = useMemo(() => {
    const allScores = rows
      .flatMap((row) => Object.values(row.answers ?? {}))
      .map((answer) => answer?.score)
      .filter((score): score is number => typeof score === 'number' && !Number.isNaN(score));
    return {
      average: computeAverage(allScores),
      nps: computeNpsScore(allScores),
      totalAnswers: allScores.length,
    };
  }, [rows]);

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

  const healthScoreAverage = useMemo(() => {
    const scores = rows
      .map((row) => computeHealthScore(row))
      .filter((score): score is number => typeof score === 'number' && !Number.isNaN(score));
    return computeAverage(scores);
  }, [rows]);

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
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        NPS - Pesquisa
      </Typography>

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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Clientes avaliados</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{rows.length}</Typography>
          <Typography variant="caption" color="text.secondary">Respostas totais: {overallStats.totalAnswers}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">NPS Geral</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatScore(overallStats.nps, 1)}</Typography>
          <Typography variant="caption" color="text.secondary">Promotores - Detratores</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Média Geral (0-10)</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatScore(overallStats.average, 1)}</Typography>
          <Typography variant="caption" color="text.secondary">Todas as categorias</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">Health Score Médio</Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatScore(healthScoreAverage, 1)}</Typography>
          <Typography variant="caption" color="text.secondary">Ponderação estratégica</Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Visão por categoria
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {categoryStats.map((stat) => (
            <Box key={stat.key} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{stat.label}</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Média</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatScore(stat.average, 1)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">NPS</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{formatScore(stat.nps, 1)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Respostas</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{stat.total}</Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Buscar por cliente
        </Typography>
        <Autocomplete
          options={companyNames}
          value={selectedCompany}
          onChange={(event, newValue) => setSelectedCompany(newValue)}
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
            onRowClick={(params) => setSelectedCompany(params.row.companyName)}
          />
        </Box>
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
    </Container>
  );
};

export default Nps;
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { getAccessToken } from '../../utils/storage';

type NpsType =
  | 'consultant'
  | 'analyst'
  | 'roi'
  | 'trust'
  | 'communication'
  | 'ease'
  | 'implementation';

type NpsAnswer = {
  score: number;
  comment: string;
};

type NpsEntry = {
  id: number;
  companyName: string;
  answers: Partial<Record<NpsType, NpsAnswer>>;
  createdAt?: string;
};

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

type ConsultantMetrics = {
  consultant: string;
  activeClients: number;
  inactiveClients: number;
  mrr: number;
  ticketMedio: number;
  churnRate: number;
  ltv: number | null;
  nps: number | null;
  npsAverage: number | null;
  npsResponses: number;
  icrAverage: number | null;
  icrResponses: number;
};

type DashboardCsResponse = {
  generatedAt: string;
  period?: DashboardPeriod;
  overview: {
    consultants: number;
    activeClients: number;
    inactiveClients: number;
    mrr: number;
    churnRate: number;
    ltv: number | null;
    nps: number | null;
    npsAverage: number | null;
    npsResponses: number;
    icrAverage: number | null;
    icrResponses: number;
  };
  byConsultant: ConsultantMetrics[];
};

type DashboardPeriod = 'monthly' | 'quarterly' | 'semiannual' | 'yearly' | 'all';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string }> = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'yearly', label: 'Anual' },
  { value: 'all', label: 'Tudo' },
];

const getPeriodStartDate = (period: DashboardPeriod): Date | null => {
  if (period === 'all') return null;

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === 'monthly') {
    start.setDate(1);
    return start;
  }

  if (period === 'quarterly') {
    const currentMonth = now.getMonth();
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
    return start;
  }

  if (period === 'semiannual') {
    const currentMonth = now.getMonth();
    const semesterStartMonth = currentMonth < 6 ? 0 : 6;
    start.setMonth(semesterStartMonth, 1);
    return start;
  }

  start.setMonth(0, 1);
  return start;
};

const currency = (value: number | null | undefined) =>
  value === null
    ? 'Infinito'
    : `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pct = (value: number | null | undefined) =>
  `${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

const score = (value: number | null | undefined, digits = 2) =>
  value === null || value === undefined
    ? '-'
    : Number(value).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const computeAverage = (scores: number[]) => {
  if (!scores.length) return null;
  const sum = scores.reduce((acc, value) => acc + value, 0);
  return sum / scores.length;
};

const computeNpsScore = (scores: number[]) => {
  if (!scores.length) return null;
  const promoters = scores.filter((value) => value >= 9).length;
  const detractors = scores.filter((value) => value <= 6).length;
  return ((promoters - detractors) / scores.length) * 100;
};

const formatScore = (value: number | null, digits = 1) => (value === null ? '-' : value.toFixed(digits));

const RelatorioCS = () => {
  const [loading, setLoading] = useState(false);
  const [loadingNps, setLoadingNps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardCsResponse | null>(null);
  const [npsRows, setNpsRows] = useState<NpsEntry[]>([]);
  const [selectedConsultant, setSelectedConsultant] = useState<string>('GERAL');
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('monthly');

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!apiUrl) {
        setError('REACT_APP_API_URL não configurada.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = getAccessToken();
        const response = await axios.get(`${apiUrl}/tab-pesquisa-nps/dashboard/cs`, {
          params: { period: selectedPeriod },
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboard(response.data);
      } catch (err) {
        setError('Erro ao carregar dashboard de CS.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [apiUrl, selectedPeriod]);

  useEffect(() => {
    const fetchNpsRows = async () => {
      if (!apiUrl) return;

      setLoadingNps(true);
      try {
        const token = getAccessToken();
        const response = await axios.get(`${apiUrl}/tab-pesquisa-nps`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = Array.isArray(response.data) ? response.data : [];
        const mapped: NpsEntry[] = payload.map((item: any) => ({
          id: item.id,
          companyName: item.companyName,
          answers: item.answers ?? {},
          createdAt: item.createdAt,
        }));

        const sorted = [...mapped].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (bTime !== aTime) return bTime - aTime;
          return b.id - a.id;
        });

        setNpsRows(sorted);
      } catch {
        // Keep CS dashboard functional even if NPS details fail.
      } finally {
        setLoadingNps(false);
      }
    };

    fetchNpsRows();
  }, [apiUrl]);

  const filteredNpsRows = useMemo(() => {
    const startDate = getPeriodStartDate(selectedPeriod);
    if (!startDate) return npsRows;

    return npsRows.filter((row) => {
      if (!row.createdAt) return false;
      return new Date(row.createdAt).getTime() >= startDate.getTime();
    });
  }, [npsRows, selectedPeriod]);

  const selectedData = useMemo(() => {
    if (!dashboard) return null;
    if (selectedConsultant === 'GERAL') return null;
    return dashboard.byConsultant.find((item) => item.consultant === selectedConsultant) || null;
  }, [dashboard, selectedConsultant]);

  const topNps = useMemo(() => {
    if (!dashboard) return [];
    return [...dashboard.byConsultant]
      .filter((item) => item.nps !== null)
      .sort((a, b) => (b.nps || 0) - (a.nps || 0))
      .slice(0, 5);
  }, [dashboard]);

  const topIcr = useMemo(() => {
    if (!dashboard) return [];
    return [...dashboard.byConsultant]
      .filter((item) => item.icrAverage !== null)
      .sort((a, b) => (b.icrAverage || 0) - (a.icrAverage || 0))
      .slice(0, 5);
  }, [dashboard]);

  const consultantRows = useMemo(() => {
    if (!dashboard) return [];
    return dashboard.byConsultant.map((item, index) => ({ id: index + 1, ...item }));
  }, [dashboard]);

  const categoryStats = useMemo(() => {
    return NPS_TYPES.map((type) => {
      const scores = filteredNpsRows
        .map((row) => row.answers?.[type.key]?.score)
        .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));

      return {
        key: type.key,
        label: type.label,
        average: computeAverage(scores),
        nps: computeNpsScore(scores),
        total: scores.length,
      };
    });
  }, [filteredNpsRows]);

  const npsOverallStats = useMemo(() => {
    const allScores = filteredNpsRows
      .flatMap((row) => Object.values(row.answers ?? {}))
      .map((answer) => answer?.score)
      .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));

    return {
      average: computeAverage(allScores),
      nps: computeNpsScore(allScores),
      totalAnswers: allScores.length,
    };
  }, [filteredNpsRows]);

  const computeHealthScore = (entry: NpsEntry) => {
    const scores = NPS_TYPES.map((type) => ({
      key: type.key,
      value: entry.answers?.[type.key]?.score,
    })).filter((item): item is { key: NpsType; value: number } =>
      typeof item.value === 'number' && !Number.isNaN(item.value),
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
    return (weightedSum / totalWeight) * 10;
  };

  const healthScoreAverage = useMemo(() => {
    const scores = filteredNpsRows
      .map((row) => computeHealthScore(row))
      .filter((value): value is number => typeof value === 'number' && !Number.isNaN(value));
    return computeAverage(scores);
  }, [filteredNpsRows]);

  const consultantColumns: GridColDef[] = [
    { field: 'consultant', headerName: 'Consultor', flex: 1.1, minWidth: 180 },
    { field: 'activeClients', headerName: 'Ativos', type: 'number', minWidth: 90 },
    { field: 'inactiveClients', headerName: 'Inativos', type: 'number', minWidth: 95 },
    {
      field: 'mrr',
      headerName: 'MRR',
      minWidth: 130,
      valueFormatter: (value) => currency(Number(value)),
    },
    {
      field: 'ltv',
      headerName: 'LTV',
      minWidth: 130,
      valueFormatter: (value) => currency(Number(value)),
    },
    {
      field: 'churnRate',
      headerName: 'Churn',
      minWidth: 110,
      valueFormatter: (value) => pct(Number(value)),
    },
    {
      field: 'nps',
      headerName: 'NPS',
      minWidth: 100,
      valueFormatter: (value) => score(value as number | null, 1),
    },
    {
      field: 'icrAverage',
      headerName: 'ICR Médio',
      minWidth: 110,
      valueFormatter: (value) => score(value as number | null, 2),
    },
    { field: 'npsResponses', headerName: 'Resp. NPS', type: 'number', minWidth: 105 },
    { field: 'icrResponses', headerName: 'Resp. ICR', type: 'number', minWidth: 105 },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Sucesso do Cliente
          </Typography>
          <Typography variant="body2" color="text.secondary">
            LTV, Churn, NPS e ICR geral e por consultor
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel id="periodo-cs-select">Período</InputLabel>
            <Select
              labelId="periodo-cs-select"
              value={selectedPeriod}
              label="Período"
              onChange={(event) => setSelectedPeriod(event.target.value as DashboardPeriod)}
            >
              {PERIOD_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 260 }}>
            <InputLabel id="consultor-cs-select">Visão</InputLabel>
            <Select
              labelId="consultor-cs-select"
              value={selectedConsultant}
              label="Visão"
              onChange={(event) => setSelectedConsultant(event.target.value)}
            >
              <MenuItem value="GERAL">Geral FAST</MenuItem>
              {(dashboard?.byConsultant || []).map((item) => (
                <MenuItem key={item.consultant} value={item.consultant}>
                  {item.consultant}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <CircularProgress size={22} />
          <Typography>Carregando indicadores...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {dashboard && (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">NPS Geral FAST</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {score(selectedData?.nps ?? dashboard.overview.nps, 1)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Média nota: {score(selectedData?.npsAverage ?? dashboard.overview.npsAverage, 2)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">ICR Médio</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {score(selectedData?.icrAverage ?? dashboard.overview.icrAverage, 2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Resp.: {selectedData?.icrResponses ?? dashboard.overview.icrResponses}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">LTV</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {currency(selectedData?.ltv ?? dashboard.overview.ltv)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    MRR: {currency(selectedData?.mrr ?? dashboard.overview.mrr)}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">Churn</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {pct(selectedData?.churnRate ?? dashboard.overview.churnRate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ativos: {selectedData?.activeClients ?? dashboard.overview.activeClients} | Inativos: {selectedData?.inactiveClients ?? dashboard.overview.inactiveClients}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
            <Box>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top 5 NPS por Consultor</Typography>
                <Stack spacing={1.5}>
                  {topNps.length === 0 && <Typography color="text.secondary">Sem respostas NPS suficientes.</Typography>}
                  {topNps.map((item) => {
                    const barValue = Math.max(0, Math.min(100, ((item.nps || 0) + 100) / 2));
                    return (
                      <Box key={`nps-${item.consultant}`}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.consultant}</Typography>
                          <Typography variant="body2">{score(item.nps, 1)}</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={barValue} sx={{ mt: 0.5, height: 8, borderRadius: 8 }} />
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Box>
            <Box>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Top 5 ICR por Consultor</Typography>
                <Stack spacing={1.5}>
                  {topIcr.length === 0 && <Typography color="text.secondary">Sem respostas ICR suficientes.</Typography>}
                  {topIcr.map((item) => {
                    const barValue = Math.max(0, Math.min(100, ((item.icrAverage || 0) / 10) * 100));
                    return (
                      <Box key={`icr-${item.consultant}`}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.consultant}</Typography>
                          <Typography variant="body2">{score(item.icrAverage, 2)}</Typography>
                        </Stack>
                        <LinearProgress color="success" variant="determinate" value={barValue} sx={{ mt: 0.5, height: 8, borderRadius: 8 }} />
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            </Box>
          </Box>

          {loadingNps ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Carregando detalhes de NPS...</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">Clientes avaliados</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{filteredNpsRows.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Respostas totais: {npsOverallStats.totalAnswers}</Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">NPS Geral</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatScore(npsOverallStats.nps, 1)}</Typography>
                  <Typography variant="caption" color="text.secondary">Promotores - Detratores</Typography>
                </Paper>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">Média Geral (0-10)</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatScore(npsOverallStats.average, 1)}</Typography>
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
                  NPS total por categoria
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

            </>
          )}

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Indicadores por Consultor
            </Typography>
            <Box sx={{ height: 520 }}>
              <DataGrid
                rows={consultantRows}
                columns={consultantColumns}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                onRowClick={(params) => setSelectedConsultant(params.row.consultant)}
              />
            </Box>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default RelatorioCS;

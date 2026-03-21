import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { getAccessToken } from '../../utils/storage';

type UserItem = {
  user: string;
};

type TabFunilVenda = {
  id: number;
  colaborador: string;
  contato: number;
  qualificacoes: number;
  visitas: number;
  propostas: number;
  contratos: number;
  data: string;
  naoFechados: number;
  semPerfil: number;
  nutricao: number;
};

type FunnelTotals = {
  contato: number;
  qualificacoes: number;
  visitas: number;
  propostas: number;
  contratos: number;
  naoFechados: number;
  semPerfil: number;
  nutricao: number;
};

type EvolutionSeriesKey =
  | 'contato'
  | 'qualificacoes'
  | 'visitas'
  | 'propostas'
  | 'contratos'
  | 'naoFechados'
  | 'semPerfil'
  | 'nutricao';

type PeriodFilter = 'diario' | 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'personalizado';

type EvolutionPoint = {
  label: string;
  contato: number;
  qualificacoes: number;
  visitas: number;
  propostas: number;
  contratos: number;
  naoFechados: number;
  semPerfil: number;
  nutricao: number;
};

const evolutionSeriesDefinition: Array<{ key: EvolutionSeriesKey; label: string }> = [
  { key: 'contato', label: 'Contato' },
  { key: 'qualificacoes', label: 'Qualificado' },
  { key: 'visitas', label: 'Visitas Efetuadas' },
  { key: 'propostas', label: 'Propostas Efetuadas' },
  { key: 'contratos', label: 'Contratos Fechados' },
  { key: 'naoFechados', label: 'Não Fechados' },
  { key: 'semPerfil', label: 'Sem Perfil' },
  { key: 'nutricao', label: 'Nutrição' },
];

const fluxoPrincipalSeriesKeys: EvolutionSeriesKey[] = [
  'contato',
  'qualificacoes',
  'visitas',
  'propostas',
  'contratos',
];

const foraFunilSeriesKeys: EvolutionSeriesKey[] = ['naoFechados', 'semPerfil', 'nutricao'];

const createEmptyEvolutionPointValues = () => ({
  contato: 0,
  qualificacoes: 0,
  visitas: 0,
  propostas: 0,
  contratos: 0,
  naoFechados: 0,
  semPerfil: 0,
  nutricao: 0,
});

const parseRowDate = (value: string) => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return null;
  }

  const brPattern = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brPattern) {
    const day = Number(brPattern[1]);
    const month = Number(brPattern[2]);
    const year = Number(brPattern[3]);
    const parsed = new Date(year, month - 1, day);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

const EvolutionChart = ({
  title,
  data,
  seriesKeys,
}: {
  title: string;
  data: EvolutionPoint[];
  seriesKeys: EvolutionSeriesKey[];
}) => {
  const theme = useTheme();
  const lineColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.grey[700],
    theme.palette.grey[500],
  ];

  const selectedSeries = evolutionSeriesDefinition.filter((item) => seriesKeys.includes(item.key));

  const series = selectedSeries.map((item, index) => ({
    ...item,
    color: lineColors[index % lineColors.length],
  }));

  const maxValue = Math.max(...data.flatMap((point) => series.map((item) => point[item.key])), 0);

  const chartWidth = 900;
  const chartHeight = 300;
  const padding = {
    top: 14,
    right: 20,
    bottom: 30,
    left: 58,
  };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const valueRange = maxValue > 0 ? maxValue : 1;
  const axisLabelStep = Math.max(1, Math.ceil(data.length / 8));

  const shouldRenderAxisLabel = (index: number) => index % axisLabelStep === 0 || index === data.length - 1;

  const getX = (index: number) => {
    if (data.length <= 1) {
      return padding.left + plotWidth / 2;
    }
    return padding.left + (index * plotWidth) / (data.length - 1);
  };

  const getY = (value: number) => padding.top + ((valueRange - value) / valueRange) * plotHeight;

  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" fontWeight={700} mb={2}>
        {title}
      </Typography>

      {data.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          Sem dados suficientes para exibir este gráfico.
        </Typography>
      ) : (
        <>
          <Box sx={{ width: '100%', pb: 1 }}>
            <svg
              width="100%"
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={title}
            >
                {[0, 1, 2, 3, 4].map((level) => {
                  const y = padding.top + (plotHeight * level) / 4;
                  const tickValue = Math.round(((4 - level) / 4) * valueRange);
                  return (
                    <g key={`grid-${level}`}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke={theme.palette.divider}
                        strokeWidth={1}
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fill={theme.palette.text.secondary}
                        fontSize="13"
                        fontWeight="700"
                      >
                        {tickValue}
                      </text>
                    </g>
                  );
                })}

                {series.map((item) => {
                  const points = data.map((point, index) => ({
                    x: getX(index),
                    y: getY(point[item.key]),
                    value: point[item.key],
                  }));

                  const path = points
                    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
                    .join(' ');

                  return (
                    <g key={item.key}>
                      <path d={path} fill="none" stroke={item.color} strokeWidth={2.4} />
                      {points.map((point, index) => (
                        <circle key={`${item.key}-${index}`} cx={point.x} cy={point.y} r={3.4} fill={item.color}>
                          <title>{`${item.label} (${data[index].label}): ${point.value}`}</title>
                        </circle>
                      ))}
                    </g>
                  );
                })}

                {data.map((point, index) =>
                  shouldRenderAxisLabel(index) ? (
                    <text
                      key={`label-${point.label}`}
                      x={getX(index)}
                      y={chartHeight - 8}
                      textAnchor="middle"
                      fill={theme.palette.text.secondary}
                      fontSize="13"
                      fontWeight="700"
                    >
                      {point.label}
                    </text>
                  ) : null,
                )}
              </svg>
          </Box>

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            {series.map((item) => (
              <Stack key={item.key} direction="row" spacing={0.75} alignItems="center">
                <Box sx={{ width: 14, height: 14, borderRadius: 0.5, backgroundColor: item.color }} />
                <Typography variant="body2" color="text.secondary" fontWeight={700}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
};

const RelatorioComercial = () => {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [rows, setRows] = useState<TabFunilVenda[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('mensal');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const apiBaseUrl = process.env.REACT_APP_API_URL;

  const authConfig = useMemo(
    () => () => ({
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    }),
    [],
  );

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const fetchUsersComercial = useCallback(async () => {
    setLoadingUsers(true);
    setError('');
    try {
      const response = await axios.get<UserItem[]>(
        `${apiBaseUrl}/login/department/username/Comercial`,
        authConfig(),
      );
      const list = (Array.isArray(response.data) ? response.data : [])
        .map((item) => item?.user)
        .filter((item): item is string => Boolean(item));
      setUsers(list);
    } catch {
      setError('Erro ao carregar usuários do Comercial.');
    } finally {
      setLoadingUsers(false);
    }
  }, [apiBaseUrl, authConfig]);

  const fetchFunilData = useCallback(
    async (user: string, currentUsers: string[]) => {
      setLoadingData(true);
      setError('');
      try {
        if (user === 'GERAL') {
          const response = await axios.get<TabFunilVenda[]>(`${apiBaseUrl}/tab-funil-vendas`, authConfig());
          const allRows = Array.isArray(response.data) ? response.data : [];
          const allowedUsers = new Set(currentUsers);
          const filteredRows = allRows.filter((item) => allowedUsers.has(item.colaborador));
          setRows(filteredRows);
        } else {
          const response = await axios.get<TabFunilVenda[]>(
            `${apiBaseUrl}/tab-funil-vendas/colaborador/${encodeURIComponent(user)}`,
            authConfig(),
          );
          setRows(Array.isArray(response.data) ? response.data : []);
        }
      } catch {
        setRows([]);
        setError('Erro ao carregar dados do funil comercial.');
      } finally {
        setLoadingData(false);
      }
    },
    [apiBaseUrl, authConfig],
  );

  useEffect(() => {
    fetchUsersComercial();
  }, [fetchUsersComercial]);

  const now = useMemo(() => new Date(), []);

  const parsedCustomStartDate = useMemo(() => {
    if (!customStartDate) {
      return null;
    }

    const parsed = new Date(customStartDate);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [customStartDate]);

  const parsedCustomEndDate = useMemo(() => {
    if (!customEndDate) {
      return null;
    }

    const parsed = new Date(customEndDate);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    parsed.setHours(23, 59, 59, 999);
    return parsed;
  }, [customEndDate]);

  const filteredRowsByPeriod = useMemo<TabFunilVenda[]>(() => {
    return rows.filter((row) => {
      const parsedDate = parseRowDate(row.data);
      if (!parsedDate) {
        return false;
      }

      if (periodFilter === 'personalizado') {
        if (!parsedCustomStartDate || !parsedCustomEndDate) {
          return true;
        }

        return parsedDate >= parsedCustomStartDate && parsedDate <= parsedCustomEndDate;
      }

      const sameYear = parsedDate.getFullYear() === now.getFullYear();
      const month = parsedDate.getMonth();
      const currentMonth = now.getMonth();

      switch (periodFilter) {
        case 'diario':
          return (
            parsedDate.getDate() === now.getDate() &&
            parsedDate.getMonth() === currentMonth &&
            sameYear
          );
        case 'mensal':
          return parsedDate.getMonth() === currentMonth && sameYear;
        case 'trimestral': {
          const currentQuarter = Math.floor(currentMonth / 3);
          const rowQuarter = Math.floor(month / 3);
          return rowQuarter === currentQuarter && sameYear;
        }
        case 'semestral': {
          const currentSemester = currentMonth < 6 ? 1 : 2;
          const rowSemester = month < 6 ? 1 : 2;
          return rowSemester === currentSemester && sameYear;
        }
        case 'anual':
          return sameYear;
        default:
          return true;
      }
    });
  }, [rows, periodFilter, parsedCustomStartDate, parsedCustomEndDate, now]);

  const totals = useMemo<FunnelTotals>(() => {
    return filteredRowsByPeriod.reduce(
      (acc, item) => ({
        contato: acc.contato + toNumber(item.contato),
        qualificacoes: acc.qualificacoes + toNumber(item.qualificacoes),
        visitas: acc.visitas + toNumber(item.visitas),
        propostas: acc.propostas + toNumber(item.propostas),
        contratos: acc.contratos + toNumber(item.contratos),
        naoFechados: acc.naoFechados + toNumber(item.naoFechados),
        semPerfil: acc.semPerfil + toNumber(item.semPerfil),
        nutricao: acc.nutricao + toNumber(item.nutricao),
      }),
      {
        contato: 0,
        qualificacoes: 0,
        visitas: 0,
        propostas: 0,
        contratos: 0,
        naoFechados: 0,
        semPerfil: 0,
        nutricao: 0,
      },
    );
  }, [filteredRowsByPeriod]);

  const funilCards = [
    { label: 'Contato', value: totals.contato },
    { label: 'Qualificado', value: totals.qualificacoes },
    { label: 'Visitas Efetuadas', value: totals.visitas },
    { label: 'Propostas Efetuadas', value: totals.propostas },
    { label: 'Contratos Fechados', value: totals.contratos },
  ];

  const funilForaCards = [
    { label: 'Não Fechados', value: totals.naoFechados },
    { label: 'Sem Perfil', value: totals.semPerfil },
    { label: 'Nutrição', value: totals.nutricao },
  ];

  const evolucaoMensal = useMemo<EvolutionPoint[]>(() => {
    const grouped = new Map<
      string,
      {
        sortKey: number;
        label: string;
        values: ReturnType<typeof createEmptyEvolutionPointValues>;
      }
    >();

    filteredRowsByPeriod.forEach((row) => {
      const parsedDate = parseRowDate(row.data);
      if (!parsedDate) {
        return;
      }

      const month = parsedDate.getMonth();
      const year = parsedDate.getFullYear();
      const key = `${year}-${String(month + 1).padStart(2, '0')}`;
      const existing = grouped.get(key) ?? {
        sortKey: year * 100 + month,
        label: `${String(month + 1).padStart(2, '0')}/${String(year).slice(-2)}`,
        values: createEmptyEvolutionPointValues(),
      };

      evolutionSeriesDefinition.forEach((item) => {
        existing.values[item.key] += toNumber(row[item.key]);
      });
      grouped.set(key, existing);
    });

    return Array.from(grouped.values())
      .sort((left, right) => left.sortKey - right.sortKey)
      .map((item) => ({
        label: item.label,
        ...item.values,
      }));
  }, [filteredRowsByPeriod]);

  const evolucaoTrimestral = useMemo<EvolutionPoint[]>(() => {
    const grouped = new Map<
      string,
      {
        sortKey: number;
        label: string;
        values: ReturnType<typeof createEmptyEvolutionPointValues>;
      }
    >();

    filteredRowsByPeriod.forEach((row) => {
      const parsedDate = parseRowDate(row.data);
      if (!parsedDate) {
        return;
      }

      const month = parsedDate.getMonth();
      const year = parsedDate.getFullYear();
      const quarter = Math.floor(month / 3) + 1;
      const key = `${year}-T${quarter}`;
      const existing = grouped.get(key) ?? {
        sortKey: year * 10 + quarter,
        label: `T${quarter}/${year}`,
        values: createEmptyEvolutionPointValues(),
      };

      evolutionSeriesDefinition.forEach((item) => {
        existing.values[item.key] += toNumber(row[item.key]);
      });
      grouped.set(key, existing);
    });

    return Array.from(grouped.values())
      .sort((left, right) => left.sortKey - right.sortKey)
      .map((item) => ({
        label: item.label,
        ...item.values,
      }));
  }, [filteredRowsByPeriod]);

  const selectedEvolutionMode = periodFilter === 'trimestral' || periodFilter === 'semestral' ? 'trimestral' : 'mensal';
  const selectedEvolutionData = selectedEvolutionMode === 'trimestral' ? evolucaoTrimestral : evolucaoMensal;

  const selectedEvolutionTitle =
    periodFilter === 'diario'
      ? 'Evolução Diária (base mensal)'
      : periodFilter === 'mensal'
        ? 'Evolução Mensal'
        : periodFilter === 'trimestral'
          ? 'Evolução Trimestral'
          : periodFilter === 'semestral'
            ? 'Evolução Semestral (base trimestral)'
            : periodFilter === 'anual'
              ? 'Evolução Anual (base mensal)'
              : 'Evolução do Período (base mensal)';

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Relatório Comercial
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 260 } }}>
              <InputLabel id="period-filter-label">Filtro de período</InputLabel>
              <Select
                labelId="period-filter-label"
                id="period-filter"
                value={periodFilter}
                label="Filtro de período"
                onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}
              >
                <MenuItem value="diario">Diário</MenuItem>
                <MenuItem value="mensal">Mensal</MenuItem>
                <MenuItem value="trimestral">Trimestral</MenuItem>
                <MenuItem value="semestral">Semestral</MenuItem>
                <MenuItem value="anual">Anual</MenuItem>
                <MenuItem value="personalizado">Período personalizado</MenuItem>
              </Select>
            </FormControl>

            {periodFilter === 'personalizado' && (
              <>
                <TextField
                  size="small"
                  label="De"
                  type="date"
                  value={customStartDate}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: { xs: '100%', sm: 180 } }}
                />
                <TextField
                  size="small"
                  label="Até"
                  type="date"
                  value={customEndDate}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: { xs: '100%', sm: 180 } }}
                />
              </>
            )}
          </Stack>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
            <Box sx={{ width: { xs: '100%', sm: '220px' } }}>
              <Button
                variant="contained"
                color={selectedUser === 'GERAL' ? 'primary' : 'inherit'}
                onClick={() => {
                  setSelectedUser('GERAL');
                  fetchFunilData('GERAL', users);
                }}
                disabled={loadingUsers || loadingData}
                fullWidth
                sx={{
                  height: 72,
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
              >
                Geral
              </Button>
            </Box>

            {loadingUsers ? (
              <CircularProgress size={20} />
            ) : (
              users.map((user) => (
                <Box key={user} sx={{ width: { xs: '100%', sm: '220px' } }}>
                  <Button
                    variant="contained"
                    color={selectedUser === user ? 'primary' : 'inherit'}
                    onClick={() => {
                      setSelectedUser(user);
                      fetchFunilData(user, users);
                    }}
                    disabled={loadingData}
                    fullWidth
                    sx={{
                      height: 72,
                      fontWeight: 'bold',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        transition: 'transform 0.2s ease-in-out',
                      },
                    }}
                  >
                    {user}
                  </Button>
                </Box>
              ))
            )}
          </Stack>

        </Paper>

        {error && <Alert severity="error">{error}</Alert>}

        {selectedUser ? (
          <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                {selectedUser === 'GERAL' ? 'Funil Geral - Comercial' : `Funil de ${selectedUser}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Registros considerados: {filteredRowsByPeriod.length}
              </Typography>
            </Stack>

            {loadingData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ width: '100%', maxWidth: 1120, mx: 'auto' }}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack spacing={1.25} alignItems="center">
                        {funilCards.map((card, index) => {
                          const desktopWidth = Math.max(58, 100 - index * 12);
                          const mobileWidth = Math.max(78, desktopWidth);

                          return (
                            <Paper
                              key={card.label}
                              variant="outlined"
                              sx={{
                                width: { xs: `${mobileWidth}%`, md: `${desktopWidth}%` },
                                px: 2,
                                py: 1.5,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                clipPath: 'polygon(3% 0, 97% 0, 100% 100%, 0 100%)',
                                borderRadius: 0,
                              }}
                            >
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                {card.label}
                              </Typography>
                              <Typography variant="h6" fontWeight={700}>
                                {card.value}
                              </Typography>
                            </Paper>
                          );
                        })}
                      </Stack>
                    </Box>

                    <Paper variant="outlined" sx={{ width: { xs: '100%', md: 280 }, p: 2, flexShrink: 0 }}>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight={700} mb={1.5}>
                        Fora do Funil
                      </Typography>
                      <Stack spacing={1}>
                        {funilForaCards.map((card) => (
                          <Paper key={card.label} variant="outlined" sx={{ px: 1.5, py: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                {card.label}
                              </Typography>
                              <Typography variant="h6" fontWeight={700}>
                                {card.value}
                              </Typography>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Paper>
                  </Stack>

                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={700}>
                      {selectedEvolutionTitle}
                    </Typography>

                    <Box sx={{ width: '100%' }}>
                      <EvolutionChart
                        title={`${selectedEvolutionTitle} - Fluxo Principal`}
                        data={selectedEvolutionData}
                        seriesKeys={fluxoPrincipalSeriesKeys}
                      />
                    </Box>

                    <Box sx={{ width: '100%' }}>
                      <EvolutionChart
                        title={`${selectedEvolutionTitle} - Fora do Funil`}
                        data={selectedEvolutionData}
                        seriesKeys={foraFunilSeriesKeys}
                      />
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Paper>
        ) : (
          <></>
        )}
      </Stack>
    </Container>
  );
};

export default RelatorioComercial;
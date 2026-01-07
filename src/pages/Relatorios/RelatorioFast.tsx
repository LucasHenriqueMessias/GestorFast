import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Box, Paper, Typography, CircularProgress, Alert, Stack, IconButton } from '@mui/material';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { getAccessToken } from '../../utils/storage';

type GeoPoint = {
  city: string;
  state: string;
  count: number;
  coords: {
    lat: number;
    lng: number;
  };
};

type GeoClientesResponse = {
  totals: {
    clientes: number;
    cidades: number;
    semCoordenadas: number;
  };
  points: GeoPoint[];
  missing: unknown[];
};

type RelatorioFastResponse = {
  soma_fatura?: number;
  prospeccao_quente?: number;
  prospeccao_fria?: number;
  reunioes_realizadas?: number;
  ferramentas_desenvolvidas?: number;
  chamados_ativos?: number;
  chamados_finalizados?: number;
  chamados_total?: number;
  clientes_sinal_amarelo?: number;
  eventos_pendentes?: number;
  eventos_realizados?: number;
  clientes_ativos?: number;
  clientes_ativos_fast?: number;
  clientes_funil?: number;
  clientes_total?: number;
  clientes_total_fast?: number;
  total_clientes?: number;
};

type FastMetrics = {
  soma_fatura: number;
  prospeccao_quente: number;
  prospeccao_fria: number;
  reunioes_realizadas: number;
  ferramentas_desenvolvidas: number;
  chamados_ativos: number;
  chamados_finalizados: number;
  chamados_total: number;
  clientes_sinal_amarelo: number;
  eventos_pendentes: number;
  eventos_realizados: number;
  clientes_ativos: number;
  clientes_funil: number;
  clientes_total: number;
};

const DEFAULT_METRICS: FastMetrics = {
  soma_fatura: 0,
  prospeccao_quente: 0,
  prospeccao_fria: 0,
  reunioes_realizadas: 0,
  ferramentas_desenvolvidas: 0,
  chamados_ativos: 0,
  chamados_finalizados: 0,
  chamados_total: 0,
  clientes_sinal_amarelo: 0,
  eventos_pendentes: 0,
  eventos_realizados: 0,
  clientes_ativos: 0,
  clientes_funil: 0,
  clientes_total: 0,
};

type ChartDatum = {
  label: string;
  value: number;
  color: string;
};

const SimpleBarChart: React.FC<{ title: string; data: ChartDatum[] }> = ({ title, data }) => {
  const maxValue = useMemo(() => {
    const highest = Math.max(...data.map((item) => item.value), 0);
    return Number.isFinite(highest) ? highest : 0;
  }, [data]);

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="flex-end" justifyContent="space-between" sx={{ height: 160 }}>
        {data.map((item) => {
          const normalized = maxValue > 0 ? (item.value / maxValue) * 120 : 0;
          return (
            <Box key={item.label} sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  mx: 'auto',
                  width: '70%',
                  minHeight: 6,
                  height: normalized,
                  backgroundColor: item.color,
                  borderRadius: 1,
                  transition: 'height 0.3s ease',
                }}
              />
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

const BRAZIL_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const BRAZIL_STATES_GEO_URL =
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson';

const GeoClientsMap: React.FC<{ points: GeoPoint[]; height?: number | string }> = ({ points, height = '420px' }) => {
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);

  return (
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ scale: 650, center: [-54, -15] }}
      style={{ width: '100%', height }}
      onContextMenu={(event: React.MouseEvent<SVGSVGElement>) => event.preventDefault()}
    >
      <ZoomableGroup
        defaultCenter={[-54, -15] as [number, number]}
        defaultZoom={1}
        minZoom={0.5}
        maxZoom={8}
        translateExtent={[[-1000, -700], [1000, 700]]}
        zoomBehaviorConfig={{
          filter: (event: any) => {
            if (event.type === 'wheel') {
              return true;
            }
            if (event.type === 'mousedown') {
              return event.button === 0 || event.button === 2;
            }
            return !event.ctrlKey;
          },
        }}
      >
        <Geographies geography={BRAZIL_TOPO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies
              .filter((geo) => geo.properties?.name === 'Brazil')
              .map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  stroke="#0D47A1"
                  strokeWidth={0.7}
                  style={{
                    default: { fill: '#81A1D1', outline: 'none' },
                    hover: { fill: '#5C7FB0', outline: 'none' },
                    pressed: { fill: '#425E85', outline: 'none' },
                  }}
                />
              ))
          }
        </Geographies>
        <Geographies geography={BRAZIL_STATES_GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo) => (
              <Geography
                key={`state-${geo.rsmKey}`}
                geography={geo}
                fill="transparent"
                stroke="rgba(15, 23, 42, 0.45)"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        {points.map((point) => {
          const markerKey = `${point.city}-${point.state}`;
          return (
            <Marker key={markerKey} coordinates={[point.coords.lng, point.coords.lat]}>
              <title>{`${point.city} (${point.count})`}</title>
              <circle
                r={Math.max(4, Math.sqrt(point.count) * 3)}
                fill="#E91E63"
                stroke="#FFFFFF"
                strokeWidth={1}
                onMouseEnter={() => setHoveredMarker(markerKey)}
                onMouseLeave={() => setHoveredMarker(null)}
              />
              {hoveredMarker === markerKey ? (
                <text
                  textAnchor="middle"
                  y={-14}
                  style={{ pointerEvents: 'none', fontSize: 12, fontWeight: 600, fill: '#0D47A1' }}
                >
                  {`${point.city} (${point.count})`}
                </text>
              ) : null}
            </Marker>
          );
        })}
      </ZoomableGroup>
    </ComposableMap>
  );
};

const RelatorioFast: React.FC = () => {
  const [data, setData] = useState<RelatorioFastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [geoData, setGeoData] = useState<GeoClientesResponse | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(true);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  useEffect(() => {
    const fetchRelatorio = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = getAccessToken();
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const response = await axios.get<RelatorioFastResponse>(`${baseUrl}/loja/relatorio-fast`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        setData(response.data);
      } catch (requestError) {
        setError('Não foi possível carregar os indicadores do Fast.');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatorio();
  }, []);

  useEffect(() => {
    const fetchGeoClientes = async () => {
      setGeoLoading(true);
      setGeoError(null);

      try {
        const token = getAccessToken();
        const baseUrl = process.env.REACT_APP_API_URL || '';
        const response = await axios.get<GeoClientesResponse>(`${baseUrl}/loja/geo-clientes`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        setGeoData(response.data);
      } catch (requestError) {
        setGeoError('Não foi possível carregar os dados geográficos.');
      } finally {
        setGeoLoading(false);
      }
    };

    fetchGeoClientes();
  }, []);

  const metrics = useMemo<FastMetrics>(() => {
    if (!data) {
      return DEFAULT_METRICS;
    }

    return {
      soma_fatura: data.soma_fatura ?? DEFAULT_METRICS.soma_fatura,
      prospeccao_quente: data.prospeccao_quente ?? DEFAULT_METRICS.prospeccao_quente,
      prospeccao_fria: data.prospeccao_fria ?? DEFAULT_METRICS.prospeccao_fria,
      reunioes_realizadas: data.reunioes_realizadas ?? DEFAULT_METRICS.reunioes_realizadas,
      ferramentas_desenvolvidas: data.ferramentas_desenvolvidas ?? DEFAULT_METRICS.ferramentas_desenvolvidas,
      chamados_ativos: data.chamados_ativos ?? DEFAULT_METRICS.chamados_ativos,
      chamados_finalizados: data.chamados_finalizados ?? DEFAULT_METRICS.chamados_finalizados,
      chamados_total: data.chamados_total ?? DEFAULT_METRICS.chamados_total,
      clientes_sinal_amarelo: data.clientes_sinal_amarelo ?? DEFAULT_METRICS.clientes_sinal_amarelo,
      eventos_pendentes: data.eventos_pendentes ?? DEFAULT_METRICS.eventos_pendentes,
      eventos_realizados: data.eventos_realizados ?? DEFAULT_METRICS.eventos_realizados,
      clientes_ativos:
        data.clientes_ativos ?? data.clientes_ativos_fast ?? DEFAULT_METRICS.clientes_ativos,
      clientes_funil: data.clientes_funil ?? DEFAULT_METRICS.clientes_funil,
      clientes_total:
        data.clientes_total ??
        data.clientes_total_fast ??
        data.total_clientes ??
        DEFAULT_METRICS.clientes_total,
    };
  }, [data]);

  const chamadosData = useMemo<ChartDatum[]>(() => {
    return [
      { label: 'Ativos', value: metrics.chamados_ativos, color: '#F44336' },
      { label: 'Finalizados', value: metrics.chamados_finalizados, color: '#4CAF50' },
    ];
  }, [metrics]);

  const prospeccaoData = useMemo<ChartDatum[]>(() => {
    return [
      { label: 'Quente', value: metrics.prospeccao_quente, color: '#FF9800' },
      { label: 'Fria', value: metrics.prospeccao_fria, color: '#9E9E9E' },
    ];
  }, [metrics]);

  const eventosData = useMemo<ChartDatum[]>(() => {
    return [
      { label: 'Pendentes', value: metrics.eventos_pendentes, color: '#90CAF9' },
      { label: 'Realizados', value: metrics.eventos_realizados, color: '#1976D2' },
    ];
  }, [metrics]);

  const markers = useMemo(() => {
    if (!geoData?.points) {
      return [] as GeoPoint[];
    }

    return geoData.points.filter((point) => {
      const { lat, lng } = point.coords;
      return Number.isFinite(lat) && Number.isFinite(lng);
    });
  }, [geoData]);

  const topCityLabel = useMemo(() => {
    if (!markers.length) {
      return 'Sem dados';
    }

    const sorted = [...markers].sort((a, b) => b.count - a.count);
    const top = sorted[0];
    return `${top.city} (${top.count})`;
  }, [markers]);

  const rankedCities = useMemo(() => {
    if (!markers.length) {
      return [] as GeoPoint[];
    }

    return [...markers].sort((a, b) => b.count - a.count);
  }, [markers]);

  const mapCard = (
    <Paper
      sx={{
        p: 3,
        mb: mapFullscreen ? 0 : 4,
        maxWidth: mapFullscreen ? 960 : 720,
        width: '100%',
        mx: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: mapFullscreen ? 6 : undefined,
        ...(mapFullscreen && {
          maxHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
        }),
      }}
    >
      <IconButton
        aria-label={mapFullscreen ? 'Sair do modo tela cheia' : 'Expandir mapa'}
        onClick={() => setMapFullscreen((prev) => !prev)}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          color: mapFullscreen ? '#1E293B' : '#1E3A8A',
          backgroundColor: mapFullscreen ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)',
          boxShadow: '0 1px 4px rgba(15, 23, 42, 0.25)',
          '&:hover': {
            backgroundColor: mapFullscreen ? 'rgba(255,255,255,0.95)' : 'rgba(226,232,240,0.9)',
          },
        }}
      >
        {mapFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
      </IconButton>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1E3A8A', pr: 5 }}>
        Distribuição geográfica dos clientes
      </Typography>
      {geoLoading ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
          <Typography variant="body2">Carregando mapa...</Typography>
        </Stack>
      ) : geoError ? (
        <Alert severity="error">{geoError}</Alert>
      ) : markers.length > 0 ? (
        <>
          <Box
            sx={{
              display: mapFullscreen ? 'flex' : 'block',
              gap: mapFullscreen ? 3 : 0,
              alignItems: mapFullscreen ? 'stretch' : 'flex-start',
              flexWrap: mapFullscreen ? 'wrap' : 'nowrap',
            }}
          >
            <Box sx={{ flexGrow: 1, mt: 1, minWidth: mapFullscreen ? '60%' : 'auto' }}>
              <GeoClientsMap points={markers} height={mapFullscreen ? '65vh' : '420px'} />
            </Box>
            {mapFullscreen ? (
              <Box
                sx={{
                  flex: '1 1 260px',
                  maxHeight: '65vh',
                  overflowY: 'auto',
                  borderLeft: '1px solid rgba(30, 58, 138, 0.12)',
                  pl: 2,
                  mt: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#1E3A8A', mb: 1 }}>
                  Cidades com clientes
                </Typography>
                <Stack spacing={0.75}>
                  {rankedCities.map((city) => (
                    <Typography key={`${city.city}-${city.state}`} variant="body2">
                      {`${city.city} (${city.count})`}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ) : null}
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2">Clientes mapeados: {geoData?.totals.clientes ?? 0}</Typography>
            <Typography variant="body2">Cidades atendidas: {geoData?.totals.cidades ?? 0}</Typography>
            <Typography variant="body2">Sem coordenadas: {geoData?.totals.semCoordenadas ?? 0}</Typography>
          </Stack>
        </>
      ) : (
        <Typography variant="body2" sx={{ py: 4, textAlign: 'center' }}>
          Nenhum cliente com coordenadas disponíveis.
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
          <Typography variant="body2">Carregando relatório...</Typography>
        </Stack>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : data ? (
        <>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
              color: '#FFFFFF',
            }}
          >
            <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8 }}>
              Visão geral da Fast
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                mt: 1,
              }}
            >
              {`R$ ${metrics.soma_fatura.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 3, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Clientes ativos
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                  {metrics.clientes_ativos}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Clientes em funil
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                  {metrics.clientes_funil}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Clientes sinal amarelo
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                  {metrics.clientes_sinal_amarelo}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Base geral de clientes
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFFFFF' }}>
                  {topCityLabel}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #FF9800' }}>
                <Typography variant="subtitle1" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                  Prospecção quente
                </Typography>
                <Typography variant="h3" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                  {metrics.prospeccao_quente}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #9E9E9E' }}>
                <Typography variant="subtitle1" sx={{ color: '#9E9E9E', fontWeight: 'bold' }}>
                  Prospecção fria
                </Typography>
                <Typography variant="h3" sx={{ color: '#9E9E9E', fontWeight: 'bold' }}>
                  {metrics.prospeccao_fria}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #4CAF50' }}>
                <Typography variant="subtitle1" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  Reuniões realizadas
                </Typography>
                <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  {metrics.reunioes_realizadas}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #2196F3' }}>
                <Typography variant="subtitle1" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                  Ferramentas desenvolvidas
                </Typography>
                <Typography variant="h3" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                  {metrics.ferramentas_desenvolvidas}
                </Typography>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #F44336' }}>
                <Typography variant="subtitle1" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                  Chamados ativos
                </Typography>
                <Typography variant="h3" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                  {metrics.chamados_ativos}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #4CAF50' }}>
                <Typography variant="subtitle1" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  Chamados finalizados
                </Typography>
                <Typography variant="h3" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                  {metrics.chamados_finalizados}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #2196F3' }}>
                <Typography variant="subtitle1" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                  Chamados total
                </Typography>
                <Typography variant="h3" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                  {metrics.chamados_total}
                </Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: '1 1 220px', minWidth: 220 }}>
              <Paper sx={{ p: 3, textAlign: 'center', border: '2px solid #FFEB3B' }}>
                <Typography variant="subtitle1" sx={{ color: '#FFEB3B', fontWeight: 'bold' }}>
                  Clientes sinal amarelo
                </Typography>
                <Typography variant="h3" sx={{ color: '#FFEB3B', fontWeight: 'bold' }}>
                  {metrics.clientes_sinal_amarelo}
                </Typography>
              </Paper>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SimpleBarChart data={chamadosData} title="Chamados - Ativos x Finalizados" />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SimpleBarChart data={prospeccaoData} title="Prospecção - Quente x Fria" />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
              <SimpleBarChart data={eventosData} title="Eventos - Pendentes x Realizados" />
            </Box>
          </Box>

          {mapFullscreen ? (
            <Box
              sx={{
                position: 'fixed',
                inset: 0,
                zIndex: 1400,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, sm: 4 },
              }}
            >
              {mapCard}
            </Box>
          ) : (
            mapCard
          )}
        </>
      ) : null}
    </Box>
  );
};

export default RelatorioFast;

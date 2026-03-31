import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  CheckCircle,
  Delete,
  Edit,
  NavigateBefore,
  NavigateNext,
  PlayCircle,
} from '@mui/icons-material';
import { getAccessToken, getDepartment } from '../../utils/storage';

interface CursoDetail {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
}

interface VideoItem {
  id: string;
  tab_curso_id: string;
  title: string;
  description: string;
  youtube_video_id: string;
  thumbnail_url: string;
  is_published: boolean;
  order_index: number;
  modulo_curso: string;
}

interface VideoModuleGroup {
  name: string;
  items: VideoItem[];
}

interface MyCourseProgressResponse {
  curso_id: string;
  total_videos: number;
  completed_videos: number;
  total_watched_seconds: number;
  course_completed: boolean;
  video_progress: Array<{
    video_id: string;
    watched_seconds: number;
    last_position_seconds: number;
    is_completed: boolean;
    has_quiz: boolean;
    quiz_passed: boolean;
    quiz_score_percent: number;
    quiz_correct_answers: number;
    quiz_total_questions: number;
    completed_at: string | null;
  }>;
}

interface CourseAnalyticsResponse {
  curso_id: string;
  total_videos: number;
  users_count: number;
  completed_users_count: number;
  users: Array<{
    user_login: string;
    department: string | null;
    total_watched_seconds: number;
    completed_videos: number;
    total_videos: number;
    course_completed: boolean;
  }>;
}

interface VideoProgressItem {
  watched_seconds: number;
  last_position_seconds: number;
  is_completed: boolean;
  has_quiz: boolean;
  quiz_passed: boolean;
  quiz_score_percent: number;
  quiz_correct_answers: number;
  quiz_total_questions: number;
}

interface VideoQuizResponse {
  has_quiz: boolean;
  required_score_percent: number;
  questions: Array<unknown>;
}

const toCurso = (item: any): CursoDetail => ({
  id: String(item.id ?? ''),
  title: item.title ?? item.nome ?? item.titulo ?? 'Curso sem titulo',
  description: item.description ?? item.descricao ?? '',
  is_published: Boolean(item.is_published ?? item.publicado ?? item.published),
});

const toVideo = (item: any): VideoItem => ({
  id: String(item.id ?? ''),
  tab_curso_id: String(item.tab_curso_id ?? item.curso_id ?? item.tabCursoId ?? ''),
  title: item.titulo_video ?? item.title ?? item.nome ?? item.titulo ?? 'Video sem titulo',
  description: item.descricao_video ?? item.description ?? item.descricao ?? '',
  youtube_video_id: item.youtube_video_id ?? item.youtubeId ?? '',
  thumbnail_url: item.thumbnail_url ?? '',
  is_published: Boolean(item.is_published ?? item.publicado ?? item.published),
  order_index: Number(item.ordem_exibicao ?? item.order_index ?? item.ordem ?? 0),
  modulo_curso: item.modulo_curso ?? 'Geral',
});

const extractYouTubeId = (value: string): string | null => {
  if (!value) {
    return null;
  }

  const clean = value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
};

const getEmbedUrl = (value: string): string => {
  const videoId = extractYouTubeId(value);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
};

const formatDuration = (seconds: number): string => {
  const clamped = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const remainingSeconds = clamped % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
};

const DetalhesCurso = () => {
  const navigate = useNavigate();
  const params = useParams();
  const cursoId = params.cursoId ?? params.id;
  const isInvalidCursoId = !cursoId || cursoId === 'NaN';

  const department = getDepartment();
  const canManageVideos = ['Diretor', 'Gestor', 'Developer'].includes(department || '');

  const [curso, setCurso] = useState<CursoDetail | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [videoProgressById, setVideoProgressById] = useState<Record<string, VideoProgressItem>>({});
  const [courseProgressSummary, setCourseProgressSummary] = useState<{
    total_videos: number;
    completed_videos: number;
    total_watched_seconds: number;
    course_completed: boolean;
  } | null>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalyticsResponse | null>(null);
  const [sessionWatchSeconds, setSessionWatchSeconds] = useState(0);
  const [quizData, setQuizData] = useState<VideoQuizResponse | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [courseVisibilityChecked, setCourseVisibilityChecked] = useState(false);

  const apiHeaders = useMemo(() => {
    const token = getAccessToken();
    if (!token) {
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  const loadCurso = useCallback(async () => {
    if (isInvalidCursoId) {
      setError('Curso invalido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!apiHeaders) {
        throw new Error('Token de acesso nao encontrado. Faca login novamente.');
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-cursos/${cursoId}`, {
        headers: apiHeaders,
      });
      const mappedCurso = toCurso(response.data);

      if (!canManageVideos && !mappedCurso.is_published) {
        setCurso(null);
        setVideos([]);
        setSelectedVideoId(null);
        setError('Este curso nao esta publicado.');
        return;
      }

      setCurso(mappedCurso);
    } catch (err: any) {
      console.error('Erro ao carregar curso:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao carregar curso (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao carregar curso.');
      }
      setCurso(null);
    } finally {
      setLoading(false);
      setCourseVisibilityChecked(true);
    }
  }, [apiHeaders, canManageVideos, cursoId, isInvalidCursoId]);

  const loadVideos = useCallback(async () => {
    if (isInvalidCursoId) {
      setError('Curso invalido.');
      return;
    }

    if (!canManageVideos && !courseVisibilityChecked) {
      return;
    }

    if (!canManageVideos && !curso) {
      setVideos([]);
      return;
    }

    setLoadingVideos(true);
    setError(null);

    try {
      if (!apiHeaders) {
        throw new Error('Token de acesso nao encontrado. Faca login novamente.');
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/tab-video-cursos/curso/${cursoId}`,
        { headers: apiHeaders }
      );

      const data = Array.isArray(response.data) ? response.data.map(toVideo) : [];
      data.sort((a: VideoItem, b: VideoItem) => a.order_index - b.order_index);
      setVideos(data);
    } catch (err: any) {
      console.error('Erro ao carregar videos:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao carregar videos (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao carregar videos.');
      }
      setVideos([]);
    } finally {
      setLoadingVideos(false);
    }
  }, [apiHeaders, canManageVideos, courseVisibilityChecked, curso, cursoId, isInvalidCursoId]);

  useEffect(() => {
    loadCurso();
  }, [loadCurso]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const loadMyProgress = useCallback(async () => {
    if (isInvalidCursoId || !cursoId || !apiHeaders) {
      return;
    }

    try {
      const response = await axios.get<MyCourseProgressResponse>(
        `${process.env.REACT_APP_API_URL}/tab-curso-progresso/curso/${cursoId}/my`,
        { headers: apiHeaders }
      );

      const map: Record<string, VideoProgressItem> = {};
      response.data.video_progress.forEach((item: MyCourseProgressResponse['video_progress'][number]) => {
        map[item.video_id] = {
          watched_seconds: item.watched_seconds ?? 0,
          last_position_seconds: item.last_position_seconds ?? 0,
          is_completed: item.is_completed ?? false,
          has_quiz: item.has_quiz ?? false,
          quiz_passed: item.quiz_passed ?? false,
          quiz_score_percent: item.quiz_score_percent ?? 0,
          quiz_correct_answers: item.quiz_correct_answers ?? 0,
          quiz_total_questions: item.quiz_total_questions ?? 0,
        };
      });

      setVideoProgressById(map);
      setCourseProgressSummary({
        total_videos: response.data.total_videos,
        completed_videos: response.data.completed_videos,
        total_watched_seconds: response.data.total_watched_seconds,
        course_completed: response.data.course_completed,
      });
    } catch (err) {
      console.error('Erro ao carregar progresso do curso:', err);
    }
  }, [apiHeaders, cursoId, isInvalidCursoId]);

  const loadAnalytics = useCallback(async () => {
    if (!canManageVideos || isInvalidCursoId || !cursoId || !apiHeaders) {
      return;
    }

    try {
      const response = await axios.get<CourseAnalyticsResponse>(
        `${process.env.REACT_APP_API_URL}/tab-curso-progresso/curso/${cursoId}/analytics`,
        { headers: apiHeaders }
      );
      setCourseAnalytics(response.data);
    } catch (err) {
      console.error('Erro ao carregar analytics do curso:', err);
    }
  }, [apiHeaders, canManageVideos, cursoId, isInvalidCursoId]);

  useEffect(() => {
    loadMyProgress();
  }, [loadMyProgress]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const visibleVideos = useMemo(() => {
    if (canManageVideos) {
      return videos;
    }
    return videos.filter((video: VideoItem) => video.is_published);
  }, [videos, canManageVideos]);

  useEffect(() => {
    if (visibleVideos.length === 0) {
      setSelectedVideoId(null);
      return;
    }

    const exists = visibleVideos.some((video: VideoItem) => video.id === selectedVideoId);
    if (!exists) {
      setSelectedVideoId(visibleVideos[0].id);
    }
  }, [visibleVideos, selectedVideoId]);

  const selectedVideo = useMemo(() => {
    if (!selectedVideoId) {
      return null;
    }
    return visibleVideos.find((video: VideoItem) => video.id === selectedVideoId) ?? null;
  }, [visibleVideos, selectedVideoId]);

  const selectedIndex = useMemo(() => {
    if (!selectedVideo) {
      return -1;
    }
    return visibleVideos.findIndex((video: VideoItem) => video.id === selectedVideo.id);
  }, [visibleVideos, selectedVideo]);

  const loadVideoQuiz = useCallback(async () => {
    if (!selectedVideo || !apiHeaders) {
      setQuizData(null);
      return;
    }

    setQuizLoading(true);

    try {
      const response = await axios.get<VideoQuizResponse>(
        `${process.env.REACT_APP_API_URL}/tab-curso-progresso/video/${selectedVideo.id}/quiz`,
        { headers: apiHeaders }
      );

      setQuizData(response.data);
    } catch (err) {
      console.error('Erro ao carregar quiz do video:', err);
      setQuizData({ has_quiz: false, required_score_percent: 75, questions: [] });
    } finally {
      setQuizLoading(false);
    }
  }, [apiHeaders, selectedVideo]);

  useEffect(() => {
    loadVideoQuiz();
  }, [loadVideoQuiz]);

  const modules = useMemo<VideoModuleGroup[]>(() => {
    const map: Record<string, VideoItem[]> = {};

    visibleVideos.forEach((video: VideoItem) => {
      const key = video.modulo_curso || 'Geral';
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(video);
    });

    return Object.entries(map).map(([name, items]) => ({
      name,
      items: [...items].sort((a, b) => a.order_index - b.order_index),
    }));
  }, [visibleVideos]);

  const progressPercent = useMemo(() => {
    const totalVideos = courseProgressSummary?.total_videos ?? visibleVideos.length;
    const completedVideos = courseProgressSummary?.completed_videos ?? 0;

    if (totalVideos === 0) {
      return 0;
    }

    return Math.round((completedVideos / totalVideos) * 100);
  }, [courseProgressSummary, visibleVideos.length]);

  const persistVideoProgress = useCallback(
    async (videoId: string, payload: { watched_seconds_delta?: number; last_position_seconds?: number; is_completed?: boolean }) => {
      if (!apiHeaders) {
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/tab-curso-progresso/video/${videoId}/progress`,
        payload,
        { headers: apiHeaders }
      );
    },
    [apiHeaders]
  );

  useEffect(() => {
    if (!selectedVideo) {
      return;
    }

    setSessionWatchSeconds(0);
    const interval = setInterval(() => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      setSessionWatchSeconds((current: number) => current + 15);
      persistVideoProgress(selectedVideo.id, { watched_seconds_delta: 15 }).catch(() => undefined);
    }, 15000);

    return () => clearInterval(interval);
  }, [persistVideoProgress, selectedVideo]);

  const markVideoAsCompleted = () => {
    if (!selectedVideo) {
      return;
    }

    const selectedProgress = videoProgressById[selectedVideo.id];
    const hasQuiz = quizData?.has_quiz || selectedProgress?.has_quiz;
    const passedQuiz = selectedProgress?.quiz_passed;

    if (hasQuiz && !passedQuiz) {
      setError('Este video possui questionario. Para concluir, acerte pelo menos 75% das questoes.');
      return;
    }

    const isCompleted = !(videoProgressById[selectedVideo.id]?.is_completed ?? false);
    persistVideoProgress(selectedVideo.id, { is_completed: isCompleted }).catch(() => undefined);

    setVideoProgressById((current: Record<string, VideoProgressItem>) => ({
      ...current,
      [selectedVideo.id]: {
        watched_seconds: current[selectedVideo.id]?.watched_seconds ?? 0,
        last_position_seconds: current[selectedVideo.id]?.last_position_seconds ?? 0,
        is_completed: isCompleted,
        has_quiz: current[selectedVideo.id]?.has_quiz ?? false,
        quiz_passed: current[selectedVideo.id]?.quiz_passed ?? false,
        quiz_score_percent: current[selectedVideo.id]?.quiz_score_percent ?? 0,
        quiz_correct_answers: current[selectedVideo.id]?.quiz_correct_answers ?? 0,
        quiz_total_questions: current[selectedVideo.id]?.quiz_total_questions ?? 0,
      },
    }));

    loadMyProgress();
    if (canManageVideos) {
      loadAnalytics();
    }
  };

  const goToAdjacentVideo = (direction: -1 | 1) => {
    if (selectedIndex < 0) {
      return;
    }

    const nextIndex = selectedIndex + direction;
    if (nextIndex < 0 || nextIndex >= visibleVideos.length) {
      return;
    }

    setSelectedVideoId(visibleVideos[nextIndex].id);
  };

  const toggleVideoPublication = async (video: VideoItem) => {
    if (!canManageVideos) {
      setError('Apenas Diretor, Gestor e Developer podem publicar videos.');
      return;
    }

    try {
      if (!apiHeaders) {
        throw new Error('Token de acesso nao encontrado. Faca login novamente.');
      }

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/tab-video-cursos/${video.id}`,
        { is_published: !video.is_published },
        { headers: apiHeaders }
      );

      setSuccess(`Video ${!video.is_published ? 'publicado' : 'despublicado'} com sucesso.`);
      await loadVideos();
    } catch (err: any) {
      console.error('Erro ao publicar/despublicar video:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao atualizar video (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao atualizar video.');
      }
    }
  };

  const deleteVideo = async () => {
    if (!videoToDelete) {
      return;
    }

    if (!canManageVideos) {
      setError('Apenas Diretor, Gestor e Developer podem excluir videos.');
      return;
    }

    try {
      if (!apiHeaders) {
        throw new Error('Token de acesso nao encontrado. Faca login novamente.');
      }

      await axios.delete(`${process.env.REACT_APP_API_URL}/tab-video-cursos/${videoToDelete.id}`, {
        headers: apiHeaders,
      });

      setSuccess('Video excluido com sucesso.');
      setVideoToDelete(null);
      await loadVideos();
    } catch (err: any) {
      console.error('Erro ao excluir video:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao excluir video (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao excluir video.');
      }
    }
  };

  const selectedEmbedUrl = getEmbedUrl(selectedVideo?.youtube_video_id ?? '');
  const completedVideoIds = Object.entries(videoProgressById as Record<string, VideoProgressItem>)
    .filter(([, value]) => value.is_completed)
    .map(([videoId]) => videoId);
  const selectedVideoWatchedSeconds = selectedVideo ? (videoProgressById[selectedVideo.id]?.watched_seconds ?? 0) : 0;
  const selectedVideoProgress = selectedVideo ? videoProgressById[selectedVideo.id] : undefined;
  const requiresQuizApproval = Boolean((quizData?.has_quiz || selectedVideoProgress?.has_quiz) && !selectedVideoProgress?.quiz_passed);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={2.5}>
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            background: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 55%, #0B3B8C 100%)',
            color: '#FFFFFF',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/cursos')}
                sx={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.6)', mb: 2 }}
              >
                Voltar para cursos
              </Button>

              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {curso?.title ?? 'Carregando curso...'}
              </Typography>
              <Typography sx={{ mt: 1.2, maxWidth: 900, opacity: 0.92 }}>
                {curso?.description || 'Acompanhe a trilha de videos e avance no seu ritmo.'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip
                label={curso?.is_published ? 'Curso publicado' : 'Curso nao publicado'}
                color={curso?.is_published ? 'success' : 'default'}
                sx={{ color: '#0F172A', backgroundColor: '#E2E8F0' }}
              />
              {canManageVideos && (
                <Chip
                  label="Modo gestor de conteudo"
                  sx={{ color: '#022C22', backgroundColor: '#A7F3D0', fontWeight: 700 }}
                />
              )}
            </Stack>
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Typography sx={{ mb: 0.7, fontWeight: 600 }}>Progresso do curso</Typography>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{ height: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)' }}
            />
            <Typography sx={{ mt: 0.8, fontSize: 13, opacity: 0.95 }}>
              {progressPercent}% concluido • {courseProgressSummary?.completed_videos ?? completedVideoIds.length} de {courseProgressSummary?.total_videos ?? visibleVideos.length} videos concluidos
            </Typography>
            <Typography sx={{ mt: 0.5, fontSize: 13, opacity: 0.95 }}>
              Tempo total assistido: {formatDuration(courseProgressSummary?.total_watched_seconds ?? 0)}
            </Typography>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {loading || (loadingVideos && (canManageVideos || Boolean(curso))) ? (
          <Paper sx={{ p: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <CircularProgress size={26} />
              <Typography>Carregando experiencia do curso...</Typography>
            </Box>
          </Paper>
        ) : visibleVideos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6">Nenhum video disponivel</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {canManageVideos
                ? 'Crie o primeiro video para iniciar este curso.'
                : 'Ainda nao ha videos publicados para este curso.'}
            </Typography>

            {canManageVideos && (
              <Button
                variant="contained"
                startIcon={<Add />}
                sx={{ mt: 2, backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
                onClick={() => navigate(`/cursos/${cursoId}/videos/novo`)}
              >
                Novo video
              </Button>
            )}
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
              gap: 2,
            }}
          >
            <Stack spacing={2}>
              <Paper sx={{ p: { xs: 1, md: 2 }, borderRadius: 3 }}>
                {selectedEmbedUrl ? (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%',
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#020617',
                    }}
                  >
                    <Box
                      component="iframe"
                      src={selectedEmbedUrl}
                      title={selectedVideo?.title || 'Video do curso'}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </Box>
                ) : (
                  <Alert severity="warning">Nao foi possivel gerar o player para o video selecionado.</Alert>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {selectedVideo?.title ?? 'Selecione um video'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.6 }}>
                    {selectedVideo?.description ?? 'Sem descricao'}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.6 }}>
                    Tempo assistido neste video: {formatDuration(selectedVideoWatchedSeconds)}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.3 }}>
                    Sessao atual: {formatDuration(sessionWatchSeconds)}
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.6 }}>
                    <Chip label={`Modulo: ${selectedVideo?.modulo_curso ?? '-'}`} size="small" />
                    <Chip
                      label={selectedVideo?.is_published ? 'Publicado' : 'Nao publicado'}
                      size="small"
                      color={selectedVideo?.is_published ? 'success' : 'default'}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<NavigateBefore />}
                      onClick={() => goToAdjacentVideo(-1)}
                      disabled={selectedIndex <= 0}
                    >
                      Aula anterior
                    </Button>
                    <Button
                      variant="outlined"
                      endIcon={<NavigateNext />}
                      onClick={() => goToAdjacentVideo(1)}
                      disabled={selectedIndex < 0 || selectedIndex >= visibleVideos.length - 1}
                    >
                      Proxima aula
                    </Button>
                    <Button
                      variant={selectedVideo && completedVideoIds.includes(selectedVideo.id) ? 'contained' : 'outlined'}
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={markVideoAsCompleted}
                      disabled={!selectedVideo || requiresQuizApproval}
                    >
                      {selectedVideo && completedVideoIds.includes(selectedVideo.id)
                        ? 'Concluido'
                        : 'Marcar como concluido'}
                    </Button>
                  </Stack>

                  {requiresQuizApproval && (
                    <Alert
                      severity="info"
                      sx={{ mt: 2 }}
                      action={(
                        <Button
                          color="inherit"
                          size="small"
                          variant="outlined"
                          onClick={() => navigate(`/cursos/${cursoId}/videos/${selectedVideo?.id}/questionario`)}
                        >
                          Ir ao questionario
                        </Button>
                      )}
                    >
                      Este video possui questionario. Para concluir, acerte pelo menos 75% das questoes.
                    </Alert>
                  )}
                </Box>
              </Paper>

              {selectedVideo && quizLoading && (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <CircularProgress size={20} />
                    <Typography>Carregando questionario...</Typography>
                  </Box>
                </Paper>
              )}

              {selectedVideo && !quizLoading && quizData?.has_quiz && (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Questionario do video
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5, mb: 1.2 }}>
                    Para concluir este video, acerte pelo menos {quizData.required_score_percent}% das questoes. O questionario abre em tela cheia.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/cursos/${cursoId}/videos/${selectedVideo.id}/questionario`)}
                  >
                    Ir ao questionario
                  </Button>

                  {selectedVideoProgress?.has_quiz && (
                    <Alert severity={selectedVideoProgress.quiz_passed ? 'success' : 'warning'} sx={{ mt: 2 }}>
                      Ultimo resultado: {selectedVideoProgress.quiz_correct_answers}/{selectedVideoProgress.quiz_total_questions} acertos ({selectedVideoProgress.quiz_score_percent.toFixed(2)}%).
                    </Alert>
                  )}
                </Paper>
              )}

              {canManageVideos && courseAnalytics && (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.8 }}>
                    Analytics de consumo do curso
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1.4 }}>
                    {courseAnalytics.completed_users_count} de {courseAnalytics.users_count} usuarios concluiram o curso.
                  </Typography>

                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Usuario</TableCell>
                        <TableCell>Departamento</TableCell>
                        <TableCell align="right">Progresso</TableCell>
                        <TableCell align="right">Tempo assistido</TableCell>
                        <TableCell align="center">Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {courseAnalytics.users.map((user: CourseAnalyticsResponse['users'][number]) => (
                        <TableRow key={user.user_login}>
                          <TableCell>{user.user_login}</TableCell>
                          <TableCell>{user.department || '-'}</TableCell>
                          <TableCell align="right">
                            {user.completed_videos}/{user.total_videos}
                          </TableCell>
                          <TableCell align="right">{formatDuration(user.total_watched_seconds)}</TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={user.course_completed ? 'Concluiu' : 'Em andamento'}
                              color={user.course_completed ? 'success' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              )}

              {canManageVideos && selectedVideo && (
                <Paper sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Gestao do video selecionado
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate(`/cursos/${cursoId}/videos/novo`)}
                      sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
                    >
                      Novo video
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => navigate(`/cursos/${cursoId}/videos/${selectedVideo.id}/editar`)}
                    >
                      Editar video
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => navigate(`/cursos/${cursoId}/videos/${selectedVideo.id}/perguntas`)}
                    >
                      Gerenciar perguntas
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => toggleVideoPublication(selectedVideo)}
                    >
                      {selectedVideo.is_published ? 'Despublicar' : 'Publicar'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => setVideoToDelete(selectedVideo)}
                    >
                      Excluir
                    </Button>
                  </Stack>
                </Paper>
              )}
            </Stack>

            <Paper sx={{ p: 2, borderRadius: 3, maxHeight: { lg: 'calc(100vh - 210px)' }, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.2 }}>
                Trilha de aulas
              </Typography>

              {modules.map((moduleGroup: VideoModuleGroup) => (
                <Box key={moduleGroup.name} sx={{ mb: 1.6 }}>
                  <Typography sx={{ fontWeight: 700, color: '#1E3A8A', mb: 0.7 }}>{moduleGroup.name}</Typography>
                  <Stack spacing={0.8}>
                    {moduleGroup.items.map((video: VideoItem) => {
                      const active = selectedVideoId === video.id;
                      const completed = completedVideoIds.includes(video.id);
                      const displayOrder = video.order_index > 0 ? `${video.order_index}.` : '-';

                      return (
                        <Box
                          key={video.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedVideoId(video.id)}
                          onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setSelectedVideoId(video.id);
                            }
                          }}
                          sx={{
                            p: 1.2,
                            borderRadius: 2,
                            border: active ? '1px solid #1D4ED8' : '1px solid #E2E8F0',
                            backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            '&:hover': { borderColor: '#93C5FD', backgroundColor: '#F8FAFC' },
                          }}
                        >
                          <Stack direction="row" spacing={1.1} alignItems="center">
                            {completed ? (
                              <CheckCircle color="success" fontSize="small" />
                            ) : (
                              <PlayCircle sx={{ color: '#475569' }} fontSize="small" />
                            )}
                            <Box sx={{ minWidth: 20, color: '#64748B', fontSize: 13, fontWeight: 700 }}>{displayOrder}</Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>
                                {video.title}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: '#64748B' }} noWrap>
                                {video.description || 'Sem descricao'}
                              </Typography>
                            </Box>
                            {!video.is_published && (
                              <Chip label="Rascunho" size="small" sx={{ height: 22 }} />
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                  <Divider sx={{ mt: 1.4 }} />
                </Box>
              ))}
            </Paper>
          </Box>
        )}
      </Stack>

      <Dialog open={Boolean(videoToDelete)} onClose={() => setVideoToDelete(null)}>
        <DialogTitle>Excluir video</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja realmente excluir o video <strong>{videoToDelete?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoToDelete(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={deleteVideo}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DetalhesCurso;

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { getAccessToken, getDepartment } from '../../utils/storage';

interface VideoFormData {
  title: string;
  description: string;
  youtube_input: string;
  modulo_curso: string;
  order_index: number;
  is_published: boolean;
}

const emptyForm: VideoFormData = {
  title: '',
  description: '',
  youtube_input: '',
  modulo_curso: 'Geral',
  order_index: 1,
  is_published: false,
};

const extractYouTubeId = (value: string): string | null => {
  const clean = value.trim();
  if (!clean) {
    return null;
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return clean;
  }

  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
};

const GestaoVideosCurso = () => {
  const navigate = useNavigate();
  const params = useParams();
  const cursoId = params.cursoId ?? params.id;
  const videoId = params.videoId;
  const isEditMode = Boolean(videoId);
  const isInvalidCursoId = !cursoId || cursoId === 'NaN';
  const department = getDepartment();
  const canManageVideos = ['Diretor', 'Gestor', 'Developer'].includes(department || '');

  const [form, setForm] = useState<VideoFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    const loadVideo = async () => {
      if (!isEditMode || !videoId) {
        return;
      }
      setLoading(true);
      setError(null);

      try {
        if (!apiHeaders) {
          throw new Error('Token de acesso não encontrado. Faça login novamente.');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-video-cursos/${videoId}`, {
          headers: apiHeaders,
        });

        const item = response.data ?? {};
        setForm({
          title: item.titulo_video ?? item.title ?? item.nome ?? item.titulo ?? '',
          description: item.descricao_video ?? item.description ?? item.descricao ?? '',
          youtube_input: item.youtube_video_id ?? item.youtube_url ?? item.video_url ?? item.url ?? '',
          modulo_curso: item.modulo_curso ?? 'Geral',
          order_index: Number(item.ordem_exibicao ?? item.order_index ?? item.ordem ?? 1),
          is_published: Boolean(item.is_published ?? item.publicado ?? item.published),
        });
      } catch (err: any) {
        console.error('Erro ao carregar video:', err);
        if (axios.isAxiosError(err)) {
          setError(`Erro ao carregar video (${err.response?.status ?? 'sem status'}).`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro inesperado ao carregar video.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [apiHeaders, isEditMode, videoId]);

  const handleSave = async () => {
    if (!canManageVideos) {
      setError('Apenas Diretor, Gestor e Developer podem editar ou publicar videos.');
      return;
    }

    if (isInvalidCursoId) {
      setError('Curso invalido para salvar video.');
      return;
    }

    if (!form.title.trim()) {
      setError('Informe o titulo do video.');
      return;
    }

    const youtubeVideoId = extractYouTubeId(form.youtube_input);
    if (!youtubeVideoId) {
      setError('Informe uma URL ou ID valido do YouTube.');
      return;
    }

    if (!form.description.trim()) {
      setError('Informe a descricao do video.');
      return;
    }

    if (!form.modulo_curso.trim()) {
      setError('Informe o modulo do curso.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!apiHeaders) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.');
      }

      const payload = {
        tab_curso_id: cursoId,
        modulo_curso: form.modulo_curso.trim(),
        ordem_exibicao: Math.max(1, Number(form.order_index) || 1),
        youtube_video_id: youtubeVideoId,
        titulo_video: form.title.trim(),
        descricao_video: form.description.trim(),
        thumbnail_url: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`,
        is_published: form.is_published,
      };

      if (isEditMode && videoId) {
        await axios.patch(`${process.env.REACT_APP_API_URL}/tab-video-cursos/${videoId}`, payload, {
          headers: apiHeaders,
        });
        setSuccess('Video atualizado com sucesso.');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/tab-video-cursos`, payload, {
          headers: apiHeaders,
        });
        setSuccess('Video criado com sucesso.');
      }

      setTimeout(() => navigate(`/cursos/${cursoId}`), 500);
    } catch (err: any) {
      console.error('Erro ao salvar video:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao salvar video (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao salvar video.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={26} />
          <Typography>Carregando video...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate(`/cursos/${cursoId}`)}>
                Voltar
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isEditMode ? 'Editar Video' : 'Novo Video'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving || !canManageVideos}
              sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>

          {isEditMode && videoId && canManageVideos && (
            <Button
              variant="outlined"
              onClick={() => navigate(`/cursos/${cursoId}/videos/${videoId}/perguntas`)}
            >
              Gerenciar perguntas do video
            </Button>
          )}

          {!canManageVideos && (
            <Alert severity="warning">
              Apenas Diretor, Gestor e Developer podem editar ou publicar videos.
            </Alert>
          )}

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

          <TextField
            label="Titulo do video"
            value={form.title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            fullWidth
            required
          />

          <TextField
            label="Descricao"
            value={form.description}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            multiline
            minRows={4}
            fullWidth
            required
          />

          <TextField
            label="URL ou ID do YouTube"
            value={form.youtube_input}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, youtube_input: event.target.value }))}
            fullWidth
            required
            helperText="Aceita URL completa ou ID do video (11 caracteres)."
          />

          <TextField
            label="Modulo do curso"
            value={form.modulo_curso}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, modulo_curso: event.target.value }))}
            fullWidth
            required
          />

          <TextField
            label="Ordem de exibicao"
            type="number"
            value={form.order_index}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, order_index: Number(event.target.value) }))}
            inputProps={{ min: 1 }}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.is_published}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, is_published: event.target.checked }))}
                disabled={!canManageVideos}
              />
            }
            label="Video publicado"
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default GestaoVideosCurso;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, ArrowBack, Delete, Edit, OpenInNew } from '@mui/icons-material';
import { getAccessToken, getDepartment } from '../../utils/storage';

interface CursoItem {
  id: string;
  title: string;
  description: string;
  is_published: boolean;
  thumbnail_url?: string;
  created_at?: string;
}

const toCurso = (item: any): CursoItem => ({
  id: String(item.id ?? ''),
  title: item.title ?? item.nome ?? item.titulo ?? 'Curso sem titulo',
  description: item.description ?? item.descricao ?? '',
  is_published: Boolean(item.is_published ?? item.publicado ?? item.published),
  thumbnail_url: item.thumbnail_url ?? item.imagem_url ?? item.thumbnailUrl ?? undefined,
  created_at: item.created_at ?? item.data_criacao,
});

const CursosLista = () => {
  const navigate = useNavigate();
  const department = getDepartment();
  const canManageCourses = ['Diretor', 'Gestor', 'Developer'].includes(department || '');
  const [cursos, setCursos] = useState<CursoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cursoToDelete, setCursoToDelete] = useState<CursoItem | null>(null);

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

  const loadCursos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!apiHeaders) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.');
      }

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-cursos`, {
        headers: apiHeaders,
        params: { published: true },
      });

      const data = Array.isArray(response.data) ? response.data.map(toCurso) : [];
      setCursos(data);
    } catch (err: any) {
      console.error('Erro ao carregar cursos:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao carregar cursos (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao carregar cursos.');
      }
      setCursos([]);
    } finally {
      setLoading(false);
    }
  }, [apiHeaders]);

  useEffect(() => {
    loadCursos();
  }, [loadCursos]);

  const handleDeleteCurso = async () => {
    if (!cursoToDelete) {
      return;
    }

    if (!canManageCourses) {
      setError('Apenas Developer, Gestor e Diretor podem excluir cursos.');
      setCursoToDelete(null);
      return;
    }

    try {
      if (!apiHeaders) {
        throw new Error('Token de acesso não encontrado. Faça login novamente.');
      }

      await axios.delete(`${process.env.REACT_APP_API_URL}/tab-cursos/${cursoToDelete.id}`, {
        headers: apiHeaders,
      });

      setSuccess('Curso excluido com sucesso.');
      setCursoToDelete(null);
      await loadCursos();
    } catch (err: any) {
      console.error('Erro ao excluir curso:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao excluir curso (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao excluir curso.');
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              sx={{ backgroundColor: '#1E3A8A', '&:hover': { backgroundColor: '#1D4ED8' } }}
            >
              Voltar
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
              Cursos
            </Typography>
          </Box>

          {canManageCourses && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/cursos/novo')}
              sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
            >
              Novo Curso
            </Button>
          )}
        </Box>

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

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6, justifyContent: 'center' }}>
            <CircularProgress size={26} />
            <Typography>Carregando cursos...</Typography>
          </Box>
        )}

        {!loading && cursos.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Nenhum curso encontrado
            </Typography>
            <Typography color="text.secondary">
              Crie o primeiro curso ou ajuste os filtros.
            </Typography>
          </Paper>
        )}

        {!loading && cursos.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, minmax(0, 1fr))',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {cursos.map((curso) => (
              <Paper
                key={curso.id}
                sx={{
                  p: 1.4,
                  borderRadius: 2,
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onClick={() => navigate(`/cursos/${curso.id}`)}
              >
                <Box sx={{ minWidth: 0 }}>
                  {curso.thumbnail_url && (
                    <Box
                      sx={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        borderRadius: 1.4,
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                        mb: 1,
                        backgroundColor: '#F8FAFC',
                      }}
                    >
                      <Box
                        component="img"
                        src={curso.thumbnail_url}
                        alt={`Thumbnail ${curso.title}`}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  )}

                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {curso.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.8,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    color="text.secondary"
                  >
                    {curso.description || 'Sem descricao'}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}
                  onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}
                >
                  <Tooltip title="Detalhes">
                    <IconButton
                      onClick={() => navigate(`/cursos/${curso.id}`)}
                      sx={{ color: '#1D4ED8', border: '1px solid #BFDBFE', backgroundColor: '#EFF6FF' }}
                    >
                      <OpenInNew />
                    </IconButton>
                  </Tooltip>
                  {canManageCourses && (
                    <>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/cursos/${curso.id}/editar`)}
                      >
                        Editar
                      </Button>
                      <Button
                        color="error"
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => setCursoToDelete(curso)}
                      >
                        Excluir
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Stack>

      <Dialog open={Boolean(cursoToDelete)} onClose={() => setCursoToDelete(null)}>
        <DialogTitle>Excluir curso</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja realmente excluir o curso <strong>{cursoToDelete?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCursoToDelete(null)}>Cancelar</Button>
          <Button onClick={handleDeleteCurso} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CursosLista;

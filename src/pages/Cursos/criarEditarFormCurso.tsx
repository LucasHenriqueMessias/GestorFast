import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, CloudUpload, Save } from '@mui/icons-material';
import { getAccessToken, getDepartment } from '../../utils/storage';

const IMGBB_API_KEY = process.env.REACT_APP_IMGBB_API_KEY || 'c3513e58ab9583768620c9091ef24d17';

interface CursoFormData {
  title: string;
  description: string;
  thumbnail_url: string;
  is_published: boolean;
}

const emptyForm: CursoFormData = {
  title: '',
  description: '',
  thumbnail_url: '',
  is_published: false,
};

const getApiErrorMessage = (err: any, fallback: string): string => {
  if (!axios.isAxiosError(err)) {
    return fallback;
  }

  const data = err.response?.data;
  if (typeof data === 'string' && data.trim()) {
    return data;
  }
  if (typeof data?.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error;
  }
  if (Array.isArray(data?.message) && data.message.length > 0) {
    return data.message.join(' | ');
  }

  return `${fallback} (${err.response?.status ?? 'sem status'})`;
};

const CriarEditarForm = () => {
  const navigate = useNavigate();
  const params = useParams();
  const cursoId = params.cursoId ?? params.id;
  const isEditMode = Boolean(cursoId);
  const canManageCourses = ['Diretor', 'Gestor', 'Developer'].includes(getDepartment() || '');

  const [form, setForm] = useState<CursoFormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [selectedImageDataUrl, setSelectedImageDataUrl] = useState<string | null>(null);
  const [thumbnailCenterX, setThumbnailCenterX] = useState<number>(50);
  const [thumbnailCenterY, setThumbnailCenterY] = useState<number>(50);
  const [thumbnailZoom, setThumbnailZoom] = useState<number>(1);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailFrameRef = useRef<HTMLDivElement | null>(null);
  const thumbnailDragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startCenterX: number;
    startCenterY: number;
  } | null>(null);

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
    if (!canManageCourses) {
      navigate('/cursos', { replace: true });
      return;
    }

    const loadCurso = async () => {
      if (!isEditMode || !cursoId) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        if (!apiHeaders) {
          throw new Error('Token de acesso não encontrado. Faça login novamente.');
        }
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/tab-cursos/${cursoId}`, {
          headers: apiHeaders,
        });
        const item = response.data ?? {};
        setForm({
          title: item.title ?? item.nome ?? item.titulo ?? '',
          description: item.description ?? item.descricao ?? '',
          thumbnail_url: item.thumbnail_url ?? item.imagem_url ?? '',
          is_published: Boolean(item.is_published ?? item.publicado ?? item.published),
        });
      } catch (err) {
        console.error('Erro ao carregar curso:', err);
        if (axios.isAxiosError(err)) {
          setError(`Erro ao carregar curso (${err.response?.status ?? 'sem status'}).`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro inesperado ao carregar curso.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCurso();
  }, [apiHeaders, canManageCourses, cursoId, isEditMode, navigate]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('Informe o titulo do curso.');
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
        title: form.title.trim(),
        description: form.description.trim(),
        thumbnail_url: form.thumbnail_url.trim(),
        is_published: form.is_published,
      };

      if (isEditMode && cursoId) {
        await axios.patch(
          `${process.env.REACT_APP_API_URL}/tab-cursos/${cursoId}`,
          payload,
          { headers: apiHeaders }
        );
        setSuccess('Curso atualizado com sucesso.');
        setTimeout(() => navigate(`/cursos/${cursoId}`), 500);
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/tab-cursos`,
        payload,
        { headers: apiHeaders }
      );

      setSuccess('Curso criado com sucesso.');
      setTimeout(() => navigate('/cursos'), 500);
    } catch (err: any) {
      console.error('Erro ao salvar curso:', err);
      if (axios.isAxiosError(err)) {
        setError(getApiErrorMessage(err, 'Erro ao salvar curso'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao salvar curso.');
      }
    } finally {
      setSaving(false);
    }
  };

  const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

  const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Nao foi possivel carregar a imagem selecionada.'));
      image.src = dataUrl;
    });
  };

  const cropImageTo16by9 = async (
    dataUrl: string,
    centerXPercent: number,
    centerYPercent: number,
    zoom: number,
  ): Promise<Blob> => {
    const image = await loadImage(dataUrl);
    const targetAspect = 16 / 9;
    const sourceAspect = image.width / image.height;

    let cropWidth = image.width;
    let cropHeight = image.height;

    if (sourceAspect > targetAspect) {
      cropWidth = image.height * targetAspect;
      cropHeight = image.height;
    } else {
      cropWidth = image.width;
      cropHeight = image.width / targetAspect;
    }

    const safeZoom = clamp(zoom, 1, 3);
    cropWidth = cropWidth / safeZoom;
    cropHeight = cropHeight / safeZoom;

    const centerX = (centerXPercent / 100) * image.width;
    const centerY = (centerYPercent / 100) * image.height;

    const sourceX = clamp(centerX - cropWidth / 2, 0, image.width - cropWidth);
    const sourceY = clamp(centerY - cropHeight / 2, 0, image.height - cropHeight);

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Nao foi possivel preparar o recorte da imagem.');
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Falha ao gerar imagem para upload.'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSelectThumbnail = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem valido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setSelectedImageDataUrl(result);
      setThumbnailCenterX(50);
      setThumbnailCenterY(50);
      setThumbnailZoom(1);
    };
    reader.onerror = () => setError('Nao foi possivel ler a imagem selecionada.');
    reader.readAsDataURL(file);
  };

  const handleThumbnailPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!selectedImageDataUrl) {
      return;
    }

    thumbnailDragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startCenterX: thumbnailCenterX,
      startCenterY: thumbnailCenterY,
    };
    setIsDraggingThumbnail(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleThumbnailPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = thumbnailDragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId || !thumbnailFrameRef.current) {
      return;
    }

    const frameRect = thumbnailFrameRef.current.getBoundingClientRect();
    if (frameRect.width <= 0 || frameRect.height <= 0) {
      return;
    }

    const deltaX = event.clientX - dragState.startClientX;
    const deltaY = event.clientY - dragState.startClientY;

    const nextCenterX = clamp(dragState.startCenterX - (deltaX / frameRect.width) * 100, 0, 100);
    const nextCenterY = clamp(dragState.startCenterY - (deltaY / frameRect.height) * 100, 0, 100);

    setThumbnailCenterX(nextCenterX);
    setThumbnailCenterY(nextCenterY);
  };

  const finishThumbnailDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = thumbnailDragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    thumbnailDragStateRef.current = null;
    setIsDraggingThumbnail(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleUploadThumbnail = async () => {
    if (!selectedImageDataUrl) {
      setError('Selecione uma imagem para enviar.');
      return;
    }

    if (!IMGBB_API_KEY) {
      setError('Chave da API do ImgBB nao configurada.');
      return;
    }

    setUploadingThumbnail(true);
    setError(null);
    setSuccess(null);

    try {
      const croppedImageBlob = await cropImageTo16by9(selectedImageDataUrl, thumbnailCenterX, thumbnailCenterY, thumbnailZoom);
      const formData = new FormData();
      formData.append('image', croppedImageBlob, 'thumbnail.jpg');

      const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
        params: {
          key: IMGBB_API_KEY,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const imageUrl =
        response.data?.data?.display_url ||
        response.data?.data?.url ||
        response.data?.data?.image?.url;

      if (!imageUrl) {
        throw new Error('Nao foi possivel obter a URL da imagem enviada.');
      }

      setForm((prev) => ({ ...prev, thumbnail_url: imageUrl }));
      setSelectedImageDataUrl(null);
      setSuccess('Thumbnail enviada com sucesso.');
    } catch (err) {
      console.error('Erro ao enviar thumbnail para ImgBB:', err);
      if (axios.isAxiosError(err)) {
        setError(getApiErrorMessage(err, 'Erro ao enviar imagem para o ImgBB'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao enviar imagem.');
      }
    } finally {
      setUploadingThumbnail(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={26} />
          <Typography>Carregando curso...</Typography>
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
              <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                Voltar
              </Button>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {isEditMode ? 'Editar Curso' : 'Novo Curso'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{ backgroundColor: '#059669', '&:hover': { backgroundColor: '#047857' } }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
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

          <TextField
            label="Titulo do curso"
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            required
            fullWidth
          />

          <TextField
            label="Descricao"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            multiline
            minRows={4}
            fullWidth
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSelectThumbnail}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              disabled={saving}
            >
              Selecionar imagem
            </Button>
            <Button
              variant="contained"
              startIcon={uploadingThumbnail ? <CircularProgress size={18} color="inherit" /> : <CloudUpload />}
              onClick={handleUploadThumbnail}
              disabled={uploadingThumbnail || saving || !selectedImageDataUrl}
            >
              {uploadingThumbnail ? 'Enviando imagem...' : 'Salvar imagem'}
            </Button>
          </Box>

          {selectedImageDataUrl && (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
              <Typography sx={{ fontWeight: 600, mb: 0.8 }}>Ajustar enquadramento da thumbnail</Typography>
              <Box
                ref={thumbnailFrameRef}
                sx={{
                  width: '100%',
                  maxWidth: 420,
                  aspectRatio: '16 / 9',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: isDraggingThumbnail ? 'grabbing' : 'grab',
                  touchAction: 'none',
                  borderRadius: 1.5,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                }}
                onPointerDown={handleThumbnailPointerDown}
                onPointerMove={handleThumbnailPointerMove}
                onPointerUp={finishThumbnailDrag}
                onPointerCancel={finishThumbnailDrag}
                onPointerLeave={finishThumbnailDrag}
              >
                <Box
                  component="img"
                  src={selectedImageDataUrl}
                  alt="Preview da imagem selecionada"
                  draggable={false}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: `${thumbnailCenterX}% ${thumbnailCenterY}%`,
                    transform: `scale(${thumbnailZoom})`,
                    transformOrigin: 'center center',
                    userSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </Box>

              <Box sx={{ mt: 1.2 }}>
                <Typography sx={{ fontSize: 13, mb: 0.3 }}>Zoom (redimensionar)</Typography>
                <Slider
                  size="small"
                  value={thumbnailZoom}
                  min={1}
                  max={3}
                  step={0.01}
                  onChange={(_, value) => setThumbnailZoom(Number(value))}
                />
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                  Arraste a imagem para mover e ajuste o zoom para enquadrar.
                </Typography>
              </Box>
            </Paper>
          )}

          {form.thumbnail_url && (
            <Box
              component="img"
              src={form.thumbnail_url}
              alt="Preview da thumbnail"
              sx={{
                width: '100%',
                maxWidth: 420,
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                borderRadius: 1.5,
                border: '1px solid #E2E8F0',
              }}
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={form.is_published}
                onChange={(event) => setForm((prev) => ({ ...prev, is_published: event.target.checked }))}
              />
            }
            label="Curso publicado"
          />
        </Stack>
      </Paper>
    </Container>
  );
};

export default CriarEditarForm;

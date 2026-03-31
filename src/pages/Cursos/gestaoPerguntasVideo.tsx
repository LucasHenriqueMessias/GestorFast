import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  Radio,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, ArrowBack, Delete, Save } from '@mui/icons-material';
import { getAccessToken, getDepartment } from '../../utils/storage';

interface QuizAnswerForm {
  id?: string;
  resposta: string;
  correta: boolean;
}

interface QuizQuestionForm {
  id?: string;
  pergunta: string;
  respostas: QuizAnswerForm[];
}

const createEmptyAnswer = (): QuizAnswerForm => ({
  resposta: '',
  correta: false,
});

const createEmptyQuestion = (): QuizQuestionForm => ({
  pergunta: '',
  respostas: [createEmptyAnswer(), createEmptyAnswer()],
});

const GestaoPerguntasVideo = () => {
  const navigate = useNavigate();
  const params = useParams();
  const cursoId = params.cursoId;
  const videoId = params.videoId;

  const department = getDepartment();
  const canManageQuiz = ['Diretor', 'Gestor', 'Developer'].includes(department || '');

  const [loading, setLoading] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionForm[]>([]);
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

  const loadQuestions = useCallback(async () => {
    if (!videoId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/cursos-perguntas/curso/${videoId}`, {
        headers: apiHeaders || undefined,
      });

      const data = Array.isArray(response.data) ? response.data : [];
      const mapped: QuizQuestionForm[] = data.map((item: any) => ({
        id: String(item.id),
        pergunta: item.pergunta ?? '',
        respostas: Array.isArray(item.respostas)
          ? item.respostas.map((resposta: any) => ({
              id: String(resposta.id),
              resposta: resposta.resposta ?? '',
              correta: Boolean(resposta.correta),
            }))
          : [],
      }));

      setQuestions(mapped);
    } catch (err) {
      console.error('Erro ao carregar perguntas do video:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao carregar perguntas (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao carregar perguntas.');
      }
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [apiHeaders, videoId]);

  useEffect(() => {
    if (!canManageQuiz) {
      navigate(`/cursos/${cursoId}`, { replace: true });
      return;
    }
    loadQuestions();
  }, [canManageQuiz, cursoId, loadQuestions, navigate]);

  const updateQuestion = (index: number, updater: (current: QuizQuestionForm) => QuizQuestionForm) => {
    setQuestions((current) => current.map((item, itemIndex) => (itemIndex === index ? updater(item) : item)));
  };

  const addQuestion = () => {
    setQuestions((current) => [...current, createEmptyQuestion()]);
  };

  const removeQuestionLocal = (index: number) => {
    setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const addAnswer = (questionIndex: number) => {
    updateQuestion(questionIndex, (question) => ({
      ...question,
      respostas: [...question.respostas, createEmptyAnswer()],
    }));
  };

  const removeAnswerLocal = (questionIndex: number, answerIndex: number) => {
    updateQuestion(questionIndex, (question) => ({
      ...question,
      respostas: question.respostas.filter((_, itemIndex) => itemIndex !== answerIndex),
    }));
  };

  const validateQuestion = (question: QuizQuestionForm): string | null => {
    if (!question.pergunta.trim()) {
      return 'Preencha o enunciado da pergunta.';
    }

    const nonEmptyAnswers = question.respostas.filter((item) => item.resposta.trim());
    if (nonEmptyAnswers.length < 2) {
      return 'Cada pergunta precisa de pelo menos 2 respostas preenchidas.';
    }

    const hasCorrect = nonEmptyAnswers.some((item) => item.correta);
    if (!hasCorrect) {
      return 'Selecione pelo menos uma resposta correta.';
    }

    return null;
  };

  const saveQuestion = async (questionIndex: number) => {
    if (!videoId || !cursoId) {
      setError('Curso ou video invalido para salvar perguntas.');
      return;
    }

    const question = questions[questionIndex];
    if (!question) {
      return;
    }

    const validationError = validateQuestion(question);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingQuestionId(question.id || `new-${questionIndex}`);
    setError(null);
    setSuccess(null);

    try {
      let questionId = question.id;

      if (questionId) {
        await axios.patch(
          `${process.env.REACT_APP_API_URL}/cursos-perguntas/${questionId}`,
          {
            pergunta: question.pergunta.trim(),
            videoaula: videoId,
            curso: cursoId,
          },
          { headers: apiHeaders || undefined },
        );
      } else {
        const createdQuestion = await axios.post(
          `${process.env.REACT_APP_API_URL}/cursos-perguntas`,
          {
            pergunta: question.pergunta.trim(),
            videoaula: videoId,
            curso: cursoId,
            respostas: [],
          },
          { headers: apiHeaders || undefined },
        );

        questionId = String(createdQuestion.data?.id);
      }

      if (!questionId) {
        throw new Error('Nao foi possivel identificar a pergunta salva.');
      }

      const freshQuestionResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/cursos-perguntas/${questionId}`,
        { headers: apiHeaders || undefined },
      );

      const existingAnswers = Array.isArray(freshQuestionResponse.data?.respostas)
        ? freshQuestionResponse.data.respostas
        : [];

      const keptAnswerIds = new Set<string>();

      for (const answer of question.respostas) {
        const payload = {
          resposta: answer.resposta.trim(),
          correta: Boolean(answer.correta),
          id_pergunta: { id: questionId },
        };

        if (answer.id) {
          await axios.patch(
            `${process.env.REACT_APP_API_URL}/cursos-respostas/${answer.id}`,
            payload,
            { headers: apiHeaders || undefined },
          );
          keptAnswerIds.add(answer.id);
        } else if (answer.resposta.trim()) {
          const createdAnswer = await axios.post(
            `${process.env.REACT_APP_API_URL}/cursos-respostas`,
            payload,
            { headers: apiHeaders || undefined },
          );
          if (createdAnswer.data?.id) {
            keptAnswerIds.add(String(createdAnswer.data.id));
          }
        }
      }

      for (const existingAnswer of existingAnswers) {
        const existingAnswerId = String(existingAnswer.id);
        if (!keptAnswerIds.has(existingAnswerId)) {
          await axios.delete(`${process.env.REACT_APP_API_URL}/cursos-respostas/${existingAnswerId}`, {
            headers: apiHeaders || undefined,
          });
        }
      }

      setSuccess('Pergunta salva com sucesso.');
      await loadQuestions();
    } catch (err) {
      console.error('Erro ao salvar pergunta:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao salvar pergunta (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao salvar pergunta.');
      }
    } finally {
      setSavingQuestionId(null);
    }
  };

  const deleteQuestion = async (questionIndex: number) => {
    const question = questions[questionIndex];
    if (!question) {
      return;
    }

    if (!question.id) {
      removeQuestionLocal(questionIndex);
      return;
    }

    setDeletingQuestionId(question.id);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/cursos-perguntas/${question.id}`, {
        headers: apiHeaders || undefined,
      });
      const answers = Array.isArray(response.data?.respostas) ? response.data.respostas : [];

      for (const answer of answers) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/cursos-respostas/${answer.id}`, {
          headers: apiHeaders || undefined,
        });
      }

      await axios.delete(`${process.env.REACT_APP_API_URL}/cursos-perguntas/${question.id}`, {
        headers: apiHeaders || undefined,
      });

      setSuccess('Pergunta excluida com sucesso.');
      await loadQuestions();
    } catch (err) {
      console.error('Erro ao excluir pergunta:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao excluir pergunta (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao excluir pergunta.');
      }
    } finally {
      setDeletingQuestionId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate(`/cursos/${cursoId}`)}
            >
              Voltar
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Questionario do video
            </Typography>
          </Box>

          <Button variant="contained" startIcon={<Add />} onClick={addQuestion}>
            Adicionar pergunta
          </Button>
        </Box>

        {!canManageQuiz && (
          <Alert severity="warning">Apenas Diretor, Gestor e Developer podem gerir perguntas.</Alert>
        )}

        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}

        {loading && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <CircularProgress size={24} />
              <Typography>Carregando perguntas...</Typography>
            </Box>
          </Paper>
        )}

        {!loading && questions.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 600 }}>Nenhuma pergunta cadastrada para este video.</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.6 }}>
              Clique em Adicionar pergunta para criar o questionario.
            </Typography>
          </Paper>
        )}

        {!loading && questions.map((question, questionIndex) => {
          const saving = savingQuestionId === (question.id || `new-${questionIndex}`);
          const deleting = deletingQuestionId === question.id;

          return (
            <Paper key={question.id || `new-${questionIndex}`} sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1.2}>
                <TextField
                  label={`Pergunta ${questionIndex + 1}`}
                  value={question.pergunta}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updateQuestion(questionIndex, (current) => ({
                      ...current,
                      pergunta: event.target.value,
                    }))
                  }
                  fullWidth
                />

                <Stack spacing={1}>
                  {question.respostas.map((answer, answerIndex) => (
                    <Box
                      key={answer.id || `new-answer-${questionIndex}-${answerIndex}`}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                    >
                      <TextField
                        label={`Resposta ${answerIndex + 1}`}
                        value={answer.resposta}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          updateQuestion(questionIndex, (current) => ({
                            ...current,
                            respostas: current.respostas.map((item, itemIndex) =>
                              itemIndex === answerIndex
                                ? {
                                    ...item,
                                    resposta: event.target.value,
                                  }
                                : item,
                            ),
                          }))
                        }
                        sx={{ flex: 1, minWidth: 220 }}
                      />

                      <FormControlLabel
                        control={
                          <Radio
                            checked={answer.correta}
                            onChange={() =>
                              updateQuestion(questionIndex, (current) => ({
                                ...current,
                                respostas: current.respostas.map((item, itemIndex) => ({
                                  ...item,
                                  correta: itemIndex === answerIndex,
                                })),
                              }))
                            }
                          />
                        }
                        label="Correta"
                      />

                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => removeAnswerLocal(questionIndex, answerIndex)}
                        disabled={question.respostas.length <= 2}
                      >
                        Remover
                      </Button>
                    </Box>
                  ))}
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => addAnswer(questionIndex)}
                  >
                    Adicionar resposta
                  </Button>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => deleteQuestion(questionIndex)}
                      disabled={deleting}
                    >
                      {deleting ? 'Excluindo...' : 'Excluir pergunta'}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                      onClick={() => saveQuestion(questionIndex)}
                      disabled={saving}
                    >
                      {saving ? 'Salvando...' : 'Salvar pergunta'}
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Container>
  );
};

export default GestaoPerguntasVideo;

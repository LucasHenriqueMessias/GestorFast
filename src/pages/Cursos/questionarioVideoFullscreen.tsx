import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  FormControl,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import { ArrowBack, NavigateBefore, NavigateNext } from '@mui/icons-material';
import { getAccessToken } from '../../utils/storage';

interface QuizQuestion {
  id: string;
  pergunta: string;
  answers: Array<{
    id: string;
    resposta: string;
  }>;
}

interface QuizResponse {
  has_quiz: boolean;
  required_score_percent: number;
  questions: QuizQuestion[];
}

interface QuizSubmitResponse {
  approved: boolean;
  required_score_percent: number;
  score_percent: number;
  correct_answers: number;
  total_questions: number;
  result_by_question: Array<{
    question_id: string;
    selected_answer_id: string | null;
    correct_answer_id: string | null;
    is_correct: boolean;
  }>;
}

const QuestionarioVideoFullscreen = () => {
  const navigate = useNavigate();
  const params = useParams();
  const cursoId = params.cursoId;
  const videoId = params.videoId;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizData, setQuizData] = useState<QuizResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    const loadQuiz = async () => {
      if (!videoId) {
        setError('Video invalido.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get<QuizResponse>(
          `${process.env.REACT_APP_API_URL}/tab-curso-progresso/video/${videoId}/quiz`,
          {
            headers: apiHeaders || undefined,
          },
        );

        setQuizData(response.data);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setResult(null);
      } catch (err: any) {
        console.error('Erro ao carregar questionario:', err);
        if (axios.isAxiosError(err)) {
          setError(`Erro ao carregar questionario (${err.response?.status ?? 'sem status'}).`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro inesperado ao carregar questionario.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [apiHeaders, videoId]);

  const questions = quizData?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : '';
  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((current: number) => Math.max(0, current - 1));
  };

  const goToNextQuestion = () => {
    if (!currentQuestion || !currentAnswer) {
      return;
    }
    setCurrentQuestionIndex((current: number) => Math.min(questions.length - 1, current + 1));
  };

  const finishQuiz = async () => {
    if (!videoId || !quizData) {
      return;
    }

    const unanswered = quizData.questions.some((question: QuizQuestion) => !answers[question.id]);
    if (unanswered) {
      setError('Responda todas as perguntas antes de finalizar o questionario.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post<QuizSubmitResponse>(
        `${process.env.REACT_APP_API_URL}/tab-curso-progresso/video/${videoId}/quiz/submit`,
        {
          answers: quizData.questions.map((question: QuizQuestion) => ({
            question_id: question.id,
            answer_id: answers[question.id],
          })),
        },
        {
          headers: apiHeaders || undefined,
        },
      );

      setResult(response.data);
    } catch (err: any) {
      console.error('Erro ao finalizar questionario:', err);
      if (axios.isAxiosError(err)) {
        setError(`Erro ao enviar questionario (${err.response?.status ?? 'sem status'}).`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao enviar questionario.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resultByQuestion = useMemo(() => {
    const map = new Map<string, { selected_answer_id: string | null; correct_answer_id: string | null; is_correct: boolean }>();
    (result?.result_by_question ?? []).forEach((item: QuizSubmitResponse['result_by_question'][number]) => {
      map.set(item.question_id, {
        selected_answer_id: item.selected_answer_id,
        correct_answer_id: item.correct_answer_id,
        is_correct: item.is_correct,
      });
    });
    return map;
  }, [result]);

  const handleBackToCourse = () => {
    navigate(`/cursos/${cursoId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: 'calc(100vh - 48px)' }}>
      <Stack spacing={2.2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<ArrowBack />} onClick={handleBackToCourse}>
            Voltar ao curso
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Questionario
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <Paper sx={{ p: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={28} />
              <Typography>Carregando questionario...</Typography>
            </Box>
          </Paper>
        )}

        {!loading && quizData && !quizData.has_quiz && (
          <Alert severity="info">Este video nao possui questionario.</Alert>
        )}

        {!loading && quizData?.has_quiz && !result && currentQuestion && (
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, minHeight: '70vh' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  Questao {currentQuestionIndex + 1} de {questions.length}
                </Typography>
                <LinearProgress variant="determinate" value={progressPercent} sx={{ mt: 0.8, height: 8, borderRadius: 999 }} />
              </Box>

              <FormControl component="fieldset" fullWidth sx={{ flex: 1 }}>
                <FormLabel component="legend" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.2 }}>
                  {currentQuestion.pergunta}
                </FormLabel>
                <RadioGroup
                  value={currentAnswer ?? ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setAnswers((current: Record<string, string>) => ({
                      ...current,
                      [currentQuestion.id]: event.target.value,
                    }))
                  }
                >
                  <Stack spacing={1}>
                    {currentQuestion.answers.map((answer: QuizQuestion['answers'][number]) => (
                      <Paper
                        key={answer.id}
                        variant="outlined"
                        sx={{ p: 1.2, borderRadius: 1.5, borderColor: currentAnswer === answer.id ? '#3B82F6' : '#E2E8F0' }}
                      >
                        <FormControlLabel
                          value={answer.id}
                          control={<Radio />}
                          label={answer.resposta}
                          sx={{ width: '100%', m: 0 }}
                        />
                      </Paper>
                    ))}
                  </Stack>
                </RadioGroup>
              </FormControl>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<NavigateBefore />}
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex <= 0}
                >
                  Anterior
                </Button>

                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={<NavigateNext />}
                    onClick={goToNextQuestion}
                    disabled={!currentAnswer}
                  >
                    Proxima questao
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={finishQuiz}
                    disabled={!currentAnswer || submitting}
                  >
                    {submitting ? 'Finalizando...' : 'Finalizar questionario'}
                  </Button>
                )}
              </Box>
            </Stack>
          </Paper>
        )}

        {!loading && quizData?.has_quiz && result && (
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Stack spacing={1.2}>
              <Alert severity={result.approved ? 'success' : 'warning'}>
                Resultado: {result.correct_answers}/{result.total_questions} acertos ({result.score_percent.toFixed(2)}%).
                Minimo para aprovacao: {result.required_score_percent}%.
              </Alert>

              {questions.map((question: QuizQuestion, questionIndex: number) => {
                const questionResult = resultByQuestion.get(question.id);

                return (
                  <Paper key={question.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>
                      {questionIndex + 1}. {question.pergunta}
                    </Typography>

                    <Stack spacing={0.8}>
                      {question.answers.map((answer: QuizQuestion['answers'][number]) => {
                        const isCorrectAnswer = questionResult?.correct_answer_id === answer.id;
                        const isSelectedWrong = questionResult?.selected_answer_id === answer.id && !isCorrectAnswer;

                        let backgroundColor = '#FFFFFF';
                        let borderColor = '#E2E8F0';

                        if (isCorrectAnswer) {
                          backgroundColor = '#DCFCE7';
                          borderColor = '#22C55E';
                        } else if (isSelectedWrong) {
                          backgroundColor = '#FEE2E2';
                          borderColor = '#EF4444';
                        }

                        return (
                          <Box
                            key={answer.id}
                            sx={{
                              p: 1,
                              border: '1px solid',
                              borderColor,
                              borderRadius: 1.2,
                              backgroundColor,
                            }}
                          >
                            <Typography>{answer.resposta}</Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Paper>
                );
              })}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleBackToCourse}>
                  Voltar ao curso
                </Button>
              </Box>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default QuestionarioVideoFullscreen;

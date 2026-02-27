import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLevelExercises } from '../hooks/useLevels';
import { useSubmitAttempt } from '../hooks/useExercises';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function ExercisePage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  const { data: exercises, isLoading } = useLevelExercises(Number(levelId));
  const submitAttempt = useSubmitAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [spellingAnswer, setSpellingAnswer] = useState('');
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
    accuracyScore?: number;
    userResponse?: string;
  } | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);

  const currentExercise = (exercises as any)?.[currentIndex];
  const totalExercises = (exercises as any)?.length || 0;

  // Reset state when exercise changes
  useEffect(() => {
    setSpellingAnswer('');
    setFeedback(null);
    setShowNextButton(false);
  }, [currentIndex]);

  const handleVoiceComplete = async (result: { transcript: string; audioBlob?: Blob }) => {
    if (!currentExercise) return;

    try {
      const response: any = await submitAttempt.mutateAsync({
        exerciseId: currentExercise.id,
        data: {
          userResponse: result.transcript,
          // Don't send attemptDuration for now - it's optional
        },
      });

      setFeedback({
        message: response.feedback,
        isCorrect: response.isCorrect,
        accuracyScore: response.accuracyScore,
      });
      setShowNextButton(true);
    } catch (error: any) {
      alert(error.message || 'Error al enviar respuesta');
    }
  };

  const handleSpellingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentExercise || !spellingAnswer.trim()) return;

    try {
      const response: any = await submitAttempt.mutateAsync({
        exerciseId: currentExercise.id,
        data: {
          userResponse: spellingAnswer.trim(),
          // Don't send attemptDuration for now - it's optional
        },
      });

      setFeedback({
        message: response.feedback,
        isCorrect: response.isCorrect,
        accuracyScore: response.accuracyScore,
        userResponse: spellingAnswer.trim(),
      });
      setShowNextButton(true);
    } catch (error: any) {
      alert(error.message || 'Error al enviar respuesta');
    }
  };

  const handleNext = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all exercises
      navigate('/');
    }
  };

  const handleSkip = () => {
    if (currentIndex < totalExercises - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">🌱</div>
          <p className="text-muted-foreground">Cargando ejercicios...</p>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>No hay ejercicios disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isVoiceExercise =
    currentExercise.exerciseType === 'voice_repeat' ||
    currentExercise.exerciseType === 'voice_answer';
  const isSpellingExercise = currentExercise.exerciseType === 'spelling';
  const isTranslationExercise = currentExercise.exerciseType === 'translation';
  const isTextExercise = isSpellingExercise || isTranslationExercise;

  return (
    <div className="min-h-screen bg-gradient-to-b from-garden-sky to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Volver
            </button>
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} / {totalExercises}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / totalExercises) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Exercise Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{currentExercise.promptText}</CardTitle>
            <CardDescription className="text-lg">
              {currentExercise.promptTextEs}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Voice Exercise */}
            {isVoiceExercise && (
              <VoiceRecorder
                onComplete={handleVoiceComplete}
                expectedText={currentExercise.expectedText || undefined}
              />
            )}

            {/* Text Exercise (Spelling or Translation) */}
            {isTextExercise && !showNextButton && (
              <form onSubmit={handleSpellingSubmit} className="space-y-4">
                <div>
                  <label htmlFor="spelling" className="block text-sm font-medium mb-2">
                    {isTranslationExercise ? 'Traduce al inglés:' : 'Escribe tu respuesta:'}
                  </label>
                  {isTranslationExercise && (
                    <div className="mb-3 p-4 bg-accent/50 rounded-lg">
                      <p className="text-xl font-medium text-center">
                        {currentExercise.promptTextEs}
                      </p>
                    </div>
                  )}
                  <input
                    id="spelling"
                    type="text"
                    value={spellingAnswer}
                    onChange={(e) => setSpellingAnswer(e.target.value)}
                    className="w-full px-4 py-3 border border-input rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={isTranslationExercise ? 'Escribe la traducción...' : 'Escribe aquí...'}
                    autoFocus
                    disabled={submitAttempt.isPending}
                  />
                </div>

                {currentExercise.hintTextEs && (
                  <p className="text-sm text-muted-foreground">
                    💡 Pista: {currentExercise.hintTextEs}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleSkip}
                    disabled={submitAttempt.isPending}
                  >
                    Saltar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!spellingAnswer.trim() || submitAttempt.isPending}
                  >
                    {submitAttempt.isPending ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </form>
            )}

            {/* Feedback */}
            {feedback && (
              <div
                className={`p-4 rounded-lg ${
                  feedback.isCorrect
                    ? 'bg-primary/10 border border-primary/20'
                    : 'bg-destructive/10 border border-destructive/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">
                    {feedback.isCorrect ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-lg mb-1">
                      {feedback.isCorrect ? '¡Correcto!' : 'Inténtalo de nuevo'}
                    </p>
                    <p className="text-sm mb-3">{feedback.message}</p>

                    {/* Show what user said/wrote */}
                    {feedback.userResponse && (
                      <div className="text-sm mb-2">
                        <span className="font-medium">Tu respuesta:</span>{' '}
                        <span className="text-muted-foreground">&quot;{feedback.userResponse}&quot;</span>
                      </div>
                    )}

                    {/* Show expected answer if incorrect */}
                    {!feedback.isCorrect && currentExercise.expectedText && (
                      <div className="text-sm mb-2">
                        <span className="font-medium">Respuesta correcta:</span>{' '}
                        <span className="text-primary">&quot;{currentExercise.expectedText}&quot;</span>
                      </div>
                    )}

                    {/* Show hint if available and incorrect */}
                    {!feedback.isCorrect && currentExercise.hintTextEs && (
                      <div className="text-sm mt-2 p-2 bg-muted/50 rounded">
                        <span className="font-medium">💡 Pista:</span>{' '}
                        {currentExercise.hintTextEs}
                      </div>
                    )}

                    {feedback.accuracyScore !== undefined && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Precisión: {feedback.accuracyScore.toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {showNextButton && (
              <div className="flex gap-2">
                {!feedback?.isCorrect && (
                  <Button
                    onClick={() => {
                      setFeedback(null);
                      setShowNextButton(false);
                      setSpellingAnswer('');
                    }}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Intentar de nuevo
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="flex-1"
                  size="lg"
                  variant={feedback?.isCorrect ? 'default' : 'outline'}
                >
                  {currentIndex < totalExercises - 1
                    ? feedback?.isCorrect
                      ? 'Siguiente Ejercicio →'
                      : 'Saltar'
                    : 'Finalizar Nivel 🎉'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

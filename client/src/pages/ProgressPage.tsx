import { useNavigate } from 'react-router-dom';
import { useProgressStats } from '../hooks/useProgress';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function ProgressPage() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useProgressStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">📊</div>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const statsData = (stats as any)?.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-garden-sky to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')}>
              ← Volver
            </Button>
            <h1 className="text-xl font-semibold">Tu Progreso</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <div className="text-6xl mb-4">🌸</div>
          <h2 className="text-3xl font-bold mb-2">
            ¡Gran trabajo, {user?.displayName}!
          </h2>
          <p className="text-muted-foreground">
            Aquí está tu progreso de aprendizaje
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Levels Completed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">
                {statsData?.totalLevelsCompleted || 0}
              </CardTitle>
              <CardDescription>Niveles Completados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl text-center">🎯</div>
            </CardContent>
          </Card>

          {/* Exercises Completed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">
                {statsData?.totalExercisesCompleted || 0}
              </CardTitle>
              <CardDescription>Ejercicios Completados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl text-center">✅</div>
            </CardContent>
          </Card>

          {/* Average Accuracy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl">
                {statsData?.averageAccuracy
                  ? Math.round(statsData.averageAccuracy)
                  : 0}
                %
              </CardTitle>
              <CardDescription>Precisión Promedio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl text-center">🎯</div>
            </CardContent>
          </Card>
        </div>

        {/* Skill Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Desglose por Habilidad</CardTitle>
            <CardDescription>
              Tu progreso en cada tipo de ejercicio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Speaking */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎤</span>
                  <span className="font-medium">Hablar (Speaking)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {statsData?.skillBreakdown?.speaking?.completed || 0} ejercicios
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{
                    width: `${
                      statsData?.skillBreakdown?.speaking?.accuracy || 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statsData?.skillBreakdown?.speaking?.accuracy
                  ? Math.round(statsData.skillBreakdown.speaking.accuracy)
                  : 0}
                % de precisión
              </p>
            </div>

            {/* Listening */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👂</span>
                  <span className="font-medium">Escuchar (Listening)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {statsData?.skillBreakdown?.listening?.completed || 0} ejercicios
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{
                    width: `${
                      statsData?.skillBreakdown?.listening?.accuracy || 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statsData?.skillBreakdown?.listening?.accuracy
                  ? Math.round(statsData.skillBreakdown.listening.accuracy)
                  : 0}
                % de precisión
              </p>
            </div>

            {/* Spelling */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✍️</span>
                  <span className="font-medium">Ortografía (Spelling)</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {statsData?.skillBreakdown?.spelling?.completed || 0} ejercicios
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{
                    width: `${
                      statsData?.skillBreakdown?.spelling?.accuracy || 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statsData?.skillBreakdown?.spelling?.accuracy
                  ? Math.round(statsData.skillBreakdown.spelling.accuracy)
                  : 0}
                % de precisión
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {statsData?.recentActivity && statsData.recentActivity.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>Últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsData.recentActivity.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-medium">
                      {activity.exercisesCompleted} ejercicios
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivational Message */}
        <div className="mt-8 text-center p-6 bg-primary/5 rounded-lg">
          <p className="text-lg font-medium mb-2">
            ¡Sigue adelante! 🌱
          </p>
          <p className="text-sm text-muted-foreground">
            Cada día que practicas, tu jardín crece un poco más.
          </p>
        </div>
      </main>
    </div>
  );
}

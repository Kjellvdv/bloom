import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLevels, useStartLevel } from '../hooks/useLevels';
import { logout } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Garden } from '../components/garden/Garden';
import { GardenMessages } from '../components/garden/GardenMessages';

export function DashboardPage() {
  const { user, setUser } = useAuth();
  const { data: levels, isLoading } = useLevels();
  const startLevel = useStartLevel();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleStartLevel = async (levelId: number) => {
    try {
      await startLevel.mutateAsync(levelId);
      navigate(`/levels/${levelId}/exercises`);
    } catch (error) {
      console.error('Error starting level:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-6xl mb-4">🌱</div>
          <p className="text-muted-foreground">Cargando tu jardín...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-garden-sky to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🌱</span>
            <div>
              <h1 className="text-2xl font-bold">Bloom</h1>
              <p className="text-sm text-muted-foreground">
                Hola, {user?.displayName}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Tu Jardín de Aprendizaje</h2>
          <p className="text-muted-foreground">
            Completa los niveles para hacer crecer tu jardín 🌸
          </p>
        </div>

        {/* Garden Messages */}
        <div className="mb-6">
          <GardenMessages />
        </div>

        {/* Garden Visualization */}
        <div className="mb-8">
          <Garden />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">Niveles de Aprendizaje</h3>
          <Button variant="outline" onClick={() => navigate('/progress')}>
            Ver Progreso
          </Button>
        </div>

        {/* Levels Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(levels as any)?.map((level: any) => {
            const progress = level.progress;
            const isUnlocked =
              !level.prerequisiteLevelId ||
              progress?.status === 'in_progress' ||
              progress?.status === 'completed';

            return (
              <Card
                key={level.id}
                className={`${!isUnlocked ? 'opacity-50' : 'hover:shadow-lg transition-shadow'}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl">
                          {level.rewardFlowerType === 'daisy' && '🌼'}
                          {level.rewardFlowerType === 'rose' && '🌹'}
                          {level.rewardFlowerType === 'tulip' && '🌷'}
                          {level.rewardFlowerType === 'sunflower' && '🌻'}
                        </span>
                        <span className="text-lg">{level.titleEs}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {level.descriptionEs}
                      </CardDescription>
                    </div>
                    {!isUnlocked && (
                      <span className="text-2xl">🔒</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    {progress && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progreso</span>
                          <span className="font-medium">
                            {progress.completionPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {level.exerciseCount} ejercicios
                      </span>
                      {progress?.status === 'completed' && (
                        <span className="text-sm font-medium text-primary">
                          ✓ Completado
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    <Button
                      className="w-full"
                      onClick={() => handleStartLevel(level.id)}
                      disabled={!isUnlocked || startLevel.isPending}
                    >
                      {!isUnlocked
                        ? 'Bloqueado'
                        : progress?.status === 'completed'
                        ? 'Repasar'
                        : progress?.status === 'in_progress'
                        ? 'Continuar'
                        : 'Comenzar'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {(levels as any)?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No hay niveles disponibles aún.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

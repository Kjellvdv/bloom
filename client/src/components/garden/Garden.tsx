import { useGarden } from '../../hooks/useGarden';

const flowerEmojis: Record<string, string> = {
  daisy: '🌼',
  rose: '🌹',
  tulip: '🌷',
  sunflower: '🌻',
  lily: '🌺',
  orchid: '🪷',
};

export function Garden() {
  const { data: garden, isLoading } = useGarden();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse text-4xl">🌱</div>
      </div>
    );
  }

  const gardenData = (garden as any)?.data;
  const totalFlowers = gardenData?.totalFlowers || 0;
  const totalSessions = gardenData?.totalWateringSessions || 0;

  return (
    <div className="relative min-h-[300px] bg-gradient-to-b from-garden-sky/30 to-garden-grass/20 rounded-lg p-8 overflow-hidden">
      {/* Sky background */}
      <div className="absolute inset-0 bg-garden-sky/10" />

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-garden-soil/20 rounded-b-lg" />

      {/* Garden content */}
      <div className="relative z-10">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold mb-2">🌱 Tu Jardín</h3>
          <p className="text-sm text-muted-foreground">
            {totalFlowers} {totalFlowers === 1 ? 'flor' : 'flores'} floreciendo
          </p>
        </div>

        {/* Flowers display */}
        <div className="flex flex-wrap justify-center gap-4 min-h-[120px] items-end">
          {totalFlowers === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-2">🌱</div>
              <p className="text-sm text-muted-foreground">
                Completa niveles para ver crecer tu jardín
              </p>
            </div>
          ) : (
            Array.from({ length: totalFlowers }).map((_, i) => {
              // Rotate through different flower types
              const flowerTypes = ['daisy', 'rose', 'tulip', 'sunflower', 'lily'];
              const flowerType = flowerTypes[i % flowerTypes.length];
              const emoji = flowerEmojis[flowerType] || '🌸';

              return (
                <div
                  key={i}
                  className="text-5xl animate-bloom flower swaying"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                >
                  {emoji}
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 flex justify-center gap-8 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-1">💧</div>
            <div className="font-medium">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sesiones</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🌸</div>
            <div className="font-medium">{totalFlowers}</div>
            <div className="text-xs text-muted-foreground">Flores</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, lazy, Suspense } from 'react';

// Lazy load the game component to avoid loading game resources until needed
const GameComponent = lazy(() => import('./GameComponent'));

interface GameHeroProps {
  userName?: string;
}

const GameHero: React.FC<GameHeroProps> = ({ userName = "User" }) => {
  const [gameStarted, setGameStarted] = useState(false);
  
  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="relative w-full h-[300px] mb-8 overflow-hidden rounded-lg">
      {!gameStarted ? (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            Welcome back, {userName}!
          </h1>
          <p className="text-md text-gray-600 dark:text-gray-300 mb-6 max-w-md">
            Ready for a quick break? Try our offline-style runner game!
          </p>
          <button
            onClick={startGame}
            className="px-5 py-2 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 font-medium rounded-md hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Start Jumping!
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            No resources are loaded until you click
          </p>
        </div>
      ) : (
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-800 dark:border-gray-100 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading the game...</p>
            </div>
          </div>
        }>
          <GameComponent userName={userName} />
        </Suspense>
      )}
    </div>
  );
};

export default GameHero;
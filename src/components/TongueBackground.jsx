import { useMemo, useState, useEffect } from 'react';

// Generate a shuffled array of image indices
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate enough tiles for seamless infinite scroll
function generateTileGrid(tileSize = 75) {
  // Calculate columns to fill width
  const cols = Math.ceil((window.innerWidth * 1.5) / tileSize);
  // Need enough rows for: screen height + buffer for seamless loop
  const screenRows = Math.ceil(window.innerHeight / tileSize);
  const rows = screenRows * 4; // Extra for seamless loop
  const totalTiles = cols * rows;
  
  // Create array of image numbers 1-30
  const imageNumbers = Array.from({ length: 30 }, (_, i) => i + 1);
  
  // Generate tiles by repeating and shuffling
  const tiles = [];
  while (tiles.length < totalTiles) {
    tiles.push(...shuffleArray(imageNumbers));
  }
  
  return { tiles: tiles.slice(0, totalTiles), cols, rows, screenRows };
}

export function TongueBackground() {
  const { tiles, cols, rows, screenRows } = useMemo(() => generateTileGrid(75), []);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Total height of the grid
  const gridHeight = rows * 75;
  // Height of one screen of tiles  
  const screenHeight = screenRows * 75;
  
  // Start animation after mount to ensure it begins from the top
  useEffect(() => {
    // Small delay to ensure CSS is ready
    const timer = setTimeout(() => setIsAnimating(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Animated tongue grid - starts completely above viewport */}
      <div 
        className={`absolute ${isAnimating ? 'tongue-cascade-start' : ''}`}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 75px)`,
          gap: 0,
          left: 0,
          // Start with the grid completely above the viewport (with extra buffer)
          top: `-${gridHeight + screenHeight}px`,
          // CSS variable for animation distance
          '--total-distance': `${gridHeight + screenHeight + window.innerHeight}px`,
        }}
      >
        {tiles.map((num, index) => (
          <div 
            key={index}
            className="w-[75px] h-[75px] overflow-hidden"
          >
            <img
              src={`/assets/images/${num}.JPG`}
              alt=""
              className="w-full h-full object-cover opacity-40"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

// Possible knight moves
const KNIGHT_MOVES = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1]
];

const KnightsTourGame = () => {
  const BOARD_SIZES = [5, 6, 7];
  const [boardSize, setBoardSize] = useState(5);
  const [board, setBoard] = useState(Array(boardSize).fill().map(() => Array(boardSize).fill(0)));
  const [currentMove, setCurrentMove] = useState(1);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [showHints, setShowHints] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'complete', 'lost'

  // Regenerate board when board size changes
  useEffect(() => {
    setBoard(Array(boardSize).fill().map(() => Array(boardSize).fill(0)));
    setCurrentMove(1);
    setSelectedSquare(null);
    setGameStatus('playing');
  }, [boardSize]);

  // Generate valid knight moves
  const getValidMoves = (x, y) => {
    if (x === null || y === null) return [];
    
    return KNIGHT_MOVES
      .map(([dx, dy]) => [x + dx, y + dy])
      .filter(([newX, newY]) => 
        newX >= 0 && newX < boardSize && 
        newY >= 0 && newY < boardSize && 
        board[newY][newX] === 0
      );
  };

  // Check if the tour is complete
  const isTourComplete = () => {
    return currentMove > boardSize * boardSize;
  };

  // Check if the player is stuck (no valid moves)
  const isPlayerStuck = (x, y) => {
    if (x === null || y === null) return false;
    const validMoves = getValidMoves(x, y);
    return validMoves.length === 0;
  };

  // Handle square selection
  const handleSquareClick = (x, y) => {
    // First move
    if (currentMove === 1) {
      const newBoard = [...board];
      newBoard[y][x] = currentMove;
      setBoard(newBoard);
      setCurrentMove(currentMove + 1);
      setSelectedSquare([x, y]);
      return;
    }

    // Subsequent moves
    if (selectedSquare) {
      const validMoves = getValidMoves(selectedSquare[0], selectedSquare[1]);
      const isValidMove = validMoves.some(([vx, vy]) => vx === x && vy === y);

      if (isValidMove) {
        const newBoard = board.map(row => [...row]);
        newBoard[y][x] = currentMove;
        setBoard(newBoard);
        
        // Check if this is the final move
        if (currentMove === boardSize * boardSize) {
          setGameStatus('complete');
        } else {
          setSelectedSquare([x, y]);
          // Check if next moves are possible from the new position
          const nextValidMoves = getValidMoves(x, y);
          if (nextValidMoves.length === 0) {
            setGameStatus('lost');
          }
        }

        setCurrentMove(currentMove + 1);
      }
    }
  };

  // Reset the game
  const resetGame = () => {
    setBoard(Array(boardSize).fill().map(() => Array(boardSize).fill(0)));
    setCurrentMove(1);
    setSelectedSquare(null);
    setGameStatus('playing');
  };

  // Hint functionality
  const toggleHints = () => {
    setShowHints(!showHints);
  };

  // Change board size
  const handleBoardSizeChange = (size) => {
    setBoardSize(size);
  };

  // Render board
  const renderBoard = () => {
    const squareSize = boardSize === 5 ? 'w-16 h-16' : 
                       boardSize === 6 ? 'w-14 h-14' : 
                       'w-12 h-12';

    return board.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => {
          const isValidMove = selectedSquare 
            ? getValidMoves(selectedSquare[0], selectedSquare[1])
              .some(([vx, vy]) => vx === x && vy === y)
            : false;

          let cellClass = `${squareSize} border-2 border-gray-400 flex items-center justify-center text-xl `;
          
          if (cell > 0) {
            cellClass += "bg-green-600 text-white"; // Visited squares
          } else if (showHints && isValidMove) {
            cellClass += "bg-green-100 border-green-300 cursor-pointer"; // Hint squares
          } else {
            cellClass += "bg-white border-gray-300 cursor-pointer"; // Unvisited squares
          }

          return (
            <div 
              key={x} 
              className={cellClass}
              onClick={() => {
                if (gameStatus === 'playing' && (cell === 0 || (showHints && isValidMove))) {
                  handleSquareClick(x, y);
                }
              }}
            >
              {cell > 0 ? cell : ''}
            </div>
          );
        })}
      </div>
    ));
  };

  // Render game status message
  const renderGameStatusMessage = () => {
    switch (gameStatus) {
      case 'complete':
        return <p className="text-green-600 font-bold text-xl">Tour Complete!</p>;
      case 'lost':
        return <p className="text-red-600 font-bold text-xl">No More Moves Possible!</p>;
      default:
        return <p className="text-lg">Move {currentMove - 1} of {boardSize * boardSize}</p>;
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-50 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Knight's Tour Game</h1>
      
      {/* Board Size Selection */}
      <div className="flex justify-center mb-4">
        {BOARD_SIZES.map(size => (
          <button
            key={size}
            onClick={() => handleBoardSizeChange(size)}
            className={`mx-1 px-4 py-2 rounded transition-colors ${
              boardSize === size 
                ? 'bg-blue-600 text-white' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            {size}x{size} Board
          </button>
        ))}
      </div>
      
      <div className="mb-4 text-center">
        {renderGameStatusMessage()}
      </div>
      
      <div className="flex justify-center mb-4">
        <button 
          onClick={toggleHints} 
          className="mr-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          {showHints ? 'Hide Hints' : 'Show Hints'}
        </button>
        <button 
          onClick={resetGame} 
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
        >
          Reset Game
        </button>
      </div>
      
      <div className="flex justify-center mb-4">
        <div className="inline-block border-2 border-gray-300 rounded-lg overflow-hidden">
          {renderBoard()}
        </div>
      </div>
      
      <div className="mt-4 bg-white p-4 rounded-lg shadow-inner">
        <p className="font-semibold mb-2">Rules:</p>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Start anywhere on the board</li>
          <li>Move like a chess knight (L-shape)</li>
          <li>Visit each square exactly once</li>
          <li>Complete the tour by visiting all squares</li>
        </ul>
      </div>
    </div>
  );
};

export default KnightsTourGame;
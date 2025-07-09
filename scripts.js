document.addEventListener('DOMContentLoaded', () => {
    // Game constants and state
    const BOARD_SIZE = 8;
    const PIECES = {
        EMPTY: '',
        WHITE_PAWN: '♙',
        WHITE_ROOK: '♖',
        WHITE_KNIGHT: '♘',
        WHITE_BISHOP: '♗',
        WHITE_QUEEN: '♕',
        WHITE_KING: '♔',
        BLACK_PAWN: '♟',
        BLACK_ROOK: '♜',
        BLACK_KNIGHT: '♞',
        BLACK_BISHOP: '♝',
        BLACK_QUEEN: '♛',
        BLACK_KING: '♚'
    };

    const TUTORIAL_STEPS = [
        {
            piece: PIECES.WHITE_PAWN,
            title: "The Pawn",
            description: "Pawns move forward one square, but capture diagonally. On their first move, they can advance two squares. When they reach the opposite side, they can be promoted to any other piece (except a king)."
        },
        {
            piece: PIECES.WHITE_ROOK,
            title: "The Rook",
            description: "Rooks move any number of squares horizontally or vertically. They are powerful pieces in the endgame when they can control open files and ranks."
        },
        {
            piece: PIECES.WHITE_KNIGHT,
            title: "The Knight",
            description: "Knights move in an L-shape: two squares in one direction and then one square perpendicular. They are the only pieces that can jump over other pieces."
        },
        {
            piece: PIECES.WHITE_BISHOP,
            title: "The Bishop",
            description: "Bishops move diagonally any number of squares. Each bishop starts on a specific color and must stay on that color throughout the game."
        },
        {
            piece: PIECES.WHITE_QUEEN,
            title: "The Queen",
            description: "The queen combines the power of a rook and bishop. She can move any number of squares horizontally, vertically, or diagonally, making her the most powerful piece."
        },
        {
            piece: PIECES.WHITE_KING,
            title: "The King",
            description: "The king moves one square in any direction. The game is won by putting the opponent's king in checkmate, where it is under attack and cannot escape."
        }
    ];

    // Game state
    let gameState = {
        board: [],
        currentPlayer: 'white',
        selectedPiece: null,
        validMoves: [],
        gameMode: 'pvp', // 'pvp' or 'pvc'
        gameActive: false,
        tutorialActive: true,
        tutorialStep: 0,
        soundEnabled: true,
        capturedPieces: {
            white: [],
            black: []
        },
        aiDifficulty: 'easy', // easy, medium, hard
        check: {
            white: false,
            black: false
        },
        checkmate: false
    };

    // DOM elements
    const chessBoard = document.getElementById('chessBoard');
    const demoBoard = document.getElementById('demoBoard');
    const gameStatus = document.getElementById('gameStatus');
    const whiteCaptured = document.getElementById('whiteCaptured');
    const blackCaptured = document.getElementById('blackCaptured');
    const pieceDemo = document.getElementById('pieceDemo');
    const explanation = document.getElementById('explanation');
    const tutorialProgress = document.getElementById('tutorialProgress');
    const soundBtn = document.getElementById('soundBtn');
    const nextTutorialBtn = document.getElementById('nextTutorialBtn');
    const skipTutorialBtn = document.getElementById('skipTutorialBtn');
    const pvpBtn = document.getElementById('pvpBtn');
    const pvcBtn = document.getElementById('pvcBtn');
    const restartBtn = document.getElementById('restartBtn');
    const newGameBtn = document.getElementById('newGameBtn');
    const aiDifficulty = document.getElementById('aiDifficulty');

    // Sound effects
    const moveSound = new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3");
    const captureSound = new Audio("https://www.soundjay.com/buttons/sounds/button-10.mp3");
    const selectSound = new Audio("https://www.soundjay.com/buttons/sounds/button-03.mp3");
    const checkSound = new Audio("https://www.soundjay.com/buttons/sounds/button-16.mp3");
    const checkmateSound = new Audio("https://www.soundjay.com/buttons/sounds/button-08.mp3");
    
    // Initialize the game
    function initGame() {
        createChessBoard();
        createDemoBoard();
        setupTutorialProgress();
        updateTutorialStep();
        setupEventListeners();
        updateCapturedPiecesDisplay();
    }

    // Create the chess board
    function createChessBoard() {
        chessBoard.innerHTML = '';
        
        // Initial board setup
        const initialSetup = [
            [PIECES.BLACK_ROOK, PIECES.BLACK_KNIGHT, PIECES.BLACK_BISHOP, PIECES.BLACK_QUEEN, PIECES.BLACK_KING, PIECES.BLACK_BISHOP, PIECES.BLACK_KNIGHT, PIECES.BLACK_ROOK],
            [PIECES.BLACK_PAWN, PIECES.BLACK_PAWN, PIECES.BLACK_PAWN, PIECES.BLACK_PAWN, PIECES.BLACK_PAWN, PIECES.BLACK_PAWN, PIECES.BLACK_PAWN, PIECES.BLACK_PAWN],
            [PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY],
            [PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY],
            [PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY],
            [PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY, PIECES.EMPTY],
            [PIECES.WHITE_PAWN, PIECES.WHITE_PAWN, PIECES.WHITE_PAWN, PIECES.WHITE_PAWN, PIECES.WHITE_PAWN, PIECES.WHITE_PAWN, PIECES.WHITE_PAWN, PIECES.WHITE_PAWN],
            [PIECES.WHITE_ROOK, PIECES.WHITE_KNIGHT, PIECES.WHITE_BISHOP, PIECES.WHITE_QUEEN, PIECES.WHITE_KING, PIECES.WHITE_BISHOP, PIECES.WHITE_KNIGHT, PIECES.WHITE_ROOK]
        ];
        
        gameState.board = initialSetup;
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.textContent = gameState.board[row][col];
                piece.dataset.row = row;
                piece.dataset.col = col;
                
                if (gameState.board[row][col] !== PIECES.EMPTY) {
                    piece.style.cursor = 'grab';
                    // Add color class
                    if ([
                        PIECES.WHITE_PAWN, PIECES.WHITE_ROOK, 
                        PIECES.WHITE_KNIGHT, PIECES.WHITE_BISHOP, 
                        PIECES.WHITE_QUEEN, PIECES.WHITE_KING
                    ].includes(gameState.board[row][col])) {
                        piece.classList.add('white');
                    } else {
                        piece.classList.add('black');
                    }
                }
                
                square.appendChild(piece);
                chessBoard.appendChild(square);
            }
        }
    }

    // Create demo board for tutorial
    function createDemoBoard() {
        demoBoard.innerHTML = '';
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const square = document.createElement('div');
                square.classList.add('demo-square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                demoBoard.appendChild(square);
            }
        }
    }

    // Set up tutorial progress indicators
    function setupTutorialProgress() {
        tutorialProgress.innerHTML = '';
        
        for (let i = 0; i < TUTORIAL_STEPS.length; i++) {
            const step = document.createElement('div');
            step.classList.add('progress-step');
            if (i === gameState.tutorialStep) {
                step.classList.add('active');
            }
            step.addEventListener('click', () => {
                gameState.tutorialStep = i;
                updateTutorialStep();
            });
            tutorialProgress.appendChild(step);
        }
    }

    // Update tutorial step
    function updateTutorialStep() {
        const step = TUTORIAL_STEPS[gameState.tutorialStep];
        
        pieceDemo.textContent = step.piece;
        explanation.innerHTML = `<strong>${step.title}</strong><br>${step.description}`;
        
        // Highlight active progress step
        const steps = tutorialProgress.querySelectorAll('.progress-step');
        steps.forEach((s, i) => {
            s.classList.toggle('active', i === gameState.tutorialStep);
        });
        
        // Update demo board
        updateDemoBoard();
    }

    // Update demo board with piece movement
    function updateDemoBoard() {
        const demoSquares = demoBoard.querySelectorAll('.demo-square');
        demoSquares.forEach(sq => sq.innerHTML = '');
        
        // Place the current piece in the center
        const centerIndex = 27; // Center of the board
        const centerPiece = document.createElement('div');
        centerPiece.textContent = TUTORIAL_STEPS[gameState.tutorialStep].piece;
        centerPiece.style.fontSize = '2rem';
        demoSquares[centerIndex].appendChild(centerPiece);
        
        // Add possible moves
        const possibleMoves = [
            10, 11, 12, 13, 14, // Top row
            18, 19, 20, 21, 22, // Middle top
            26, 27, 28, 29, 30, // Center row
            34, 35, 36, 37, 38, // Middle bottom
            42, 43, 44, 45, 46  // Bottom row
        ];
        
        possibleMoves.forEach(index => {
            if (index !== centerIndex) {
                const moveIndicator = document.createElement('div');
                moveIndicator.style.width = '20px';
                moveIndicator.style.height = '20px';
                moveIndicator.style.borderRadius = '50%';
                moveIndicator.style.backgroundColor = 'rgba(50, 205, 50, 0.7)';
                moveIndicator.style.position = 'absolute';
                moveIndicator.style.boxShadow = '0 0 8px rgba(50, 205, 50, 0.5)';
                demoSquares[index].appendChild(moveIndicator);
            }
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        chessBoard.addEventListener('click', handleBoardClick);
        nextTutorialBtn.addEventListener('click', nextTutorialStep);
        skipTutorialBtn.addEventListener('click', skipTutorial);
        soundBtn.addEventListener('click', toggleSound);
        pvpBtn.addEventListener('click', () => setGameMode('pvp'));
        pvcBtn.addEventListener('click', () => setGameMode('pvc'));
        restartBtn.addEventListener('click', restartGame);
        newGameBtn.addEventListener('click', newGame);
        
        // AI difficulty buttons
        const difficultyBtns = aiDifficulty.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                gameState.aiDifficulty = btn.dataset.level;
                showNotification(`AI difficulty set to ${btn.dataset.level}`);
            });
        });
    }

    // Handle board click
    function handleBoardClick(e) {
        if (!gameState.gameActive || gameState.checkmate) return;
        
        const square = e.target.closest('.square');
        if (!square) return;
        
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // If a piece is already selected
        if (gameState.selectedPiece) {
            // Check if the clicked square is a valid move
            const isValidMove = gameState.validMoves.some(move => 
                move.row === row && move.col === col
            );
            
            if (isValidMove) {
                movePiece(gameState.selectedPiece.row, gameState.selectedPiece.col, row, col);
                clearSelection();
                return;
            }
            
            // If clicking on another piece of the same color
            if (gameState.board[row][col] !== PIECES.EMPTY) {
                const pieceColor = getPieceColor(gameState.board[row][col]);
                if (pieceColor === gameState.currentPlayer) {
                    selectPiece(row, col);
                    return;
                }
            }
            
            // Otherwise, clear selection
            clearSelection();
        } else {
            // If clicking on a piece of the current player
            if (gameState.board[row][col] !== PIECES.EMPTY) {
                const pieceColor = getPieceColor(gameState.board[row][col]);
                if (pieceColor === gameState.currentPlayer) {
                    selectPiece(row, col);
                }
            }
        }
    }

    // Select a piece
    function selectPiece(row, col) {
        gameState.selectedPiece = { row, col };
        
        // Highlight selected square
        const squares = chessBoard.querySelectorAll('.square');
        squares.forEach(sq => {
            sq.classList.remove('selected');
            sq.classList.remove('valid-move');
            sq.classList.remove('valid-capture');
        });
        
        const selectedSquare = chessBoard.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
        selectedSquare.classList.add('selected');
        
        // Calculate valid moves
        gameState.validMoves = calculateValidMoves(row, col);
        
        // Highlight valid moves
        gameState.validMoves.forEach(move => {
            const moveSquare = chessBoard.querySelector(`.square[data-row="${move.row}"][data-col="${move.col}"]`);
            if (gameState.board[move.row][move.col] === PIECES.EMPTY) {
                moveSquare.classList.add('valid-move');
            } else {
                moveSquare.classList.add('valid-capture');
            }
        });
        
        playSound('select');
    }

    // Clear selection
    function clearSelection() {
        gameState.selectedPiece = null;
        gameState.validMoves = [];
        
        const squares = chessBoard.querySelectorAll('.square');
        squares.forEach(sq => {
            sq.classList.remove('selected');
            sq.classList.remove('valid-move');
            sq.classList.remove('valid-capture');
        });
    }

    // Move a piece
    function movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = gameState.board[fromRow][fromCol];
        
        // Check if the king is being captured
        if (gameState.board[toRow][toCol] === PIECES.WHITE_KING || 
            gameState.board[toRow][toCol] === PIECES.BLACK_KING) {
            // Kings cannot be captured in chess - this should never happen with proper rules
            playSound('capture');
            showNotification("Kings cannot be captured! Move prevented.");
            return;
        }
        
        // Capture logic
        if (gameState.board[toRow][toCol] !== PIECES.EMPTY) {
            const capturedPiece = gameState.board[toRow][toCol];
            const capturedColor = getPieceColor(capturedPiece);
            
            gameState.capturedPieces[capturedColor].push(capturedPiece);
            updateCapturedPiecesDisplay();
            
            // Add capture animation to the captured piece
            const capturedSquare = chessBoard.querySelector(`.square[data-row="${toRow}"][data-col="${toCol}"] .piece`);
            if (capturedSquare) {
                capturedSquare.classList.add('piece-capture');
                setTimeout(() => {
                    capturedSquare.classList.remove('piece-capture');
                }, 400);
            }
            
            playSound('capture');
        } else {
            playSound('move');
        }
        
        // Add move animation to the moving piece
        const movingPiece = chessBoard.querySelector(`.square[data-row="${fromRow}"][data-col="${fromCol}"] .piece`);
        if (movingPiece) {
            movingPiece.classList.add('piece-move');
            setTimeout(() => {
                movingPiece.classList.remove('piece-move');
            }, 400);
        }
        
        // Update board
        gameState.board[toRow][toCol] = piece;
        gameState.board[fromRow][fromCol] = PIECES.EMPTY;
        
        // Update UI
        updateBoardUI();
        
        // Check for check
        checkForCheck();
        
        // Check if the opponent is in checkmate
        const opponent = gameState.currentPlayer === 'white' ? 'black' : 'white';
        if (gameState.check[opponent] && isCheckmate(opponent)) {
            gameState.checkmate = true;
            gameStatus.textContent = `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} wins by checkmate!`;
            playSound('checkmate');
            return;
        }
        
        // Switch player
        gameState.currentPlayer = opponent;
        
        // Update status message
        if (gameState.check[gameState.currentPlayer]) {
            gameStatus.textContent = `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)} is in check!`;
            playSound('check');
        } else {
            gameStatus.textContent = `${gameState.currentPlayer.charAt(0).toUpperCase() + gameState.currentPlayer.slice(1)}'s turn`;
        }
        
        // If playing against computer
        if (gameState.gameMode === 'pvc' && gameState.currentPlayer === 'black' && !gameState.checkmate) {
            setTimeout(makeComputerMove, 800);
        }
    }

    // Check if king is in check
    function checkForCheck() {
        // Reset check status
        gameState.check.white = false;
        gameState.check.black = false;
        
        // Remove any existing check highlights
        const squares = chessBoard.querySelectorAll('.square');
        squares.forEach(sq => sq.classList.remove('king-in-check'));
        
        // Find kings and check if they are under attack
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = gameState.board[row][col];
                if (piece === PIECES.WHITE_KING || piece === PIECES.BLACK_KING) {
                    const color = getPieceColor(piece);
                    const isInCheck = isKingUnderAttack(row, col, color);
                    
                    if (isInCheck) {
                        gameState.check[color] = true;
                        
                        // Highlight king in check
                        const kingSquare = chessBoard.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
                        kingSquare.classList.add('king-in-check');
                    }
                }
            }
        }
    }
    
    // Check if a king is under attack
    function isKingUnderAttack(kingRow, kingCol, kingColor) {
        const opponentColor = kingColor === 'white' ? 'black' : 'white';
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = gameState.board[row][col];
                if (piece !== PIECES.EMPTY && getPieceColor(piece) === opponentColor) {
                    // Get possible moves for this piece
                    const moves = getRawMovesForPiece(row, col);
                    
                    // Check if any move targets the king
                    if (moves.some(move => move.row === kingRow && move.col === kingCol)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // Check for checkmate
    function isCheckmate(color) {
        // Check if the king has any valid moves
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = gameState.board[row][col];
                if (piece !== PIECES.EMPTY && getPieceColor(piece) === color) {
                    const moves = calculateValidMoves(row, col);
                    if (moves.length > 0) {
                        return false; // There is at least one valid move
                    }
                }
            }
        }
        
        return true; // No valid moves available
    }

    // Calculate valid moves for a piece (without king safety checks)
    function getRawMovesForPiece(row, col) {
        const piece = gameState.board[row][col];
        const moves = [];
        
        // Pawn moves (simplified)
        if (piece === PIECES.WHITE_PAWN) {
            // Forward move
            if (row > 0 && gameState.board[row-1][col] === PIECES.EMPTY) {
                moves.push({ row: row-1, col });
                
                // Initial double move
                if (row === 6 && gameState.board[row-2][col] === PIECES.EMPTY) {
                    moves.push({ row: row-2, col });
                }
            }
            
            // Captures
            if (row > 0 && col > 0 && gameState.board[row-1][col-1] !== PIECES.EMPTY && 
                getPieceColor(gameState.board[row-1][col-1]) === 'black') {
                moves.push({ row: row-1, col: col-1 });
            }
            
            if (row > 0 && col < 7 && gameState.board[row-1][col+1] !== PIECES.EMPTY && 
                getPieceColor(gameState.board[row-1][col+1]) === 'black') {
                moves.push({ row: row-1, col: col+1 });
            }
        }
        else if (piece === PIECES.BLACK_PAWN) {
            // Forward move
            if (row < 7 && gameState.board[row+1][col] === PIECES.EMPTY) {
                moves.push({ row: row+1, col });
                
                // Initial double move
                if (row === 1 && gameState.board[row+2][col] === PIECES.EMPTY) {
                    moves.push({ row: row+2, col });
                }
            }
            
            // Captures
            if (row < 7 && col > 0 && gameState.board[row+1][col-1] !== PIECES.EMPTY && 
                getPieceColor(gameState.board[row+1][col-1]) === 'white') {
                moves.push({ row: row+1, col: col-1 });
            }
            
            if (row < 7 && col < 7 && gameState.board[row+1][col+1] !== PIECES.EMPTY && 
                getPieceColor(gameState.board[row+1][col+1]) === 'white') {
                moves.push({ row: row+1, col: col+1 });
            }
        }
        // Rook moves (simplified)
        else if (piece === PIECES.WHITE_ROOK || piece === PIECES.BLACK_ROOK) {
            // Horizontal and vertical directions
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            
            for (const [dx, dy] of directions) {
                let newRow = row + dx;
                let newCol = col + dy;
                
                while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    if (gameState.board[newRow][newCol] === PIECES.EMPTY) {
                        moves.push({ row: newRow, col: newCol });
                    } else if (getPieceColor(gameState.board[newRow][newCol]) !== 
                              getPieceColor(piece)) {
                        moves.push({ row: newRow, col: newCol });
                        break;
                    } else {
                        break;
                    }
                    
                    newRow += dx;
                    newCol += dy;
                }
            }
        }
        // Bishop moves (simplified)
        else if (piece === PIECES.WHITE_BISHOP || piece === PIECES.BLACK_BISHOP) {
            // Diagonal directions
            const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            
            for (const [dx, dy] of directions) {
                let newRow = row + dx;
                let newCol = col + dy;
                
                while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    if (gameState.board[newRow][newCol] === PIECES.EMPTY) {
                        moves.push({ row: newRow, col: newCol });
                    } else if (getPieceColor(gameState.board[newRow][newCol]) !== 
                              getPieceColor(piece)) {
                        moves.push({ row: newRow, col: newCol });
                        break;
                    } else {
                        break;
                    }
                    
                    newRow += dx;
                    newCol += dy;
                }
            }
        }
        // Knight moves
        else if (piece === PIECES.WHITE_KNIGHT || piece === PIECES.BLACK_KNIGHT) {
            const knightMoves = [
                [2, 1], [2, -1], [-2, 1], [-2, -1],
                [1, 2], [1, -2], [-1, 2], [-1, -2]
            ];
            
            for (const [dx, dy] of knightMoves) {
                const newRow = row + dx;
                const newCol = col + dy;
                
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    if (gameState.board[newRow][newCol] === PIECES.EMPTY || 
                        getPieceColor(gameState.board[newRow][newCol]) !== getPieceColor(piece)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        // King moves (simplified)
        else if (piece === PIECES.WHITE_KING || piece === PIECES.BLACK_KING) {
            const kingMoves = [
                [1, 0], [-1, 0], [0, 1], [0, -1],
                [1, 1], [1, -1], [-1, 1], [-1, -1]
            ];
            
            for (const [dx, dy] of kingMoves) {
                const newRow = row + dx;
                const newCol = col + dy;
                
                if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    if (gameState.board[newRow][newCol] === PIECES.EMPTY || 
                        getPieceColor(gameState.board[newRow][newCol]) !== getPieceColor(piece)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
            }
        }
        // Queen moves (rook + bishop)
        else if (piece === PIECES.WHITE_QUEEN || piece === PIECES.BLACK_QUEEN) {
            // Rook-like moves
            const rookDirections = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const [dx, dy] of rookDirections) {
                let newRow = row + dx;
                let newCol = col + dy;
                
                while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    if (gameState.board[newRow][newCol] === PIECES.EMPTY) {
                        moves.push({ row: newRow, col: newCol });
                    } else if (getPieceColor(gameState.board[newRow][newCol]) !== 
                              getPieceColor(piece)) {
                        moves.push({ row: newRow, col: newCol });
                        break;
                    } else {
                        break;
                    }
                    
                    newRow += dx;
                    newCol += dy;
                }
            }
            
            // Bishop-like moves
            const bishopDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
            for (const [dx, dy] of bishopDirections) {
                let newRow = row + dx;
                let newCol = col + dy;
                
                while (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
                    if (gameState.board[newRow][newCol] === PIECES.EMPTY) {
                        moves.push({ row: newRow, col: newCol });
                    } else if (getPieceColor(gameState.board[newRow][newCol]) !== 
                              getPieceColor(piece)) {
                        moves.push({ row: newRow, col: newCol });
                        break;
                    } else {
                        break;
                    }
                    
                    newRow += dx;
                    newCol += dy;
                }
            }
        }
        
        return moves;
    }

    // Calculate valid moves with king safety checks
    function calculateValidMoves(row, col) {
        const piece = gameState.board[row][col];
        const color = getPieceColor(piece);
        const rawMoves = getRawMovesForPiece(row, col);
        const validMoves = [];
        
        for (const move of rawMoves) {
            // Skip moves that capture the king
            if (gameState.board[move.row][move.col] === PIECES.WHITE_KING || 
                gameState.board[move.row][move.col] === PIECES.BLACK_KING) {
                continue;
            }
            
            // Create a temporary board state
            const tempBoard = JSON.parse(JSON.stringify(gameState.board));
            const capturedPiece = tempBoard[move.row][move.col];
            
            // Make the move on the temporary board
            tempBoard[move.row][move.col] = tempBoard[row][col];
            tempBoard[row][col] = PIECES.EMPTY;
            
            // Find the king's position
            let kingRow = -1;
            let kingCol = -1;
            const king = color === 'white' ? PIECES.WHITE_KING : PIECES.BLACK_KING;
            
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (tempBoard[r][c] === king) {
                        kingRow = r;
                        kingCol = c;
                        break;
                    }
                }
                if (kingRow !== -1) break;
            }
            
            // Check if the king would be in check after this move
            let kingInCheck = false;
            const opponentColor = color === 'white' ? 'black' : 'white';
            
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    const opponentPiece = tempBoard[r][c];
                    if (opponentPiece !== PIECES.EMPTY && getPieceColor(opponentPiece) === opponentColor) {
                        // Get possible moves for this opponent piece
                        const opponentMoves = getRawMovesForPiece(r, c);
                        
                        // Check if any move targets the king
                        if (opponentMoves.some(m => m.row === kingRow && m.col === kingCol)) {
                            kingInCheck = true;
                            break;
                        }
                    }
                }
                if (kingInCheck) break;
            }
            
            // Only allow moves that don't leave the king in check
            if (!kingInCheck) {
                validMoves.push(move);
            }
        }
        
        return validMoves;
    }

    // Make a computer move
    function makeComputerMove() {
        if (!gameState.gameActive || gameState.checkmate) return;
        
        // Find all black pieces
        const pieces = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                if (gameState.board[row][col] !== PIECES.EMPTY && 
                    getPieceColor(gameState.board[row][col]) === 'black') {
                    pieces.push({ row, col });
                }
            }
        }
        
        // If in check, prioritize moves that get out of check
        if (gameState.check.black) {
            let escapeMoves = [];
            
            for (const piece of pieces) {
                const moves = calculateValidMoves(piece.row, piece.col);
                if (moves.length > 0) {
                    escapeMoves = escapeMoves.concat(moves.map(move => ({
                        from: piece,
                        to: move
                    })));
                }
            }
            
            if (escapeMoves.length > 0) {
                const randomMove = escapeMoves[Math.floor(Math.random() * escapeMoves.length)];
                movePiece(randomMove.from.row, randomMove.from.col, randomMove.to.row, randomMove.to.col);
                return;
            }
        }
        
        // If not in check or no escape moves, try to capture
        let captureMove = null;
        for (const piece of pieces) {
            const moves = calculateValidMoves(piece.row, piece.col);
            for (const move of moves) {
                if (gameState.board[move.row][move.col] !== PIECES.EMPTY) {
                    captureMove = { from: piece, to: move };
                    break;
                }
            }
            if (captureMove) break;
        }
        
        if (captureMove) {
            movePiece(captureMove.from.row, captureMove.from.col, captureMove.to.row, captureMove.to.col);
            return;
        }
        
        // If no capture, make a random move
        let validMoves = [];
        let attempts = 0;
        
        while (validMoves.length === 0 && attempts < 100) {
            const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
            validMoves = calculateValidMoves(randomPiece.row, randomPiece.col);
            
            if (validMoves.length > 0) {
                const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                movePiece(randomPiece.row, randomPiece.col, randomMove.row, randomMove.col);
                break;
            }
            
            attempts++;
        }
        
        // If still no moves, it's checkmate
        if (validMoves.length === 0) {
            gameState.checkmate = true;
            gameStatus.textContent = "White wins by checkmate!";
            playSound('checkmate');
        }
    }

    // Get piece color
    function getPieceColor(piece) {
        return [
            PIECES.WHITE_PAWN, 
            PIECES.WHITE_ROOK, 
            PIECES.WHITE_KNIGHT, 
            PIECES.WHITE_BISHOP, 
            PIECES.WHITE_QUEEN, 
            PIECES.WHITE_KING
        ].includes(piece) ? 'white' : 'black';
    }

    // Update board UI
    function updateBoardUI() {
        const squares = chessBoard.querySelectorAll('.square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const pieceElement = square.querySelector('.piece');
            
            // Clear the square
            if (pieceElement) {
                pieceElement.remove();
            }
            
            // Add new piece if exists
            if (gameState.board[row][col] !== PIECES.EMPTY) {
                const newPiece = document.createElement('div');
                newPiece.classList.add('piece');
                newPiece.textContent = gameState.board[row][col];
                newPiece.dataset.row = row;
                newPiece.dataset.col = col;
                
                if ([
                    PIECES.WHITE_PAWN, PIECES.WHITE_ROOK, 
                    PIECES.WHITE_KNIGHT, PIECES.WHITE_BISHOP, 
                    PIECES.WHITE_QUEEN, PIECES.WHITE_KING
                ].includes(gameState.board[row][col])) {
                    newPiece.classList.add('white');
                } else {
                    newPiece.classList.add('black');
                }
                
                square.appendChild(newPiece);
            }
        });
    }

    // Update captured pieces display
    function updateCapturedPiecesDisplay() {
        whiteCaptured.innerHTML = '';
        blackCaptured.innerHTML = '';
        
        gameState.capturedPieces.white.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('captured-piece');
            pieceElement.textContent = piece;
            pieceElement.classList.add('black'); // Captured pieces are black for white player
            whiteCaptured.appendChild(pieceElement);
        });
        
        gameState.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('div');
            pieceElement.classList.add('captured-piece');
            pieceElement.textContent = piece;
            pieceElement.classList.add('white'); // Captured pieces are white for black player
            blackCaptured.appendChild(pieceElement);
        });
    }

    // Play sound effect
    function playSound(type) {
        if (!gameState.soundEnabled) return;
        
        try {
            if (type === 'move') {
                moveSound.currentTime = 0;
                moveSound.play();
            } else if (type === 'capture') {
                captureSound.currentTime = 0;
                captureSound.play();
            } else if (type === 'select') {
                selectSound.currentTime = 0;
                selectSound.play();
            } else if (type === 'check') {
                checkSound.currentTime = 0;
                checkSound.play();
            } else if (type === 'checkmate') {
                checkmateSound.currentTime = 0;
                checkmateSound.play();
            }
        } catch (e) {
            console.log("Sound error:", e);
        }
    }

    // Toggle sound
    function toggleSound() {
        gameState.soundEnabled = !gameState.soundEnabled;
        soundBtn.innerHTML = gameState.soundEnabled ? 
            '<i class="fas fa-volume-up"></i> Sound: On' : 
            '<i class="fas fa-volume-mute"></i> Sound: Off';
            
        soundBtn.style.backgroundColor = gameState.soundEnabled ? 
            'rgba(255, 215, 0, 0.1)' : 'rgba(220, 20, 60, 0.1)';
            
        soundBtn.style.borderColor = gameState.soundEnabled ? 
            'rgba(255, 215, 0, 0.3)' : 'rgba(220, 20, 60, 0.3)';
    }

    // Set game mode
    function setGameMode(mode) {
        gameState.gameMode = mode;
        gameState.gameActive = true;
        gameState.tutorialActive = false;
        gameState.checkmate = false;
        
        // Hide tutorial and start game
        document.querySelector('.tutorial-container').style.display = 'none';
        
        // Update button styling
        pvpBtn.classList.toggle('active', mode === 'pvp');
        pvcBtn.classList.toggle('active', mode === 'pvc');
        
        // Update game status
        gameStatus.textContent = "White's turn";
        
        // Show notification
        showNotification(`Starting ${mode === 'pvp' ? 'Player vs Player' : 'Player vs Computer'} game`);
    }

    // Restart game
    function restartGame() {
        gameState.currentPlayer = 'white';
        gameState.selectedPiece = null;
        gameState.validMoves = [];
        gameState.capturedPieces = { white: [], black: [] };
        gameState.check = { white: false, black: false };
        gameState.checkmate = false;
        
        initGame();
        gameStatus.textContent = "White's turn";
        updateCapturedPiecesDisplay();
        
        // Show notification
        showNotification("Game restarted");
    }

    // New game
    function newGame() {
        gameState.tutorialActive = true;
        gameState.tutorialStep = 0;
        gameState.gameActive = false;
        gameState.checkmate = false;
        
        // Show tutorial
        document.querySelector('.tutorial-container').style.display = 'block';
        
        updateTutorialStep();
        setupTutorialProgress();
        
        // Show notification
        showNotification("Starting new game");
    }

    // Next tutorial step
    function nextTutorialStep() {
        gameState.tutorialStep++;
        
        if (gameState.tutorialStep >= TUTORIAL_STEPS.length) {
            skipTutorial();
            return;
        }
        
        updateTutorialStep();
        playSound('move');
    }

    // Skip tutorial
    function skipTutorial() {
        gameState.tutorialActive = false;
        document.querySelector('.tutorial-container').style.display = 'none';
        gameState.gameActive = true;
        gameStatus.textContent = "White's turn";
        playSound('select');
        
        // Show notification
        showNotification("Tutorial skipped. Starting game.");
    }

    // Show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Initialize the game
    initGame();
});
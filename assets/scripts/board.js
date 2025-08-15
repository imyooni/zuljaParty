import * as gameData from './game.js';
import * as System from '/../main.js';

import { 
  initialGameState, 
  currentPlayerIndex, 
  playerColors,
  updatePlayersDisplay 
} from './game.js';


const board = document.querySelector(".board");
const rows = 8;
const cols = 10;
const totalCells = rows * cols;


let tileEffects = ["noEffect","coins"]

function generateRandomTile() {
    let enabledEffects = new Array(tileEffects.length).fill(true);
    const typesWithProbabilities = [
        { type: "noEffect", probability: 0.45, enabled: enabledEffects[0] },
        { type: "coins", probability: 0.18, enabled: enabledEffects[1] },
    ];
    let effectsArray = [];    
    const randomValue = Math.random();
    
    for (let i = 0; i < typesWithProbabilities.length; i++) {
        if (typesWithProbabilities[i].enabled) {
            if (randomValue < typesWithProbabilities[i].probability) {
                effectsArray.push(typesWithProbabilities[i].type);
            }
        }
    }
    if (effectsArray.length === 0) {
      effectsArray.push("noEffect");
    }
    return effectsArray[Math.floor(Math.random() * effectsArray.length)];
}



let num = 1;
const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
for (let c = 0; c < cols; c++) grid[0][c] = num++;
for (let r = 1; r < rows - 1; r++) grid[r][cols - 1] = num++;
for (let c = cols - 1; c >= 0; c--) grid[rows - 1][c] = num++;
for (let r = rows - 2; r > 0; r--) grid[r][0] = num++;


for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-item');
    if (grid[r][c] !== null) {
      const randomTile = generateRandomTile();
      setTileData(cell, randomTile, grid[r][c]); 
      if (randomTile !== "noEffect") {
        cell.classList.add('special-tile');
      }
    } else {
      cell.style.visibility = 'hidden';
    }
    board.appendChild(cell);
  }
}

const cells = [];
for (let r = 0; r < rows; r++) {
  cells[r] = [];
  for (let c = 0; c < cols; c++) {
    cells[r][c] = board.children[r * cols + c];
  }
}

function setTileData(cell, type, index) {
  cell.className = 'grid-item';
  const tileStyles = {
    "noEffect": {
      background: '#B0C4DE',
      title: 'Safe Zone'
    },
    "coins": {
      background: '#FFE4B5',
      title: 'Coin Tile (+5 coins)'
    }
  };
  const style = tileStyles[type] || tileStyles["noEffect"];
  cell.style.background = style.background;
  cell.dataset.tileType = type;
  cell.dataset.tileIndex = index;
}


document.addEventListener('keydown', function(event) {
    if (!['7','8','9','0'].includes(event.key)) return;
    
    const allTiles = document.querySelectorAll('.grid-item:not([style*="visibility: hidden"])');
    if (allTiles.length === 0) return;
    
    const randomTile = allTiles[Math.floor(Math.random() * allTiles.length)];
    
    if (['7','8','9'].includes(event.key)) {
        // Reset animation
        randomTile.classList.remove('tile-fade');
        void randomTile.offsetWidth; // Trigger reflow
        
        // Apply animation
        randomTile.classList.add('tile-fade');
        
        // Change tile at animation midpoint
        setTimeout(() => {
            const tileIndex = randomTile.dataset.tileIndex;
            let newType;
            switch(event.key) {
                case "7": newType = "noEffect"; break;
                case "8": 
                    newType = tileEffects[Math.floor(Math.random() * 2)];
                    break;
                case "9": newType = "coins"; break;
            }
            setTileData(randomTile, newType, tileIndex);
        }, 300);
    }
    else if (event.key === "0") {
        randomTile.style.visibility = 
            randomTile.style.visibility === 'hidden' ? 'visible' : 'hidden';
    }
});

//#=========================#
//#       PLAYERS           #
//#=========================# 

export async function movePlayer(diceValue) {
  const player = gameData.initialGameState.players[gameData.currentPlayerIndex];
  const totalTiles = 32;
  let newPosition = (player.position + diceValue) % totalTiles;
  
  // Correct way to select by multiple classes
  const tokenSelector = `.board-token.token-pos-${gameData.currentPlayerIndex}`;
  const existingTokens = document.querySelectorAll(tokenSelector);
  
  // Remove all matching tokens
  existingTokens.forEach(token => token.remove());

  if (newPosition === 0) newPosition = totalTiles;
  const willLoop = (player.position + diceValue) > totalTiles;
  
  if (willLoop) {
    const stepsToEnd = totalTiles - player.position;
    const stepsFromStart = diceValue - stepsToEnd;
    await animateTokenMovement(gameData.currentPlayerIndex, stepsToEnd);
    const startCell = findCellByPosition(1);
    if (startCell) {
      const movingTokenId = `moving-token-${gameData.currentPlayerIndex}`;
      const prevToken = document.getElementById(movingTokenId);
      if (prevToken) prevToken.remove();
      const token = createTokenInCell(startCell, gameData.currentPlayerIndex);
      token.id = movingTokenId;
      token.style.transition = 'all 0.3s ease';
    }
    await animateTokenMovement(gameData.currentPlayerIndex, stepsFromStart, 0);
  } else {
    await animateTokenMovement(gameData.currentPlayerIndex, diceValue);
  }
  
  player.position = newPosition;
  renderAllTokens();
  statusMessage.textContent = `${player.name} moved to position ${player.position}`;
  tileName.textContent = `Tile ${player.position}`;
  tileDesc.textContent = `You landed on tile ${player.position}.`;
  gameData.updatePlayersDisplay();
  endBtn.disabled = false;
}

async function animateTokenMovement(movedPlayerIndex, steps, startPosOverride = null) {
  const player = gameData.initialGameState.players[movedPlayerIndex];
  const startPos = startPosOverride !== null ? startPosOverride : player.position;
  const tokenId = `token-pos-${movedPlayerIndex % 4}`;
  
  let currentPos = startPos;
  let currentCell = findCellByPosition(currentPos);
  if (!currentCell) return;
  
  let currentToken = createTokenInCell(currentCell, movedPlayerIndex);
  currentToken.id = tokenId;
  currentToken.style.transition = 'opacity 0.2s ease';
  
  for (let i = 1; i <= steps; i++) {
    const nextPos = startPos + i;
    const nextCell = findCellByPosition(nextPos);
    if (!nextCell) continue;
    
    // Fade out current token
    currentToken.style.opacity = '0';
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Remove and create new token
    currentToken.remove();
    currentToken = createTokenInCell(nextCell, movedPlayerIndex);
    currentToken.id = tokenId;
    currentToken.style.opacity = '0';
    currentToken.style.transition = 'opacity 0.2s ease';
    
    // Play sound
    System.audioManager.playSound('move');
 
    
    // Fade in new token
    currentToken.style.opacity = '1';
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}


function findCellByPosition(pos) {
  pos = Number(pos);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === pos) {
        return cells[r][c];
      }
    }
  }
  console.warn(`Position ${pos} not found in grid!`);
  return null;
}


function createTokenInCell(cell, playerIndex) {
  let container = cell.querySelector('.board-token-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'board-token-container';
    cell.appendChild(container);
  }
  const token = document.createElement('div');
  token.className = `board-token token-pos-${playerIndex % 4}`; 
  token.style.background = playerColors[playerIndex % playerColors.length];
  container.appendChild(token);
  return token;
}

function renderAllTokens(skipMovingPlayer = false) {
  if (!skipMovingPlayer) {
    document.querySelectorAll('.board-token:not([id^="moving-token"])').forEach(t => t.remove());
  } else {
    document.querySelectorAll('.board-token:not([id^="moving-token"])').forEach(t => t.remove());
  }
  gameData.initialGameState.players.forEach((player, i) => {
    if (!(skipMovingPlayer && i === gameData.currentPlayerIndex)) {
      const cell = findCellByPosition(player.position);
      if (cell) createTokenInCell(cell, i);
    }
  });
}

export function initTokens() {
  document.querySelectorAll('.board-token').forEach(token => token.remove());
  initialGameState.players.forEach((player, index) => {
    const cell = findCellByPosition(player.position);
    if (cell) {
      createTokenInCell(cell, index);
    }
  });
}
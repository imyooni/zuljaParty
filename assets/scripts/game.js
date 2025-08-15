import * as boardData from './board.js';
import * as System from './main.js';

const rollBtn = document.getElementById('rollBtn');
const endBtn = document.getElementById('endBtn');
const menuBtn = document.getElementById('menuBtn');
const tileName = document.getElementById('tileName');
const tileDesc = document.getElementById('tileDesc');
const statusMessage = document.getElementById('statusMessage');
const playersDiv = document.getElementById('players');
const turnInfo = document.getElementById('turnInfo');
//const diceAnimation = document.getElementById('diceAnimation');

export const initialGameState = {
  players: [],
  coins: [0, 0, 0, 0], 
  stars: [0, 0, 0, 0], 
};


export let currentPlayerIndex = 0;
export const playerColors = ['#EEE8AA', '#FA8072', '#98FB98', '#7FFFD4'];


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}



const settings = JSON.parse(localStorage.getItem('gameSettings')) || {};

// ---- Game Logic ----
export function startGame(numPlayers) {

  System.audioManager.playSound('battle_theme', true);
  let nickNameColor;
  const defaultNames = [
    'Zulja', 'Winter', 'Aori', 'Minapi', 'KBG', 'Fiktah', 'Yeptar', 'Ob1'
  ];
  
  // Shuffle default names
  shuffleArray(defaultNames);
  
  initialGameState.players = [];
  const usedNames = new Set();
  
  if (settings.nickname) {
    usedNames.add(settings.nickname);
  }

  for (let i = 1; i <= numPlayers; i++) {
    let playerName;
    
    if (i === 1) {
      playerName = settings.nickname || 'Player 1';
      nickNameColor = '#FFD700';
    } else {
      nickNameColor = '#ffffff';
      const usedNamesLower = Array.from(usedNames).map(name => name.toLowerCase());
      playerName = defaultNames.find(name => 
        !usedNamesLower.includes(name.toLowerCase())
      ) || `Player ${i}`;
      usedNames.add(playerName);
    }
    
    initialGameState.players.push({ 
      name: playerName, 
      color: nickNameColor,
      position: 1 // Start at position 1 (first tile) instead of 0
    });
  }

  shuffleArray(initialGameState.players);
  currentPlayerIndex = 0;
  playerSelection.style.display = 'none';
  gameView.style.display = 'block';
  
  // Render tokens at starting positions
  boardData.initTokens();
  
  updatePlayersDisplay();
  updateTurnInfo();
  rollBtn.disabled = false;
  endBtn.disabled = true;
  statusMessage.textContent = '🎲 Roll the dice to start!';
}

//#=========================#
//#         dice            #
//#=========================# 

rollBtn.addEventListener('click', () => {
  rollBtn.disabled = true;
  statusMessage.textContent = 'Rolling...';
  const diceValue = Math.floor(Math.random() * 6) + 1;
  playDiceAnimation(diceValue, () => {
    boardData.movePlayer(diceValue);
  });
});

function playDiceAnimation(finalValue, callback) {
  const dice = document.getElementById('diceAnimation');
  System.audioManager.playSound('dice');
  dice.style.display = 'block';
  dice.classList.add('dice-roll-effect'); // fade + shake
  let frame = 0;
  const totalFrames = 6;
  const frameWidth = 32;
  const interval = setInterval(() => {
    dice.style.backgroundPosition = `-${frame * frameWidth}px 0`;
    frame = (frame + 1) % totalFrames;
  }, 100);
  setTimeout(() => {
    clearInterval(interval);
    const finalFrame = finalValue - 1;
    dice.style.backgroundPosition = `-${finalFrame * frameWidth}px 0`;
    setTimeout(() => {
      dice.style.display = 'none';
      dice.classList.remove('dice-roll-effect');
      if (callback) callback();
    }, 500);
  }, 1000);
}


//#=========================#
//#         END TURN        #
//#=========================# 

endBtn.addEventListener('click', () => {
  currentPlayerIndex = (currentPlayerIndex + 1) % initialGameState.players.length;
  updateTurnInfo();
  updatePlayersDisplay();
  rollBtn.disabled = false;
  endBtn.disabled = true;
  statusMessage.textContent = '🎲 Roll the dice!';
  tileName.textContent = '-';
  tileDesc.textContent = '-';
});


export function updateTurnInfo() {
  turnInfo.innerHTML = `<strong>Turn:</strong> ${initialGameState.players[currentPlayerIndex].name}`;
}

export function updatePlayersDisplay() {
  playersDiv.innerHTML = '';
  initialGameState.players.forEach((p, i) => {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player-item');
    if (i === currentPlayerIndex) {
      playerDiv.classList.add('active');
    }
    // Token circle
    const token = document.createElement('div');
    token.classList.add('player-token');
    token.style.background = playerColors[i % playerColors.length];
    // Player info container
    const infoContainer = document.createElement('div');
    infoContainer.className = 'player-info-container';
    // Player name
    const nameElement = document.createElement('span');
    nameElement.className = 'player-name';
    nameElement.textContent = p.name;
    nameElement.style.color = p.color; 
    // Stats container
    const statsContainer = document.createElement('div');
    statsContainer.className = 'player-stats-container';
    // Star element
    const starElement = document.createElement('div');
    starElement.className = 'stat-container';
    const starSprite = document.createElement('div');
    starSprite.className = 'star-icon';
    const starValue = document.createElement('span');
    starValue.className = 'stat-value';
    starValue.textContent = initialGameState.stars[i];
    starElement.appendChild(starSprite);
    starElement.appendChild(starValue);
    // Coin element
    const coinElement = document.createElement('div');
    coinElement.className = 'stat-container';
    const coinSprite = document.createElement('div');
    coinSprite.className = 'coin-animation';
    const coinValue = document.createElement('span');
    coinValue.className = 'stat-value';
    coinValue.textContent = initialGameState.coins[i];
    coinElement.appendChild(coinSprite);
    coinElement.appendChild(coinValue);
    statsContainer.appendChild(starElement);
    statsContainer.appendChild(coinElement);
    infoContainer.appendChild(nameElement);
    infoContainer.appendChild(statsContainer);
    playerDiv.appendChild(token);
    playerDiv.appendChild(infoContainer);
    playersDiv.appendChild(playerDiv);
  });
}
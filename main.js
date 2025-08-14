const newGameBtn = document.getElementById('new-game');
const backBtn = document.getElementById('back');
const mainMenu = document.getElementById('main-menu');
const playerSelect = document.getElementById('player-select');
const board = document.getElementById('board');
const playersBar = document.getElementById('players');

newGameBtn.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    playerSelect.classList.remove('hidden');
});


backBtn.addEventListener('click', () => {
    playerSelect.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});


playerSelect.querySelectorAll('button:not(.back-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
        const numPlayers = parseInt(btn.dataset.players);
        playerSelect.classList.add('hidden');
        board.classList.remove('hidden');
        playersBar.classList.remove('hidden');
        createBoard(8, 10);
        playersBar.innerHTML = '';
        for (let i = 1; i <= numPlayers; i++) {
            const playerDiv = document.createElement('div');
            playerDiv.className = `player p${i}`;
            playerDiv.textContent = `P${i}`;
            playersBar.appendChild(playerDiv);
        }
    });
});



function createBoard(rows, cols) {
    const board = document.getElementById('board');
    board.style.gridTemplateColumns = `repeat(${cols}, 32px)`;
    board.style.gridTemplateRows = `repeat(${rows}, 32px)`;
    board.innerHTML = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            if (!(r === 0 || r === rows - 1 || c === 0 || c === cols - 1)) {
                tile.classList.add('empty');
            }
            board.appendChild(tile);
        }
    }
}
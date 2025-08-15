// Cached DOM elements
import * as boardData from './assets/scripts/board.js';
import * as gameData from './assets/scripts/game.js';
import * as Audio from './assets/scripts/audio.js';

const mainMenu = document.getElementById('mainMenu');
const gameView = document.getElementById('gameView');
const playerSelection = document.getElementById('playerSelection');
const newGameMenuBtn = document.getElementById('newGameMenuBtn');
const continueBtn = document.getElementById('continueBtn'); // not configured yet
const optionsBtn = document.getElementById('optionsBtn');
const backToMainBtn = document.getElementById('backToMainBtn');
///
const optionsView = document.getElementById('optionsView');
const nicknameInput = document.getElementById('nicknameInput');
const soundToggle = document.getElementById('soundToggle');
const musicToggle = document.getElementById('musicToggle');
const backFromOptionsBtn = document.getElementById('backFromOptionsBtn');

const style = document.createElement('style');
style.textContent = `
  * {
    user-select: none !important;
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
  }
`;

export const audioManager = new Audio.AudioManager();
await audioManager.loadAudio();

document.head.appendChild(style);

newGameMenuBtn.addEventListener('click', () => {
  mainMenu.style.display = 'none';
  playerSelection.style.display = 'block';
});

backToMainBtn.addEventListener('click', () => {
  playerSelection.style.display = 'none';
  mainMenu.style.display = 'block';
});

menuBtn.addEventListener('click', () => {
  gameView.style.display = 'none';
  mainMenu.style.display = 'block';
});

playerSelection.querySelectorAll('button[data-players]').forEach(btn => {
  btn.addEventListener('click', () => {
    const numPlayers = parseInt(btn.dataset.players);
    gameData.startGame(numPlayers);
  });
});

optionsBtn.addEventListener('click', () => {
  mainMenu.style.display = 'none';
  optionsView.style.display = 'block';
  const settings = JSON.parse(localStorage.getItem('gameSettings')) || {};

  initVolumeControls()
  nicknameInput.value = settings.nickname || '';
});

backFromOptionsBtn.addEventListener('click', () => {
  const settings = {
    nickname: nicknameInput.value.substring(0, 10),
  };
  localStorage.setItem('gameSettings', JSON.stringify(settings));
  optionsView.style.display = 'none';
  mainMenu.style.display = 'block';
});


const sfxVolumeSlider = document.getElementById('sfxVolumeSlider');
const musicVolumeSlider = document.getElementById('musicVolumeSlider');
const sfxVolumeValue = document.getElementById('sfxVolumeValue');
const musicVolumeValue = document.getElementById('musicVolumeValue');

function initVolumeControls() {
    const savedSfxVolume = audioManager.loadGameValue('sfxVolume') ?? 0.5;
    const savedMusicVolume = audioManager.loadGameValue('bgmVolume') ?? 0.5;
    sfxVolumeSlider.value = savedSfxVolume;
    musicVolumeSlider.value = savedMusicVolume;
    updateVolumeDisplay();
    audioManager.setSFXVolume(savedSfxVolume);
    audioManager.setBGMVolume(savedMusicVolume);
}

function updateVolumeDisplay() {
    sfxVolumeValue.textContent = `${Math.round(sfxVolumeSlider.value * 100)}%`;
    musicVolumeValue.textContent = `${Math.round(musicVolumeSlider.value * 100)}%`;
}

sfxVolumeSlider.addEventListener('input', () => {
    updateVolumeDisplay();
    audioManager.setSFXVolume(parseFloat(sfxVolumeSlider.value));
    localStorage.setItem('sfxVolume', sfxVolumeSlider.value);
});

musicVolumeSlider.addEventListener('input', () => {
    updateVolumeDisplay();
    audioManager.setBGMVolume(parseFloat(musicVolumeSlider.value));
    localStorage.setItem('bgmVolume', musicVolumeSlider.value);
});

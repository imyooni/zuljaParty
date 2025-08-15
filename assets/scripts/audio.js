export class AudioManager {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.audioBuffers = new Map();
    this.currentBGM = {
      source: null,
      gainNode: null,
      key: null
    };
    this.bgmVolume = 0.5;
    this.sfxVolume = 1;
    this.loadVolumeSettings();
  }

  loadVolumeSettings() {
    this.bgmVolume = this.loadGameValue('bgmVolume') ?? 0.5;
    this.sfxVolume = this.loadGameValue('sfxVolume') ?? 1;
  }

  loadGameValue(key) {
    try {
      return localStorage.getItem(key) ? parseFloat(localStorage.getItem(key)) : null;
    } catch (e) {
      return null;
    }
  }

  async loadAudio() {
    const audioFiles = {
      // BGM
      'battle_theme': './assets/audio/bgm/battle_theme.ogg',

      // SFX
      'dice': './assets/audio/sfx/system_dice.ogg',
      'move': './assets/audio/Sfx/system_player_move.ogg',
    };

    const sfxVolumes = {
      dice: 1,
      move: 1,
    };

    const bgmVolumes = {
      battle_theme: 0.45,
    };

    this.sfxVolumes = sfxVolumes;
    this.bgmVolumes = bgmVolumes;

    const promises = Object.entries(audioFiles).map(async ([key, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(key, audioBuffer);
      } catch (error) {
        console.error(`Error loading audio file ${key}:`, error);
      }
    });

    await Promise.all(promises);
  }

  isAudioPlayable() {
    return !document.hidden && this.audioContext.state === 'running';
  }

  playSound(key, isMusic = false) {
    if (!this.isAudioPlayable() || !this.audioBuffers.has(key)) {
      return null;
    }

    const baseVolume = isMusic 
      ? (this.bgmVolumes[key] ?? 1) 
      : (this.sfxVolumes[key] ?? 1);
    
    const settingVolume = isMusic ? this.bgmVolume : this.sfxVolume;
    const finalVolume = Math.min(Math.max(baseVolume * settingVolume, 0), 1);

    // Create audio graph
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.audioBuffers.get(key);
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Set initial volume
    gainNode.gain.value = finalVolume;

    if (isMusic) {
      // Stop current BGM if playing
      if (this.currentBGM.source) {
        this.currentBGM.source.stop();
      }
      
      // Store references for later control
      source.loop = true;
      this.currentBGM = {
        source,
        gainNode,
        key
      };
    }
    
    source.start();
    return { source, gainNode };
  }

  stopAll() {
    if (this.currentBGM.source) {
      this.currentBGM.source.stop();
      this.currentBGM = {
        source: null,
        gainNode: null,
        key: null
      };
    }
  }

  setBGMVolume(volume) {
    this.bgmVolume = Math.min(Math.max(volume, 0), 1);
    
    // Update current BGM volume if playing
    if (this.currentBGM.gainNode) {
      const baseVolume = this.bgmVolumes[this.currentBGM.key] ?? 1;
      const finalVolume = Math.min(Math.max(baseVolume * this.bgmVolume, 0), 1);
      
      // Smooth volume transition
      this.currentBGM.gainNode.gain.setTargetAtTime(
        finalVolume, 
        this.audioContext.currentTime, 
        0.1 // 100ms fade time
      );
    }
  }

  setSFXVolume(volume) {
    this.sfxVolume = Math.min(Math.max(volume, 0), 1);
  }

  // Additional helper methods
  pauseBGM() {
    if (this.currentBGM.source) {
      this.currentBGM.source.stop();
      this.currentBGM.source = null;
    }
  }

  resumeBGM() {
    if (this.currentBGM.key && !this.currentBGM.source) {
      this.playSound(this.currentBGM.key, true);
    }
  }

  fadeOutBGM(duration = 1) {
    if (this.currentBGM.gainNode) {
      this.currentBGM.gainNode.gain.setTargetAtTime(
        0, 
        this.audioContext.currentTime, 
        duration
      );
      
      // Stop the source after fade completes
      this.currentBGM.source.stop(this.audioContext.currentTime + duration + 0.1);
      this.currentBGM.source = null;
    }
  }

  fadeInBGM(key, duration = 1) {
    if (this.currentBGM.source) {
      this.fadeOutBGM(duration);
    }
    
    const bgm = this.playSound(key, true);
    if (bgm) {
      bgm.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      bgm.gainNode.gain.setTargetAtTime(
        this.bgmVolume * (this.bgmVolumes[key] ?? 1),
        this.audioContext.currentTime,
        duration
      );
    }
  }

}

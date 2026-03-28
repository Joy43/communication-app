
import { Vibration } from 'react-native';

type AudioSound = {
  loadAsync: (source: any) => Promise<void>;
  setIsLoopingAsync: (looping: boolean) => Promise<void>;
  playAsync: () => Promise<void>;
  stopAsync: () => Promise<void>;
  unloadAsync: () => Promise<void>;
  pauseAsync: () => Promise<void>;
  setVolumeAsync: (volume: number) => Promise<void>;
};

// Lazy-load expo-av to avoid crashing in Expo Go at module parse time
let AudioClass: { Sound: new () => AudioSound } | null = null;

function getAudio() {
  if (AudioClass) return AudioClass;
  try {
    const expoAv = require('expo-av');
    AudioClass = expoAv.Audio;
    return AudioClass;
  } catch {
    return null;
  }
}

class RingtoneManager {
  private soundObject: AudioSound | null = null;
  private isPlaying = false;

  async playRingtone() {
    try {
      if (this.isPlaying) {
        console.log('🔊 Ringtone already playing');
        return;
      }

      const Audio = getAudio();
      if (!Audio) {
        console.warn('⚠️ expo-av not available, falling back to vibration');
        this.vibrate();
        return;
      }

      this.soundObject = new Audio.Sound();
      await this.soundObject.loadAsync(
        require('../../assets/images/rington.mp3'),
      );
      await this.soundObject.setIsLoopingAsync(true);
      await this.soundObject.playAsync();
      this.isPlaying = true;
      console.log('🔊 Ringtone started');
    } catch (error) {
      console.error('❌ Error playing ringtone:', error);
      this.vibrate();
    }
  }

  async stopRingtone() {
    try {
      // Stop vibration regardless
      Vibration.cancel();

      if (this.soundObject && this.isPlaying) {
        await this.soundObject.stopAsync();
        await this.soundObject.unloadAsync();
        this.soundObject = null;
        this.isPlaying = false;
        console.log('🔊 Ringtone stopped');
      }
    } catch (error) {
      console.error('❌ Error stopping ringtone:', error);
    }
  }

  async pauseRingtone() {
    try {
      if (this.soundObject && this.isPlaying) {
        await this.soundObject.pauseAsync();
        this.isPlaying = false;
        console.log('🔊 Ringtone paused');
      }
    } catch (error) {
      console.error('❌ Error pausing ringtone:', error);
    }
  }

  async resumeRingtone() {
    try {
      if (this.soundObject && !this.isPlaying) {
        await this.soundObject.playAsync();
        this.isPlaying = true;
        console.log('🔊 Ringtone resumed');
      }
    } catch (error) {
      console.error('❌ Error resuming ringtone:', error);
    }
  }

  async setVolume(volume: number) {
    try {
      if (this.soundObject) {
        await this.soundObject.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      }
    } catch (error) {
      console.error('❌ Error setting volume:', error);
    }
  }

  private vibrate() {
    Vibration.vibrate([0, 500, 200, 500], true);
  }

  destroy() {
    this.stopRingtone();
  }
}

export const ringtoneManager = new RingtoneManager();
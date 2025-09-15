import { SoundLoader } from "../loaders";
import { Music } from "./music";
import { Sound } from "./sound";

export enum SoundType {
  Explosion,
  Die,
  Powerup,
  Collision
}

const soundFiles = [
  'explosion.wav',
  'die.wav',
  'powerup.wav',
  'collision.wav'
];

const musicFiles = [
  'music-01.wav',
];

export class SoundManager {
  private _volume = 1.0;

  private constructor(
    private readonly _gainNode: GainNode,
    private readonly _sounds = new Map<SoundType, Sound>(),
    private readonly _music = new Map<number, Music>()
  ) {

  }

  public get volume(): number {
    return this._volume;
  }

  public set volume(value: number) {
    this._volume = Math.max(0, Math.min(1, value));
    this._gainNode.gain.value = this._volume;
  }

  public fadeToVolumne(volume: number, time: number): void {
    const now = this._gainNode.context.currentTime;
    volume = Math.max(0, Math.min(1, volume));
    this._gainNode.gain.setValueAtTime(this._gainNode.gain.value, now);
    this._gainNode.gain.linearRampToValueAtTime(volume, now + 0.001 * time);
    setTimeout(() => this.volume = volume, time);
  }

  public get isSuspended(): boolean {
    return this._gainNode.context.state === 'suspended';
  }

  public async init(): Promise<void> {
    if (this._gainNode.context.state === 'suspended') {
      await (this._gainNode.context as AudioContext).resume();
    }

    this.fadeToVolumne(0.5, 5000.0);
  }

  public getSound(type: SoundType): Sound | undefined {
    return this._sounds.get(type);
  }

  public getMusic(level: number): Music | undefined {
    return this._music.get(level);
  }

  public static async create(audioContext: AudioContext, soundLoader: SoundLoader): Promise<SoundManager> {
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0.0; // start silent

    const loadSound = async (file: string): Promise<Sound> => {
      const path = `/assets/${file}`;

      return new Sound(audioContext, gainNode, await soundLoader(path));
    }

    const sounds = new Map<SoundType, Sound>(await Promise.all(
      soundFiles.map(async (file, index) => {
        const sound = await loadSound(file);
        return [index as SoundType, sound] as [SoundType, Sound];
      })
    ));

    const loadMusic = async (file: string): Promise<Music> => {
      const path = `/assets/${file}`;

      return new Music(audioContext, gainNode, await soundLoader(path));
    }

    const music = new Map<number, Music>(await Promise.all(
      musicFiles.map(async (file, index) => {
        const music = await loadMusic(file);
        return [index, music] as [number, Music];
      })
    ));

    return new SoundManager(gainNode, sounds, music);
  }
}

import { SoundLoader } from "../loaders";
import { Music } from "./music";
import { Sound } from "./sound";

export enum SoundType {
  Explosion,
  Die
}

const soundFiles = [
  'explosion.wav',
  'die.wav'
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

  public getSound(type: SoundType): Sound | undefined {
    return this._sounds.get(type);
  }

  public getMusic(level: number): Music | undefined {
    return this._music.get(level);
  }

  public static async create(audioContext: AudioContext, soundLoader: SoundLoader): Promise<SoundManager> {
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 1.0; // 100% volume

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

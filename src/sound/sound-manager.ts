import { SoundLoader } from "../loaders";
import { Sound } from "./sound";

export enum SoundType {
  Explosion,
  Die
}

const soundFiles = [
  'explosion.wav',
  'die.wav'
]

export class SoundManager {
  private constructor(private readonly _sounds = new Map<SoundType, Sound>()) {

  }

  public getSound(type: SoundType): Sound | undefined {
    return this._sounds.get(type);
  }

  public static async create(audioContext: AudioContext, soundLoader: SoundLoader): Promise<SoundManager> {
    const loadSound = async (file: string): Promise<Sound> => {
      const path = `/assets/${file}`;

      return new Sound(audioContext, await soundLoader(path));
    }

    const sounds = new Map<SoundType, Sound>(await Promise.all(
      soundFiles.map(async (file, index) => {
        const sound = await loadSound(file);
        return [index as SoundType, sound] as [SoundType, Sound];
      })
    ));

    return new SoundManager(sounds);
  }
}

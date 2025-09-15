export class Music {
    private static currentMusic: AudioBufferSourceNode | undefined = undefined;

    constructor(
        private readonly _audioContext: AudioContext,
        private readonly _gainNode: GainNode,
        private readonly _audioBuffer: AudioBuffer
    ) {
    }

    public play(): void {
        const source = this._audioContext.createBufferSource();
        source.buffer = this._audioBuffer;

        source.loop = true;
        source.loopStart = 0;
        source.loopEnd = this._audioBuffer.duration;

        source.connect(this._gainNode);
        source.start();

        Music.currentMusic = source;
    }

    public stop(): void {
        if (Music.currentMusic) {
            Music.currentMusic.stop();
            Music.currentMusic.disconnect();
            Music.currentMusic = undefined;
        }
    }
}

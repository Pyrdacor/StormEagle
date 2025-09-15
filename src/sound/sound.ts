export class Sound {
    constructor(
        private readonly _audioContext: AudioContext,
        private readonly _gainNode: GainNode,
        private readonly _audioBuffer: AudioBuffer
    ) {
    }

    public play(): void {
        const source = this._audioContext.createBufferSource();
        source.buffer = this._audioBuffer;
        source.connect(this._gainNode);
        source.start();
    }
}

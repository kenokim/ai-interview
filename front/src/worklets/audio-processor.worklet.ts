// This class is instantiated by the browser's AudioWorkletGlobalScope.
// It cannot import other modules and must be self-contained.
// The `registerProcessor` function is globally available in this scope.

class AudioProcessor extends AudioWorkletProcessor {
  /**
   * Converts a Float32Array buffer to a 16-bit PCM Int16Array.
   * @param buffer The Float32Array audio data.
   * @returns The Int16Array PCM data.
   */
  private float32ToPCM16(buffer: Float32Array): Int16Array {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
      // Clamp the value between -1 and 1, then scale to 16-bit integer range.
      buf[l] = Math.max(-1, Math.min(1, buffer[l])) * 0x7FFF;
    }
    return buf;
  }

  // The process method is called whenever a new block of audio data is available.
  process(
    inputs: Float32Array[][],
  ): boolean {
    // We expect one input, with one channel.
    const input = inputs[0];
    const channel = input[0];

    if (channel) {
      // Convert the audio data to 16-bit PCM.
      const pcmData = this.float32ToPCM16(channel);
      // Post the converted data back to the main thread.
      // The second argument is a list of transferable objects.
      // Transfering the buffer is more efficient than copying.
      this.port.postMessage(pcmData, [pcmData.buffer]);
    }
    
    // Return true to keep the processor alive.
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);

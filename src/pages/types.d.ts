import type katex from 'katex';
import type Delta from 'quill-delta';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

declare global {
  interface Window {
    Delta: typeof Delta;
    katex: typeof katex;
    ffmpeg: FFmpeg;
    loadingFFmpeg: boolean;
  }
}

export {};

import type katex from 'katex';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

declare global {
  interface Window {
    katex: typeof katex;
    ffmpeg: FFmpeg;
    loadingFFmpeg: boolean;
  }
}

export {};

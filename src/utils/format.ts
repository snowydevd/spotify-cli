// src/utils/format.ts

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatProgress(progress: number, duration: number, width = 30): string {
  const percent = Math.min(progress / duration, 1);
  const filled = Math.floor(percent * width);
  const empty = width - filled;
  
  const filledBar = '━'.repeat(filled);
  const emptyBar = '─'.repeat(empty);
  const head = filled < width ? '●' : '';
  
  return `${filledBar}${head}${emptyBar}`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function padCenter(str: string, width: number): string {
  const padding = Math.max(0, width - str.length);
  const leftPad = Math.floor(padding / 2);
  const rightPad = padding - leftPad;
  return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
}

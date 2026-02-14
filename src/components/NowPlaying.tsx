// src/components/NowPlaying.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { spotifyService } from '../services/spotify-service.js';
import { formatDuration, formatProgress, truncate } from '../utils/format.js';
import type { PlaybackState } from '../types/index.js';

interface NowPlayingProps {
  onBack: () => void;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({ onBack }) => {
  const [state, setState] = useState<PlaybackState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchState = async () => {
    try {
      const playback = await spotifyService.getPlaybackState();
      setState(playback);
      setError(null);
    } catch (err) {
      setError('Failed to fetch playback state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, []);

  useInput(async (input, key) => {
    if (key.escape || input === 'q') {
      onBack();
      return;
    }

    try {
      switch (input) {
        case ' ':
          await spotifyService.togglePlayPause();
          break;
        case 'n':
          await spotifyService.next();
          break;
        case 'p':
          await spotifyService.previous();
          break;
        case '+':
        case '=':
          if (state?.volume !== undefined) {
            await spotifyService.setVolume(Math.min(100, state.volume + 10));
          }
          break;
        case '-':
          if (state?.volume !== undefined) {
            await spotifyService.setVolume(Math.max(0, state.volume - 10));
          }
          break;
        case 's':
          if (state) {
            await spotifyService.setShuffle(!state.shuffle);
          }
          break;
        case 'r':
          if (state) {
            const modes: ('off' | 'track' | 'context')[] = ['off', 'context', 'track'];
            const currentIndex = modes.indexOf(state.repeat);
            const nextMode = modes[(currentIndex + 1) % 3];
            await spotifyService.setRepeat(nextMode);
          }
          break;
      }
      await fetchState();
    } catch (err) {
      setError('Command failed');
    }
  });

  if (loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text>
          <Spinner type="dots" /> Loading playback state...
        </Text>
      </Box>
    );
  }

  if (!state || !state.track) {
    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text color="yellow">⚠ </Text>
          <Text>No active playback</Text>
        </Box>
        <Text color="gray">Start playing something on Spotify to control it here.</Text>
        <Box marginTop={1}>
          <Text color="gray" dimColor>Press </Text>
          <Text color="cyan">ESC</Text>
          <Text color="gray" dimColor> to go back</Text>
        </Box>
      </Box>
    );
  }

  const { track, isPlaying, shuffle, repeat, volume, device } = state;
  const progress = track.progress || 0;

  return (
    <Box flexDirection="column" padding={1}>
      {/* Track Info */}
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="green" bold>{isPlaying ? '▶' : '⏸'} </Text>
          <Text bold color="white">{truncate(track.name, 45)}</Text>
        </Box>
        <Box marginLeft={2}>
          <Text color="gray">by </Text>
          <Text color="cyan">{truncate(track.artists.join(', '), 40)}</Text>
        </Box>
        <Box marginLeft={2}>
          <Text color="gray">on </Text>
          <Text color="magenta">{truncate(track.album, 40)}</Text>
        </Box>
      </Box>

      {/* Progress Bar */}
      <Box marginBottom={1}>
        <Text color="gray">{formatDuration(progress)} </Text>
        <Text color="green">{formatProgress(progress, track.duration, 35)}</Text>
        <Text color="gray"> {formatDuration(track.duration)}</Text>
      </Box>

      {/* Playback Status */}
      <Box marginBottom={1} gap={2}>
        <Box>
          <Text color={shuffle ? 'green' : 'gray'}>⤮ Shuffle {shuffle ? 'ON' : 'OFF'}</Text>
        </Box>
        <Box>
          <Text color={repeat !== 'off' ? 'green' : 'gray'}>
            ↻ Repeat {repeat === 'track' ? '🔂' : repeat === 'context' ? '🔁' : 'OFF'}
          </Text>
        </Box>
        <Box>
          <Text color="gray">🔊 {volume}%</Text>
        </Box>
      </Box>

      {/* Device */}
      {device && (
        <Box marginBottom={1}>
          <Text color="gray">Playing on: </Text>
          <Text color="yellow">{device.name}</Text>
          <Text color="gray"> ({device.type})</Text>
        </Box>
      )}

      {/* Controls Help */}
      <Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1} marginTop={1}>
        <Text color="gray" bold>Controls:</Text>
        <Box gap={2} flexWrap="wrap">
          <Text><Text color="cyan">SPACE</Text> Play/Pause</Text>
          <Text><Text color="cyan">N</Text> Next</Text>
          <Text><Text color="cyan">P</Text> Previous</Text>
          <Text><Text color="cyan">+/-</Text> Volume</Text>
          <Text><Text color="cyan">S</Text> Shuffle</Text>
          <Text><Text color="cyan">R</Text> Repeat</Text>
          <Text><Text color="cyan">ESC</Text> Back</Text>
        </Box>
      </Box>

      {error && (
        <Box marginTop={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}
    </Box>
  );
};

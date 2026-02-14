// src/components/Playlists.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { spotifyService } from '../services/spotify-service.js';
import { truncate, formatDuration } from '../utils/format.js';
import type { Playlist, Track } from '../types/index.js';

interface PlaylistsProps {
  onBack: () => void;
}

type ViewMode = 'list' | 'tracks' | 'loading';

export const Playlists: React.FC<PlaylistsProps> = ({ onBack }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [mode, setMode] = useState<ViewMode>('loading');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setMode('loading');
      const data = await spotifyService.getMyPlaylists();
      setPlaylists(data);
      setMode('list');
    } catch (err) {
      console.error('Playlist error:', err);
      setError('Failed to load playlists');
      setMode('list');
    }
  };

  const loadTracks = async (playlist: Playlist) => {
    try {
      setMode('loading');
      setSelectedPlaylist(playlist);
      const data = await spotifyService.getPlaylistTracks(playlist.id);
      setTracks(data);
      setMode('tracks');
    } catch (err) {
      setError('Failed to load tracks');
      setMode('list');
    }
  };

  const handleSelectPlaylist = (item: { value: string }) => {
    const playlist = playlists.find(p => p.id === item.value);
    if (playlist) {
      loadTracks(playlist);
    }
  };

  const handlePlayPlaylist = async () => {
    if (!selectedPlaylist) return;
    try {
      await spotifyService.playContext(selectedPlaylist.uri);
      setMessage('✓ Playing playlist!');
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError('Failed to play playlist');
    }
  };

  const handleSelectTrack = async (item: { value: string }) => {
    if (!selectedPlaylist) return;
    const trackIndex = tracks.findIndex(t => t.uri === item.value);
    try {
      await spotifyService.playContext(selectedPlaylist.uri, trackIndex);
      setMessage('✓ Now playing!');
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError('Failed to play track');
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      if (mode === 'tracks') {
        setMode('list');
        setSelectedPlaylist(null);
        setTracks([]);
      } else {
        onBack();
      }
    }
    if (input === 'p' && mode === 'tracks' && selectedPlaylist) {
      handlePlayPlaylist();
    }
  });

  if (mode === 'loading') {
    return (
      <Box padding={1}>
        <Text>
          <Spinner type="dots" /> Loading...
        </Text>
      </Box>
    );
  }

  if (mode === 'list') {
    const items = playlists.map(p => ({
      label: `${truncate(p.name, 35)} • ${p.trackCount} tracks`,
      value: p.id,
    }));

    return (
      <Box flexDirection="column" padding={1}>
        <Box marginBottom={1}>
          <Text color="green" bold>📋 Your Playlists</Text>
          <Text color="gray"> ({playlists.length})</Text>
        </Box>

        {playlists.length > 0 ? (
          <>
            <SelectInput items={items} onSelect={handleSelectPlaylist} limit={15} />
            <Box marginTop={1}>
              <Text color="gray" dimColor>Press </Text>
              <Text color="cyan">ENTER</Text>
              <Text color="gray" dimColor> to view tracks, </Text>
              <Text color="cyan">ESC</Text>
              <Text color="gray" dimColor> to go back</Text>
            </Box>
          </>
        ) : (
          <Text color="yellow">No playlists found.</Text>
        )}

        {error && (
          <Box marginTop={1}>
            <Text color="red">✗ {error}</Text>
          </Box>
        )}
      </Box>
    );
  }

  // Tracks view
  const trackItems = tracks.map(t => ({
    label: `${truncate(t.name, 28)} • ${truncate(t.artists.join(', '), 18)} • ${formatDuration(t.duration)}`,
    value: t.uri,
  }));

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="green" bold>🎵 {selectedPlaylist?.name}</Text>
        <Text color="gray"> ({tracks.length} tracks)</Text>
      </Box>

      {tracks.length > 0 ? (
        <>
          <SelectInput items={trackItems} onSelect={handleSelectTrack} limit={12} />
          <Box marginTop={1}>
            <Text color="gray" dimColor>Press </Text>
            <Text color="cyan">ENTER</Text>
            <Text color="gray" dimColor> to play track, </Text>
            <Text color="cyan">P</Text>
            <Text color="gray" dimColor> to shuffle playlist, </Text>
            <Text color="cyan">ESC</Text>
            <Text color="gray" dimColor> to go back</Text>
          </Box>
        </>
      ) : (
        <Text color="yellow">No tracks in this playlist.</Text>
      )}

      {message && (
        <Box marginTop={1}>
          <Text color="green">{message}</Text>
        </Box>
      )}

      {error && (
        <Box marginTop={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}
    </Box>
  );
};

// src/components/Home.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { spotifyService } from '../services/spotify-service.js';
import { truncate, formatDuration } from '../utils/format.js';
import type { Track, View } from '../types/index.js';

interface HomeProps {
  onNavigate: (view: View) => void;
  onExit: () => void;
}

interface MenuItem {
  label: string;
  value: View | 'exit';
}

export const Home: React.FC<HomeProps> = ({ onNavigate, onExit }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [track, user] = await Promise.all([
          spotifyService.getCurrentlyPlaying(),
          spotifyService.getMe(),
        ]);
        setCurrentTrack(track);
        setUserName(user.name);
      } catch (err) {
        // Silently fail
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const items: MenuItem[] = [
    { label: '▶  Now Playing       Control current playback', value: 'now-playing' },
    { label: '🔍 Search            Find tracks and artists', value: 'search' },
    { label: '📋 Playlists         Browse your playlists', value: 'playlists' },
    { label: '📡 Devices           Switch playback device', value: 'devices' },
    { label: '🚪 Exit              Close Spotify CLI', value: 'exit' },
  ];

  const handleSelect = (item: MenuItem) => {
    if (item.value === 'exit') {
      onExit();
    } else {
      onNavigate(item.value as View);
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      {/* Welcome */}
      <Box marginBottom={1}>
        <Text color="gray">Welcome back, </Text>
        <Text color="green" bold>{userName || 'Spotify User'}</Text>
        <Text color="gray">!</Text>
      </Box>

      {/* Currently Playing Mini */}
      {currentTrack && (
        <Box 
          flexDirection="column" 
          borderStyle="round" 
          borderColor="green" 
          paddingX={2}
          paddingY={1}
          marginBottom={1}
        >
          <Box>
            <Text color={currentTrack.isPlaying ? 'green' : 'yellow'}>
              {currentTrack.isPlaying ? '▶ ' : '⏸ '}
            </Text>
            <Text bold>{truncate(currentTrack.name, 35)}</Text>
          </Box>
          <Box>
            <Text color="gray">  {truncate(currentTrack.artists.join(', '), 30)} • {formatDuration(currentTrack.duration)}</Text>
          </Box>
        </Box>
      )}

      {!currentTrack && (
        <Box marginBottom={1} paddingX={2}>
          <Text color="gray" dimColor>Nothing playing right now</Text>
        </Box>
      )}

      {/* Menu */}
      <Box flexDirection="column">
        <Text color="gray" bold marginBottom={1}>What would you like to do?</Text>
        <SelectInput 
          items={items} 
          onSelect={handleSelect}
          indicatorComponent={({ isSelected }) => (
            <Text color="green">{isSelected ? '❯ ' : '  '}</Text>
          )}
        />
      </Box>

      {/* Footer */}
      <Box marginTop={2}>
        <Text color="gray" dimColor>
          Use ↑↓ to navigate • ENTER to select • Ctrl+C to quit
        </Text>
      </Box>
    </Box>
  );
};

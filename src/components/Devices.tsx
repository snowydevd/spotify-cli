// src/components/Devices.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import Spinner from 'ink-spinner';
import { spotifyService } from '../services/spotify-service.js';
import type { Device } from '../types/index.js';

interface DevicesProps {
  onBack: () => void;
}

const DEVICE_ICONS: Record<string, string> = {
  Computer: '💻',
  Smartphone: '📱',
  Speaker: '🔊',
  TV: '📺',
  Tablet: '📱',
  CastVideo: '📺',
  CastAudio: '🔊',
  Automobile: '🚗',
  default: '🎵',
};

export const Devices: React.FC<DevicesProps> = ({ onBack }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const data = await spotifyService.getDevices();
      setDevices(data);
      setError(null);
    } catch (err) {
      setError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleSelect = async (item: { value: string }) => {
    try {
      setMessage('Transferring playback...');
      await spotifyService.transferPlayback(item.value);
      setMessage('✓ Playback transferred!');
      await loadDevices();
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setError('Failed to transfer playback');
      setMessage(null);
    }
  };

  useInput((input, key) => {
    if (key.escape || input === 'q') {
      onBack();
    }
    if (input === 'r') {
      loadDevices();
    }
  });

  if (loading) {
    return (
      <Box padding={1}>
        <Text>
          <Spinner type="dots" /> Loading devices...
        </Text>
      </Box>
    );
  }

  const items = devices.map(d => ({
    label: `${DEVICE_ICONS[d.type] || DEVICE_ICONS.default} ${d.name} ${d.isActive ? '(Active)' : ''} • Volume: ${d.volume}%`,
    value: d.id,
  }));

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text color="green" bold>📡 Available Devices</Text>
        <Text color="gray"> ({devices.length})</Text>
      </Box>

      {devices.length > 0 ? (
        <>
          <SelectInput items={items} onSelect={handleSelect} />
          <Box marginTop={1}>
            <Text color="gray" dimColor>Press </Text>
            <Text color="cyan">ENTER</Text>
            <Text color="gray" dimColor> to transfer playback, </Text>
            <Text color="cyan">R</Text>
            <Text color="gray" dimColor> to refresh, </Text>
            <Text color="cyan">ESC</Text>
            <Text color="gray" dimColor> to go back</Text>
          </Box>
        </>
      ) : (
        <Box flexDirection="column">
          <Text color="yellow">No devices found.</Text>
          <Text color="gray">Make sure Spotify is open on at least one device.</Text>
        </Box>
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

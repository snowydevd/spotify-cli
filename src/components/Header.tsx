// src/components/Header.tsx
import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = 'SPOTIFY CLI' }) => {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Gradient name="pastel">
        <Text bold>
          ╭─────────────────────────────────────────────────────╮
        </Text>
      </Gradient>
      <Box>
        <Gradient name="pastel">
          <Text bold>│</Text>
        </Gradient>
        <Text> </Text>
        <Text color="green" bold>♫</Text>
        <Text> </Text>
        <Text bold color="white">{title}</Text>
        <Text color="gray"> • Your music, your terminal</Text>
        <Box flexGrow={1} />
        <Gradient name="pastel">
          <Text bold>│</Text>
        </Gradient>
      </Box>
      <Gradient name="pastel">
        <Text bold>
          ╰─────────────────────────────────────────────────────╯
        </Text>
      </Gradient>
    </Box>
  );
};

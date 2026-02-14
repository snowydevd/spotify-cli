#!/usr/bin/env node
// src/index.tsx
import React from 'react';
import { render } from 'ink';
import { program } from 'commander';
import { App } from './components/App.js';
import { authService } from './auth/auth-service.js';
import { spotifyService } from './services/spotify-service.js';
import ora from 'ora';
import chalk from 'chalk';
import boxen from 'boxen';

const VERSION = '1.0.0';

// ASCII Art Logo
const logo = `
   _____ ____  ____  ______ _______ ______ __  __   _____ _      _____ 
  / ____|  _ \\/ __ \\|__  __||__   __|  ____|  \\/  | / ____| |    |_   _|
 | (___ | |_) | |  | | | |     | |  | |__  | \\  / || |    | |      | |  
  \\___ \\|  __/| |  | | | |     | |  |  __| | |\\/| || |    | |      | |  
  ____) | |   | |__| | | |     | |  | |    | |  | || |____| |____ _| |_ 
 |_____/|_|    \\____/  |_|     |_|  |_|    |_|  |_| \\_____|______|_____|
`;

async function main() {
  program
    .name('spotify')
    .description('🎵 A beautiful CLI for Spotify')
    .version(VERSION);

  // Login command
  program
    .command('login')
    .description('Authenticate with Spotify')
    .action(async () => {
      console.log(chalk.green(logo));
      const spinner = ora('Opening browser for authentication...').start();
      
      try {
        await authService.login();
        spinner.succeed('Successfully authenticated with Spotify!');
        console.log(chalk.gray('\nRun `spotify` to start the CLI.\n'));
      } catch (err) {
        spinner.fail('Authentication failed');
        console.error(chalk.red('\nPlease try again.\n'));
        process.exit(1);
      }
    });

  // Logout command
  program
    .command('logout')
    .description('Remove saved credentials')
    .action(() => {
      authService.logout();
      console.log(chalk.green('✓ Logged out successfully'));
    });

  // Play command
  program
    .command('play [query]')
    .description('Play a track or resume playback')
    .action(async (query?: string) => {
      if (!(await authService.isAuthenticated())) {
        console.log(chalk.yellow('Please login first: spotify login'));
        process.exit(1);
      }

      const spinner = ora('Processing...').start();
      try {
        if (query) {
          const results = await spotifyService.search(query, ['track'], 1);
          if (results.tracks.length > 0) {
            await spotifyService.play(results.tracks[0].uri);
            spinner.succeed(`Now playing: ${results.tracks[0].name} by ${results.tracks[0].artists.join(', ')}`);
          } else {
            spinner.fail('No tracks found');
          }
        } else {
          await spotifyService.play();
          spinner.succeed('Playback resumed');
        }
      } catch (err) {
        spinner.fail('Failed to play');
      }
    });

  // Pause command
  program
    .command('pause')
    .description('Pause playback')
    .action(async () => {
      if (!(await authService.isAuthenticated())) {
        console.log(chalk.yellow('Please login first: spotify login'));
        process.exit(1);
      }

      try {
        await spotifyService.pause();
        console.log(chalk.green('⏸ Playback paused'));
      } catch (err) {
        console.log(chalk.red('Failed to pause'));
      }
    });

  // Next command
  program
    .command('next')
    .description('Skip to next track')
    .action(async () => {
      if (!(await authService.isAuthenticated())) {
        console.log(chalk.yellow('Please login first: spotify login'));
        process.exit(1);
      }

      try {
        await spotifyService.next();
        console.log(chalk.green('⏭ Skipped to next track'));
      } catch (err) {
        console.log(chalk.red('Failed to skip'));
      }
    });

  // Previous command
  program
    .command('prev')
    .description('Go to previous track')
    .action(async () => {
      if (!(await authService.isAuthenticated())) {
        console.log(chalk.yellow('Please login first: spotify login'));
        process.exit(1);
      }

      try {
        await spotifyService.previous();
        console.log(chalk.green('⏮ Previous track'));
      } catch (err) {
        console.log(chalk.red('Failed to go back'));
      }
    });

  // Volume command
  program
    .command('volume <level>')
    .description('Set volume (0-100)')
    .action(async (level: string) => {
      if (!(await authService.isAuthenticated())) {
        console.log(chalk.yellow('Please login first: spotify login'));
        process.exit(1);
      }

      const vol = parseInt(level, 10);
      if (isNaN(vol) || vol < 0 || vol > 100) {
        console.log(chalk.red('Volume must be between 0 and 100'));
        return;
      }

      try {
        await spotifyService.setVolume(vol);
        console.log(chalk.green(`🔊 Volume set to ${vol}%`));
      } catch (err) {
        console.log(chalk.red('Failed to set volume'));
      }
    });

  // Now playing command
  program
    .command('now')
    .description('Show currently playing track')
    .action(async () => {
      if (!(await authService.isAuthenticated())) {
        console.log(chalk.yellow('Please login first: spotify login'));
        process.exit(1);
      }

      try {
        const track = await spotifyService.getCurrentlyPlaying();
        if (track) {
          const status = track.isPlaying ? '▶' : '⏸';
          console.log(
            boxen(
              `${status} ${chalk.bold(track.name)}\n` +
              `${chalk.cyan(track.artists.join(', '))}\n` +
              `${chalk.gray(track.album)}`,
              {
                padding: 1,
                borderColor: 'green',
                borderStyle: 'round',
              }
            )
          );
        } else {
          console.log(chalk.yellow('Nothing is currently playing'));
        }
      } catch (err) {
        console.log(chalk.red('Failed to get current track'));
      }
    });

  // Default action (interactive mode)
  program
    .action(async () => {
      // Check authentication
      if (!(await authService.isAuthenticated())) {
        console.log(
          boxen(
            `${chalk.bold('Welcome to Spotify CLI!')}\n\n` +
            `You need to authenticate first.\n` +
            `Run: ${chalk.cyan('spotify login')}`,
            {
              padding: 1,
              borderColor: 'green',
              borderStyle: 'round',
            }
          )
        );
        return;
      }

      // Start interactive mode
      const { waitUntilExit } = render(
        <App onExit={() => process.exit(0)} />
      );

      await waitUntilExit();
    });

  program.parse();
}

main().catch(console.error);

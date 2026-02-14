// src/auth/auth-service.ts
import SpotifyWebApi from 'spotify-web-api-node';
import Conf from 'conf';
import open from 'open';
import express from 'express';
import { SPOTIFY_CONFIG, AUTH_PORT } from '../config/spotify.js';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const config = new Conf<{ tokens: TokenData }>({
  projectName: 'spotify-cli',
  encryptionKey: 'spotify-cli-secret-key',
});

export class AuthService {
  private spotifyApi: SpotifyWebApi;

  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: SPOTIFY_CONFIG.clientId,
      clientSecret: SPOTIFY_CONFIG.clientSecret,
      redirectUri: SPOTIFY_CONFIG.redirectUri,
    });
  }

  getSpotifyApi(): SpotifyWebApi {
    return this.spotifyApi;
  }

  async isAuthenticated(): Promise<boolean> {
    const tokens = config.get('tokens');
    if (!tokens) return false;

    // Check if token is expired
    if (Date.now() > tokens.expiresAt) {
      try {
        await this.refreshAccessToken();
        return true;
      } catch {
        return false;
      }
    }

    this.spotifyApi.setAccessToken(tokens.accessToken);
    this.spotifyApi.setRefreshToken(tokens.refreshToken);
    return true;
  }

  async login(): Promise<void> {
    return new Promise((resolve, reject) => {
      const app = express();
      let server: ReturnType<typeof app.listen>;

      app.get('/callback', async (req, res) => {
        const code = req.query.code as string;
        const error = req.query.error as string;

        if (error) {
          res.send(`
            <html>
              <body style="background: #191414; color: #1DB954; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                <div style="text-align: center;">
                  <h1>❌ Authentication Failed</h1>
                  <p>Error: ${error}</p>
                  <p>You can close this window.</p>
                </div>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(error));
          return;
        }

        try {
          const data = await this.spotifyApi.authorizationCodeGrant(code);
          
          const tokens: TokenData = {
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresAt: Date.now() + data.body.expires_in * 1000,
          };

          config.set('tokens', tokens);
          this.spotifyApi.setAccessToken(tokens.accessToken);
          this.spotifyApi.setRefreshToken(tokens.refreshToken);

          res.send(`
            <html>
              <body style="background: #191414; color: #1DB954; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                <div style="text-align: center;">
                  <h1>✅ Spotify CLI Connected!</h1>
                  <p style="font-size: 48px;">🎵</p>
                  <p>You can close this window and return to your terminal.</p>
                </div>
              </body>
            </html>
          `);

          server.close();
          resolve();
        } catch (err) {
          res.send('Authentication failed. Please try again.');
          server.close();
          reject(err);
        }
      });

      server = app.listen(AUTH_PORT, () => {
        const authorizeUrl = this.spotifyApi.createAuthorizeURL(
          SPOTIFY_CONFIG.scopes,
          'spotify-cli-state'
        );
        open(authorizeUrl);
      });
    });
  }

  async refreshAccessToken(): Promise<void> {
    const tokens = config.get('tokens');
    if (!tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.spotifyApi.setRefreshToken(tokens.refreshToken);
    const data = await this.spotifyApi.refreshAccessToken();

    const newTokens: TokenData = {
      accessToken: data.body.access_token,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + data.body.expires_in * 1000,
    };

    config.set('tokens', newTokens);
    this.spotifyApi.setAccessToken(newTokens.accessToken);
  }

  logout(): void {
    config.delete('tokens');
  }
}

export const authService = new AuthService();

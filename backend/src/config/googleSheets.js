import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const scopes = ['https://www.googleapis.com/auth/spreadsheets'];
const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
let auth;
let configurationError = null;

try {
  if (serviceAccount) {
    const credentials = JSON.parse(
      Buffer.from(serviceAccount, 'base64').toString('utf8')
    );

    if (credentials.type !== 'service_account') {
      throw new Error('Google credentials must be a service account JSON file');
    }

    auth = new google.auth.GoogleAuth({ credentials, scopes });
  } else {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const tokenPath = path.resolve(
      currentDirectory,
      '../../config/google-oauth-token.json'
    );

    if (!fs.existsSync(tokenPath)) {
      throw new Error(
        'Google credentials are missing. Set GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 or authorize Google OAuth.'
      );
    }

    auth = google.auth.fromJSON(JSON.parse(fs.readFileSync(tokenPath, 'utf8')));
    auth.scopes = scopes;
  }
} catch (error) {
  configurationError = error;
}

const sheets = google.sheets({
  version: 'v4',
  auth,
});

export const spreadsheetId = process.env.GOOGLE_SHEET_ID;

export function assertGoogleSheetsConfigured() {
  if (!spreadsheetId) throw new Error('GOOGLE_SHEET_ID is missing');
  if (configurationError) throw configurationError;
}

export default sheets;

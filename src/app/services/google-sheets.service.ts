import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from '../../environments/environment';
import { Player } from '../models/player';

declare var google: any;
declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleSheetsService {
  private readonly API_KEY = environment.googleApi.apiKey;
  private readonly SPREADSHEET_ID = environment.googleApi.spreadsheetId;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initializeGoogleApi();
  }

  private async initializeGoogleApi(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.initClient();
    }
    await this.initPromise;
  }

  private initClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
          });
          this.isInitialized = true;
          resolve();
        } catch (error) {
          console.error('Error initializing Google API client:', error);
          reject(error);
        }
      });
    });
  }

  getPlayers(): Observable<Player[]> {
    return from(this.getPlayersAsync());
  }

  private async getPlayersAsync(): Promise<Player[]> {

    if (!this.isInitialized) {
      await this.initializeGoogleApi();
    }

    try {

      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.SPREADSHEET_ID,
        range: 'A4:E'
      });

      const rows = response.result.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      //remover jogador sem nome
      const filteredRows = rows.filter(row => row[0] !== undefined && row[0] !== '');

      return filteredRows.map(row => ({
        nome: row[0],
        gols: parseInt(row[1]) || 0,
        capas: parseInt(row[2]) || 0,
        posicao: row[3] as 'ATA' | 'MEI' | 'ZAG' | 'GOL',
        foto: row[4] || '' // Assuming the photo filename is in the 5th column (index 4)
      }
      ));
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      return [];
    }
  }
}

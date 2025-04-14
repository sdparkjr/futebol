import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Player } from '../../models/player';
import { GoogleSheetsService } from '../../services/google-sheets.service';

@Component({
  selector: 'app-player-table',
  templateUrl: './player-table.component.html',
  styleUrls: ['./player-table.component.scss']
})
export class PlayerTableComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'posicao', 'gols', 'capas'];
  dataSource: MatTableDataSource<Player>;
  isLoading = true;
  error: string | null = null;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private googleSheetsService: GoogleSheetsService) {
    this.dataSource = new MatTableDataSource<Player>();
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    this.googleSheetsService.getPlayers().subscribe(
      (players) => {
        this.dataSource.data = players;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      (error) => {
        this.error = 'Erro ao carregar dados: ' + error.message;
        this.isLoading = false;
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getPositionColor(posicao: string): string {
    const colors = {
      'ATA': '#ff4444',
      'MEI': '#33b5e5',
      'ZAG': '#00C851',
      'GOL': '#FF8800'
    };
    return colors[posicao] || '#757575';
  }
}

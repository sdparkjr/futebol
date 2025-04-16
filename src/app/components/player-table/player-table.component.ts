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
  positions: string[] = ['ATA', 'MEI', 'ZAG', 'GOL'];
  highlightedPlayers: {
    goleiro: Player | null;
    zagueiros: Player[];
    meias: Player[];
    atacantes: Player[];
  } = {
    goleiro: null,
    zagueiros: [],
    meias: [],
    atacantes: []
  };
  selectedPosition: string = '';
  sortField: string = '';
  sortDirection: 'asc' | 'desc' = 'desc';
  private originalData: Player[] = [];

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
        this.originalData = players;
        this.dataSource.data = players;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.updateHighlightedPlayers();
        this.isLoading = false;
      },
      (error) => {
        this.error = 'Erro ao carregar dados: ' + error.message;
        this.isLoading = false;
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.applyFilters(filterValue, this.selectedPosition);
  }

  filterByPosition(position: string): void {
    if (this.selectedPosition === position) {
      this.selectedPosition = '';
    } else {
      this.selectedPosition = position;
    }
    this.applyFilters(this.dataSource.filter, this.selectedPosition);
  }

  private applyFilters(textFilter: string, positionFilter: string): void {
    let filteredData = this.originalData;

    if (positionFilter) {
      filteredData = filteredData.filter(player => player.posicao === positionFilter);
    }

    if (textFilter) {
      filteredData = filteredData.filter(player =>
        player.nome.toLowerCase().includes(textFilter)
      );
    }

    this.dataSource.data = filteredData;

    if (this.sortField) {
      this.sortData(this.sortField);
    }

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.sortData(field);
  }

  private sortData(field: string): void {
    const data = [...this.dataSource.data];
    data.sort((a, b) => {
      const modifier = this.sortDirection === 'asc' ? 1 : -1;
      return (a[field] < b[field] ? -1 : 1) * modifier;
    });
    this.dataSource.data = data;
  }

  getPositionColor(posicao: string): string {
    const colors = {
      'ATA': '#34943c',
      'MEI': '#dea712',
      'ZAG': '#213ddb',
      'GOL': '#FF8800'
    };
    return colors[posicao] || '#757575';
  }

  private updateHighlightedPlayers(): void {
    const playersByPosition = {
      GOL: [] as Player[],
      ZAG: [] as Player[],
      MEI: [] as Player[],
      ATA: [] as Player[]
    };

    this.originalData.forEach(player => {
      playersByPosition[player.posicao].push(player);
    });

    const sortPlayers = (a: Player, b: Player) => {
      if (a.capas !== b.capas) {
        return b.capas - a.capas;
      }
      return b.gols - a.gols;
    };

    this.highlightedPlayers = {
      goleiro: playersByPosition.GOL.sort(sortPlayers)[0] || null,
      zagueiros: playersByPosition.ZAG.sort(sortPlayers).slice(0, 2),
      meias: playersByPosition.MEI.sort(sortPlayers).slice(0, 2),
      atacantes: playersByPosition.ATA.sort(sortPlayers).slice(0, 2)
    };
  }
}

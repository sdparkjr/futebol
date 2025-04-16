export interface Player {
    nome: string;
    gols: number;
    capas: number;
    posicao: 'ATA' | 'MEI' | 'ZAG' | 'GOL';
    foto: string;
}

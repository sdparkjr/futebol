# Default Avatar Image

Para resolver o loop infinito das imagens, você precisa:

1. Adicionar um arquivo `default-avatar.png` nesta pasta (`src/assets/`)
2. O arquivo pode ser qualquer imagem de silhueta de jogador ou avatar padrão
3. Este arquivo será usado quando:
   - O jogador não tiver uma foto definida
   - A foto do jogador não for encontrada

As fotos dos jogadores devem ser colocadas em:
`src/assets/player-images/[nome-do-jogador].jpg`

Exemplo de estrutura:
```
src/assets/
├── default-avatar.png
└── player-images/
    ├── joao-silva.jpg
    ├── pedro-santos.jpg
    └── ...

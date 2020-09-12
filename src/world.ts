export type World = {
    tileMap: TileMap;
}

export type TileMap = {
    tiles: Array<Array<Tile>>;
}

export type Tile = number;

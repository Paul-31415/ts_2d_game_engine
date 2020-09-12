import * as PIXI from "pixi.js";
import { Draw } from "./draw";
import { applyInputs, Gamestate, step } from "./game";
import { InputListener } from "./input";
import { Vec } from "./physics";


const app = new PIXI.Application({
    resolution: window.devicePixelRatio || 1,
    width: window.innerWidth,
    height: window.innerHeight,
    autoDensity: true, // Set resolution based on pixel density
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
console.log("pixel ratio:", window.devicePixelRatio);
document.body.appendChild(app.view);

function genWorld(w = 100, h = 100) {
    const a: number[][] = [];
    const f = Math.floor(w / 2);
    for (let y = 0; y < h; y++) {
        a[y] = [];
        for (let x = 0; x < w; x++) {
            a[y][x] = (y > f) ? (((x ^ y) % (y - f)) == 0) ? 1 : 0 : 0;
        }
    }
    return a;
}

var state: Gamestate = {
    world: {
        tileMap: {
            tiles: genWorld(512, 512)
        }
    },
    player: { pos: new Vec(), vel: new Vec(), graphicsID: 2 },
    cam: { pos: { x: 0, y: 0 }, smooth: [new Vec(), new Vec()] }
}

state.cam.pos.x = 32;
state.cam.pos.y = 32;

const disp = new Draw();
disp.offs.x = window.innerWidth / 2;
disp.offs.y = window.innerHeight / 2;
disp.wh.setFrom({ x: 20, y: 16 });

app.stage.addChild(disp.container);

const inputs = new InputListener();

export function toggleTile(v: Vec) {
    const t = disp.camMapInv(v, state.cam.pos).floor();
    const r = state.world.tileMap.tiles[t.y];
    if (r != undefined)
        if (state.world.tileMap.tiles[t.y][t.x] != undefined)
            state.world.tileMap.tiles[t.y][t.x] = state.world.tileMap.tiles[t.y][t.x] ? 0 : 1;
}

function update(_delta: number) {
    applyInputs(state, inputs);
    step(state);
    disp.draw(state);
}

function start() {
    inputs.attach(document, 0x43);
}

async function startGame() {
    start();
    app.ticker.add(update);
}

startGame();

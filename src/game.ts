import { toggleTile } from "./browser";
import { ColPoint, PolyCol, StaticLine } from "./collision_detection";
import { InputListener, InputType } from "./input";
import { Line, Pointy, Vec } from "./physics";
import { thickLine } from "./rasterIters";
import { Sprite } from "./sprite";
import { World } from "./world";


type Ptype = Sprite & {
    vel: Vec,
};

export type Gamestate = {
    player: Ptype;
    cam: { pos: { x: number, y: number }, smooth: Pointy[] };
    world: World;
}


function tileAt(v: Vec, s: Gamestate) {
    const c = v.floor();
    const r = s.world.tileMap.tiles[c.y];
    return r == undefined ? -1 : r[c.x] == undefined ? -1 : r[c.x];
}

export function step(state: Gamestate) {
    updatePlayer(state.player, state);
}
const tileCollider = new PolyCol([new StaticLine(new Vec(1, 1), new Vec(1, 0)),
new StaticLine(new Vec(1, 0), new Vec(0, 0)),
new StaticLine(new Vec(0, 0), new Vec(0, 1)),
new StaticLine(new Vec(0, 1), new Vec(1, 1))]);
function updatePlayer(player: Ptype, state: Gamestate) {
    const gravity = new Vec(0, .01);
    const nextPos = player.pos.plus(player.vel);
    let hit = false;
    let mint = 1;
    for (let t of thickLine(player.pos, nextPos)) {
        if (tileAt(t.i, state)) {
            const cp = new ColPoint(player.pos.minus(t.i), nextPos.minus(t.i));
            for (let col of cp.collide(tileCollider)) {
                if (col.t >= 0 && col.t < mint) {
                    hit = true;
                    mint = col.t;
                }
            }
            if (hit)
                break;
            //mint = new Line(player.pos, nextPos).uv(t.p).y * 1;
            nextPos.setFrom(t.p);
            mint = .99;
            if (t.p.x % 1 == 0)
                player.vel.x *= -.875;
            if (t.p.y % 1 == 0)
                player.vel.y *= -.875;
            hit = true;
            break;
        }
    }
    player.pos.lerpEq(nextPos, mint);
    if (!hit)
        player.vel.increment(gravity);


}


export function applyInputs(state: Gamestate, inputs: InputListener) {
    for (let inp of inputs.inputs) {
        if (inp.t == InputType.KeyDown) {
            const ke = (inp.d as KeyboardEvent);
            if (ke.keyCode == 37) //left
                state.player.vel.x -= 1;
            if (ke.keyCode == 38) //up
                state.player.vel.y -= 1;
            if (ke.keyCode == 39) //right
                state.player.vel.x += 1;
            if (ke.keyCode == 40) //down
                state.player.vel.y += 1;
            if (ke.keyCode == 65) //a
                state.player.vel.x -= .1;
            if (ke.keyCode == 87) //w
                state.player.vel.y -= .1;
            if (ke.keyCode == 68) //d
                state.player.vel.x += .1;
            if (ke.keyCode == 83) //s
                state.player.vel.y += .1;
        }

        if (inp.t == InputType.MouseClick) {
            const me = (inp.d as MouseEvent);
            const pos = new Vec(me.pageX, me.pageY);
            toggleTile(pos, state);
        }
    }

    inputs.clear();
}

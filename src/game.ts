import { toggleTile } from "./browser";
import { InputListener, InputType } from "./input";
import { Pointy, Vec } from "./physics";
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
    state.player.pos.increment(state.player.vel);
    state.player.vel.increment(new Vec(0, 0.01));
    if (tileAt(state.player.pos, state)) {
        state.player.vel.scale(0);
    }
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
            const pos = new Vec(me.offsetX, me.offsetY);
            toggleTile(pos);
        }
    }

    inputs.clear();
}

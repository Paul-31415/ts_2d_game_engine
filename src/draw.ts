import { Gamestate } from "./game";
import * as PIXI from "pixi.js";
import { Vec, Pointy, vec_iir } from "./physics";
import { thickRect } from "./rasterIters";


export class Draw {
    readonly container = new PIXI.Container();
    readonly graphics = new PIXI.Graphics();
    constructor() {
        this.container.addChild(this.graphics);
    }

    wh = new Vec(10, 7);
    s = 16;
    offs = new Vec(500, 500);

    draw(g: Gamestate) {
        const a = [-1.5680703172728885, 0.64603409538547];
        const camCenter = vec_iir(a
            , 0.019490944528145357 - 1, [0.038981889056290714 - a[0], 0.019490944528145357 - a[1]]
            , g.cam.smooth, g.player.pos);

        const dm = .9375 * Math.min(this.wh.x, this.wh.y);

        // This function approaches 1 slower than tanh alone.
        camCenter.funcMag((m: number) => Math.tanh(Math.log1p(Math.abs(m / dm)) * Math.sign(m)) * dm);
        camCenter.increment(g.player.pos);

        camCenter.setTo(g.cam.pos);
        const l = this.wh.rminus(camCenter);
        const h = this.wh.plus(camCenter);
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xff8800);
        this.vdrawBox(this.camMap(l, camCenter), this.camMap(h, camCenter));
        this.graphics.lineStyle(4, 0xffffff);
        for (let p of thickRect(l, h)) {
            const y = p.y;
            const r = g.world.tileMap.tiles[y];
            if (r != undefined) {
                const x = p.x;
                const t = r[x];
                if (t) {
                    const c = this.camMap(p, camCenter);
                    this.drawBox(c.x, c.y, this.s, this.s);
                }
            }

        }
        this.graphics.lineStyle(3, 0x0088ff);
        const c = this.camMap(g.player.pos, camCenter);
        this.graphics.drawCircle(c.x, c.y, this.s / 2);
    }

    camMap(v: Vec, c: Pointy) {
        return v.minus(c).scale(this.s).increment(this.offs);
    }

    camMapInv(v: Vec, c: Pointy) {
        return v.minus(this.offs).unscale(this.s).increment(c);
    }

    private vdrawBox(p: Vec, p2: Vec) {
        this.graphics.moveTo(p.x, p.y);
        this.graphics.lineTo(p.x, p2.y);
        this.graphics.lineTo(p2.x, p2.y);
        this.graphics.lineTo(p2.x, p.y);
        this.graphics.lineTo(p.x, p.y);
    }

    private drawBox(x: number, y: number, w = this.s, h = this.s, hollow = false) {
        this.graphics.moveTo(x, y);
        this.graphics.lineTo(x, y + h);
        this.graphics.lineTo(x + w, y + h);
        this.graphics.lineTo(x + w, y);
        this.graphics.lineTo(x, y);
        if (!hollow)
            this.graphics.lineTo(x + w, y + h);
    }
}

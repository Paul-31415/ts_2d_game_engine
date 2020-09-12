import * as PIXI from "pixi.js";
import { Gamestate } from "./game";

const ROOT_ZERO = (() => {
    let rz = 1;
    while (rz * rz != 0) {
        rz /= 2;
    }
    return rz
})();


export interface Physical {
    step: (g: Gamestate) => void;
}

class Ballistic implements Physical {
    pos: Vec;
    vel: Vec;
    acc: Vec;
    constructor() {
        this.pos = new Vec();
        this.vel = new Vec();
        this.acc = new Vec();
    }
    step(_g: Gamestate) {
        this.pos.increment(this.vel);
        this.vel.increment(this.acc);
    }
}

export type Pointy = {
    x: number;
    y: number;
}

export function pseudoCosine(n: number) {
    n = (((n % 4) + 4) % 4) - 2;
    return Math.abs(n) - 1;
}

export function pseudoSine(n: number) {
    return pseudoCosine(n - 1);
}

export function mod(a: number, b: number) {
    return ((a % b) + b) % b;
}

export function vecify(p: Pointy) { return new Vec(p.x, p.y); }

export function vec_iir(a: number[], b0: number, b: number[], state: Pointy[], inp: Vec) {
    const s = inp.copy();
    for (let i in a)
        s.decrement(vecify(state[i]).scale(a[i]));
    const r = s.times(b0);
    for (let i in b)
        r.increment(vecify(state[i]).scale(b[i]));
    for (let i = state.length - 1; i > 0; i--) {
        state[i].x = state[i - 1].x;
        state[i].y = state[i - 1].y;
    }
    s.setTo(state[0]);
    return r;
}

export class Vec extends PIXI.Point {
    constructor(x: number | undefined = undefined, y: number | undefined = undefined) { super(x, y); }
    clone() {
        return new Vec(this.x, this.y);
    }
    copy() {
        return this.clone();
    }
    setFrom(o: Pointy) {
        this.x = o.x;
        this.y = o.y;
    }
    setTo(o: Pointy) {
        o.x = this.x;
        o.y = this.y;
    }
    //nicies
    get mag2(): number {
        return this.dot(this);
    }
    set mag2(n: number) {
        this.normalize(Math.sqrt(n));
    }
    get mag(): number {
        return Math.hypot(this.x, this.y);
    }
    set mag(n: number) {
        this.normalize(n);
    }
    get angle(): number {
        return Math.atan2(this.y, this.x);
    }
    set angle(a: number) {
        this.rotate(a - this.angle);
    }
    get pseudoAngle(): number {
        const d = Math.abs(this.x) + Math.abs(this.y);
        if (d == 0) {
            return 0;
        }
        const p = 1 - this.x / d;
        if (this.y > 0) return p;
        return -p;
    }
    set pseudoAngle(pa: number) {
        const s = pseudoSine(pa);
        const c = pseudoCosine(pa);
        const m = this.mag;
        this.x = c;
        this.y = s;
        this.normalize(m);
    }

    ccw(): Vec {
        return new Vec(-this.y, this.x);
    }
    cw(): Vec {
        return new Vec(this.y, -this.x);
    }
    //math stuff
    isZero(): boolean {
        return this.x == 0 && this.y == 0;
    }
    dot(o: Pointy) {
        return this.x * o.x + this.y * o.y;
    }
    cross(o: Pointy) {
        return this.x * o.y - this.y * o.x;
    }
    funcMag(mf: (m: number) => number) {
        const m = this.mag;
        const r = mf(m);
        if (m == 0) {
            this.x = r;
            this.y = 0;
            return this;
        }
        const f = r / m;
        this.x *= f;
        this.y *= f;
        return this;
    }
    normalize(m = 1): Vec {
        if ((this.x == 0 && this.y == 0) || m == 0) {
            this.x = m;
            this.y = 0;
            return this;
        }
        const h = this.mag;
        const f = m / h;
        this.x *= f;
        this.y *= f;
        return this;
    }
    normalized(m = 1) {
        return this.clone().normalize(m);
    }
    rotate(a: number) {
        const s = Math.sin(a);
        const c = Math.cos(a);
        const tmp = this.x * c - this.y * s;
        this.y = this.x * s + this.y * c;
        this.x = tmp;
        return this;
    }
    rotated(a: number) {
        return this.clone().rotate(a);
    }
    increment(o: Pointy) {
        this.x += o.x;
        this.y += o.y;
        return this;
    }
    plus(o: Pointy) {
        return new Vec(this.x + o.x, this.y + o.y);
    }
    decrement(o: Pointy) {
        this.x -= o.x;
        this.y -= o.y;
        return this;
    }
    minus(o: Pointy) {
        return new Vec(this.x - o.x, this.y - o.y);
    }
    rminus(o: Pointy) {
        return new Vec(o.x - this.x, o.y - this.y);
    }
    chs() {
        return new Vec(-this.x, -this.y);
    }
    negate() {
        this.x = -this.x; this.y = -this.y;
        return this;
    }
    scale(n: number) {
        this.x *= n;
        this.y *= n;
        return this;
    }
    times(n: number) {
        return new Vec(this.x * n, this.y * n);
    }
    vscale(o: Pointy) {
        this.x *= o.x;
        this.y *= o.y;
        return this;
    }
    vtimes(o: Pointy) {
        return new Vec(this.x * o.x, this.y * o.y);
    }
    unscale(n: number) {
        this.x /= n;
        this.y /= n;
        return this;
    }
    divide(n: number) {
        return new Vec(this.x / n, this.y / n);
    }
    vunscale(o: Pointy) {
        this.x /= o.x;
        this.y /= o.y;
        return this;
    }
    vdivide(o: Pointy) {
        return new Vec(this.x / o.x, this.y / o.y);
    }
    vmax(o: Pointy) {
        return new Vec(Math.max(this.x, o.x), Math.max(this.y, o.y));
    }
    vmin(o: Pointy) {
        return new Vec(Math.min(this.x, o.x), Math.min(this.y, o.y));
    }
    max(o: number) {
        return new Vec(Math.max(this.x, o), Math.max(this.y, o));
    }
    min(o: number) {
        return new Vec(Math.min(this.x, o), Math.min(this.y, o));
    }
    func(f: (a: number, b: number) => number, o: Pointy) {
        return new Vec(f(this.x, o.x), f(this.y, o.y));
    }
    map(f: (a: number) => number) {
        return new Vec(f(this.x), f(this.y));
    }
    floor() {
        return new Vec(Math.floor(this.x), Math.floor(this.y));
    }
    round() {
        return new Vec(Math.round(this.x), Math.round(this.y));
    }
    ceil() {
        return new Vec(Math.ceil(this.x), Math.ceil(this.y));
    }
    gt(o: Pointy) {
        return this.x > o.x && this.y > o.y;
    }
    lt(o: Pointy) {
        return this.x < o.x && this.y < o.y;
    }
    between(lo: Pointy, hi: Pointy) {
        return this.gt(lo) && this.lt(hi);
    }
    vmod(o: Pointy) {
        return this.func(mod, o);
    }
    mod(o: number) {
        return this.map((a: number) => mod(a, o));
    }
    vrem(o: Pointy) {
        return new Vec(this.x % o.x, this.y % o.y);
    }
    rem(o: number) {
        return new Vec(this.x % o, this.y % o);
    }

    //fancier vector thingies
    uv(o: Pointy) {
        return new Vec(this.dot(o), this.cross(o)).unscale(this.mag2);
    }
    xy(o: Pointy) {
        return this.times(o.x).increment(this.ccw().scale(o.y));
    }
    reflectNormal(o: Pointy) {
        const u = this.dot(o) / this.mag2;
        return this.times(-2 * u).plus(o);
    }
    reflectAlong(o: Pointy) {
        return this.ccw().reflectNormal(o);
    }

    lerp(o: Pointy, t: number) {
        return new Vec(this.x * (1 - t) + o.x * t, this.y * (1 - t) + o.y * t);
    }
    lerpEq(o: Pointy, t: number) {
        this.x = this.x * (1 - t) + o.x * t;
        this.y = this.y * (1 - t) + o.y * t;
    }


    scaleComponent(dir: Pointy, scale: number) {
        const comp = this.scale(this.dot(dir) / this.mag2)
        return this.plus(comp.scale(scale - 1));
    }


}

export class Line {
    constructor(public a: Vec, public b: Vec) { }

    get d(): Vec {
        return this.b.minus(this.a);
    }
    set d(v: Vec) {
        this.b = v.plus(this.a);
    }

    side(p: Pointy): boolean {
        return this.a.rminus(p).cross(this.d) > 0;
    }
    uv(p: Pointy): Vec {
        const p0 = this.a.rminus(p);
        return this.d.uv(p0);
    }
    xy(p: Pointy): Vec {
        return this.a.plus(this.d.xy(p));
    }

    st(l: Line): Vec {
        //(s,t) where
        // s*d+a = t*e+c
        // s*d-t*e = c-a
        // make orthogonal
        const d = this.d;
        const e = l.d;
        const common = d.dot(e);
        const dm = d.mag2;
        const f = common / dm;
        e.decrement(d.scale(-f));
        //e` = e-d*(d•e)/(d•d)
        //e`•d = e•d-(d*(d•e)/(d•d))•d
        //     = e•d-d•e = 0
        const k = l.a.minus(this.a);
        const s_ = d.dot(k) / dm;
        const em = e.mag2;
        const t_ = e.dot(k) / em;
        //s`d+t`e` = c-a
        //s`d+t`(e-d*(d•e)/(d•d)) = c-a
        //s`d+t`e-t`(d•e)/(d•d)*d = c-a
        //(s`-t`(d•e)/(d•d))d+t`e = c-a
        //s = (s`-t`f),t=-t`
        return new Vec(s_ - t_ * f, -t_);
    }
    lerp(l: Line, t: number) {
        return new Line(this.a.lerp(l.a, t), this.b.lerp(l.b, t));
    }
    t(t: number): Vec {
        return this.a.lerp(this.b, t);
    }
    increment(o: Line) {
        this.a.increment(o.a);
        this.b.increment(o.b);
        return this;
    }
    plus(o: Line) {
        return new Line(this.a.plus(o.a), this.b.plus(o.b));
    }
    decrement(o: Line) {
        this.a.decrement(o.a);
        this.b.decrement(o.b);
        return this;
    }
    minus(o: Line) {
        return new Line(this.a.minus(o.a), this.b.minus(o.b));
    }
    rminus(o: Line) {
        return new Line(this.a.rminus(o.a), this.b.rminus(o.b));
    }
    chs() {
        return new Line(this.a.chs(), this.b.chs());
    }
    negate() {
        this.a.negate(); this.b.negate();
        return this;
    }
}

import { Pointy, Vec, mod } from "./physics";



export function* thickLine(a: Pointy, b: Pointy, s: number = 1): IterableIterator<{ i: Vec, p: Vec }> {
    a = new Vec(a.x, a.y).unscale(s);
    b = new Vec(b.x, b.y).unscale(s);

    const ody = b.y - a.y;
    const odx = b.x - a.x;
    const odiry = ody < 0 ? -1 : 1;//can't use Math.sign because
    const odirx = odx < 0 ? -1 : 1;// it can return 0
    //force direction to the positive 0<=slope<=1 octant
    /*      |    .:
            |  .:::
      ______|.:::::
            |
            |
     */
    const swap = Math.abs(ody) > Math.abs(odx);
    const oa = swap ? (x: number, y: number) => { return new Vec(y * odirx, x * odiry) } :
        (x: number, y: number) => { return new Vec(x * odirx, y * odiry) };
    {
        const delta = swap ? new Vec(Math.abs(ody), Math.abs(odx)) : new Vec(Math.abs(odx), Math.abs(ody));
        const start = swap ? new Vec(a.y * odiry, a.x * odirx) : new Vec(a.x * odirx, a.y * odiry);
        const end = start.plus(delta);
        const m = delta.y / delta.x;
        let ox = start.x;
        let oy = start.y;
        let x = Math.floor(start.x) + 1;
        let y = (x - ox) * m + start.y;
        while (x < Math.floor(end.x)) {
            if (Math.floor(y) > Math.floor(oy)) {
                const d = Math.floor(y) - oy;
                yield { p: oa(d / m + ox, Math.floor(y)), i: oa(Math.floor(d / m + ox) + .5, Math.floor(y) + .5).floor() };
            }
            yield { p: oa(x, y), i: oa(x + .5, Math.floor(y) + .5).floor() };
            ox = x;
            oy = y;
            x++;
            y += m;
        }
        y += (end.x - x) * m;
        x = end.x;
        if (Math.floor(y) > Math.floor(oy)) {
            const d = Math.floor(y) - oy;
            yield { p: oa(d / m + ox, Math.floor(y)), i: oa(Math.floor(d / m + ox) + .5, Math.floor(y) + .5).floor() };
        }
        if (Math.floor(x) > Math.floor(ox)) {
            const rx = Math.floor(x);
            const ry = y + (rx - x) * m;
            yield { p: oa(rx, ry), i: oa(rx + .5, Math.floor(ry) + .5).floor() };
        }
    }


    /*const diry = a.y > b.y ? -1 : 1;
    const dirx = a.x > b.x ? -1 : 1;
    let intersect = a.x;
    const sy = a.y - b.y / (a.x - b.x)
    for (let y = Math.floor(a.y); y * diry <= Math.floor(b.y) * diry; y += diry) {
        const oldix = intersect;
        if (y * diry + 1 > b.y * diry) //multiplying by diry makes a.y < b.y, so we going up in y
            intersect = b.x;
        else
            //p=(x,y) such that it's on the line and
            //p.y = y+diry
            //so p.x = (p.y/d.y)*d.x+a.x
            intersect = a.x + (b.x - a.x) * (y + diry) / (b.y - a.y);
        let iy = y;
        for (let x = oldix; x * dirx <= intersect * dirx && x * dirx <= b.x * dirx; x += dirx) {
            yield new Vec(x, iy);
            iy += sy;
        }
    }*/
}

export function* thickRect(l: Pointy, h: Pointy, s = 1): IterableIterator<Vec> {
    const lv = new Vec(l.x, l.y).unscale(s).floor();
    const hv = new Vec(h.x, h.y).unscale(s).floor();
    for (let y = lv.y; y <= hv.y; y++)
        for (let x = lv.x; x <= hv.x; x++)
            yield new Vec(x, y);

}

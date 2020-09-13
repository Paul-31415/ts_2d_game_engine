import { Collideable } from "./collision_detection";
import { Vec } from "./physics";


export type Sprite = {
    pos: Vec,
    graphicsID: number,
}



export type PSprite = Sprite & {
    vel: Vec,
    collider: Collideable,
}


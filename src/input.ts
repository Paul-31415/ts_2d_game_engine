export enum InputType {
    KeyDown,
    KeyUp,
    MouseDown,
    MouseUp,
    MouseMove,
    MouseWheel,
    MouseClick
}

export interface Input {
    t: InputType;
    d: any;
}

class EventInput implements Input {
    constructor(public t: InputType, public d: UIEvent) { }
}

export class InputListener {
    doc: Document | undefined;
    inputs: Array<Input>;
    constructor() {
        this.inputs = [];
        this.boundKeyDown = this.keyDownCallback.bind(this);
        this.boundKeyUp = this.keyUpCallback.bind(this);
        this.boundMouseDown = this.mouseDownCallback.bind(this);
        this.boundMouseMove = this.mouseMoveCallback.bind(this);
        this.boundMouseUp = this.mouseUpCallback.bind(this);
        this.boundMouseWheel = this.mouseWheelCallback.bind(this);
        this.boundMouseClick = this.mouseClickCallback.bind(this);
    }
    clear() {
        this.inputs = [];
    }
    boundKeyDown: (ke: KeyboardEvent) => void;
    boundKeyUp: (ke: KeyboardEvent) => void;
    boundMouseDown: (me: MouseEvent) => void;
    boundMouseMove: (me: MouseEvent) => void;
    boundMouseUp: (me: MouseEvent) => void;
    boundMouseWheel: (me: MouseEvent) => void;
    boundMouseClick: (me: MouseEvent) => void;
    keyDownCallback(ke: KeyboardEvent): void {
        this.inputs.push(new EventInput(InputType.KeyDown, ke))
    }
    keyUpCallback(ke: KeyboardEvent): void {
        this.inputs.push(new EventInput(InputType.KeyUp, ke))
    }
    mouseDownCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseDown, me));
    }
    mouseUpCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseUp, me));
    }
    mouseMoveCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseMove, me));
    }
    mouseWheelCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseWheel, me));
    }
    mouseClickCallback(me: MouseEvent): void {
        this.inputs.push(new EventInput(InputType.MouseClick, me));
    }
    attach(d: Document, mask = -1) {
        this.doc = d;
        if (mask & 1)
            d.addEventListener("keydown", this.boundKeyDown);
        if (mask & 2)
            d.addEventListener("keyup", this.boundKeyUp);
        if (mask & 4)
            d.addEventListener("mousemove", this.boundMouseMove);
        if (mask & 8)
            d.addEventListener("mousedown", this.boundMouseDown);
        if (mask & 0x10)
            d.addEventListener("mouseup", this.boundMouseUp);
        if (mask & 0x20)
            d.addEventListener("wheel", this.boundMouseWheel);
        if (mask & 0x40)
            d.addEventListener("click", this.boundMouseClick);
    }
    detach() {
        const d = this.doc;
        this.doc = undefined;
        if (d != undefined) {
            d.removeEventListener("keydown", this.boundKeyDown);
            d.removeEventListener("keyup", this.boundKeyUp);
            d.removeEventListener("mousemove", this.boundMouseMove);
            d.removeEventListener("mousedown", this.boundMouseDown);
            d.removeEventListener("mouseup", this.boundMouseUp);
            d.removeEventListener("wheel", this.boundMouseWheel);
            d.removeEventListener("click", this.boundMouseClick);
        }
        return d;
    }
}

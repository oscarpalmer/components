export class PalmerPopover extends HTMLElement {
    readonly button: HTMLElement;
    readonly content: HTMLElement;
    private timer;
    set open(arg: boolean);
    get open(): boolean;
    toggle(): void;
}
export type Callbacks = {
    click: (event: Event) => void;
    keydown: (event: Event) => void;
};

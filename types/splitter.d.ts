export class PalmerSplitter extends HTMLElement {
    static observedAttributes: string[];
    readonly handle: HTMLElement;
    readonly primary: HTMLElement;
    readonly secondary: HTMLElement;
    readonly separator: HTMLElement;
    set max(arg: number);
    get max(): number;
    set min(arg: number);
    get min(): number;
    set type(arg: Type);
    get type(): Type;
    set value(arg: number);
    get value(): number;
    attributeChangedCallback(name: string, _: string | undefined, value: string | undefined): void;
}
type Type = "horizontal" | "vertical";
export {};

export class PalmerAccordion extends HTMLElement {
    static observedAttributes: string[];
    set multiple(arg: boolean);
    get multiple(): boolean;
    attributeChangedCallback(name: any): void;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
export type Stored = {
    elements: HTMLDetailsElement[];
    observer: MutationObserver;
};

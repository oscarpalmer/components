(()=>{function c(e){return(e??"").trim().length===0}function d(e,t){return{capture:t??!1,passive:e??!0}}var n="palmer-disclosure",p=0;function i(e,t){e.button.setAttribute("aria-expanded",t),e.content.hidden=!t,e.dispatchEvent(new CustomEvent("toggle",{detail:t})),e.button.focus()}var s=class extends HTMLElement{get open(){return this.button.getAttribute("aria-expanded")==="true"}set open(t){typeof t=="boolean"&&t!==this.open&&i(this,t)}constructor(){super();let t=this.querySelector(`[${n}-button]`),r=this.querySelector(`[${n}-content]`);if(!(t instanceof HTMLButtonElement))throw new TypeError(`<${n}> needs a <button>-element with the attribute '${n}-button'`);if(!(r instanceof HTMLElement))throw new TypeError(`<${n}> needs an element with the attribute '${n}-content'`);this.button=t,this.content=r;let{open:u}=this;t.hidden=!1,r.hidden=!u;let{id:o}=r;c(o)&&(o=`palmer_disclosure_${++p}`),t.setAttribute("aria-expanded",u),t.setAttribute("aria-controls",o),r.id=o,t.addEventListener("click",f=>i(this,!this.open),d())}hide(){this.open&&i(this,!1)}show(){this.open||i(this,!0)}toggle(){i(this,!this.open)}};customElements.define(n,s);})();

var u={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},b=["[href]","[tabindex]","button","input","select","textarea"].map(n=>`${n}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function c(n,e,i){let t=n.getAttribute(e);return t==null||t.trim().length===0?i:t}function a(n,e){return n.replace(/\{\{(\w+)\}\}/g,(i,...t)=>t==null||t.length===0?i:String(e?.[t[0]]??i))}function r(n,e,i){typeof i=="boolean"&&n?.setAttribute(e,String(i))}var l={full:"{{label}}{{indicator}}{{status}}",indicator:'<div class="swanky-switch__indicator" aria-hidden="true"><span class="swanky-switch__indicator__value"></span></div>',label:'<div id="{{id}}" class="swanky-switch__label">{{html}}</div>',status:{item:'<span class="swanky-switch__status__{{type}}">{{html}}</span>',wrapper:'<div class="swanky-switch__status" aria-hidden="true">{{off}}{{on}}</div>'}},s=class{static addListeners(e){e.addEventListener("click",s.onToggle.bind(e),u.passive),e.addEventListener("keydown",s.onKey.bind(e),u.passive)}static initialize(e,i,t){i.parentElement?.removeChild(i),t.parentElement?.removeChild(t),r(e,"aria-checked",t.checked||e.checked),r(e,"aria-disabled",t.disabled||e.disabled),r(e,"aria-readonly",t.readOnly||e.readOnly),e.setAttribute("aria-labelledby",`${t.id}_label`),e.setAttribute("id",t.id),e.setAttribute("name",t.name??t.id),e.setAttribute("role","switch"),e.setAttribute("tabindex","0"),e.setAttribute("value",t.value);let o=c(e,"swanky-switch-off","Off"),h=c(e,"swanky-switch-on","On");e.insertAdjacentHTML("afterbegin",s.render(t.id,i,o,h)),s.addListeners(e)}static onKey(e){(e.key===" "||e.key==="Enter")&&this instanceof d&&s.toggle(this)}static onToggle(){this instanceof d&&s.toggle(this)}static render(e,i,t,o){return a(l.full,{indicator:l.indicator,label:a(l.label,{html:i.innerHTML,id:`${e}_label`}),status:a(l.status.wrapper,{off:a(l.status.item,{html:t,type:"off"}),on:a(l.status.item,{html:o,type:"on"})})})}static toggle(e){e.disabled||e.readOnly||(e.checked=!e.checked,e.dispatchEvent(new Event("change")))}},d=class extends HTMLElement{get checked(){return this.getAttribute("aria-checked")==="true"}set checked(e){r(this,"aria-checked",e)}get disabled(){return this.getAttribute("aria-disabled")==="true"}set disabled(e){r(this,"aria-disabled",e)}get readOnly(){return this.getAttribute("aria-readonly")==="true"}set readOnly(e){r(this,"aria-readonly",e)}get value(){return this.checked?"on":"off"}constructor(){if(super(),this.querySelector(".swanky-switch__label")!=null){s.addListeners(this);return}let e=this.querySelector("[swanky-switch-input]"),i=this.querySelector("[swanky-switch-label]");if(typeof e>"u"||!(e instanceof HTMLInputElement)||e.type!=="checkbox")throw new Error("<swanky-switch> must have an <input>-element with type 'checkbox' and the attribute 'swanky-switch-input'");if(typeof i>"u"||!(i instanceof HTMLElement))throw new Error("<swanky-switch> must have a <label>-element with the attribute 'swanky-switch-label'");s.initialize(this,i,e)}};globalThis.customElements.define("swanky-switch",d);

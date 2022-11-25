var j=Object.defineProperty;var U=(n,e,t)=>e in n?j(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t;var L=(n,e,t)=>(U(n,typeof e!="symbol"?e+"":e,t),t);var r={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},V=['[contenteditable]:not([contenteditable="false"])',"[href]","[tabindex]:not(slot)","audio[controls]","button","details","details[open] > summary","input","select","textarea","video[controls]"],B=V.map(n=>`${n}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function f(n){return globalThis.requestAnimationFrame?.(n)??globalThis.setTimeout?.(()=>{n(Date.now())},16)}function E(n,e){let t=typeof e=="string";if(t?n.matches(e):e(n))return n;let i=n?.parentElement;for(;i!=null;){if(i===document.body)return;if(t?i.matches(e):e(i))break;i=i.parentElement}return i??void 0}function A(n,e,t){let i=n.getAttribute(e);return i==null||i.trim().length===0?t:i}function R(n){let e=[],t=Array.from(n.querySelectorAll(B));for(let i of t){let s=globalThis.getComputedStyle?.(i);(s==null||s.display!=="none"&&s.visibility!=="hidden")&&e.push(i)}return e}function W(n){return n==null?!0:n.trim().length===0}function x(n,e){return n.replace(/\{\{(\w+)\}\}/g,(t,...i)=>i==null||i.length===0?t:String(e?.[i[0]]??t))}function d(n,e,t){t==null?n.removeAttribute(e):n.setAttribute(e,String(t))}function v(n,e,t){n.setAttribute(e,String(typeof t=="boolean"?t:!1))}var a=class{static destroyList(e){let{children:t,observer:i,open:s}=h.list;t.delete(e),s.delete(e),i.get(e)?.disconnect(),i.delete(e)}static getChildren(e){return Array.from(e.querySelectorAll(":scope > delicious-details > details, :scope > details"))}static initializeList(e){let{children:t,observer:i,open:s}=h.list;t.set(e,a.getChildren(e)),s.set(e,[]),i.set(e,new MutationObserver(o=>{D.callback(e,o)})),i.get(e)?.observe(e,D.options),a.open(e,A(e,"open",""))}static onGlobalKeydown(e){if(e.key!=="Escape")return;let{containers:t}=h.details,i=E(document.activeElement,s=>t.has(s)&&(t.get(s)?.open??!0));i instanceof q&&a.onToggle.call(i,!1)}static onLocalKeydown(e){if(e.isComposing||e.key!=="ArrowDown"&&e.key!=="ArrowUp"||!(this instanceof z))return;let{target:t}=e;if(!(t instanceof HTMLElement))return;let i=h.list.children.get(this)??[],s=t.parentElement,o=i.indexOf(s);if(o===-1)return;let l=o+(e.key==="ArrowDown"?1:-1);l<0?l=i.length-1:l>=i.length&&(l=0),i[l]?.querySelector(":scope > summary")?.focus()}static onToggle(e){if(!(this instanceof q))return;let{buttons:t,containers:i}=h.details,s=i.get(this);s!=null&&(s.open=e??!s.open,s.open||t.get(this)?.focus())}static open(e,t){if(t==null){a.update(e,[]);return}if(t.length>0&&!/^[\s\d,]+$/.test(t))throw new Error("The 'selected'-attribute of a 'delicious-details-list'-element must be a comma-separated string of numbers, e.g. '', '0' or '0,1,2'");let i=t.length>0?t.split(",").filter(s=>s.trim().length>0).map(s=>Number.parseInt(s,10)):[];a.update(e,i)}static update(e,t){if(typeof t>"u")return;let{children:i,observer:s,open:o}=h.list,l=t.filter((u,m,k)=>k.indexOf(u)===m).sort((u,m)=>u-m);e.multiple||(l=l.length>0&&l[0]!=null?l.length>1?[l[0]]:l:[]);let c=e.open;if(l.length===c.length&&l.every((u,m)=>c[m]===u))return;s.get(e)?.disconnect();let w=i.get(e)??[];for(let u of w)l.includes(w.indexOf(u))!==u.open&&(u.open=!u.open);f(()=>{o.set(e,l),d(e,"open",l.length===0?null:l),e.dispatchEvent(new Event("toggle")),f(()=>s.get(e)?.observe(e,D.options))})}},D=class{static callback(e,t){if(t.length===0)return;let{children:i}=h.list,s=t[0],o=Array.from(s?.addedNodes??[]),l=Array.from(s?.removedNodes??[]);if(o.concat(l).some(k=>k.parentElement===e)){i.set(e,a.getChildren(e));return}if(s?.type!=="attributes"||!(s?.target instanceof HTMLDetailsElement))return;let c=s.target,u=(i.get(e)??[]).indexOf(c);if(u===-1)return;let m=[];e.multiple?m=c.open?e.open.concat([u]):e.open.filter(k=>k!==u):m=c.open?[u]:[],a.update(e,m)}};L(D,"options",{attributeFilter:["open"],attributes:!0,childList:!0,subtree:!0});var h=class{};L(h,"details",{buttons:new WeakMap,containers:new WeakMap}),L(h,"list",{children:new WeakMap,observer:new WeakMap,open:new WeakMap});var q=class extends HTMLElement{get open(){return h.details.containers.get(this)?.open??!1}set open(e){a.onToggle.call(this,e)}connectedCallback(){let e=this.querySelector(":scope > details"),t=e?.querySelector(":scope > summary");h.details.buttons.set(this,t),h.details.containers.set(this,e)}disconnectedCallback(){h.details.buttons.delete(this),h.details.containers.delete(this)}toggle(){a.onToggle.call(this)}},z=class extends HTMLElement{static get observedAttributes(){return["multiple","open"]}get multiple(){return this.getAttribute("multiple")!=null}set multiple(e){d(this,"multiple",e?"":null)}get open(){return h.list.open.get(this)??[]}set open(e){a.update(this,e)}constructor(){super(),this.addEventListener("keydown",a.onLocalKeydown.bind(this),r.passive)}attributeChangedCallback(e,t,i){if(t!==i)switch(e){case"multiple":a.open(this,A(this,"open",""));break;case"open":a.open(this,i);break;default:break}}connectedCallback(){a.initializeList(this)}disconnectedCallback(){a.destroyList(this)}};globalThis.addEventListener("keydown",a.onGlobalKeydown,r.passive);globalThis.customElements.define("delicious-details",q);globalThis.customElements.define("delicious-details-list",z);var T="formal-focus-trap",I=new WeakMap,P=class{static observer(e){for(let t of e){if(t.type!=="attributes")continue;let i=t.target;i.getAttribute(T)==null?C.destroy(i):C.create(i)}}static onKeydown(e){if(e.key!=="Tab")return;let t=e.target,i=E(t,`[${T}]`);i!=null&&(e.preventDefault(),e.stopImmediatePropagation(),P.handle(e,i,t))}static handle(e,t,i){let s=R(t);if(i===t){f(()=>{(s[e.shiftKey?s.length-1:0]??t).focus()});return}let o=s.indexOf(i),l=t;if(o>-1){let c=o+(e.shiftKey?-1:1);c<0?c=s.length-1:c>=s.length&&(c=0),l=s[c]??t}f(()=>{l.focus()})}},C=class{tabIndex;constructor(e){this.tabIndex=e.tabIndex,d(e,"tabindex","-1")}static create(e){I.has(e)||I.set(e,new C(e))}static destroy(e){let t=I.get(e);t!=null&&(d(e,"tabindex",t.tabIndex),I.delete(e))}};(()=>{if(typeof globalThis._formalFocusTrap<"u")return;globalThis._formalFocusTrap=null,new MutationObserver(P.observer).observe(document,{attributeFilter:[T],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0}),f(()=>{let e=Array.from(document.querySelectorAll(`[${T}]`));for(let t of e)t.setAttribute(T,"")}),document.addEventListener("keydown",P.onKeydown,r.active)})();var N=["above","above-left","above-right","below","below-left","below-right","horizontal","left","right","vertical"],y=class{static update(e,t){let{anchor:i,floater:s,parent:o}=e;function l(){if(s.hidden){i.insertAdjacentElement("afterend",s);return}let c=y.getPosition((o??i).getAttribute("position")??"",t),w={anchor:i.getBoundingClientRect(),floater:s.getBoundingClientRect()},u=y.getTop(w,c),k=`matrix(1, 0, 0, 1, ${y.getLeft(w,c)}, ${u})`;s.style.position="fixed",s.style.inset="0 auto auto 0",s.style.transform=k,f(l)}document.body.appendChild(s),s.hidden=!1,f(l)}static getLeft(e,t){let{left:i,right:s}=e.anchor,{width:o}=e.floater;switch(t){case"above":case"below":case"vertical":return i+e.anchor.width/2-o/2;case"above-left":case"below-left":return i;case"above-right":case"below-right":return s-o;case"horizontal":return s+o>globalThis.innerWidth?i-o<0?s:i-o:s;case"left":return i-o;case"right":return s;default:return 0}}static getTop(e,t){let{bottom:i,top:s}=e.anchor,{height:o}=e.floater;switch(t){case"above":case"above-left":case"above-right":return s-o;case"below":case"below-left":case"below-right":return i;case"horizontal":case"left":case"right":return s+e.anchor.height/2-o/2;case"vertical":return i+o>globalThis.innerHeight?s-o<0?i:s-o:i;default:return 0}}static getPosition(e,t){if(e==null)return t;let i=e.trim().toLowerCase(),s=N.indexOf(i);return s>-1?N[s]??t:t}};var J=0,b=class{static initialize(e,t,i){i.hidden=!0,W(e.id)&&d(e,"id",`polite_popover_${J++}`),W(t.id)&&d(t,"id",`${e.id}_button`),W(i.id)&&d(i,"id",`${e.id}_content`),d(t,"aria-controls",i.id),v(t,"aria-expanded",!1),d(t,"aria-haspopup","dialog"),d(i,T,""),d(i,"role","dialog"),d(i,"aria-modal","false"),t.addEventListener("click",b.toggle.bind(e),r.passive)}static onClick(e){this instanceof O&&this.open&&b.handleGlobalEvent(e,this,e.target)}static onKeydown(e){this instanceof O&&this.open&&e instanceof KeyboardEvent&&e.key==="Escape"&&b.handleGlobalEvent(e,this,document.activeElement)}static toggle(e){let t=this instanceof O?p.elements.get(this):null;t!=null&&b.handleToggle(this,t,e)}static afterToggle(e,t,i){b.handleCallbacks(e,i),i?(R(t.floater)?.[0]??t.floater).focus():t.anchor.focus()}static handleCallbacks(e,t){let i=p.callbacks.get(e);if(i==null)return;let s=t?"addEventListener":"removeEventListener";document[s]("click",i.click,r.passive),document[s]("keydown",i.keydown,r.passive)}static handleGlobalEvent(e,t,i){let s=p.elements.get(t);if(s==null)return;let o=E(i,"[polite-popover-content]");if(o==null){this.handleToggle(t,s,!1);return}e.stopPropagation();let l=Array.from(document.body.children);l.indexOf(o)-l.indexOf(s.floater)<(e instanceof KeyboardEvent?1:0)&&b.handleToggle(t,s,!1)}static handleToggle(e,t,i){let s=typeof i=="boolean"?!i:e.open;v(t.anchor,"aria-expanded",!s),s?(t.floater.hidden=!0,b.afterToggle(e,t,!1)):(y.update({anchor:t.anchor,floater:t.floater,parent:e},"below-left"),f(()=>{b.afterToggle(e,t,!0)})),e.dispatchEvent(new Event("toggle"))}},H=class{static add(e){let t=e.querySelector(":scope > [polite-popover-button]"),i=e.querySelector(":scope > [polite-popover-content]");t==null||i==null||(H.callbacks.set(e,{click:b.onClick.bind(e),keydown:b.onKeydown.bind(e)}),H.elements.set(e,{anchor:t,floater:i}))}static remove(e){let t=H.elements.get(e);t?.floater instanceof HTMLElement&&(t.floater.hidden=!0,t.anchor?.insertAdjacentElement("afterend",t.floater)),H.callbacks.delete(e),H.elements.delete(e)}},p=H;L(p,"callbacks",new WeakMap),L(p,"elements",new WeakMap);var O=class extends HTMLElement{get button(){return p.elements.get(this)?.anchor}get content(){return p.elements.get(this)?.floater}get open(){return this.button?.getAttribute("aria-expanded")==="true"}set open(e){b.toggle.call(this,e)}constructor(){super();let e=this.querySelector(":scope > [polite-popover-button]"),t=this.querySelector(":scope > [polite-popover-content]");if(e==null||!(e instanceof HTMLButtonElement||e instanceof HTMLElement&&e.getAttribute("role")==="button"))throw new Error("<polite-popover> must have a <button>-element (or button-like element) with the attribute 'polite-popover-button'");if(t==null||!(t instanceof HTMLElement))throw new Error("<polite-popover> must have an element with the attribute 'polite-popover-content'");b.initialize(this,e,t)}connectedCallback(){p.add(this)}disconnectedCallback(){p.remove(this)}toggle(){b.toggle.call(this)}};globalThis.customElements.define("polite-popover",O);var S={full:"{{label}}{{indicator}}{{status}}",indicator:'<div class="swanky-switch__indicator" aria-hidden="true"><span class="swanky-switch__indicator__value"></span></div>',label:'<div id="{{id}}" class="swanky-switch__label">{{html}}</div>',status:{item:'<span class="swanky-switch__status__{{type}}">{{html}}</span>',wrapper:'<div class="swanky-switch__status" aria-hidden="true">{{off}}{{on}}</div>'}},g=class{static addListeners(e){e.addEventListener("click",g.onToggle.bind(e),r.passive),e.addEventListener("keydown",g.onKey.bind(e),r.passive)}static initialize(e,t,i){t.parentElement?.removeChild(t),i.parentElement?.removeChild(i),v(e,"aria-checked",i.checked||e.checked),v(e,"aria-disabled",i.disabled||e.disabled),v(e,"aria-readonly",i.readOnly||e.readOnly),e.setAttribute("aria-labelledby",`${i.id}_label`),e.setAttribute("id",i.id),e.setAttribute("name",i.name??i.id),e.setAttribute("role","switch"),e.setAttribute("tabindex","0"),e.setAttribute("value",i.value);let s=A(e,"swanky-switch-off","Off"),o=A(e,"swanky-switch-on","On");e.insertAdjacentHTML("afterbegin",g.render(i.id,t,s,o)),g.addListeners(e)}static onKey(e){(e.key===" "||e.key==="Enter")&&this instanceof $&&g.toggle(this)}static onToggle(){this instanceof $&&g.toggle(this)}static render(e,t,i,s){return x(S.full,{indicator:S.indicator,label:x(S.label,{html:t.innerHTML,id:`${e}_label`}),status:x(S.status.wrapper,{off:x(S.status.item,{html:i,type:"off"}),on:x(S.status.item,{html:s,type:"on"})})})}static toggle(e){e.disabled||e.readOnly||(e.checked=!e.checked,e.dispatchEvent(new Event("change")))}},$=class extends HTMLElement{get checked(){return this.getAttribute("aria-checked")==="true"}set checked(e){v(this,"aria-checked",e)}get disabled(){return this.getAttribute("aria-disabled")==="true"}set disabled(e){v(this,"aria-disabled",e)}get readOnly(){return this.getAttribute("aria-readonly")==="true"}set readOnly(e){v(this,"aria-readonly",e)}get value(){return this.checked?"on":"off"}constructor(){if(super(),this.querySelector(".swanky-switch__label")!=null){g.addListeners(this);return}let e=this.querySelector("[swanky-switch-input]"),t=this.querySelector("[swanky-switch-label]");if(typeof e>"u"||!(e instanceof HTMLInputElement)||e.type!=="checkbox")throw new Error("<swanky-switch> must have an <input>-element with type 'checkbox' and the attribute 'swanky-switch-input'");if(typeof t>"u"||!(t instanceof HTMLElement))throw new Error("<swanky-switch> must have a <label>-element with the attribute 'swanky-switch-label'");g.initialize(this,t,e)}};globalThis.customElements.define("swanky-switch",$);var K="toasty-tooltip",Q=`${K}-content`,F=new WeakMap,G=class{static observer(e){for(let t of e){if(t.type!=="attributes")continue;let i=t.target;i.getAttribute(K)==null?M.destroy(i):M.create(i)}}},M=class{constructor(e){this.anchor=e;this.focusable=e.matches(B),this.floater=M.createFloater(e),this.handleCallbacks(!0)}callbacks={click:this.onClick.bind(this),hide:this.onHide.bind(this),keydown:this.onKeyDown.bind(this),show:this.onShow.bind(this)};floater;focusable;static create(e){F.has(e)||F.set(e,new M(e))}static destroy(e){let t=F.get(e);typeof t>"u"||(t.handleCallbacks(!1),F.delete(e))}static createFloater(e){let t=e.getAttribute("aria-describedby")??e.getAttribute("aria-labelledby"),i=t==null?null:document.getElementById(t);if(i==null)throw new Error(`A '${K}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);return i.hidden=!0,d(i,Q,""),d(i,"role","tooltip"),v(i,"aria-hidden",!0),i}onClick(e){E(e.target,t=>[this.anchor,this.floater].includes(t))==null&&this.toggle(!1)}onHide(){this.toggle(!1)}onKeyDown(e){e instanceof KeyboardEvent&&e.key==="Escape"&&this.toggle(!1)}onShow(){this.toggle(!0)}toggle(e){let t=e?"addEventListener":"removeEventListener";document[t]("click",this.callbacks.click,r.passive),document[t]("keydown",this.callbacks.keydown,r.passive),e?y.update(this,"above"):this.floater.hidden=!0}handleCallbacks(e){let{anchor:t,floater:i,focusable:s}=this,o=e?"addEventListener":"removeEventListener";for(let l of[t,i])l[o]("mouseenter",this.callbacks.show,r.passive),l[o]("mouseleave",this.callbacks.hide,r.passive),l[o]("touchstart",this.callbacks.show,r.passive);s&&(t[o]("blur",this.callbacks.hide,r.passive),t[o]("focus",this.callbacks.show,r.passive))}},X=new MutationObserver(G.observer);X.observe(document,{attributeFilter:[K],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});f(()=>{let n=Array.from(document.querySelectorAll(`[${K}]`));for(let e of n)e.setAttribute(K,"")});

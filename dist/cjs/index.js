"use strict";var I=Object.defineProperty;var N=(l,e,t)=>e in l?I(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var k=(l,e,t)=>(N(l,typeof e!="symbol"?e+"":e,t),t);var h={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},q=["[href]","[tabindex]","button","input","select","textarea"].map(l=>`${l}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function y(l){var e,t,i;return(i=(e=globalThis.requestAnimationFrame)==null?void 0:e.call(globalThis,l))!=null?i:(t=globalThis.setTimeout)==null?void 0:t.call(globalThis,()=>{l(Date.now())},16)}function B(l,e){let t=l==null?void 0:l.parentElement;for(;t!=null;){if(t===document.body)return;if(e(t))break;t=t.parentElement}return t!=null?t:void 0}function T(l,e,t){let i=l.getAttribute(e);return i==null||i.trim().length===0?t:i}function z(l){var i;let e=[],t=Array.from(l.querySelectorAll(q));for(let s of t){let n=(i=globalThis.getComputedStyle)==null?void 0:i.call(globalThis,s);(n==null||n.display!=="none"&&n.visibility!=="hidden")&&e.push(s)}return e}function F(l){return l==null?!0:l.trim().length===0}function M(l,e){return l.replace(/\{\{(\w+)\}\}/g,(t,...i)=>{var s;return i==null||i.length===0?t:String((s=e==null?void 0:e[i[0]])!=null?s:t)})}function D(l,e,t){t==null?l.removeAttribute(e):l.setAttribute(e,String(t))}function m(l,e,t){typeof t=="boolean"&&(l==null||l.setAttribute(e,String(t)))}var u=class{static destroyList(e){var n;let{children:t,observer:i,open:s}=b.list;t.delete(e),s.delete(e),(n=i.get(e))==null||n.disconnect(),i.delete(e)}static getChildren(e){return Array.from(e.querySelectorAll(":scope > delicious-details > details, :scope > details"))}static initializeList(e){var n;let{children:t,observer:i,open:s}=b.list;t.set(e,u.getChildren(e)),s.set(e,[]),i.set(e,new MutationObserver(o=>{x.callback(e,o)})),(n=i.get(e))==null||n.observe(e,x.options),u.open(e,T(e,"open",""))}static onGlobalKeydown(e){if(e.key!=="Escape")return;let{containers:t}=b.details,i=B(document.activeElement,s=>{var n,o;return t.has(s)&&((o=(n=t.get(s))==null?void 0:n.open)!=null?o:!0)});i instanceof O&&u.onToggle.call(i,!1)}static onLocalKeydown(e){var c;if(e.isComposing||e.key!=="ArrowDown"&&e.key!=="ArrowUp"||!(this instanceof K))return;let{target:t}=e;if(!(t instanceof HTMLElement))return;let i=(c=b.list.children.get(this))!=null?c:[],s=t.parentElement,n=i.indexOf(s);if(n===-1)return;let o=n+(e.key==="ArrowDown"?1:-1);o<0?o=i.length-1:o>=i.length&&(o=0);let a=i[o],d=a==null?void 0:a.querySelector(":scope > summary");d==null||d.focus()}static onToggle(e){var n;if(!(this instanceof O))return;let{buttons:t,containers:i}=b.details,s=i.get(this);s!=null&&(s.open=e!=null?e:!s.open,s.open||(n=t.get(this))==null||n.focus())}static open(e,t){if(t==null){u.update(e,[]);return}if(t.length>0&&!/^[\s\d,]+$/.test(t))throw new Error("The 'selected'-attribute of a 'delicious-details-list'-element must be a comma-separated string of numbers, e.g. '', '0' or '0,1,2'");let i=t.length>0?t.split(",").filter(s=>s.trim().length>0).map(s=>Number.parseInt(s,10)):[];u.update(e,i)}static update(e,t){var c,f;if(typeof t=="undefined")return;let{children:i,observer:s,open:n}=b.list,o=t.filter((r,g,W)=>W.indexOf(r)===g).sort((r,g)=>r-g);e.multiple||(o=o.length>0&&o[0]!=null?o.length>1?[o[0]]:o:[]);let a=e.open;if(o.length===a.length&&o.every((r,g)=>a[g]===r))return;(c=s.get(e))==null||c.disconnect();let d=(f=i.get(e))!=null?f:[];for(let r of d)o.includes(d.indexOf(r))!==r.open&&(r.open=!r.open);y(()=>{n.set(e,o),D(e,"open",o.length===0?null:o),e.dispatchEvent(new Event("toggle")),y(()=>{var r;return(r=s.get(e))==null?void 0:r.observe(e,x.options)})})}},x=class{static callback(e,t){var r,g,W;if(t.length===0)return;let{children:i}=b.list,s=t[0],n=Array.from((r=s==null?void 0:s.addedNodes)!=null?r:[]),o=Array.from((g=s==null?void 0:s.removedNodes)!=null?g:[]);if(n.concat(o).some(V=>V.parentElement===e)){i.set(e,u.getChildren(e));return}if((s==null?void 0:s.type)!=="attributes"||!((s==null?void 0:s.target)instanceof HTMLDetailsElement))return;let a=s.target,c=((W=i.get(e))!=null?W:[]).indexOf(a);if(c===-1)return;let f=[];e.multiple?f=a.open?e.open.concat([c]):e.open.filter(V=>V!==c):f=a.open?[c]:[],u.update(e,f)}};k(x,"options",{attributeFilter:["open"],attributes:!0,childList:!0,subtree:!0});var b=class{};k(b,"details",{buttons:new WeakMap,containers:new WeakMap}),k(b,"list",{children:new WeakMap,observer:new WeakMap,open:new WeakMap});var O=class extends HTMLElement{get open(){var e,t;return(t=(e=b.details.containers.get(this))==null?void 0:e.open)!=null?t:!1}set open(e){u.onToggle.call(this,e)}connectedCallback(){let e=this.querySelector(":scope > details"),t=e==null?void 0:e.querySelector(":scope > summary");b.details.buttons.set(this,t),b.details.containers.set(this,e)}disconnectedCallback(){b.details.buttons.delete(this),b.details.containers.delete(this)}toggle(){u.onToggle.call(this)}},K=class extends HTMLElement{static get observedAttributes(){return["multiple","open"]}get multiple(){return this.getAttribute("multiple")!=null}set multiple(e){D(this,"multiple",e?"":null)}get open(){var e;return(e=b.list.open.get(this))!=null?e:[]}set open(e){u.update(this,e)}constructor(){super(),this.addEventListener("keydown",u.onLocalKeydown.bind(this),h.passive)}attributeChangedCallback(e,t,i){if(t!==i)switch(e){case"multiple":u.open(this,T(this,"open",""));break;case"open":u.open(this,i);break;default:break}}connectedCallback(){u.initializeList(this)}disconnectedCallback(){u.destroyList(this)}};addEventListener==null||addEventListener("keydown",u.onGlobalKeydown,h.passive);customElements==null||customElements.define("delicious-details",O);customElements==null||customElements.define("delicious-details-list",K);var L=class{static update(e,t,i){let{anchor:s,floater:n,parent:o}=e,{after:a,getPosition:d,validate:c}=i;function f(){if(!c())return;let r=L.getType(o!=null?o:s,t),g=d(r,{anchor:s.getBoundingClientRect(),floater:n.getBoundingClientRect(),parent:o==null?void 0:o.getBoundingClientRect()});L.setPosition(n,g),a==null||a(),y(f)}y(f)}static getType(e,t){let i=T(e,"position",t.default);return t.all.includes(i)?i:t.default}static setPosition(e,t){let{left:i,top:s}=t.coordinate;e.setAttribute("position",t.type),e.style.inset="0 auto auto 0",e.style.position="fixed",e.style.transform=`translate3d(${i}px, ${s}px, 0)`,e.hidden&&y(()=>{e.hidden=!1})}};var j=0,G=["any"].concat(...["above","below"].map(l=>[l,`${l}-left`,`${l}-right`])),v=class{static getPosition(e,t){let i=v.getValue(e,["left","right"],t,!0),s=v.getValue(e,["below","above"],t,!1),n=t.anchor.left===i?"left":"right";if(e!=="any")return{coordinate:{left:i,top:s},type:["above","below"].includes(e)?`${e}-${n}`:e};let o=t.anchor.bottom===s?"below":"above";return{coordinate:{left:i,top:s},type:`${o}-${n}`}}static getValue(e,t,i,s){var r;let{anchor:n,floater:o}=i,a=s?o.width:o.height,d=s?n.left:n.bottom,c=(s?n.right:n.top)-a;return t.some(g=>e.includes(g))?e.includes((r=t[0])!=null?r:"_")?d:c:d+a<=(s?globalThis.innerWidth:globalThis.innerHeight)||c<0?d:c}static initialize(e,t,i){i.hidden=!0,F(i.id)&&i.setAttribute("id",F(e.id)?`polite_popover_${j++}`:`${e.id}_content`),t.setAttribute("aria-controls",i.id),t.setAttribute("aria-expanded","false"),i.setAttribute("tabindex","-1"),t.addEventListener("click",v.toggle.bind(e),h.passive)}static onClick(e){var s;if(!(this instanceof A)||!this.open)return;let t=p.values.anchors.get(this),i=p.values.floaters.get(this);e.target!==t&&e.target!==i&&!((s=i==null?void 0:i.contains(e.target))!=null&&s)&&v.toggle.call(this,!1)}static onKeydown(e){var o;if(!(this instanceof A)||!this.open||!(e instanceof KeyboardEvent))return;e.key==="Escape"&&v.toggle.call(this,!1);let t=p.values.floaters.get(this);if(e.key!=="Tab"||t==null)return;e.preventDefault();let i=z(t);if(document.activeElement===t){y(()=>{var a;((a=i[e.shiftKey?i.length-1:0])!=null?a:t).focus()});return}let s=i.indexOf(document.activeElement),n=t;if(s>-1){let a=s+(e.shiftKey?-1:1);a<0?a=i.length-1:a>=i.length&&(a=0),n=(o=i[a])!=null?o:t}y(()=>{n.focus()})}static toggle(e){var c;if(!(this instanceof A))return;let t=p.values.anchors.get(this),i=p.values.floaters.get(this);if(t==null||i==null)return;let s=typeof e=="boolean"?!e:this.open,n=p.values.click.get(this),o=p.values.keydown.get(this),a=s?"removeEventListener":"addEventListener";if(n!=null&&document[a]("click",n,h.passive),o!=null&&document[a]("keydown",o,h.active),s?(c=i.parentElement)==null||c.removeChild(i):document.body.appendChild(i),m(t,"aria-expanded",!s),this.dispatchEvent(new Event("toggle")),s){t.focus();return}let d=!1;L.update({anchor:t,floater:i,parent:this},{all:G,default:"below"},{after(){d||(d=!0,y(()=>{var f;((f=z(i)[0])!=null?f:i).focus()}))},getPosition:v.getPosition,validate:()=>this.open})}},E=class{static add(e){var s,n,o,a;let t=e.querySelector(":scope > [polite-popover-button]"),i=e.querySelector(":scope > [polite-popover-content]");t==null||i==null||((s=E.values.anchors)==null||s.set(e,t),(n=E.values.floaters)==null||n.set(e,i),(o=E.values.click)==null||o.set(e,v.onClick.bind(e)),(a=E.values.keydown)==null||a.set(e,v.onKeydown.bind(e)))}static remove(e){let t=E.values.floaters.get(e);t!=null&&(t.hidden=!0,e.appendChild(t)),E.values.anchors.delete(e),E.values.floaters.delete(e),E.values.click.delete(e),E.values.keydown.delete(e)}},p=E;k(p,"values",{anchors:new WeakMap,click:new WeakMap,floaters:new WeakMap,keydown:new WeakMap});var A=class extends HTMLElement{get button(){return p.values.anchors.get(this)}get content(){return p.values.floaters.get(this)}get open(){var e;return((e=this.button)==null?void 0:e.getAttribute("aria-expanded"))==="true"}set open(e){v.toggle.call(this,e)}constructor(){super();let e=this.querySelector(":scope > [polite-popover-button]"),t=this.querySelector(":scope > [polite-popover-content]");if(e==null||!(e instanceof HTMLButtonElement||e instanceof HTMLElement&&e.getAttribute("role")==="button"))throw new Error("<polite-popover> must have a <button>-element (or button-like element) with the attribute 'polite-popover-button'");if(t==null||!(t instanceof HTMLElement))throw new Error("<polite-popover> must have an element with the attribute 'polite-popover-content'");v.initialize(this,e,t)}connectedCallback(){p.add(this)}disconnectedCallback(){p.remove(this)}toggle(){v.toggle.call(this)}};customElements==null||customElements.define("polite-popover",A);var P={full:"{{label}}{{indicator}}{{status}}",indicator:'<div class="swanky-switch__indicator" aria-hidden="true"><span class="swanky-switch__indicator__value"></span></div>',label:'<div id="{{id}}" class="swanky-switch__label">{{html}}</div>',status:{item:'<span class="swanky-switch__status__{{type}}">{{html}}</span>',wrapper:'<div class="swanky-switch__status" aria-hidden="true">{{off}}{{on}}</div>'}},w=class{static addListeners(e){e.addEventListener("click",w.onToggle.bind(e),h.passive),e.addEventListener("keydown",w.onKey.bind(e),h.passive)}static initialize(e,t,i){var o,a,d;(o=t.parentElement)==null||o.removeChild(t),(a=i.parentElement)==null||a.removeChild(i),m(e,"aria-checked",i.checked||e.checked),m(e,"aria-disabled",i.disabled||e.disabled),m(e,"aria-readonly",i.readOnly||e.readOnly),e.setAttribute("aria-labelledby",`${i.id}_label`),e.setAttribute("id",i.id),e.setAttribute("name",(d=i.name)!=null?d:i.id),e.setAttribute("role","switch"),e.setAttribute("tabindex","0"),e.setAttribute("value",i.value);let s=T(e,"swanky-switch-off","Off"),n=T(e,"swanky-switch-on","On");e.insertAdjacentHTML("afterbegin",w.render(i.id,t,s,n)),w.addListeners(e)}static onKey(e){(e.key===" "||e.key==="Enter")&&this instanceof S&&w.toggle(this)}static onToggle(){this instanceof S&&w.toggle(this)}static render(e,t,i,s){return M(P.full,{indicator:P.indicator,label:M(P.label,{html:t.innerHTML,id:`${e}_label`}),status:M(P.status.wrapper,{off:M(P.status.item,{html:i,type:"off"}),on:M(P.status.item,{html:s,type:"on"})})})}static toggle(e){e.disabled||e.readOnly||(e.checked=!e.checked,e.dispatchEvent(new Event("change")))}},S=class extends HTMLElement{get checked(){return this.getAttribute("aria-checked")==="true"}set checked(e){m(this,"aria-checked",e)}get disabled(){return this.getAttribute("aria-disabled")==="true"}set disabled(e){m(this,"aria-disabled",e)}get readOnly(){return this.getAttribute("aria-readonly")==="true"}set readOnly(e){m(this,"aria-readonly",e)}get value(){return this.checked?"on":"off"}constructor(){if(super(),this.querySelector(".swanky-switch__label")!=null){w.addListeners(this);return}let e=this.querySelector("[swanky-switch-input]"),t=this.querySelector("[swanky-switch-label]");if(typeof e=="undefined"||!(e instanceof HTMLInputElement)||e.type!=="checkbox")throw new Error("<swanky-switch> must have an <input>-element with type 'checkbox' and the attribute 'swanky-switch-input'");if(typeof t=="undefined"||!(t instanceof HTMLElement))throw new Error("<swanky-switch> must have a <label>-element with the attribute 'swanky-switch-label'");w.initialize(this,t,e)}};customElements==null||customElements.define("swanky-switch",S);var R="toasty-tooltip",$=new WeakMap,U=["above","below","horizontal","left","right","vertical"],H=class{static getPosition(e,t){let i=H.getValue(e,["horizontal","left","right"],t,!0),s=H.getValue(e,["vertical","above","below"],t,!1);return["horizontal","vertical"].includes(e)?{coordinate:{left:i,top:s},type:e==="horizontal"?i===t.anchor.right?"right":"left":s===t.anchor.bottom?"below":"above"}:{coordinate:{left:i,top:s},type:e}}static getValue(e,t,i,s){let{anchor:n,floater:o}=i,a=s?n.right:n.bottom,d=s?n.left:n.top,c=s?o.width:o.height,f=t.indexOf(e);if(f===-1)return d+(s?n.width:n.height)/2-c/2;let r=d-c;return f>0?f===1?r:a:a+c<=(s?globalThis.innerWidth:globalThis.innerHeight)||r<0?a:r}static observer(e){for(let t of e){if(t.type!=="attributes")continue;let i=t.target;i.getAttribute(R)==null?C.destroy(i):C.create(i)}}},C=class{constructor(e){this.anchor=e;k(this,"floater");k(this,"callbacks");k(this,"focusable");this.focusable=e.matches(q),this.callbacks={click:this.onClick.bind(this),hide:this.onHide.bind(this),key:this.onKey.bind(this),show:this.onShow.bind(this)},this.floater=this.createFloater(),this.handleCallbacks(!0)}static create(e){$.has(e)||$.set(e,new C(e))}static destroy(e){let t=$.get(e);typeof t!="undefined"&&(t.handleCallbacks(!1),$.delete(e))}onClick(){this.handleFloater(!1)}onHide(){this.handleFloater(!1)}onKey(e){e instanceof KeyboardEvent&&e.key==="Escape"&&this.handleFloater(!1)}onShow(){let{anchor:e,floater:t}=this;if(t.parentElement!=null)return;let i=this.getContent();typeof i!="undefined"&&(t.innerHTML=i.innerHTML,this.handleFloater(!0),L.update({anchor:e,floater:t},{all:U,default:"above"},{getPosition:H.getPosition,validate:()=>t.parentElement!=null}))}createFloater(){let e=document.createElement("div");return D(e,`${R}-content`,""),m(e,"aria-hidden",!0),e.hidden=!0,e}getContent(){var t,i;let e=(t=this.anchor.getAttribute("aria-describedby"))!=null?t:this.anchor.getAttribute("aria-labelledby");if(e!=null)return(i=document.getElementById(e))!=null?i:void 0}handleCallbacks(e){let{anchor:t,callbacks:i,focusable:s}=this,n=e?"addEventListener":"removeEventListener";t[n]("mouseenter",i.show,h.passive),t[n]("mouseleave",i.hide,h.passive),t[n]("touchstart",i.show,h.passive),s&&(t[n]("blur",i.hide,h.passive),t[n]("focus",i.show,h.passive))}handleFloater(e){var n;let{callbacks:t,floater:i}=this,s=e?"addEventListener":"removeEventListener";document[s]("keydown",t.key,h.passive),document[s]("pointerdown",t.click,h.passive),e?document.body.appendChild(i):(n=this.floater.parentElement)==null||n.removeChild(this.floater)}},J=new MutationObserver(H.observer);J.observe(document,{attributeFilter:[R],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});y(()=>{let l=Array.from(document.querySelectorAll(`[${R}]`));for(let e of l)e.setAttribute(R,"")});

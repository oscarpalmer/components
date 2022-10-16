var $=Object.defineProperty;var z=(l,e,t)=>e in l?$(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var k=(l,e,t)=>(z(l,typeof e!="symbol"?e+"":e,t),t);var d={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},O=["[href]","[tabindex]","button","input","select","textarea"].map(l=>`${l}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function p(l){return requestAnimationFrame?.(l)??setTimeout?.(()=>{l(Date.now())},16)}function S(l,e){let t=l?.parentElement;for(;t!=null;){if(t===document.body)return;if(e(t))break;t=t.parentElement}return t??void 0}function A(l,e,t){let i=l.getAttribute(e);return i==null||i.trim().length===0?t:i}function W(l){let e=[],t=Array.from(l.querySelectorAll(O));for(let i of t){let n=window?.getComputedStyle?.(i);(n==null||n.display!=="none"&&n.visibility!=="hidden")&&e.push(i)}return e}function K(){return URL.createObjectURL(new Blob).replace(/^.*\/([\w-]+)$/,"$1").replace(/-/g,"_")}function E(l,e,t){typeof t=="boolean"&&l?.setAttribute(e,String(t))}var u=class{static getChildren(e){return Array.from(e.querySelectorAll(":scope > delicious-details > details, :scope > details"))}static initializeList(e){let{children:t,connected:i,observer:n,open:s}=h.list;i.set(e),t.set(e,u.getChildren(e)),s.set(e,[]),n.set(e,new MutationObserver(o=>{L.callback(e,o)})),n.get(e)?.observe(e,L.options),e.addEventListener("keydown",u.onLocalKeydown.bind(e),d.passive),u.open(e,e.getAttribute("open")??void 0)}static onGlobalKeydown(e){if(e.key!=="Escape")return;let{containers:t}=h.details,i=S(document.activeElement,n=>t.has(n)&&(t.get(n)?.open??!0));i instanceof P&&u.onToggle.call(i,!1)}static onLocalKeydown(e){if(e.isComposing||e.key!=="ArrowDown"&&e.key!=="ArrowUp"||!(this instanceof D))return;let{target:t}=e;if(!(t instanceof HTMLElement))return;let i=h.list.children.get(this)??[],n=t.parentElement,s=i.indexOf(n);if(s===-1)return;let o=s+(e.key==="ArrowDown"?1:-1);o<0?o=i.length-1:o>=i.length&&(o=0),i[o]?.querySelector(":scope > summary")?.focus()}static onToggle(e){if(!(this instanceof P))return;let{buttons:t,containers:i}=h.details,n=i.get(this);n!=null&&(n.open=e??!n.open,n.open||t.get(this)?.focus())}static open(e,t){if(t==null)return;if(t.length>0&&!/^[\s\d,]+$/.test(t))throw new Error("The 'selected'-attribute of a 'delicious-details-list'-element must be a comma-separated string of numbers, e.g. '', '0' or '0,1,2'");let i=t.length>0?t.split(",").filter(n=>n.trim().length>0).map(n=>Number.parseInt(n,10)):[];u.update(e,i)}static update(e,t){if(typeof t>"u")return;let{children:i,observer:n,open:s}=h.list,o=t.filter((r,c,b)=>b.indexOf(r)===c).sort((r,c)=>r-c);if(e.multiple||(o=o.length>0&&o[0]!=null?o.length>1?[o[0]]:o:[]),o.every((r,c)=>e.open[c]===r))return;n.get(e)?.disconnect();let a=i.get(e)??[];for(let r of a)o.includes(a.indexOf(r))!==r.open&&(r.open=!r.open);s.set(e,o),p(()=>{o.length===0?e.removeAttribute("open"):e.setAttribute("open",o.join(",")),p(()=>n.get(e)?.observe(e,L.options))})}},L=class{static callback(e,t){if(t.length===0)return;let{children:i}=h.list,n=t[0],s=Array.from(n?.addedNodes??[]),o=Array.from(n?.removedNodes??[]);if(s.concat(o).some(v=>v.parentElement===e)){i.set(e,u.getChildren(e));return}if(n?.type!=="attributes"||!(n?.target instanceof HTMLDetailsElement))return;let a=n.target,c=(i.get(e)??[]).indexOf(a);if(c===-1)return;let b=[];e.multiple?b=a.open?e.open.concat([c]):e.open.filter(v=>v!==c):b=a.open?[c]:[],u.update(e,b)}};k(L,"options",{attributeFilter:["open"],attributes:!0,childList:!0,subtree:!0});var h=class{};k(h,"details",{buttons:new WeakMap,connected:new WeakMap,containers:new WeakMap}),k(h,"list",{children:new WeakMap,connected:new WeakMap,observer:new WeakMap,open:new WeakMap});var P=class extends HTMLElement{get open(){return h.details.containers.get(this)?.open??!1}set open(e){u.onToggle.call(this,e)}connectedCallback(){if(h.details.connected.has(this))return;let e=this.querySelector(":scope > details"),t=e?.querySelector(":scope > summary");h.details.connected.set(this),h.details.buttons.set(this,t),h.details.containers.set(this,e)}toggle(){u.onToggle.call(this)}},D=class extends HTMLElement{static get observedAttributes(){return["multiple","open"]}get multiple(){return this.getAttribute("multiple")!=null}set multiple(e){e?this.setAttribute("multiple",""):this.removeAttribute("multiple")}get open(){return h.list.open.get(this)??[]}set open(e){u.update(this,e)}attributeChangedCallback(e,t,i){if(t!==i)switch(e){case"multiple":u.open(this,this.getAttribute("open")??void 0);break;case"open":u.open(this,i);break;default:break}}connectedCallback(){h.list.connected.has(this)||u.initializeList(this)}};addEventListener?.("keydown",u.onGlobalKeydown,d.passive);customElements?.define("delicious-details",P);customElements?.define("delicious-details-list",D);var g=class{static update(e,t,i){let{anchor:n,floater:s,parent:o}=e,{after:a,getPosition:r,validate:c}=i;function b(){if(c())return;let v=g.getType(o??n,t),R=r(v,{anchor:n.getBoundingClientRect(),floater:s.getBoundingClientRect(),parent:o?.getBoundingClientRect()});g.setPosition(s,R),p(b),a?.()}p(b)}static getType(e,t){let i=A(e,"position",t.default);return t.all.includes(i)?i:t.default}static setPosition(e,t){let{left:i,top:n}=t.coordinate;e.setAttribute("position",t.type),e.style.inset="0 auto auto 0",e.style.position="fixed",e.style.transform=`translate3d(${i}px, ${n}px, 0)`,e.hidden&&p(()=>{e.hidden=!1})}};var q=["any"].concat(...["above","below"].map(l=>[l,`${l}-left`,`${l}-right`])),f=class{static getPosition(e,t){let i=f.getValue(e,["left","right"],t,!0),n=f.getValue(e,["below","above"],t,!1);return e!=="any"?{coordinate:{left:i,top:n},type:["above","below"].includes(e)?`??? ${e}-${t.anchor.left===i?"left":"right"}`:e}:{coordinate:{left:i,top:n},type:"???"}}static getValue(e,t,i,n){let{anchor:s,floater:o}=i,a=n?o.width:o.height,r=n?s.left:s.bottom,c=(n?s.right:s.top)-a;return t.some(v=>e.includes(v))?e.includes(t[0]??"_")?r:c:r+a<=(n?window.innerWidth:window.innerHeight)||c<0?r:c}static initialize(e,t,i){i.parentElement?.removeChild(i),i.hidden=!0,i.id||i.setAttribute("id",K()),t.setAttribute("aria-controls",i.id),t.setAttribute("aria-expanded","false"),i.setAttribute("tabindex","-1"),t.addEventListener("click",f.toggle.bind(e),d.passive),m.add(e,t,i)}static onClick(e){if(!(this instanceof M))return;let{anchor:t,floater:i}=m.getElements(this);t==null||i==null||t.getAttribute("aria-expanded")!=="true"||e.target!==t&&e.target!==i&&!(i?.contains(e.target)??!1)&&f.toggle.call(this,!1)}static onKeydown(e){if(!(this instanceof M)||!(e instanceof KeyboardEvent))return;let{anchor:t,floater:i}=m.getElements(this);if(t==null||i==null||t.getAttribute("aria-expanded")!=="true"||(e.key==="Escape"&&f.toggle.call(this,!1),e.key!=="Tab"))return;e.preventDefault();let n=W(i);if(document.activeElement===i){p(()=>{(n[e.shiftKey?n.length-1:0]??i).focus()});return}let s=n.indexOf(document.activeElement),o=i;if(s>-1){let a=s+(e.shiftKey?-1:1);a<0?a=n.length-1:a>=n.length&&(a=0),o=n[a]??i}p(()=>{o.focus()})}static toggle(e){if(!(this instanceof M))return;let{anchor:t,floater:i}=m.getElements(this);if(t==null||i==null)return;let n=typeof e=="boolean"?!e:t.getAttribute("aria-expanded")==="true",{click:s,keydown:o}=m.getCallbacks(this),a=n?"removeEventListener":"addEventListener";if(s!=null&&document[a]("click",s,d.passive),o!=null&&document[a]("keydown",o,d.active),n?i.parentElement?.removeChild(i):document.body.appendChild(i),t.setAttribute("aria-expanded",String(!n)),n){t.focus();return}let r=!1;g.update({anchor:t,floater:i,parent:this},{all:q,default:"below"},{after(){r||(r=!0,p(()=>{(W(i)[0]??i).focus()}))},getPosition:f.getPosition,validate:()=>t.getAttribute("aria-expanded")!=="true"})}},T=class{static add(e,t,i){T.values.anchors?.set(e,t),T.values.floaters?.set(e,i),T.setCallbacks(e)}static getCallbacks(e){return{click:this.values.click.get(e),keydown:this.values.keydown.get(e)}}static getElements(e){return{anchor:this.values.anchors.get(e),floater:this.values.floaters.get(e)}}static isConnected(e){return T.values.connected.has(e)}static setCallbacks(e){this.values.click?.set(e,f.onClick.bind(e)),this.values.keydown?.set(e,f.onKeydown.bind(e))}},m=T;k(m,"values",{anchors:new WeakMap,click:new WeakMap,connected:new WeakMap,floaters:new WeakMap,keydown:new WeakMap});var M=class extends HTMLElement{get content(){return m.getElements(this).floater}close(){f.toggle.call(this,!1)}connectedCallback(){if(m.isConnected(this))return;let e=this.querySelector(":scope > [polite-popover-button]"),t=this.querySelector(":scope > [polite-popover-content]");if(e==null||!(e instanceof HTMLButtonElement||e instanceof HTMLElement&&e.getAttribute("role")==="button"))throw new Error("<polite-popover> must have a <button>-element (or button-like element) with the attribute 'polite-poover-button'");if(t==null||!(t instanceof HTMLElement))throw new Error("<polite-popover> must have an element with the attribute 'polite-popover-content'");f.initialize(this,e,t)}open(){f.toggle.call(this,!0)}toggle(){f.toggle.call(this)}};customElements?.define("polite-popover",M);var F='<div id="__id__" class="swanky-switch__label">__label__</div><div class="swanky-switch__indicator" aria-hidden="true"><span class="swanky-switch__indicator__value"></span></div><div class="swanky-switch__status" aria-hidden="true"><span class="swanky-switch__status__off">__off__</span><span class="swanky-switch__status__on">__on__</span></div>',y=class{static initialize(e,t,i){t.parentElement?.removeChild(t),i.parentElement?.removeChild(i),E(e,"aria-checked",i.checked),E(e,"aria-disabled",i.disabled),E(e,"aria-readonly",i.readOnly),e.setAttribute("aria-labelledby",`${i.id}_label`),e.setAttribute("id",i.id),e.setAttribute("name",i.name??i.id),e.setAttribute("role","switch"),e.setAttribute("tabindex","0"),e.setAttribute("value",i.value);let n=A(e,"swanky-switch-off","Off"),s=A(e,"swanky-switch-on","On");e.insertAdjacentHTML("afterbegin",y.render(i.id,t,n,s)),e.addEventListener("click",y.onToggle.bind(e),d.passive),e.addEventListener("keydown",y.onKey.bind(e),d.passive)}static onKey(e){(e.key===" "||e.key==="Enter")&&this instanceof x&&y.toggle(this)}static onToggle(){this instanceof x&&y.toggle(this)}static render(e,t,i,n){return F.replace("__id__",`${e}_label`).replace("__label__",t.innerHTML).replace("__off__",i).replace("__on__",n)}static toggle(e){!e.disabled&&!e.readOnly&&(e.checked=!e.checked)}},V=new WeakMap,x=class extends HTMLElement{get checked(){return this.getAttribute("aria-checked")==="true"}set checked(e){E(this,"aria-checked",e)}get disabled(){return this.getAttribute("aria-disabled")==="true"}set disabled(e){E(this,"aria-disabled",e)}get readOnly(){return this.getAttribute("aria-readonly")==="true"}set readOnly(e){E(this,"aria-readonly",e)}get value(){return this.checked?"on":"off"}connectedCallback(){if(V.has(this))return;V.set(this);let e=this.querySelector("[swanky-switch-input]"),t=this.querySelector("[swanky-switch-label]");if(e==null||!(e instanceof HTMLInputElement)||e.type!=="checkbox")throw new Error("<swanky-switch> must have an <input>-element with type 'checkbox' and the attribute 'swanky-switch-input'");if(t==null||!(t instanceof HTMLElement))throw new Error("<swanky-switch> must have a <label>-element with the attribute 'swanky-switch-label'");y.initialize(this,t,e)}};customElements?.define("swanky-switch",x);var C="toasty-tooltip",_=new WeakMap,B=["above","below","horizontal","left","right","vertical"],w=class{static getPosition(e,t){let i=w.getValue(e,["horizontal","left","right"],t,!0),n=w.getValue(e,["vertical","above","below"],t,!1);return["horizontal","vertical"].includes(e)?{coordinate:{left:i,top:n},type:e==="horizontal"?i===t.anchor.right?"right":"left":n===t.anchor.bottom?"below":"above"}:{coordinate:{left:i,top:n},type:e}}static getValue(e,t,i,n){let{anchor:s,floater:o}=i,a=n?s.right:s.bottom,r=n?s.left:s.top,c=n?o.width:o.height,b=t.indexOf(e);if(b===-1)return r+(n?s.width:s.height)/2-c/2;let v=r-c;return b>0?b===1?v:a:a+c<=(n?window.innerWidth:window.innerHeight)||v<0?a:v}static observer(e){for(let t of e){if(t.type!=="attributes")continue;let i=t.target;i.getAttribute(C)==null?H.destroy(i):H.create(i)}}},H=class{constructor(e){this.anchor=e;this.focusable=e.matches(O),this.callbacks={click:this.onClick.bind(this),hide:this.onHide.bind(this),key:this.onKey.bind(this),show:this.onShow.bind(this)},this.floater=this.createFloater(),this.handleCallbacks(!0)}floater;callbacks;focusable;static create(e){_.has(e)||_.set(e,new H(e))}static destroy(e){let t=_.get(e);t!=null&&(t.handleCallbacks(!1),_.delete(e))}onClick(){this.handleFloater(!1)}onHide(){this.handleFloater(!1)}onKey(e){e instanceof KeyboardEvent&&e.key==="Escape"&&this.handleFloater(!1)}onShow(){let{anchor:e,floater:t}=this;if(t.parentElement!=null)return;let i=this.getContent();i!=null&&(t.innerHTML=i.innerHTML,this.handleFloater(!0),g.update({anchor:e,floater:t},{all:B,default:"above"},{getPosition:w.getPosition,validate:()=>t.parentElement==null}))}createFloater(){let e=document.createElement("div");return e.setAttribute("aria-hidden","true"),e.setAttribute(`${C}-content`,""),e.hidden=!0,e}getContent(){let e=this.anchor.getAttribute("aria-describedby")??this.anchor.getAttribute("aria-labelledby");if(e!=null)return document.getElementById(e)??void 0}handleCallbacks(e){let{anchor:t,callbacks:i,focusable:n}=this,s=e?"addEventListener":"removeEventListener";t[s]("mouseenter",i.show,d.passive),t[s]("mouseleave",i.hide,d.passive),t[s]("touchstart",i.show,d.passive),n&&(t[s]("blur",i.hide,d.passive),t[s]("focus",i.show,d.passive))}handleFloater(e){let{callbacks:t,floater:i}=this,n=e?"addEventListener":"removeEventListener";document[n]("keydown",t.key,d.passive),document[n]("pointerdown",t.click,d.passive),e?document.body.appendChild(i):this.floater.parentElement?.removeChild(this.floater)}},I=new MutationObserver(w.observer);I.observe(document,{attributeFilter:[C],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});p(()=>{let l=Array.from(document.querySelectorAll(`[${C}]`));for(let e of l)e.setAttribute(C,"")});

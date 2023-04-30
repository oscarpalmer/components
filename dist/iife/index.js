"use strict";(()=>{var ae=Object.defineProperty;var se=(t,n,e)=>n in t?ae(t,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[n]=e;var s=(t,n,e)=>(se(t,typeof n!="symbol"?n+"":n,e),e);var c={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}};function p(t,n){let e=typeof n=="string";if(e?t.matches(n):n(t))return t;let i=t==null?void 0:t.parentElement;for(;i!=null;){if(i===document.body)return;if(e?i.matches(n):n(i))break;i=i.parentElement}return i!=null?i:void 0}function L(t){let n=[],e=Array.from(t.querySelectorAll(V()));for(let i of e){let r=getComputedStyle==null?void 0:getComputedStyle(i);(r==null||r.display!=="none"&&r.visibility!=="hidden")&&n.push(i)}return n}function V(){let t=globalThis;return t.focusableSelector==null&&(t.focusableSelector=['[contenteditable]:not([contenteditable="false"])',"[href]","[tabindex]:not(slot)","audio[controls]","button","details","details[open] > summary","embed","iframe","input","object","select","textarea","video[controls]"].map(n=>`${n}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",")),t.focusableSelector}function T(t){return typeof t=="number"?t:Number.parseInt(typeof t=="string"?t:String(t),10)}function G(t){let{direction:n}=getComputedStyle==null?void 0:getComputedStyle(t);return n==="rtl"?"rtl":"ltr"}function f(t){return(t!=null?t:"").trim().length===0}var le=["ArrowDown","ArrowLeft","ArrowRight","ArrowUp","End","Home"],m=new WeakMap;function ce(t,n){var a,l,u;if(((a=document.activeElement)==null?void 0:a.tagName)!=="SUMMARY"||!le.includes(n.key))return;let e=m.get(t);if(e==null||e.elements.length===0)return;let i=e.elements.indexOf(document.activeElement.parentElement);if(i===-1)return;n.preventDefault();let r=-1;switch(n.key){case"ArrowDown":case"ArrowRight":r=i+1;break;case"ArrowLeft":case"ArrowUp":r=i-1;break;case"End":r=e.elements.length-1;break;case"Home":r=0;break}if(r<0?r=e.elements.length-1:r>=e.elements.length&&(r=0),r===i)return;let o=(l=e.elements[r])==null?void 0:l.querySelector(":scope > summary");o!=null&&((u=o.focus)==null||u.call(o))}function ue(t,n){n.open&&!t.multiple&&N(t,n)}function Y(t){let n=m.get(t);if(n!=null){n.elements=[...t.querySelectorAll(":scope > details")];for(let e of n.elements)e.addEventListener("toggle",()=>ue(t,e))}}function N(t,n){let e=m.get(t);if(e!=null)for(let i of e.elements)i!==n&&i.open&&(i.open=!1)}var M=class extends HTMLElement{get multiple(){return this.getAttribute("multiple")!=="false"}set multiple(n){typeof n=="boolean"&&this.setAttribute("multiple",n)}constructor(){super();let n={elements:[],observer:new MutationObserver(e=>Y(this))};m.set(this,n),Y(this),this.addEventListener("keydown",e=>ce(this,e),c.active),this.multiple||N(this,n.elements.find(e=>e.open))}attributeChangedCallback(n){var e;n==="multiple"&&!this.multiple&&N(this,(e=m.get(this))==null?void 0:e.elements.find(i=>i.open))}connectedCallback(){var n;(n=m.get(this))==null||n.observer.observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){var n;(n=m.get(this))==null||n.observer.disconnect()}};s(M,"observedAttributes",["max","min","value"]);customElements.define("accurate-accordion",M);var $=Math.round(16.666666666666668),J=requestAnimationFrame!=null?requestAnimationFrame:function(t){var n;return(n=setTimeout==null?void 0:setTimeout(()=>{t(Date.now())},$))!=null?n:-1},H=class{constructor(t,n,e,i){s(this,"callbacks");s(this,"configuration");s(this,"state",{active:!1,finished:!1});let r=this instanceof _,o=r?"repeated":"waited";if(typeof t!="function")throw new Error(`A ${o} timer must have a callback function`);if(typeof n!="number"||n<0)throw new Error(`A ${o} timer must have a non-negative number as its time`);if(r&&(typeof e!="number"||e<2))throw new Error("A repeated timer must have a number above 1 as its repeat count");if(r&&i!=null&&typeof i!="function")throw new Error("A repeated timer's after-callback must be a function");this.configuration={count:e,time:n},this.callbacks={after:i,default:t}}get active(){return this.state.active}get finished(){return!this.state.active&&this.state.finished}static run(t){t.state.active=!0,t.state.finished=!1;let n=t instanceof _,e=0,i;function r(o){if(!t.state.active)return;i!=null||(i=o);let a=o-i,l=a-$,u=a+$;if(l<t.configuration.time&&t.configuration.time<u)if(t.state.active&&t.callbacks.default(n?e:void 0),e+=1,n&&e<t.configuration.count)i=void 0;else{t.state.finished=!0,t.stop();return}t.state.frame=J(r)}t.state.frame=J(r)}restart(){return this.stop(),H.run(this),this}start(){return this.state.active||H.run(this),this}stop(){var t,n,e;return this.state.active=!1,typeof this.state.frame=="undefined"?this:((t=cancelAnimationFrame!=null?cancelAnimationFrame:clearTimeout)==null||t(this.state.frame),(e=(n=this.callbacks).after)==null||e.call(n,this.finished),this.state.frame=void 0,this)}},_=class extends H{},de=class extends H{constructor(t,n){super(t,n,1)}};function Q(t,n,e,i){return new _(t,n,e,i).start()}function d(t,n){return new de(t,n).start()}var g="delicious-details",z=new WeakMap;function fe(t){for(let n of t){if(n.type!=="attributes")continue;let e=n.target;if(!(e instanceof HTMLDetailsElement))throw new Error(`An element with the '${g}'-attribute must be a <details>-element`);e.getAttribute(g)==null?y.destroy(e):y.create(e)}}var y=class{constructor(n){s(this,"callbacks");s(this,"details");s(this,"summary");var e;this.details=n,this.summary=(e=n.querySelector(":scope > summary"))!=null?e:void 0,this.callbacks={onKeydown:this.onKeydown.bind(this),onToggle:this.onToggle.bind(this)},this.details.addEventListener("toggle",this.callbacks.onToggle,c.passive)}onKeydown(n){n.key!=="Escape"||!this.details.open||[...this.details.querySelectorAll(`[${g}][open]`)].some(i=>i.contains(document.activeElement))||!this.details.contains(document.activeElement)||(this.details.open=!1,d(()=>{var i;return(i=this.summary)==null?void 0:i.focus()},0))}onToggle(){var n;(n=document[this.details.open?"addEventListener":"removeEventListener"])==null||n.call(document,"keydown",this.callbacks.onKeydown,c.passive)}static create(n){z.has(n)||z.set(n,new y(n))}static destroy(n){z.delete(n)}},me=new MutationObserver(fe);me.observe(document,{attributeFilter:[g],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});d(()=>{let t=Array.from(document.querySelectorAll(`[${g}]`));for(let n of t)n.setAttribute(g,"")},0);var h="formal-focus-trap",x=new WeakMap;function he(t,n,e){var a;let i=L(n);if(e===n){d(()=>{var l;((l=i[t.shiftKey?i.length-1:0])!=null?l:n).focus()},0);return}let r=i.indexOf(e),o=n;if(r>-1){let l=r+(t.shiftKey?-1:1);l<0?l=i.length-1:l>=i.length&&(l=0),o=(a=i[l])!=null?a:n}d(()=>{o.focus()},0)}function be(t){for(let n of t){if(n.type!=="attributes")continue;let e=n.target;e.getAttribute(h)==null?w.destroy(e):w.create(e)}}function ve(t){if(t.key!=="Tab")return;let n=t.target,e=p(n,`[${h}]`);e!=null&&(t.preventDefault(),t.stopImmediatePropagation(),he(t,e,n))}var w=class{constructor(n){s(this,"tabIndex");this.tabIndex=n.tabIndex,n.tabIndex=-1}static create(n){x.has(n)||x.set(n,new w(n))}static destroy(n){let e=x.get(n);e!=null&&(n.tabIndex=e.tabIndex,x.delete(n))}};(()=>{let t=globalThis;if(t.formalFocusTrap!=null)return;t.formalFocusTrap=1,new MutationObserver(be).observe(document,{attributeFilter:[h],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0}),d(()=>{let e=Array.from(document.querySelectorAll(`[${h}]`));for(let i of e)i.setAttribute(h,"")},0),document.addEventListener("keydown",ve,c.active)})();var X=["above","above-left","above-right","any","below","below-left","below-right","horizontal","horizontal-bottom","horizontal-top","left","left-bottom","left-top","right","right-bottom","right-top","vertical","vertical-left","vertical-right"],pe=["bottom","height","left","right","top","width"],Z=["left","horizontal","right"],ge=["above","any","below","vertical",...Z];function ye(t,n,e,i){if(t!=="any"){let u=Ee(n,t,e);return{top:ke(n,t,i),left:u}}let{anchor:r,floater:o}=n,a=P(r.right,r.left,o.width,innerWidth,e),l=P(r.top,r.bottom,o.height,innerHeight,i);return{left:a,top:l}}function P(t,n,e,i,r){let o=n+e,a=t-e;return r?a<0?o>i?a:n:a:o>i?a<0?n:a:n}function we(t,n,e){if(!ge.includes(t))return t;let{anchor:i,floater:r}=n,o=Z.includes(t),a=o?e.left===i.right?"right":e.left===i.left-r.width?"left":null:e.top===i.bottom?"below":e.top===i.top-r.height?"above":null,l=o?e.top===i.top?"top":e.top===i.bottom-r.height?"bottom":null:e.left===i.left?"left":e.left===i.right-r.width?"right":null;return[a,l].filter(u=>u!=null).join("-")}function Ee(t,n,e){let{anchor:i,floater:r}=t;switch(n){case"above":case"below":case"vertical":return i.left+i.width/2-r.width/2;case"above-left":case"below-left":case"vertical-left":return i.left;case"above-right":case"below-right":case"vertical-right":return i.right-r.width;case"horizontal":case"horizontal-bottom":case"horizontal-top":return P(i.left,i.right,r.width,innerWidth,e);case"left":case"left-bottom":case"left-top":return i.left-r.width;case"right":case"right-bottom":case"right-top":return i.right;default:return i.left}}function Ae(t,n){var r;if(t==null)return n;let e=t.trim().toLowerCase(),i=X.indexOf(e);return i>-1&&(r=X[i])!=null?r:n}function ke(t,n,e){let{anchor:i,floater:r}=t;switch(n){case"above":case"above-left":case"above-right":return i.top-r.height;case"horizontal":case"left":case"right":return i.top+i.height/2-r.height/2;case"below":case"below-left":case"below-right":return i.bottom;case"horizontal-bottom":case"left-bottom":case"right-bottom":return i.bottom-r.height;case"horizontal-top":case"left-top":case"right-top":return i.top;case"vertical":case"vertical-left":case"vertical-right":return P(i.top,i.bottom,r.height,innerHeight,e);default:return i.bottom}}function S(t){let{anchor:n,floater:e,parent:i}=t.elements,r=G(e)==="rtl",o,a;function l(){n.insertAdjacentElement("afterend",e)}function u(){var j;let E=Ae((j=(i!=null?i:n).getAttribute(t.position.attribute))!=null?j:"",t.position.defaultValue),K=n.getBoundingClientRect();if(o===E&&pe.every(U=>(a==null?void 0:a[U])===K[U]))return;o=E,a=K;let W={anchor:K,floater:e.getBoundingClientRect()},D=ye(E,W,r,t.position.preferAbove),B=`matrix(1, 0, 0, 1, ${D.left}, ${D.top})`;e.style.transform!==B&&(e.style.position="fixed",e.style.inset="0 auto auto 0",e.style.transform=B,e.setAttribute("position",we(E,W,D)))}return document.body.appendChild(e),e.hidden=!1,Q(u,0,1/0,l)}var te=new WeakMap,Le=0;function ee(t,n){var e,i,r;Te(t,n),n&&t.content?((i=(e=L(t.content))==null?void 0:e[0])!=null?i:t.content).focus():(r=t.button)==null||r.focus()}function Te(t,n){let e=te.get(t);if(e==null)return;let i=n?"addEventListener":"removeEventListener";document[i]("click",e.click,c.passive),document[i]("keydown",e.keydown,c.passive)}function ne(t,n,e){let{button:i,content:r}=n;if(i==null||r==null)return;let o=p(e,"[polite-popover-content]");if(o==null){F(n,!1);return}t.stopPropagation();let a=Array.from(document.body.children);a.indexOf(o)-a.indexOf(r)<(t instanceof KeyboardEvent?1:0)&&F(n,!1)}function F(t,n){var i,r;let e=typeof n=="boolean"?!n:t.open;t.button.setAttribute("aria-expanded",!e),e?(t.content.hidden=!0,(i=t.timer)==null||i.stop(),ee(t,!1)):((r=t.timer)==null||r.stop(),t.timer=S({elements:{anchor:t.button,floater:t.content,parent:t},position:{attribute:"position",defaultValue:"vertical",preferAbove:!1}}),d(()=>{ee(t,!0)},50)),t.dispatchEvent(new Event("toggle"))}function Me(t,n,e){e.hidden=!0,f(t.id)&&(t.id=`polite_popover_${++Le}`),f(n.id)&&(n.id=`${t.id}_button`),f(e.id)&&(e.id=`${t.id}_content`),n.setAttribute("aria-controls",e.id),n.ariaExpanded="false",n.ariaHasPopup="dialog",n instanceof HTMLButtonElement||(n.tabIndex=0),e.setAttribute(h,""),e.role="dialog",e.ariaModal="false",te.set(t,{click:xe.bind(t),keydown:Pe.bind(t)}),n.addEventListener("click",I.bind(t),c.passive)}function He(t){return t==null?!1:t instanceof HTMLButtonElement?!0:t instanceof HTMLElement&&t.getAttribute("role")==="button"}function xe(t){this.open&&ne(t,this,t.target)}function Pe(t){this.open&&t instanceof KeyboardEvent&&t.key==="Escape"&&ne(t,this,document.activeElement)}function I(t){F(this,t)}var q=class extends HTMLElement{constructor(){super();s(this,"button");s(this,"content");s(this,"timer");let e=this.querySelector(":scope > [polite-popover-button]"),i=this.querySelector(":scope > [polite-popover-content]");if(!He(e))throw new Error("<polite-popover> must have a <button>-element (or button-like element) with the attribute 'polite-popover-button'");if(i==null||!(i instanceof HTMLElement))throw new Error("<polite-popover> must have an element with the attribute 'polite-popover-content'");this.button=e,this.content=i,Me(this,e,i)}get open(){var e;return((e=this.button)==null?void 0:e.getAttribute("aria-expanded"))==="true"}set open(e){I.call(this,e)}toggle(){this.button&&this.content&&I.call(this)}};customElements.define("polite-popover",q);var ie=["horizontal","vertical"],Se=0;function Re(t){var a,l;let n=document.createElement("div");f(t.primary.id)&&(t.primary.id=`spiffy_splitter_primary_${++Se}`),n.setAttribute("aria-controls",t.primary.id),n.role="separator",n.tabIndex=0;let e=t.getAttribute("value");f(e)&&(e="50");let i=T(e);t.values.original=typeof i=="number"?i:50;let r=(a=t.getAttribute("max"))!=null?a:"",o=(l=t.getAttribute("min"))!=null?l:"";return r.length===0&&A(t,n,"maximum",100),o.length===0&&A(t,n,"minimum",0),k(t,n,t.values.original,!1),n.addEventListener("keydown",u=>Oe(t,u),c.passive),n}function Oe(t,n){if(!["ArrowDown","ArrowLeft","ArrowRight","ArrowUp","End","Escape","Home"].includes(n.key)||(t.type==="vertical"?["ArrowLeft","ArrowRight"]:["ArrowDown","ArrowUp"]).includes(n.key))return;let i;switch(n.key){case"ArrowDown":case"ArrowLeft":case"ArrowRight":case"ArrowUp":i=t.value+(["ArrowLeft","ArrowUp"].includes(n.key)?-1:1);break;case"End":case"Home":i=n.key==="End"?t.values.maximum:t.values.minimum;break;case"Escape":i=t.values.original;break;default:break}k(t,t.separator,i,!0)}function A(t,n,e,i){let r=T(i);Number.isNaN(r)||r===t.values[e]||e==="maximum"&&r<t.values.minimum||e==="minimum"&&r>t.values.maximum||(e==="maximum"&&r>100?r=100:e==="minimum"&&r<0&&(r=0),t.values[e]=r,n.setAttribute(e==="maximum"?"aria-valuemax":"aria-valuemin",r),(e==="maximum"&&r<t.values.current||e==="minimum"&&r>t.values.current)&&k(t,n,r,!0))}function k(t,n,e,i){let r=T(e);Number.isNaN(r)||r===t.values.current||(r<t.values.minimum?r=t.values.minimum:r>t.values.maximum&&(r=t.values.maximum),n.ariaValueNow=r,t.primary.style.flex=`${r/100}`,t.values.current=r,i&&t.dispatchEvent(new CustomEvent("change",{detail:{value:r}})))}var R=class extends HTMLElement{constructor(){var e;super();s(this,"primary");s(this,"secondary");s(this,"separator");s(this,"values",{current:-1,maximum:-1,minimum:-1,original:-1});if(this.children.length<2)throw new Error("A <spffy-splitter> must have at least two direct children");this.primary=this.children[0],this.secondary=[...this.children].slice(1),this.separator=Re(this),(e=this.primary)==null||e.insertAdjacentElement("afterend",this.separator)}get max(){return this.values.maximum}set max(e){A(this,this.separator,"maximum",e)}get min(){return this.values.minimum}set min(e){A(this,this.separator,"minimum",e)}get type(){var i;let e=(i=this.getAttribute("type"))!=null?i:"horizontal";return ie.includes(e)?e:"horizontal"}set type(e){ie.includes(e)&&this.setAttribute("type",e)}get value(){return this.values.current}set value(e){k(this,this.separator,e,!0)}attributeChangedCallback(e,i,r){switch(e){case"max":case"min":A(this,this.separator,e==="max"?"maximum":"minimum",r);break;case"value":k(this,this.separator,r,!0);break;default:break}}};s(R,"observedAttributes",["max","min","value"]);customElements.define("spiffy-splitter",R);function Ce(t,n){let e=document.createElement("span");return e.ariaHidden=!0,e.className="swanky-switch__label",e.id=`${t}_label`,e.innerHTML=n,e}function Ke(){let t=document.createElement("span");t.ariaHidden=!0,t.className="swanky-switch__status";let n=document.createElement("span");return n.className="swanky-switch__status__indicator",t.appendChild(n),t}function De(t,n){let e=document.createElement("span");return e.ariaHidden=!0,e.className="swanky-switch__text",e.appendChild(re("off",n)),e.appendChild(re("on",t)),e}function re(t,n){let e=document.createElement("span");return e.className=`swanky-switch__text__${t}`,e.innerHTML=n,e}function Ve(t,n,e){var o,a,l;(o=n.parentElement)==null||o.removeChild(n),(a=e.parentElement)==null||a.removeChild(e),t.setAttribute("aria-checked",e.checked||t.checked),t.setAttribute("aria-disabled",e.disabled||t.disabled),t.setAttribute("aria-labelledby",`${e.id}_label`),t.setAttribute("aria-readonly",e.readOnly||t.readonly),t.setAttribute("value",e.value),t.id=e.id,t.name=(l=e.name)!=null?l:e.id,t.role="switch",t.tabIndex=0;let i=t.getAttribute("swanky-switch-off"),r=t.getAttribute("swanky-switch-on");f(i)&&(i="Off"),f(r)&&(r="On"),t.insertAdjacentElement("beforeend",Ce(t.id,n.innerHTML)),t.insertAdjacentElement("beforeend",Ke()),t.insertAdjacentElement("beforeend",De(r,i)),t.addEventListener("click",$e.bind(t),c.passive),t.addEventListener("keydown",Ne.bind(t),c.active)}function Ne(t){[" ","Enter"].includes(t.key)&&(t.preventDefault(),oe(this))}function $e(){oe(this)}function oe(t){t.disabled||t.readonly||(t.checked=!t.checked,t.dispatchEvent(new Event("change")))}var O=class extends HTMLElement{constructor(){var r;super();s(this,"internals");this.internals=(r=this.attachInternals)==null?void 0:r.call(this);let e=this.querySelector("[swanky-switch-input]"),i=this.querySelector("[swanky-switch-label]");if(typeof e=="undefined"||!(e instanceof HTMLInputElement)||e.type!=="checkbox")throw new Error("<swanky-switch> must have an <input>-element with type 'checkbox' and the attribute 'swanky-switch-input'");if(typeof i=="undefined"||!(i instanceof HTMLElement))throw new Error("<swanky-switch> must have a <label>-element with the attribute 'swanky-switch-label'");Ve(this,i,e)}get checked(){return this.getAttribute("aria-checked")==="true"}set checked(e){this.setAttribute("aria-checked",e)}get disabled(){return this.getAttribute("aria-disabled")==="true"}set disabled(e){this.setAttribute("aria-disabled",e)}get form(){var e,i;return(i=(e=this.internals)==null?void 0:e.form)!=null?i:void 0}get labels(){var e;return(e=this.internals)==null?void 0:e.labels}get name(){var e;return(e=this.getAttribute("name"))!=null?e:""}set name(e){this.setAttribute("name",e)}get readonly(){return this.getAttribute("aria-readonly")==="true"}set readonly(e){this.setAttribute("aria-readonly",e)}get validationMessage(){var e,i;return(i=(e=this.internals)==null?void 0:e.validationMessage)!=null?i:""}get validity(){var e;return(e=this.internals)==null?void 0:e.validity}get value(){var e;return(e=this.getAttribute("value"))!=null?e:this.checked?"on":"off"}get willValidate(){var e,i;return(i=(e=this.internals)==null?void 0:e.willValidate)!=null?i:!0}checkValidity(){var e,i;return(i=(e=this.internals)==null?void 0:e.checkValidity())!=null?i:!0}reportValidity(){var e,i;return(i=(e=this.internals)==null?void 0:e.reportValidity())!=null?i:!0}};s(O,"formAssociated",!0);customElements.define("swanky-switch",O);var b="toasty-tooltip",_e=`${b}-content`,ze=`${b}-position`,C=new WeakMap;function Fe(t){for(let n of t){if(n.type!=="attributes")continue;let e=n.target;e.getAttribute(b)==null?v.destroy(e):v.create(e)}}var v=class{constructor(n){this.anchor=n;s(this,"callbacks",{click:this.onClick.bind(this),hide:this.onHide.bind(this),keydown:this.onKeyDown.bind(this),show:this.onShow.bind(this)});s(this,"floater");s(this,"focusable");s(this,"timer");this.focusable=n.matches(V()),this.floater=v.createFloater(n),this.handleCallbacks(!0)}static create(n){C.has(n)||C.set(n,new v(n))}static destroy(n){let e=C.get(n);typeof e!="undefined"&&(e.handleCallbacks(!1),C.delete(n))}static createFloater(n){var r;let e=(r=n.getAttribute("aria-describedby"))!=null?r:n.getAttribute("aria-labelledby"),i=e==null?null:document.getElementById(e);if(i==null)throw new Error(`A '${b}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);return i.hidden=!0,i.setAttribute(_e,""),i.ariaHidden="true",i.role="tooltip",i}onClick(n){p(n.target,e=>[this.anchor,this.floater].includes(e))==null&&this.toggle(!1)}onHide(){this.toggle(!1)}onKeyDown(n){n instanceof KeyboardEvent&&n.key==="Escape"&&this.toggle(!1)}onShow(){this.toggle(!0)}toggle(n){var i,r;let e=n?"addEventListener":"removeEventListener";document[e]("click",this.callbacks.click,c.passive),document[e]("keydown",this.callbacks.keydown,c.passive),n?((i=this.timer)==null||i.stop(),this.timer=S({elements:{anchor:this.anchor,floater:this.floater},position:{attribute:ze,defaultValue:"vertical",preferAbove:!0}})):(this.floater.hidden=!0,(r=this.timer)==null||r.stop())}handleCallbacks(n){let{anchor:e,floater:i,focusable:r}=this,o=n?"addEventListener":"removeEventListener";for(let a of[e,i])a[o]("mouseenter",this.callbacks.show,c.passive),a[o]("mouseleave",this.callbacks.hide,c.passive),a[o]("touchstart",this.callbacks.show,c.passive);r&&(e[o]("blur",this.callbacks.hide,c.passive),e[o]("focus",this.callbacks.show,c.passive))}},Ie=new MutationObserver(Fe);Ie.observe(document,{attributeFilter:[b],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});d(()=>{let t=Array.from(document.querySelectorAll(`[${b}]`));for(let n of t)n.setAttribute(b,"")},0);})();

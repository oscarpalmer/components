"use strict";(()=>{var V=Object.defineProperty;var W=(t,e,n)=>e in t?V(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var s=(t,e,n)=>(W(t,typeof e!="symbol"?e+"":e,n),n);var T=Math.round(16.666666666666668),z=requestAnimationFrame??function(t){return setTimeout?.(()=>{t(Date.now())},T)??-1},m=class{constructor(t,e,n,o){s(this,"callbacks");s(this,"configuration");s(this,"state",{active:!1,finished:!1});let r=this instanceof M,a=r?"repeated":"waited";if(typeof t!="function")throw new Error(`A ${a} timer must have a callback function`);if(typeof e!="number"||e<0)throw new Error(`A ${a} timer must have a non-negative number as its time`);if(r&&(typeof n!="number"||n<2))throw new Error("A repeated timer must have a number above 1 as its repeat count");if(r&&o!=null&&typeof o!="function")throw new Error("A repeated timer's after-callback must be a function");this.configuration={count:n,time:e},this.callbacks={after:o,default:t}}get active(){return this.state.active}get finished(){return!this.state.active&&this.state.finished}static run(t){t.state.active=!0,t.state.finished=!1;let e=t instanceof M,n=0,o;function r(a){if(!t.state.active)return;o??(o=a);let i=a-o,l=i-T,u=i+T;if(l<t.configuration.time&&t.configuration.time<u)if(t.state.active&&t.callbacks.default(e?n:void 0),n+=1,e&&n<t.configuration.count)o=void 0;else{t.state.finished=!0,t.stop();return}t.state.frame=z(r)}t.state.frame=z(r)}restart(){return this.stop(),m.run(this),this}start(){return this.state.active||m.run(this),this}stop(){return this.state.active=!1,typeof this.state.frame>"u"?this:((cancelAnimationFrame??clearTimeout)?.(this.state.frame),this.callbacks.after?.(this.finished),this.state.frame=void 0,this)}},M=class extends m{},q=class extends m{constructor(t,e){super(t,e,1)}};function O(t,e,n,o){return new M(t,e,n,o).start()}function d(t,e){return new q(t,e).start()}var h={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},ht=(()=>{try{if("matchMedia"in window){let t=matchMedia("(pointer: coarse)");if(t!=null&&typeof t.matches=="boolean")return t.matches}return"ontouchstart"in window||navigator.maxTouchPoints>0||(navigator?.msMaxTouchPoints??0)>0}catch{return!1}})();function g(t,e){let n=typeof e=="string";if(n?t.matches(e):e(t))return t;let o=t?.parentElement;for(;o!=null;){if(o===document.body)return;if(n?o.matches(e):e(o))break;o=o.parentElement}return o??void 0}function v(t){let e=[],n=Array.from(t.querySelectorAll(j()));for(let o of n){let r=getComputedStyle?.(o);(r==null||r.display!=="none"&&r.visibility!=="hidden")&&e.push(o)}return e}function j(){let t=globalThis;return t.focusableSelector==null&&(t.focusableSelector=['[contenteditable]:not([contenteditable="false"])',"[href]","[tabindex]:not(slot)","audio[controls]","button","details","details[open] > summary","embed","iframe","input","object","select","textarea","video[controls]"].map(e=>`${e}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",")),t.focusableSelector}function S(t){let{direction:e}=getComputedStyle?.(t);return e==="rtl"?"rtl":"ltr"}function y(t){return(t??"").trim().length===0}var F=["above","above-left","above-right","any","below","below-left","below-right","horizontal","horizontal-bottom","horizontal-top","left","left-bottom","left-top","right","right-bottom","right-top","vertical","vertical-left","vertical-right"],N=["bottom","height","left","right","top","width"],I=["left","horizontal","right"],_=["above","any","below","vertical",...I];function X(t,e,n,o){if(t!=="any"){let u=G(e,t,n);return{top:Q(e,t,o),left:u}}let{anchor:r,floater:a}=e,i=E(r.right,r.left,a.width,innerWidth,n),l=E(r.top,r.bottom,a.height,innerHeight,o);return{left:i,top:l}}function E(t,e,n,o,r){let a=e+n,i=t-n;return r?i<0?a>o?i:e:i:a>o?i<0?e:i:e}function Y(t,e,n){if(!_.includes(t))return t;let{anchor:o,floater:r}=e,a=I.includes(t),i=a?n.left===o.right?"right":n.left===o.left-r.width?"left":null:n.top===o.bottom?"below":n.top===o.top-r.height?"above":null,l=a?n.top===o.top?"top":n.top===o.bottom-r.height?"bottom":null:n.left===o.left?"left":n.left===o.right-r.width?"right":null;return[i,l].filter(u=>u!=null).join("-")}function G(t,e,n){let{anchor:o,floater:r}=t;switch(e){case"above":case"below":case"vertical":return o.left+o.width/2-r.width/2;case"above-left":case"below-left":case"vertical-left":return o.left;case"above-right":case"below-right":case"vertical-right":return o.right-r.width;case"horizontal":case"horizontal-bottom":case"horizontal-top":return E(o.left,o.right,r.width,innerWidth,n);case"left":case"left-bottom":case"left-top":return o.left-r.width;case"right":case"right-bottom":case"right-top":return o.right;default:return o.left}}function J(t,e){if(t==null)return e;let n=t.trim().toLowerCase(),o=F.indexOf(n);return o>-1?F[o]??e:e}function Q(t,e,n){let{anchor:o,floater:r}=t;switch(e){case"above":case"above-left":case"above-right":return o.top-r.height;case"horizontal":case"left":case"right":return o.top+o.height/2-r.height/2;case"below":case"below-left":case"below-right":return o.bottom;case"horizontal-bottom":case"left-bottom":case"right-bottom":return o.bottom-r.height;case"horizontal-top":case"left-top":case"right-top":return o.top;case"vertical":case"vertical-left":case"vertical-right":return E(o.top,o.bottom,r.height,innerHeight,n);default:return o.bottom}}function C(t){let{anchor:e,floater:n,parent:o}=t.elements,r=S(n)==="rtl",a,i;function l(){e.insertAdjacentElement("afterend",n)}function u(){let p=J((o??e).getAttribute(t.position.attribute)??"",t.position.defaultValue),x=e.getBoundingClientRect();if(a===p&&N.every($=>i?.[$]===x[$]))return;a=p,i=x;let k={anchor:x,floater:n.getBoundingClientRect()},P=X(p,k,r,t.position.preferAbove),R=`matrix(1, 0, 0, 1, ${P.left}, ${P.top})`;n.style.transform!==R&&(n.style.position="fixed",n.style.inset="0 auto auto 0",n.style.transform=R,n.setAttribute("position",Y(p,k,P)))}return document.body.appendChild(n),n.hidden=!1,O(u,0,1/0,l)}var f="palmer-focus-trap",w=new WeakMap;function U(t,e,n){let o=v(e);if(n===e){d(()=>{(o[t.shiftKey?o.length-1:0]??e).focus()},0);return}let r=o.indexOf(n),a=e;if(r>-1){let i=r+(t.shiftKey?-1:1);i<0?i=o.length-1:i>=o.length&&(i=0),a=o[i]??e}d(()=>{a.focus()},0)}function Z(t){for(let e of t){if(e.type!=="attributes")continue;let n=e.target;n.getAttribute(f)==null?b.destroy(n):b.create(n)}}function tt(t){if(t.key!=="Tab")return;let e=t.target,n=g(e,`[${f}]`);n!=null&&(t.preventDefault(),t.stopImmediatePropagation(),U(t,n,e))}var b=class{constructor(e){s(this,"tabIndex");this.tabIndex=e.tabIndex,e.tabIndex=-1}static create(e){w.has(e)||w.set(e,new b(e))}static destroy(e){let n=w.get(e);n!=null&&(e.tabIndex=n.tabIndex,w.delete(e))}};(()=>{let t=globalThis;if(t.palmerFocusTrap!=null)return;t.palmerFocusTrap=1,new MutationObserver(Z).observe(document,{attributeFilter:[f],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0}),d(()=>{let n=Array.from(document.querySelectorAll(`[${f}]`));for(let o of n)o.setAttribute(f,"")},0),document.addEventListener("keydown",tt,h.active)})();var c="palmer-popover",B=new WeakMap,et=0;function K(t,e){nt(t,e),e&&t.content?(v(t.content)?.[0]??t.content).focus():t.button?.focus()}function nt(t,e){let n=B.get(t);if(n==null)return;let o=e?"addEventListener":"removeEventListener";document[o]("click",n.click,h.passive),document[o]("keydown",n.keydown,h.passive)}function D(t,e,n){let{button:o,content:r}=e;if(o==null||r==null)return;let a=g(n,`[${c}-content]`);if(a==null){L(e,!1);return}t.stopPropagation();let i=Array.from(document.body.children);i.indexOf(a)-i.indexOf(r)<(t instanceof KeyboardEvent?1:0)&&L(e,!1)}function L(t,e){let n=typeof e=="boolean"?!e:t.open;t.button.setAttribute("aria-expanded",!n),n?(t.content.hidden=!0,t.timer?.stop(),K(t,!1)):(t.timer?.stop(),t.timer=C({elements:{anchor:t.button,floater:t.content,parent:t},position:{attribute:"position",defaultValue:"vertical",preferAbove:!1}}),d(()=>{K(t,!0)},50)),t.dispatchEvent(new Event("toggle"))}function ot(t,e,n){n.hidden=!0,y(t.id)&&(t.id=`palmer_popover_${++et}`),y(e.id)&&(e.id=`${t.id}_button`),y(n.id)&&(n.id=`${t.id}_content`),e.setAttribute("aria-controls",n.id),e.ariaExpanded="false",e.ariaHasPopup="dialog",e instanceof HTMLButtonElement||(e.tabIndex=0),n.setAttribute(f,""),n.role="dialog",n.ariaModal="false",B.set(t,{click:it.bind(t),keydown:at.bind(t)}),e.addEventListener("click",H.bind(t),h.passive)}function rt(t){return t==null?!1:t instanceof HTMLButtonElement?!0:t instanceof HTMLElement&&t.getAttribute("role")==="button"}function it(t){this.open&&D(t,this,t.target)}function at(t){this.open&&t instanceof KeyboardEvent&&t.key==="Escape"&&D(t,this,document.activeElement)}function H(t){L(this,t)}var A=class extends HTMLElement{constructor(){super();s(this,"button");s(this,"content");s(this,"timer");let n=this.querySelector(`:scope > [${c}-button]`),o=this.querySelector(`:scope > [${c}-content]`);if(!rt(n))throw new Error(`<${c}> must have a <button>-element (or button-like element) with the attribute '${c}-button`);if(o==null||!(o instanceof HTMLElement))throw new Error(`<${c}> must have an element with the attribute '${c}-content'`);this.button=n,this.content=o,ot(this,n,o)}get open(){return this.button?.getAttribute("aria-expanded")==="true"}set open(n){H.call(this,n)}toggle(){this.button&&this.content&&H.call(this)}};customElements.define(c,A);})();

"use strict";(()=>{var x=Object.defineProperty;var L=(i,e,t)=>e in i?x(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var M=(i,e,t)=>(L(i,typeof e!="symbol"?e+"":e,t),t);var b={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},H=["[href]","[tabindex]","button","input","select","textarea"].map(i=>`${i}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function f(i){var e,t,n;return(n=(e=globalThis.requestAnimationFrame)==null?void 0:e.call(globalThis,i))!=null?n:(t=globalThis.setTimeout)==null?void 0:t.call(globalThis,()=>{i(Date.now())},16)}function w(i,e,t){let n=i.getAttribute(e);return n==null||n.trim().length===0?t:n}function P(i){var n;let e=[],t=Array.from(i.querySelectorAll(H));for(let o of t){let s=(n=globalThis.getComputedStyle)==null?void 0:n.call(globalThis,o);(s==null||s.display!=="none"&&s.visibility!=="hidden")&&e.push(o)}return e}function k(i){return i==null?!0:i.trim().length===0}function m(i,e,t){t==null?i.removeAttribute(e):i.setAttribute(e,String(t))}function E(i,e,t){typeof t=="boolean"&&(i==null||i.setAttribute(e,String(t)))}var g=class{static update(e,t,n){let{anchor:o,floater:s,parent:r}=e,{after:l,getPosition:d,validate:p}=n;function y(){if(!p())return;let h=g.getType(r!=null?r:o,t),T=d(h,{anchor:o.getBoundingClientRect(),floater:s.getBoundingClientRect(),parent:r==null?void 0:r.getBoundingClientRect()});g.setPosition(s,T),l==null||l(),f(y)}f(y)}static getType(e,t){let n=w(e,"position",t.default);return t.all.includes(n)?n:t.default}static setPosition(e,t){let{left:n,top:o}=t.coordinate;e.getAttribute("position")!==t.type&&e.setAttribute("position",t.type);let s=`matrix(1, 0, 0, 1, ${n}, ${o})`;e.style.transform!==s&&(e.style.inset="0 auto auto 0",e.style.position="fixed",e.style.transform=s,e.hidden&&f(()=>{e.hidden=!1}))}};var A=0,C=["any"].concat(...["above","below"].map(i=>[i,`${i}-left`,`${i}-right`])),u=class{static getPosition(e,t){let n=u.getValue(e,["left","right"],t,!0),o=u.getValue(e,["below","above"],t,!1),s=t.anchor.left===n?"left":"right";if(e!=="any")return{coordinate:{left:n,top:o},type:["above","below"].includes(e)?`${e}-${s}`:e};let r=t.anchor.bottom===o?"below":"above";return{coordinate:{left:n,top:o},type:`${r}-${s}`}}static getValue(e,t,n,o){var h;let{anchor:s,floater:r}=n,l=o?r.width:r.height,d=o?s.left:s.bottom,p=(o?s.right:s.top)-l;return t.some(T=>e.includes(T))?e.includes((h=t[0])!=null?h:"_")?d:p:d+l<=(o?globalThis.innerWidth:globalThis.innerHeight)||p<0?d:p}static initialize(e,t,n){n.hidden=!0,k(n.id)&&n.setAttribute("id",k(e.id)?`polite_popover_${A++}`:`${e.id}_content`),m(t,"aria-controls",n.id),E(t,"aria-expanded",!1),m(n,"role","dialog"),m(n,"tabindex","-1"),E(n,"aria-modal",!0),t.addEventListener("click",u.toggle.bind(e),b.passive)}static onClick(e){var o;if(!(this instanceof v)||!this.open)return;let t=a.values.anchors.get(this),n=a.values.floaters.get(this);e.target!==t&&e.target!==n&&!((o=n==null?void 0:n.contains(e.target))!=null&&o)&&u.toggle.call(this,!1)}static onKeydown(e){var r;if(!(this instanceof v)||!this.open||!(e instanceof KeyboardEvent))return;e.key==="Escape"&&u.toggle.call(this,!1);let t=a.values.floaters.get(this);if(e.key!=="Tab"||t==null)return;e.preventDefault();let n=P(t);if(document.activeElement===t){f(()=>{var l;((l=n[e.shiftKey?n.length-1:0])!=null?l:t).focus()});return}let o=n.indexOf(document.activeElement),s=t;if(o>-1){let l=o+(e.shiftKey?-1:1);l<0?l=n.length-1:l>=n.length&&(l=0),s=(r=n[l])!=null?r:t}f(()=>{s.focus()})}static toggle(e){if(!(this instanceof v))return;let t=a.values.anchors.get(this),n=a.values.floaters.get(this);if(t==null||n==null)return;let o=typeof e=="boolean"?!e:this.open,s=a.values.click.get(this),r=a.values.keydown.get(this),l=o?"removeEventListener":"addEventListener";if(s!=null&&document[l]("click",s,b.passive),r!=null&&document[l]("keydown",r,b.active),n.hidden=o,E(t,"aria-expanded",!o),this.dispatchEvent(new Event("toggle")),o){t.focus();return}let d=!1;g.update({anchor:t,floater:n,parent:this},{all:C,default:"below"},{after(){d||(d=!0,f(()=>{var p;((p=P(n)[0])!=null?p:n).focus()}))},getPosition:u.getPosition,validate:()=>this.open})}},c=class{static add(e){var o,s,r,l;let t=e.querySelector(":scope > [polite-popover-button]"),n=e.querySelector(":scope > [polite-popover-content]");t==null||n==null||((o=c.values.anchors)==null||o.set(e,t),(s=c.values.floaters)==null||s.set(e,n),(r=c.values.click)==null||r.set(e,u.onClick.bind(e)),(l=c.values.keydown)==null||l.set(e,u.onKeydown.bind(e)))}static remove(e){let t=c.values.floaters.get(e);t!=null&&(t.hidden=!0,e.appendChild(t)),c.values.anchors.delete(e),c.values.floaters.delete(e),c.values.click.delete(e),c.values.keydown.delete(e)}},a=c;M(a,"values",{anchors:new WeakMap,click:new WeakMap,floaters:new WeakMap,keydown:new WeakMap});var v=class extends HTMLElement{get button(){return a.values.anchors.get(this)}get content(){return a.values.floaters.get(this)}get open(){var e;return((e=this.button)==null?void 0:e.getAttribute("aria-expanded"))==="true"}set open(e){u.toggle.call(this,e)}constructor(){super();let e=this.querySelector(":scope > [polite-popover-button]"),t=this.querySelector(":scope > [polite-popover-content]");if(e==null||!(e instanceof HTMLButtonElement||e instanceof HTMLElement&&e.getAttribute("role")==="button"))throw new Error("<polite-popover> must have a <button>-element (or button-like element) with the attribute 'polite-popover-button'");if(t==null||!(t instanceof HTMLElement))throw new Error("<polite-popover> must have an element with the attribute 'polite-popover-content'");u.initialize(this,e,t)}connectedCallback(){a.add(this)}disconnectedCallback(){a.remove(this)}toggle(){u.toggle.call(this)}};globalThis.customElements.define("polite-popover",v);})();

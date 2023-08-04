(()=>{function w(t,e,n){let r=typeof e=="string";if((n??!0)&&(r?t.matches(e):e(t)))return t;let i=t?.parentElement;for(;i!==null;){if(i===document.body)return;if(r?i.matches(e):e(i))break;i=i.parentElement}return i??void 0}function c(t){return(t??"").trim().length===0}function l(t,e){return{capture:e??!1,passive:t??!0}}var O=[W,P,E,R,V],q=['[contenteditable]:not([contenteditable="false"])',"[tabindex]:not(slot)","a[href]","audio[controls]","button","details","details > summary:first-of-type","iframe","input","select","textarea","video[controls]"].map(t=>`${t}:not([inert])`).join(",");function f(t){let e=Array.from(t.querySelectorAll(q)).map(r=>({element:r,tabIndex:C(r)})).filter(r=>K(r)),n=[];for(let r of e)n[r.tabIndex]===void 0?n[r.tabIndex]=[r.element]:n[r.tabIndex].push(r.element);return n.flat()}function C(t){return t.tabIndex>-1?t.tabIndex:/^(audio|details|video)$/i.test(t.tagName)||B(t)?H(t)?-1:0:-1}function H(t){return!Number.isNaN(Number.parseInt(t.getAttribute("tabindex"),10))}function W(t){return/^(button|input|select|textarea)$/i.test(t.element.tagName)&&D(t.element)?!0:(t.element.disabled??!1)||t.element.getAttribute("aria-disabled")==="true"}function D(t){let e=t.parentElement;for(;e!==null;){if(/^fieldset$/i.test(e.tagName)&&e.disabled){let n=Array.from(e.children);for(let r of n)if(/^legend$/i.test(r.tagName))return e.matches("fieldset[disabled] *")?!0:!r.contains(t);return!0}e=e.parentElement}return!1}function B(t){return/^(|true)$/i.test(t.getAttribute("contenteditable"))}function K(t){return!O.some(e=>e(t))}function R(t){if(t.element.hidden||t.element instanceof HTMLInputElement&&t.element.type==="hidden")return!0;let e=getComputedStyle(t.element);if(e.display==="none"||e.visibility==="hidden")return!0;let{height:n,width:r}=t.element.getBoundingClientRect();return n===0&&r===0}function E(t){return(t.element.inert??!1)||/^(|true)$/i.test(t.element.getAttribute("inert"))||t.element.parentElement!==null&&E({element:t.element.parentElement})}function P(t){return t.tabIndex<0}function V(t){return/^details$/i.test(t.element.tagName)&&Array.from(t.element.children).some(e=>/^summary$/i.test(e.tagName))}var p=Math.round(16.666666666666668),v=requestAnimationFrame??function(t){return setTimeout?.(()=>{t(Date.now())},p)};function x(t){t.state.active=!0,t.state.finished=!1;let e=t instanceof $,n=0,r;function i(a){if(!t.state.active)return;r??(r=a);let s=a-r,L=s-p,F=s+p;if(L<t.configuration.time&&t.configuration.time<F)if(t.state.active&&t.callbacks.default(e?n:void 0),n+=1,e&&n<t.configuration.count)r=void 0;else{t.state.finished=!0,t.stop();return}t.state.frame=v(i)}t.state.frame=v(i)}var A=class{get active(){return this.state.active}get finished(){return!this.active&&this.state.finished}constructor(t,e,n,r){let i=this instanceof $,a=i?"repeated":"waited";if(typeof t!="function")throw new TypeError(`A ${a} timer must have a callback function`);if(typeof e!="number"||e<0)throw new TypeError(`A ${a} timer must have a non-negative number as its time`);if(i&&(typeof n!="number"||n<2))throw new TypeError("A repeated timer must have a number above 1 as its repeat count");if(i&&r!==void 0&&typeof r!="function")throw new TypeError("A repeated timer's after-callback must be a function");this.configuration={count:n,time:e},this.callbacks={after:r,default:t},this.state={active:!1,finished:!1,frame:null}}restart(){return this.stop(),x(this),this}start(){return this.state.active||x(this),this}stop(){return this.state.active=!1,this.state.frame===void 0?this:((cancelAnimationFrame??clearTimeout)?.(this.state.frame),this.callbacks.after?.(this.finished),this.state.frame=void 0,this)}},$=class extends A{},X=class extends A{constructor(t,e){super(t,e,1,null)}};function d(t,e){return new X(t,e).start()}var u="palmer-focus-trap",h=new WeakMap;function Y(t){h.has(t)||h.set(t,new m(t))}function j(t){let e=h.get(t);e!==void 0&&(t.tabIndex=e.tabIndex,h.delete(t))}function z(t,e,n){let r=f(e);if(n===e){d(()=>{(r[t.shiftKey?r.length-1:0]??e).focus()},0);return}let i=r.indexOf(n),a=e;if(i>-1){let s=i+(t.shiftKey?-1:1);s<0?s=r.length-1:s>=r.length&&(s=0),a=r[s]??e}d(()=>{a.focus()},0)}function G(t){for(let e of t)e.type==="attributes"&&(e.target.getAttribute(u)===void 0?j(e.target):Y(e.target))}function J(t){if(t.key!=="Tab")return;let e=w(t.target,`[${u}]`);e!==void 0&&(t.preventDefault(),t.stopImmediatePropagation(),z(t,e,t.target))}var m=class{constructor(e){this.tabIndex=e.tabIndex,e.tabIndex=-1}},Q=new MutationObserver(G);Q.observe(document,{attributeFilter:[u],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});d(()=>{let t=Array.from(document.querySelectorAll(`[${u}]`));for(let e of t)e.setAttribute(u,"")},0);document.addEventListener("keydown",J,l(!1));var o="palmer-dialog",I=`${o}-close`,y=`${o}-open`,g=new WeakMap,T=new WeakMap;function M(t){t.dispatchEvent(new CustomEvent("hide",{cancelable:!0}))&&(t.hidden=!0,T.get(t)?.append(t),g.get(t)?.focus(),g.delete(t),t.dispatchEvent(new CustomEvent("toggle",{detail:"hide"})))}function N(t){t.addEventListener("click",Z,l())}function S(){M(this)}function U(t){t.key==="Escape"&&S.call(this)}function Z(){let t=document.querySelector(`#${this.getAttribute(y)}`);t instanceof b&&(g.set(t,this),k(t))}function k(t){t.dispatchEvent(new CustomEvent("show",{cancelable:!0}))&&(t.hidden=!1,document.body.append(t),(f(t)[0]??t).focus(),t.dispatchEvent(new CustomEvent("toggle",{detail:"open"})))}var b=class extends HTMLElement{get alert(){return this.getAttribute("role")==="alertdialog"}get open(){return this.parentElement===document.body&&!this.hidden}set open(e){typeof e!="boolean"||this.open===e||(e?k(this):M(this))}constructor(){super(),this.hidden=!0;let{id:e}=this;if(c(e))throw new TypeError(`<${o}> must have an ID`);if(c(this.getAttribute("aria-label"))&&c(this.getAttribute("aria-labelledby")))throw new TypeError(`<${o}> should be labelled by either the 'aria-label' or 'aria-labelledby'-attribute`);let n=this.getAttribute("role")==="alertdialog"||this.getAttribute("type")==="alert";if(n&&c(this.getAttribute("aria-describedby")))throw new TypeError(`<${o}> for alerts should be described by the 'aria-describedby'-attribute`);let r=Array.from(this.querySelectorAll(`[${I}]`));if(!r.some(s=>s instanceof HTMLButtonElement))throw new TypeError(`<${o}> must have a <button>-element with the attribute '${I}'`);let i=this.querySelector(`:scope > [${o}-content]`);if(!(i instanceof HTMLElement))throw new TypeError(`<${o}> must have an element with the attribute '${o}-content'`);let a=this.querySelector(`:scope > [${o}-overlay]`);if(!(a instanceof HTMLElement))throw new TypeError(`<${o}> must have an element with the attribute '${o}-overlay'`);T.set(this,this.parentElement),i.tabIndex=-1,a.setAttribute("aria-hidden",!0),this.setAttribute("role",n?"alertdialog":"dialog"),this.setAttribute("aria-modal",!0),this.setAttribute(u,""),this.addEventListener("keydown",U.bind(this),l());for(let s of r)n&&s===a||s.addEventListener("click",S.bind(this),l())}hide(){this.open=!1}show(){this.open=!0}};customElements.define(o,b);var _=new MutationObserver(t=>{for(let e of t)e.type==="attributes"&&e.target instanceof HTMLButtonElement&&N(e.target)});_.observe(document,{attributeFilter:[y],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});setTimeout(()=>{let t=Array.from(document.querySelectorAll(`[${y}]`));for(let e of t)N(e)},0);})();
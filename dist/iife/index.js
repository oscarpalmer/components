(()=>{function H(t){if(t instanceof MouseEvent)return{x:t.clientX,y:t.clientY};let e=t.touches[0]?.clientX,n=t.touches[0]?.clientY;return typeof e=="number"&&typeof n=="number"?{x:e,y:n}:void 0}function a(t,e){return{capture:e??!1,passive:t??!0}}var Ot=new Set(["ArrowDown","ArrowLeft","ArrowRight","ArrowUp","End","Home"]),v=new WeakMap;function Nt(t,e){if(document.activeElement?.getAttribute("palmer-disclosure-button")===void 0||!Ot.has(e.key))return;let n=v.get(t);if((n?.elements?.length??0)===0)return;let r=n.elements.indexOf(document.activeElement.parentElement);if(r===-1)return;e.preventDefault();let i=-1;switch(e.key){case"ArrowDown":case"ArrowRight":{i=r+1;break}case"ArrowLeft":case"ArrowUp":{i=r-1;break}case"End":{i=n.elements.length-1;break}case"Home":{i=0;break}default:return}i<0?i=n.elements.length-1:i>=n.elements.length&&(i=0),i!==r&&n.elements[i]?.button.focus()}function Dt(t,e){e.open&&!t.multiple&&R(t,e)}function et(t){let e=v.get(t);if(e!==void 0){e.elements=[...t.querySelectorAll(":scope > palmer-disclosure")];for(let n of e.elements)n.addEventListener("toggle",()=>Dt(t,n))}}function R(t,e){let n=v.get(t);if(n!==void 0)for(let r of n.elements)r!==e&&r.open&&(r.open=!1)}var I=class extends HTMLElement{get multiple(){return this.getAttribute("multiple")!=="false"}set multiple(e){this.setAttribute("multiple",e)}constructor(){super();let e={elements:[],observer:new MutationObserver(n=>et(this))};v.set(this,e),et(this),this.addEventListener("keydown",n=>Nt(this,n),a(!1)),this.multiple||R(this,e.elements.find(n=>n.open))}attributeChangedCallback(e){e==="multiple"&&!this.multiple&&R(this,v.get(this)?.elements.find(n=>n.open))}connectedCallback(){v.get(this)?.observer.observe(this,{childList:!0,subtree:!0})}disconnectedCallback(){v.get(this)?.observer.disconnect()}};I.observedAttributes=["max","min","value"];customElements.define("palmer-accordion",I);var p=(()=>{let t=!1;try{if("matchMedia"in window){let e=matchMedia("(pointer: coarse)");typeof e?.matches=="boolean"&&(t=e.matches)}t||(t="ontouchstart"in window||navigator.maxTouchPoints>0||(navigator.msMaxTouchPoints??0)>0)}catch{t=!1}return t})(),f={begin:p?"touchstart":"mousedown",end:p?"touchend":"mouseup",move:p?"touchmove":"mousemove"};var Wt=["linear-gradient(to bottom","hsl(0 0% 100%) 0%","hsl(0 0% 100% / 0) 50%","hsl(0 0% 0% / 0) 50%","hsl(0 0% 0%) 100%)","linear-gradient(to right","hsl(0 0% 50%) 0%","hsl(0 0% 50% / 0) 100%)"],P=new WeakMap,c="palmer-colour-picker";function qt(t,e){t.hidden=!1,e.type="range",e.max=360,e.min=0}function Ft(t,e){t.hidden=!1,t.style.backgroundColor="hsl(var(--hue-value) 100% 50%)",t.style.backgroundImage=Wt,t.style.position="relative",e.tabIndex=0,e.style.position="absolute",e.style.top=0,e.style.left=0,e.style.transform="translate3d(-50%, -50%, 0)"}function it(t,e){let n=at(t);return Vt(n)?(n.length===3&&(n=n.split("").map(r=>`${r}${r}`).join("")),n):e}function st(t){let e=it(t);if(e===void 0)return;let n=e.match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i),r=[];for(let i=0;i<3;i+=1)r.push(Number.parseInt(n[i+1],16));return{red:r[0],green:r[1],blue:r[2]}}function ot(t){function e(o){let s=(o+n/30)%12,l=r*Math.min(i,1-i);return i-l*Math.max(-1,Math.min(s-3,9-s,1))}let{hue:n,saturation:r,lightness:i}=t;return n%=360,n<0&&(n+=360),r/=100,i/=100,{red:Math.round(e(0)*255),green:Math.round(e(8)*255),blue:Math.round(e(4)*255)}}function at(t){return t?.replace(/^(#|\s)|\s$/g,"")??""}function Kt(t){t.key==="Escape"&&(t.stopPropagation(),dt(this,!0))}function Rt(){dt(this,!1)}function nt(t){p&&t.preventDefault();let{height:e,left:n,top:r,width:i}=this.well.getBoundingClientRect(),{x:o,y:s}=H(t),l=100-Math.round((s-r)/e*100),u=Math.round((o-n)/i*100);ht(this,u,l)}function Pt(){this.hsl.hue=Number.parseInt(this.hue.value,10),M(this)}function zt(t){if(t.key!=="Enter")return;t.preventDefault();let e=st(this.input.value);if(e===void 0)return;let n=ut(e);this.hsl.hue=n.hue,this.hsl.saturation=n.saturation,this.hsl.lightness=n.lightness,M(this)}function _t(t){if(!["ArrowDown","ArrowLeft","ArrowRight","ArrowUp"].includes(t.key))return;t.preventDefault();let{lightness:e,saturation:n}=this.hsl;switch(t.key){case"ArrowDown":{e-=1;break}case"ArrowLeft":{n-=1;break}case"ArrowRight":{n+=1;break}case"ArrowUp":{e+=1;break}default:return}ht(this,n,e)}function rt(t){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey||t.button>0)return;t.stopPropagation(),nt.call(this,t);let e={callbacks:{onKeydown:Kt.bind(this),onPointerEnd:Rt.bind(this),onPointerMove:nt.bind(this)},hsl:{hue:this.hsl.hue,saturation:this.hsl.saturation,lightness:this.hsl.lightness}};ct(e.callbacks,!0),P.set(this,e)}function lt(t){return`#${(t.blue|t.green<<8|t.red<<16|1<<24).toString(16).slice(1)}`}function ut(t){let{red:e,green:n,blue:r}=t;e/=255,n/=255,r/=255;let i=Math.min(e,n,r),o=Math.max(e,n,r),s=o-i,l=o-s/2,u=0,T=0;switch(s){case e:{u=(n-r)/s%6;break}case n:{u=(r-e)/s+2;break}case r:{u=(e-n)/s+2;break}default:break}return T=o===0||l===0||l===0?0:(o-l)/Math.min(l,1-l),u*=60,u<0&&(u+=360),{hue:Math.round(u),saturation:Math.round(T*100),lightness:Math.round(l*100)}}function ct(t,e){let n=e?"addEventListener":"removeEventListener";document[n]("keydown",t.onKeydown,a(!0,!0)),document[n](f.end,t.onPointerEnd,a()),document[n](f.move,t.onPointerMove,a(!p)),Bt(e)}function Bt(t){document.body.style.userSelect=t?"none":null,document.body.style.webkitUserSelect=t?"none":null}function ht(t,e,n){t.hsl.saturation=e<0?0:e>100?100:e,t.hsl.lightness=n<0?0:n>100?100:n,M(t)}function dt(t,e){let n=P.get(t);n!==void 0&&(ct(n.callbacks,!1),e&&(t.hsl.hue=n.hsl.hue,t.hsl.lightness=n.hsl.lightness,t.hsl.saturation=n.hsl.saturation,M(t)),P.delete(t),t.handle.focus())}function Vt(t){return/^([\da-f]{3}){1,2}$/i.test(at(t))}function M(t){t.hue.value=t.hsl.hue,Ut(t),Yt(t),t.input.value=lt(ot(t.hsl)),t.input.dispatchEvent(new Event("change"))}function Ut(t){let{hue:e,lightness:n,saturation:r}=t.hsl;for(let i of[t,t.hue,t.well])i.style.setProperty("--hue-handle",`${e/360*100}%`),i.style.setProperty("--hue-value",e),i.style.setProperty("--value",`hsl(${e} ${r}% ${n}%)`)}function Yt(t){let{handle:e,hsl:n}=t;e.style.top=`${100-n.lightness}%`,e.style.left=`${n.saturation}%`}var z=class extends HTMLElement{get value(){let e=ot(this.hsl);return{rgb:e,hex:lt(e),hsl:this.hsl}}constructor(){super();let e=this.querySelector(`[${c}-hue]`),n=e?.querySelector(`[${c}-hue-input]`);if(!(e instanceof HTMLElement))throw new TypeError(`<${c}> needs an element with the attribute '${c}-hue' to hold the hue input`);if(!(n instanceof HTMLInputElement))throw new TypeError(`<${c}> needs an <input>-element with the attribute '${c}-hue-input'`);let r=this.querySelector(`[${c}-input]`);if(!(r instanceof HTMLInputElement)||!/^(color|text)$/i.test(r.type))throw new TypeError(`<${c}> needs an <input>-element with the attribute '${c}-input'`);let i=this.querySelector(`[${c}-well]`),o=i?.querySelector(`[${c}-well-handle]`);if([i,o].some(u=>!(u instanceof HTMLElement)))throw new TypeError(`<${c}> needs two elements for the colour well: one wrapping element with the attribute '${c}-well', and one within it with the attribute '${c}-well-handle'`);this.handle=o,this.hue=n,this.input=r,this.well=i,r.pattern="#?([\\da-fA-F]{3}){1,2}",r.type="text";let s=it(r.getAttribute("value")??this.getAttribute("value"),"000000"),l=st(s);this.hsl=ut(l),qt(e,n),Ft(i,o),this.input.addEventListener("keydown",zt.bind(this),a(!1)),this.handle.addEventListener("keydown",_t.bind(this),a(!1)),this.handle.addEventListener(f.begin,rt.bind(this),a()),i.addEventListener(f.begin,rt.bind(this),a()),this.hue.addEventListener("input",Pt.bind(this),a()),M(this)}};customElements.define(c,z);function E(t,e,n){let r=typeof e=="string";if((n??!0)&&(r?t.matches(e):e(t)))return t;let i=t?.parentElement;for(;i!==null;){if(i===document.body)return;if(r?i.matches(e):e(i))break;i=i.parentElement}return i??void 0}function _(t){return typeof t=="number"?t:Number.parseInt(typeof t=="string"?t:String(t),10)}function ft(t){return getComputedStyle?.(t)?.direction==="rtl"?"rtl":"ltr"}function h(t){return(t??"").trim().length===0}var jt=[Jt,ee,gt,te,ne],Xt=['[contenteditable]:not([contenteditable="false"])',"[tabindex]:not(slot)","a[href]","audio[controls]","button","details","details > summary:first-of-type","iframe","input","select","textarea","video[controls]"].map(t=>`${t}:not([inert])`).join(",");function $(t){let e=Array.from(t.querySelectorAll(Xt)).map(r=>({element:r,tabIndex:mt(r)})).filter(r=>pt(r)),n=[];for(let r of e)n[r.tabIndex]===void 0?n[r.tabIndex]=[r.element]:n[r.tabIndex].push(r.element);return n.flat()}function mt(t){return t.tabIndex>-1?t.tabIndex:/^(audio|details|video)$/i.test(t.tagName)||Zt(t)?Gt(t)?-1:0:-1}function Gt(t){return!Number.isNaN(Number.parseInt(t.getAttribute("tabindex"),10))}function Jt(t){return/^(button|input|select|textarea)$/i.test(t.element.tagName)&&Qt(t.element)?!0:(t.element.disabled??!1)||t.element.getAttribute("aria-disabled")==="true"}function Qt(t){let e=t.parentElement;for(;e!==null;){if(/^fieldset$/i.test(e.tagName)&&e.disabled){let n=Array.from(e.children);for(let r of n)if(/^legend$/i.test(r.tagName))return e.matches("fieldset[disabled] *")?!0:!r.contains(t);return!0}e=e.parentElement}return!1}function Zt(t){return/^(|true)$/i.test(t.getAttribute("contenteditable"))}function bt(t){return pt({element:t,tabIndex:mt(t)})}function pt(t){return!jt.some(e=>e(t))}function te(t){if(t.element.hidden||t.element instanceof HTMLInputElement&&t.element.type==="hidden")return!0;let e=getComputedStyle(t.element);if(e.display==="none"||e.visibility==="hidden")return!0;let{height:n,width:r}=t.element.getBoundingClientRect();return n===0&&r===0}function gt(t){return(t.element.inert??!1)||/^(|true)$/i.test(t.element.getAttribute("inert"))||t.element.parentElement!==null&&gt({element:t.element.parentElement})}function ee(t){return t.tabIndex<0}function ne(t){return/^details$/i.test(t.element.tagName)&&Array.from(t.element.children).some(e=>/^summary$/i.test(e.tagName))}var B=Math.round(16.666666666666668),yt=requestAnimationFrame??function(t){return setTimeout?.(()=>{t(Date.now())},B)};function wt(t){t.state.active=!0,t.state.finished=!1;let e=t instanceof C,n=0,r;function i(o){if(!t.state.active)return;r??(r=o);let s=o-r,l=s-B,u=s+B;if(l<t.configuration.time&&t.configuration.time<u)if(t.state.active&&t.callbacks.default(e?n:void 0),n+=1,e&&n<t.configuration.count)r=void 0;else{t.state.finished=!0,t.stop();return}t.state.frame=yt(i)}t.state.frame=yt(i)}var vt=class{get active(){return this.state.active}get finished(){return!this.active&&this.state.finished}constructor(t,e,n,r){let i=this instanceof C,o=i?"repeated":"waited";if(typeof t!="function")throw new TypeError(`A ${o} timer must have a callback function`);if(typeof e!="number"||e<0)throw new TypeError(`A ${o} timer must have a non-negative number as its time`);if(i&&(typeof n!="number"||n<2))throw new TypeError("A repeated timer must have a number above 1 as its repeat count");if(i&&r!==void 0&&typeof r!="function")throw new TypeError("A repeated timer's after-callback must be a function");this.configuration={count:n,time:e},this.callbacks={after:r,default:t},this.state={active:!1,finished:!1,frame:null}}restart(){return this.stop(),wt(this),this}start(){return this.state.active||wt(this),this}stop(){return this.state.active=!1,this.state.frame===void 0?this:((cancelAnimationFrame??clearTimeout)?.(this.state.frame),this.callbacks.after?.(this.finished),this.state.frame=void 0,this)}},C=class extends vt{},re=class extends vt{constructor(t,e){super(t,e,1,null)}};function y(t,e){return new re(t,e).start()}var g="palmer-focus-trap",O=new WeakMap;function ie(t){O.has(t)||O.set(t,new V(t))}function se(t){let e=O.get(t);e!==void 0&&(t.tabIndex=e.tabIndex,O.delete(t))}function oe(t,e,n){let r=$(e);if(n===e){y(()=>{(r[t.shiftKey?r.length-1:0]??e).focus()},0);return}let i=r.indexOf(n),o=e;if(i>-1){let s=i+(t.shiftKey?-1:1);s<0?s=r.length-1:s>=r.length&&(s=0),o=r[s]??e}y(()=>{o.focus()},0)}function ae(t){for(let e of t)e.type==="attributes"&&(e.target.getAttribute(g)===void 0?se(e.target):ie(e.target))}function le(t){if(t.key!=="Tab")return;let e=E(t.target,`[${g}]`);e!==void 0&&(t.preventDefault(),t.stopImmediatePropagation(),oe(t,e,t.target))}var V=class{constructor(e){this.tabIndex=e.tabIndex,e.tabIndex=-1}},ue=new MutationObserver(ae);ue.observe(document,{attributeFilter:[g],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});y(()=>{let t=Array.from(document.querySelectorAll(`[${g}]`));for(let e of t)e.setAttribute(g,"")},0);document.addEventListener("keydown",le,a(!1));var d="palmer-dialog",Et=`${d}-close`,Y=`${d}-open`,U=new WeakMap,At=new WeakMap;function kt(t){t.dispatchEvent(new CustomEvent("hide",{cancelable:!0}))&&(t.hidden=!0,At.get(t)?.append(t),U.get(t)?.focus(),U.delete(t),t.dispatchEvent(new CustomEvent("toggle",{detail:"hide"})))}function $t(t){t.addEventListener("click",he,a())}function xt(){kt(this)}function ce(t){t.key==="Escape"&&xt.call(this)}function he(){let t=document.querySelector(`#${this.getAttribute(Y)}`);t instanceof N&&(U.set(t,this),Tt(t))}function Tt(t){t.dispatchEvent(new CustomEvent("show",{cancelable:!0}))&&(t.hidden=!1,document.body.append(t),($(t)[0]??t).focus(),t.dispatchEvent(new CustomEvent("toggle",{detail:"open"})))}var N=class extends HTMLElement{get alert(){return this.getAttribute("role")==="alertdialog"}get open(){return this.parentElement===document.body&&!this.hidden}set open(e){typeof e!="boolean"||this.open===e||(e?Tt(this):kt(this))}constructor(){super(),this.hidden=!0;let{id:e}=this;if(h(e))throw new TypeError(`<${d}> must have an ID`);if(h(this.getAttribute("aria-label"))&&h(this.getAttribute("aria-labelledby")))throw new TypeError(`<${d}> should be labelled by either the 'aria-label' or 'aria-labelledby'-attribute`);let n=this.getAttribute("role")==="alertdialog"||this.getAttribute("type")==="alert";if(n&&h(this.getAttribute("aria-describedby")))throw new TypeError(`<${d}> for alerts should be described by the 'aria-describedby'-attribute`);let r=Array.from(this.querySelectorAll(`[${Et}]`));if(!r.some(s=>s instanceof HTMLButtonElement))throw new TypeError(`<${d}> must have a <button>-element with the attribute '${Et}'`);let i=this.querySelector(`:scope > [${d}-content]`);if(!(i instanceof HTMLElement))throw new TypeError(`<${d}> must have an element with the attribute '${d}-content'`);let o=this.querySelector(`:scope > [${d}-overlay]`);if(!(o instanceof HTMLElement))throw new TypeError(`<${d}> must have an element with the attribute '${d}-overlay'`);At.set(this,this.parentElement),i.tabIndex=-1,o.setAttribute("aria-hidden",!0),this.setAttribute("role",n?"alertdialog":"dialog"),this.setAttribute("aria-modal",!0),this.setAttribute(g,""),this.addEventListener("keydown",ce.bind(this),a());for(let s of r)n&&s===o||s.addEventListener("click",xt.bind(this),a())}hide(){this.open=!1}show(){this.open=!0}};customElements.define(d,N);var de=new MutationObserver(t=>{for(let e of t)e.type==="attributes"&&e.target instanceof HTMLButtonElement&&$t(e.target)});de.observe(document,{attributeFilter:[Y],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});setTimeout(()=>{let t=Array.from(document.querySelectorAll(`[${Y}]`));for(let e of t)$t(e)},0);var A="palmer-disclosure",fe=0;function L(t,e){t.dispatchEvent(new CustomEvent("toggle",{cancelable:!0,detail:e?"show":"hide"}))&&(t.button.setAttribute("aria-expanded",e),t.content.hidden=!e,t.button.focus())}var j=class extends HTMLElement{get open(){return this.button.getAttribute("aria-expanded")==="true"}set open(e){typeof e=="boolean"&&e!==this.open&&L(this,e)}constructor(){super();let e=this.querySelector(`[${A}-button]`),n=this.querySelector(`[${A}-content]`);if(!(e instanceof HTMLButtonElement))throw new TypeError(`<${A}> needs a <button>-element with the attribute '${A}-button'`);if(!(n instanceof HTMLElement))throw new TypeError(`<${A}> needs an element with the attribute '${A}-content'`);this.button=e,this.content=n;let{open:r}=this;e.hidden=!1,n.hidden=!r;let{id:i}=n;h(i)&&(i=`palmer_disclosure_${++fe}`),e.setAttribute("aria-expanded",r),e.setAttribute("aria-controls",i),n.id=i,e.addEventListener("click",o=>L(this,!this.open),a())}hide(){this.open&&L(this,!1)}show(){this.open||L(this,!0)}toggle(){L(this,!this.open)}};customElements.define(A,j);var Mt=["above","above-left","above-right","below","below-left","below-right","horizontal","horizontal-bottom","horizontal-top","left","left-bottom","left-top","right","right-bottom","right-top","vertical","vertical-left","vertical-right"],me=["bottom","height","left","right","top","width"];function be(t){let{end:e,max:n,offset:r,preferMin:i,start:o}=t,s=e+r,l=o-r;return i?l>=0?l:s<=n?e:l:s<=n?e:l>=0?l:e}function pe(t,e,n){let{left:r,top:i}=n;switch(t){case"horizontal":case"horizontal-bottom":case"horizontal-top":return t.replace("horizontal",e.right-1<r&&r<e.right+1?"right":"left");case"vertical":case"vertical-left":case"vertical-right":return t.replace("vertical",e.bottom-1<i&&i<e.bottom+1?"below":"above");default:return t}}function ge(t,e,n,r){let{anchor:i,floater:o}=n;if((t?["above","below","vertical"]:["horizontal","left","right"]).includes(e)){let s=(t?i.width:i.height)/2,l=(t?o.width:o.height)/2;return(t?i.left:i.top)+s-l}if(t?e.startsWith("horizontal"):e.startsWith("vertical"))return be({preferMin:r,end:t?i.right:i.bottom,max:t?innerWidth:innerHeight,offset:t?o.width:o.height,start:t?i.left:i.top})}function ye(t,e){if(t===null)return e;let n=t.trim().toLowerCase(),r=Mt.indexOf(n);return r>-1?Mt[r]??e:e}function Lt(t,e,n,r){let{anchor:i,floater:o}=n;if(t?e.startsWith("right"):e.endsWith("top"))return t?i.right:i.top;if(t?e.startsWith("left"):e.endsWith("bottom"))return(t?i.left:i.bottom)-(t?o.width:o.height);if(t?e.endsWith("right"):e.startsWith("above"))return(t?i.right:i.top)-(t?o.width:o.height);let s=ge(t,e,n,r);return s!==void 0?s:t?i.left:i.bottom}function D(t){let{anchor:e,floater:n,parent:r}=t.elements,{attribute:i,defaultValue:o,preferAbove:s}=t.position,l=ye((r??e).getAttribute(i)??"",o),u=ft(n)==="rtl",T;function Ht(){e.after(n)}function It(Ct){let F=e.getBoundingClientRect();if(Ct>10&&me.every(tt=>T?.[tt]===F[tt]))return;T=F;let Q={anchor:F,floater:n.getBoundingClientRect()},K={left:Lt(!0,l,Q,u),top:Lt(!1,l,Q,s)},Z=`matrix(1, 0, 0, 1, ${K.left}, ${K.top})`;n.style.transform!==Z&&(n.setAttribute("position",pe(l,e,K)),n.style.position="fixed",n.style.inset="0 auto auto 0",n.style.transform=Z)}return document.body.append(n),n.hidden=!1,new C(It,0,Number.POSITIVE_INFINITY,Ht).start()}var m="palmer-popover",St=new WeakMap,we=0;function ve(t,e){Ee(t,e),y(()=>{(e?$(t.content)?.[0]??t.content:t.button)?.focus()},0),t.dispatchEvent(new CustomEvent("toggle",{detail:e?"open":"show"}))}function Ee(t,e){let n=St.get(t);if(n===void 0)return;let r=e?"addEventListener":"removeEventListener";document[r](f.begin,n.pointer,a()),document[r]("keydown",n.keydown,a())}function x(t,e){let n=typeof e=="boolean"?!e:t.open;t.dispatchEvent(new CustomEvent(n?"hide":"show",{cancelable:!0}))&&(t.button.setAttribute("aria-expanded",!n),t.timer?.stop(),n?t.content.hidden=!0:t.timer=D({elements:{anchor:t.button,floater:t.content,parent:t},position:{attribute:"position",defaultValue:"vertical",preferAbove:!1}}),ve(t,!n))}function Ae(t){(!(t instanceof KeyboardEvent)||[" ","Enter"].includes(t.key))&&x(this,!1)}function ke(t){this.open&&t instanceof KeyboardEvent&&t.key==="Escape"&&x(this,!1)}function $e(t){this.open&&E(t.target,e=>[this.button,this.content].includes(e))===void 0&&x(this,!1)}function xe(){x(this)}function Te(t){t.button.addEventListener("click",xe.bind(t),a());let e=Array.from(t.querySelectorAll(`[${m}-close]`));for(let n of e)n.addEventListener("click",Ae.bind(t),a())}var X=class extends HTMLElement{get open(){return this.button.getAttribute("aria-expanded")==="true"}set open(e){typeof e=="boolean"&&e!==this.open&&x(this,open)}constructor(){if(super(),E(this,m,!1))throw new TypeError(`<${m}>-elements must not be nested within each other`);let e=this.querySelector(`[${m}-button]`),n=this.querySelector(`[${m}-content]`);if(!(e instanceof HTMLButtonElement))throw new TypeError(`<${m}> must have a <button>-element with the attribute '${m}-button`);if(!(n instanceof HTMLElement))throw new TypeError(`<${m}> must have an element with the attribute '${m}-content'`);this.button=e,this.content=n,this.timer=void 0,n.hidden=!0,h(this.id)&&(this.id=`palmer_popover_${++we}`),h(e.id)&&(e.id=`${this.id}_button`),h(n.id)&&(n.id=`${this.id}_content`),e.setAttribute("aria-controls",n.id),e.setAttribute("aria-expanded",!1),e.setAttribute("aria-haspopup","dialog"),n.setAttribute("role","dialog"),n.setAttribute("aria-modal",!1),n.setAttribute(g,""),St.set(this,{keydown:ke.bind(this),pointer:$e.bind(this)}),Te(this)}hide(){this.open=!1}show(){this.open=!0}toggle(){x(this)}};customElements.define(m,X);var b="palmer-splitter",Me=new Set(["horizontal","vertical"]),w=new WeakMap,Le=0;function Se(t){t.key==="Escape"&&G(this,!1)}function He(t){G(t,!0)}function Ie(){G(this,!1)}function Ce(t){p&&t.preventDefault();let e=H(t);if(e===void 0)return;let n=this.getBoundingClientRect(),r=this.type==="horizontal"?(e.y-n.top)/n.height:(e.x-n.left)/n.width;S(this,{separator:this.separator,value:r*100})}function Oe(t,e){if(!["ArrowDown","ArrowLeft","ArrowRight","ArrowUp","End","Escape","Home"].includes(e.key)||(t.type==="horizontal"?["ArrowLeft","ArrowRight"]:["ArrowDown","ArrowUp"]).includes(e.key))return;let{values:r}=w.get(t);if(r===void 0)return;let i;switch(e.key){case"ArrowDown":case"ArrowLeft":case"ArrowRight":case"ArrowUp":{i=Math.round(t.value+(["ArrowLeft","ArrowUp"].includes(e.key)?-1:1));break}case"End":case"Home":{i=e.key==="End"?r.maximum:r.minimum;break}case"Escape":{i=r.initial??r.original,r.initial=void 0;break}default:break}S(t,{value:i,values:r,separator:t.separator})}function Ne(t,e){let{key:n,separator:r,setFlex:i}=e,o=e.values??w.get(t)?.values,s=_(e.value);o===void 0||Number.isNaN(s)||s===o[n]||n==="maximum"&&s<o.minimum||n==="minimum"&&s>o.maximum||(n==="maximum"&&s>100?s=100:n==="minimum"&&s<0&&(s=0),o[e.key]=s,r.setAttribute(n==="maximum"?"aria-valuemax":"aria-valuemin",s),i&&(n==="maximum"&&s<o.current||n==="minimum"&&s>o.current)&&S(t,{separator:r,value:s,values:o}))}function G(t,e){let n=w.get(t);if(n===void 0)return;e&&(n.values.initial=Number(n.values.current));let r=e?"addEventListener":"removeEventListener";document[r]("keydown",n.callbacks.keydown,a()),document[r](f.end,n.callbacks.pointerEnd,a()),document[r](f.move,n.callbacks.pointerMove,a(!p)),n.dragging=e,document.body.style.userSelect=e?"none":null,document.body.style.webkitUserSelect=e?"none":null}function S(t,e){let{separator:n}=e,r=e.values??w.get(t)?.values,i=_(e.value);r===void 0||Number.isNaN(i)||i===r.current||(i<r.minimum?i=r.minimum:i>r.maximum&&(i=r.maximum),(e.setOriginal??!1)&&(r.original=i),n.setAttribute("aria-valuenow",i),t.primary.style.flex=`${i/100}`,t.secondary.style.flex=`${(100-i)/100}`,r.current=i,t.dispatchEvent(new CustomEvent("change",{detail:i})))}function De(t){let{handle:e}=t;e.hidden=!1,e.setAttribute("aria-hidden",!0),e.addEventListener(f.begin,()=>He(t),a())}function We(t){let{separator:e}=t;e.hidden=!1,e.tabIndex=0,e.setAttribute("role","separator"),e.setAttribute("aria-controls",t.primary.id),e.setAttribute("aria-valuemax",100),e.setAttribute("aria-valuemin",0),e.setAttribute("aria-valuenow",50),h(t.getAttribute("value"))&&S(t,{separator:e,value:50}),e.addEventListener("keydown",n=>Oe(t,n),a())}var W=class extends HTMLElement{get max(){return w.get(this)?.values.maximum}set max(e){this.setAttribute("max",e)}get min(){return w.get(this)?.values.minimum}set min(e){this.setAttribute("min",e)}get type(){let e=this.getAttribute("type")??"vertical";return Me.has(e)?e:"vertical"}set type(e){this.setAttribute("type",e)}get value(){return w.get(this)?.values.current}set value(e){this.setAttribute("value",e)}constructor(){super();let e=Array.from(this.querySelectorAll(`:scope > [${b}-panel]`));if(e.length!==2||e.some(u=>!(u instanceof HTMLElement)))throw new TypeError(`<${b}> must have two direct child elements with the attribute '${b}-panel'`);let n=this.querySelector(`:scope > [${b}-separator]`),r=n?.querySelector(`:scope > [${b}-separator-handle]`);if([n,r].some(u=>!(u instanceof HTMLElement)))throw new TypeError(`<${b}> must have a separator element with the attribute '${b}-separator', and it must have a child element with the attribute '${b}-separator-handle'`);let i=e[0],o=e[1],s=Array.from(this.children);if(!(s.indexOf(i)<s.indexOf(n)&&s.indexOf(n)<s.indexOf(o)))throw new TypeError(`<${b}> must have elements with the order of: panel, separator, panel`);let l={callbacks:{keydown:Se.bind(this),pointerEnd:Ie.bind(this),pointerMove:Ce.bind(this)},dragging:!1,values:{current:-1,maximum:100,minimum:0,original:50}};w.set(this,l),this.primary=i,this.secondary=o,this.handle=r,this.separator=n,h(i.id)&&(i.id=`palmer_splitter_primary_panel_${++Le}`),We(this),De(this)}attributeChangedCallback(e,n,r){switch(e){case"max":case"min":{Ne(this,{key:e==="max"?"maximum":"minimum",separator:this.separator,setFlex:!0,value:r});break}case"value":{S(this,{separator:this.separator,setOriginal:!0,value:r});break}default:break}}};W.observedAttributes=["max","min","value"];customElements.define(b,W);var k="palmer-tooltip",qe=`${k}-position`,q=new WeakMap;function Fe(t){let e=t.getAttribute("aria-describedby")??t.getAttribute("aria-labelledby"),n=e===null?null:document.querySelector(`#${e}`);if(n===null)throw new TypeError(`A '${k}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);return n.hidden=!0,n.setAttribute("aria-hidden",!0),n.setAttribute("role","tooltip"),n.setAttribute(`${k}-content`,""),n}function Ke(t){q.has(t)||q.set(t,new J(t))}function Re(t){let e=q.get(t);e!==void 0&&(e.handleCallbacks(!1),q.delete(t))}function Pe(t){for(let e of t)e.type==="attributes"&&(e.target.getAttribute(k)===null?Re(e.target):Ke(e.target))}var J=class{constructor(e){this.anchor=e,this.callbacks={click:this.onClick.bind(this),hide:this.onHide.bind(this),keydown:this.onKeyDown.bind(this),show:this.onShow.bind(this)},this.focusable=bt(e),this.floater=Fe(e),this.timer=void 0,this.handleCallbacks(!0)}onClick(e){E(e.target,n=>[this.anchor,this.floater].includes(n))===void 0&&this.toggle(!1)}onHide(){this.toggle(!1)}onKeyDown(e){e instanceof KeyboardEvent&&e.key==="Escape"&&this.toggle(!1)}onShow(){this.toggle(!0)}toggle(e){let n=e?"addEventListener":"removeEventListener";document[n]("click",this.callbacks.click,a()),document[n]("keydown",this.callbacks.keydown,a()),e?(this.timer?.stop(),this.timer=D({elements:{anchor:this.anchor,floater:this.floater},position:{attribute:qe,defaultValue:"vertical",preferAbove:!0}})):(this.floater.hidden=!0,this.timer?.stop())}handleCallbacks(e){let{anchor:n,floater:r,focusable:i}=this,o=e?"addEventListener":"removeEventListener";for(let s of[n,r])s[o]("mouseenter",this.callbacks.show,a()),s[o]("mouseleave",this.callbacks.hide,a()),s[o]("touchstart",this.callbacks.show,a());i&&(n[o]("blur",this.callbacks.hide,a()),n[o]("focus",this.callbacks.show,a()))}},ze=new MutationObserver(Pe);ze.observe(document,{attributeFilter:[k],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});y(()=>{let t=Array.from(document.querySelectorAll(`[${k}]`));for(let e of t)e.setAttribute(k,"")},0);})();

(()=>{function b(t){if(t instanceof MouseEvent)return{x:t.clientX,y:t.clientY};let e=t.touches[0]?.clientX,n=t.touches[0]?.clientY;return e===void 0||n===void 0?void 0:{x:e,y:n}}function a(t,e){return{capture:e??!1,passive:t??!0}}var c=(()=>{let t=!1;try{if("matchMedia"in window){let e=matchMedia("(pointer: coarse)");typeof e?.matches=="boolean"&&(t=e.matches)}t||(t="ontouchstart"in window||navigator.maxTouchPoints>0||(navigator.msMaxTouchPoints??0)>0)}catch{t=!1}return t})(),d={begin:c?"touchstart":"mousedown",end:c?"touchend":"mouseup",move:c?"touchmove":"mousemove"};var P=["linear-gradient(to bottom","hsl(0 0% 100%) 0%","hsl(0 0% 100% / 0) 50%","hsl(0 0% 0% / 0) 50%","hsl(0 0% 0%) 100%)","linear-gradient(to right","hsl(0 0% 50%) 0%","hsl(0 0% 50% / 0) 100%)"],g=new WeakMap,o="palmer-colour-picker";function A(t,e){t.hidden=!1,e.type="range",e.max=360,e.min=0}function I(t,e){t.hidden=!1,t.style.backgroundColor="hsl(var(--hue-value) 100% 50%)",t.style.backgroundImage=P,t.style.position="relative",e.tabIndex=0,e.style.position="absolute",e.style.top=0,e.style.left=0,e.style.transform="translate3d(-50%, -50%, 0)"}function M(t,e){let n=E(t);return W(n)?(n.length===3&&(n=n.split("").map(s=>`${s}${s}`).join("")),n):e}function $(t){let e=M(t);if(e===void 0)return;let n=e.match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i),s=[];for(let i=0;i<3;i+=1)s.push(Number.parseInt(n[i+1],16));return{red:s[0],green:s[1],blue:s[2]}}function x(t){function e(r){let u=(r+n/30)%12,h=s*Math.min(i,1-i);return i-h*Math.max(-1,Math.min(u-3,9-u,1))}let{hue:n,saturation:s,lightness:i}=t;return n%=360,n<0&&(n+=360),s/=100,i/=100,{red:Math.round(e(0)*255),green:Math.round(e(8)*255),blue:Math.round(e(4)*255)}}function E(t){return t?.replace(/^(#|\s)|\s$/g,"")??""}function K(t){t.key==="Escape"&&(t.stopPropagation(),H(this,!0))}function S(){H(this,!1)}function w(t){c&&t.preventDefault();let{height:e,left:n,top:s,width:i}=this.well.getBoundingClientRect(),{x:r,y:u}=b(t),h=100-Math.round((u-s)/e*100),l=Math.round((r-n)/i*100);L(this,l,h)}function D(){this.hsl.hue=Number.parseInt(this.hue.value,10),f(this)}function C(t){if(t.key!=="Enter")return;t.preventDefault();let e=$(this.input.value);if(e===void 0)return;let n=v(e);this.hsl.hue=n.hue,this.hsl.saturation=n.saturation,this.hsl.lightness=n.lightness,f(this)}function q(t){if(!["ArrowDown","ArrowLeft","ArrowRight","ArrowUp"].includes(t.key))return;t.preventDefault();let{lightness:e,saturation:n}=this.hsl;switch(t.key){case"ArrowDown":{e-=1;break}case"ArrowLeft":{n-=1;break}case"ArrowRight":{n+=1;break}case"ArrowUp":{e+=1;break}default:return}L(this,n,e)}function m(t){if(t.altKey||t.ctrlKey||t.metaKey||t.shiftKey||t.button>0)return;t.stopPropagation(),w.call(this,t);let e={callbacks:{onKeydown:K.bind(this),onPointerEnd:S.bind(this),onPointerMove:w.bind(this)},hsl:{hue:this.hsl.hue,saturation:this.hsl.saturation,lightness:this.hsl.lightness}};T(e.callbacks,!0),g.set(this,e)}function k(t){return`#${(t.blue|t.green<<8|t.red<<16|1<<24).toString(16).slice(1)}`}function v(t){let{red:e,green:n,blue:s}=t;e/=255,n/=255,s/=255;let i=Math.min(e,n,s),r=Math.max(e,n,s),u=r-i,h=r-u/2,l=0,y=0;switch(u){case e:{l=(n-s)/u%6;break}case n:{l=(s-e)/u+2;break}case s:{l=(e-n)/u+2;break}default:break}return y=r===0||h===0||h===0?0:(r-h)/Math.min(h,1-h),l*=60,l<0&&(l+=360),{hue:Math.round(l),saturation:Math.round(y*100),lightness:Math.round(h*100)}}function T(t,e){let n=e?"addEventListener":"removeEventListener";document[n]("keydown",t.onKeydown,a(!0,!0)),document[n](d.end,t.onPointerEnd,a()),document[n](d.move,t.onPointerMove,a(!c)),R(e)}function R(t){document.body.style.userSelect=t?"none":null,document.body.style.webkitUserSelect=t?"none":null}function L(t,e,n){t.hsl.saturation=e<0?0:e>100?100:e,t.hsl.lightness=n<0?0:n>100?100:n,f(t)}function H(t,e){let n=g.get(t);n!==void 0&&(T(n.callbacks,!1),e&&(t.hsl.hue=n.hsl.hue,t.hsl.lightness=n.hsl.lightness,t.hsl.saturation=n.hsl.saturation,f(t)),g.delete(t),t.handle.focus())}function W(t){return/^([\da-f]{3}){1,2}$/i.test(E(t))}function f(t){t.hue.value=t.hsl.hue,U(t),B(t),t.input.value=k(x(t.hsl)),t.input.dispatchEvent(new Event("change"))}function U(t){let{hue:e,lightness:n,saturation:s}=t.hsl;for(let i of[t,t.hue,t.well])i.style.setProperty("--hue-handle",`${e/360*100}%`),i.style.setProperty("--hue-value",e),i.style.setProperty("--value",`hsl(${e} ${s}% ${n}%)`)}function B(t){let{handle:e,hsl:n}=t;e.style.top=`${100-n.lightness}%`,e.style.left=`${n.saturation}%`}var p=class extends HTMLElement{get value(){let e=x(this.hsl);return{rgb:e,hex:k(e),hsl:this.hsl}}constructor(){super();let e=this.querySelector(`[${o}-hue]`),n=e?.querySelector(`[${o}-hue-input]`);if(!(e instanceof HTMLElement))throw new TypeError(`<${o}> needs an element with the attribute '${o}-hue' to hold the hue input`);if(!(n instanceof HTMLInputElement))throw new TypeError(`<${o}> needs an <input>-element with the attribute '${o}-hue-input'`);let s=this.querySelector(`[${o}-input]`);if(!(s instanceof HTMLInputElement)||!/^(color|text)$/i.test(s.type))throw new TypeError(`<${o}> needs an <input>-element with the attribute '${o}-input'`);let i=this.querySelector(`[${o}-well]`),r=i?.querySelector(`[${o}-well-handle]`);if([i,r].some(l=>!(l instanceof HTMLElement)))throw new TypeError(`<${o}> needs two elements for the colour well: one wrapping element with the attribute '${o}-well', and one within it with the attribute '${o}-well-handle'`);this.handle=r,this.hue=n,this.input=s,this.well=i,s.pattern="#?([\\da-fA-F]{3}){1,2}",s.type="text";let u=M(s.getAttribute("value")??this.getAttribute("value"),"000000"),h=$(u);this.hsl=v(h),A(e,n),I(i,r),this.input.addEventListener("keydown",C.bind(this),a(!1)),this.handle.addEventListener("keydown",q.bind(this),a(!1)),this.handle.addEventListener(d.begin,m.bind(this),a()),i.addEventListener(d.begin,m.bind(this),a()),this.hue.addEventListener("input",D.bind(this),a()),f(this)}};customElements.define(o,p);})();
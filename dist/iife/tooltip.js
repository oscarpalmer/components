"use strict";(()=>{var M=Object.defineProperty;var H=(i,e,t)=>e in i?M(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var b=(i,e,t)=>(H(i,typeof e!="symbol"?e+"":e,t),t);var s={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},A=['[contenteditable]:not([contenteditable="false"])',"[href]","[tabindex]:not(slot)","audio[controls]","button","details","details[open] > summary","input","select","textarea","video[controls]"],y=A.map(i=>`${i}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function d(i){var e,t,n;return(n=(e=globalThis.requestAnimationFrame)==null?void 0:e.call(globalThis,i))!=null?n:(t=globalThis.setTimeout)==null?void 0:t.call(globalThis,()=>{i(Date.now())},16)}function E(i,e){let t=typeof e=="string";if(t?i.matches(e):e(i))return i;let n=i==null?void 0:i.parentElement;for(;n!=null;){if(n===document.body)return;if(t?n.matches(e):e(n))break;n=n.parentElement}return n!=null?n:void 0}function h(i,e,t){t==null?i.removeAttribute(e):i.setAttribute(e,String(t))}function w(i,e,t){i.setAttribute(e,String(typeof t=="boolean"?t:!1))}var k=["above","above-left","above-right","below","below-left","below-right","horizontal","left","right","vertical"],l=class{static update(e,t){let{anchor:n,floater:o,parent:r}=e;function c(){var m;if(o.hidden){n.insertAdjacentElement("afterend",o);return}let g=l.getPosition((m=(r!=null?r:n).getAttribute("position"))!=null?m:"",t),p={anchor:n.getBoundingClientRect(),floater:o.getBoundingClientRect()},L=l.getTop(p,g),T=`matrix(1, 0, 0, 1, ${l.getLeft(p,g)}, ${L})`;o.style.position="fixed",o.style.inset="0 auto auto 0",o.style.transform=T,d(c)}document.body.appendChild(o),o.hidden=!1,d(c)}static getLeft(e,t){let{left:n,right:o}=e.anchor,{width:r}=e.floater;switch(t){case"above":case"below":case"vertical":return n+e.anchor.width/2-r/2;case"above-left":case"below-left":return n;case"above-right":case"below-right":return o-r;case"horizontal":return o+r>globalThis.innerWidth?n-r<0?o:n-r:o;case"left":return n-r;case"right":return o;default:return 0}}static getTop(e,t){let{bottom:n,top:o}=e.anchor,{height:r}=e.floater;switch(t){case"above":case"above-left":case"above-right":return o-r;case"below":case"below-left":case"below-right":return n;case"horizontal":case"left":case"right":return o+e.anchor.height/2-r/2;case"vertical":return n+r>globalThis.innerHeight?o-r<0?n:o-r:n;default:return 0}}static getPosition(e,t){var r;if(e==null)return t;let n=e.trim().toLowerCase(),o=k.indexOf(n);return o>-1&&(r=k[o])!=null?r:t}};var u="toasty-tooltip",x=`${u}-content`,f=new WeakMap,v=class{static observer(e){for(let t of e){if(t.type!=="attributes")continue;let n=t.target;n.getAttribute(u)==null?a.destroy(n):a.create(n)}}},a=class{constructor(e){this.anchor=e;b(this,"callbacks",{click:this.onClick.bind(this),hide:this.onHide.bind(this),keydown:this.onKeyDown.bind(this),show:this.onShow.bind(this)});b(this,"floater");b(this,"focusable");this.focusable=e.matches(y),this.floater=a.createFloater(e),this.handleCallbacks(!0)}static create(e){f.has(e)||f.set(e,new a(e))}static destroy(e){let t=f.get(e);typeof t!="undefined"&&(t.handleCallbacks(!1),f.delete(e))}static createFloater(e){var o;let t=(o=e.getAttribute("aria-describedby"))!=null?o:e.getAttribute("aria-labelledby"),n=t==null?null:document.getElementById(t);if(n==null)throw new Error(`A '${u}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);return n.hidden=!0,h(n,x,""),h(n,"role","tooltip"),w(n,"aria-hidden",!0),n}onClick(e){E(e.target,t=>[this.anchor,this.floater].includes(t))==null&&this.toggle(!1)}onHide(){this.toggle(!1)}onKeyDown(e){e instanceof KeyboardEvent&&e.key==="Escape"&&this.toggle(!1)}onShow(){this.toggle(!0)}toggle(e){let t=e?"addEventListener":"removeEventListener";document[t]("click",this.callbacks.click,s.passive),document[t]("keydown",this.callbacks.keydown,s.passive),e?l.update(this,"above"):this.floater.hidden=!0}handleCallbacks(e){let{anchor:t,floater:n,focusable:o}=this,r=e?"addEventListener":"removeEventListener";for(let c of[t,n])c[r]("mouseenter",this.callbacks.show,s.passive),c[r]("mouseleave",this.callbacks.hide,s.passive),c[r]("touchstart",this.callbacks.show,s.passive);o&&(t[r]("blur",this.callbacks.hide,s.passive),t[r]("focus",this.callbacks.show,s.passive))}},S=new MutationObserver(v.observer);S.observe(document,{attributeFilter:[u],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});d(()=>{let i=Array.from(document.querySelectorAll(`[${u}]`));for(let e of i)e.setAttribute(u,"")});})();

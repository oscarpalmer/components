"use strict";var y=Object.defineProperty;var k=(l,e,t)=>e in l?y(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var g=(l,e,t)=>(k(l,typeof e!="symbol"?e+"":e,t),t);var h={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},w=["[href]","[tabindex]","button","input","select","textarea"].map(l=>`${l}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function f(l){var e;return(e=requestAnimationFrame==null?void 0:requestAnimationFrame(l))!=null?e:setTimeout==null?void 0:setTimeout(()=>{l(Date.now())},16)}function m(l){var n;let e=[],t=Array.from(l.querySelectorAll(w));for(let o of t){let i=(n=window==null?void 0:window.getComputedStyle)==null?void 0:n.call(window,o);(i==null||i.display!=="none"&&i.visibility!=="hidden")&&e.push(o)}return e}function E(){return URL.createObjectURL(new Blob).replace(/^.*\/([\w-]+)$/,"$1").replace(/-/g,"_")}var u=class{static setCoordinate(e,t){let{left:n,top:o}=t;e.style.inset="0 auto auto 0",e.style.position="fixed",e.style.transform=`translate3d(${n}px, ${o}px, 0)`,e.hidden&&f(()=>{e.hidden=!1})}static update(e,t,n,o){let{anchor:i,floater:c,parent:s}=e;function a(){if(o())return;let v=u.getPosition(s!=null?s:i,t);c.setAttribute("position",v);let b=n(v,{anchor:i.getBoundingClientRect(),floater:c.getBoundingClientRect(),parent:s==null?void 0:s.getBoundingClientRect()});u.setCoordinate(c,b),f(a)}f(a)}static getPosition(e,t){let n=e.getAttribute("position"),o=n==null?void 0:n.trim().toLowerCase();return o!=null&&t.all.includes(o)?o:t.default}};var M=["any"].concat(...["above","below"].map(l=>[l,`${l}-left`,`${l}-right`])),r=class{static getCoordinate(e,t){return{left:r.getLeft(e,t),top:r.getTop(e,t)}}static getLeft(e,t){let{left:n,right:o}=t.anchor,{width:i}=t.floater,c=n+i,s=o-i;return e.includes("left")||e.includes("right")?e.includes("left")?n:o-i:c>window.innerWidth?s<0?n:o-i:n}static getTop(e,t){let{bottom:n,top:o}=t.anchor,{height:i}=t.floater,c=n+i,s=o-i;return e.includes("above")||e.includes("below")?e.includes("above")?o-i:n:c>window.innerHeight?s<0?n:s:n}static onClick(e){var o;if(!(this instanceof p))return;let{anchor:t,floater:n}=d.getElements(this);t==null||n==null||t.getAttribute("aria-expanded")!=="true"||e.target!==t&&e.target!==n&&!((o=n==null?void 0:n.contains(e.target))!=null&&o)&&r.toggle.call(this,!1)}static onKeydown(e){var s;if(!(this instanceof p)||!(e instanceof KeyboardEvent))return;let{anchor:t,floater:n}=d.getElements(this);if(t==null||n==null||t.getAttribute("aria-expanded")!=="true"||(e.key==="Escape"&&r.toggle.call(this,!1),e.key!=="Tab"))return;e.preventDefault();let o=m(n);if(document.activeElement===n){f(()=>{var a;((a=o[e.shiftKey?o.length-1:0])!=null?a:n).focus()});return}let i=o.indexOf(document.activeElement),c=n;if(i>-1){let a=i+(e.shiftKey?-1:1);a<0?a=o.length-1:a>=o.length&&(a=0),c=(s=o[a])!=null?s:n}f(()=>{c.focus()})}static toggle(e){var a,v;if(!(this instanceof p))return;let{anchor:t,floater:n}=d.getElements(this);if(t==null||n==null)return;let o=typeof e=="boolean"?!e:t.getAttribute("aria-expanded")==="true",{click:i,keydown:c}=d.getCallbacks(this),s=o?"removeEventListener":"addEventListener";i!=null&&document[s]("click",i,h.passive),c!=null&&document[s]("keydown",c,h.active),o?(a=n.parentElement)==null||a.removeChild(n):document.body.appendChild(n),t.setAttribute("aria-expanded",String(!o)),(o?t:(v=m(n)[0])!=null?v:n).focus(),u.update({anchor:t,floater:n,parent:this},{all:M,default:"below"},r.getCoordinate,()=>t.getAttribute("aria-expanded")!=="true")}},d=class{static getCallbacks(e){return{click:this.values.click.get(e),keydown:this.values.keydown.get(e)}}static getElements(e){return{anchor:this.values.anchors.get(e),floater:this.values.floaters.get(e)}}static remove(e){this.values.anchors.delete(e),this.values.click.delete(e),this.values.floaters.delete(e),this.values.keydown.delete(e)}static setCallbacks(e){var t,n;(t=this.values.click)==null||t.set(e,r.onClick.bind(e)),(n=this.values.keydown)==null||n.set(e,r.onKeydown.bind(e))}static setElements(e,t,n){var o,i;(o=this.values.anchors)==null||o.set(e,t),(i=this.values.floaters)==null||i.set(e,n)}};g(d,"values",{anchors:new WeakMap,click:new WeakMap,floaters:new WeakMap,keydown:new WeakMap});var p=class extends HTMLElement{close(){r.toggle.call(this,!1)}connectedCallback(){var n;let e=this.querySelector(":scope > [polite-popover-button]"),t=this.querySelector(":scope > [polite-popover-content]");if(e==null)throw new Error("a");if(!(e instanceof HTMLButtonElement)&&e.getAttribute("role")!=="button")throw new Error("b");if(t==null)throw new Error("c");(n=t.parentElement)==null||n.removeChild(t),t.id||t.setAttribute("id",E()),u.setCoordinate(t,{left:-1e6,top:-1e6}),e.setAttribute("aria-controls",t.id),e.setAttribute("aria-expanded","false"),t.setAttribute("tabindex","-1"),d.setElements(this,e,t),d.setCallbacks(this),e.addEventListener("click",r.toggle.bind(this),h.passive)}disconnectedCallback(){d.remove(this)}open(){r.toggle.call(this,!0)}toggle(){r.toggle.call(this)}};customElements==null||customElements.define("polite-popover",p);

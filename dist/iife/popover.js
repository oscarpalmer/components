"use strict";(()=>{var w=Object.defineProperty;var P=(s,e,t)=>e in s?w(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var b=(s,e,t)=>(P(s,typeof e!="symbol"?e+"":e,t),t);var h={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},T=["[href]","[tabindex]","button","input","select","textarea"].map(s=>`${s}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function p(s){var e;return(e=requestAnimationFrame==null?void 0:requestAnimationFrame(s))!=null?e:setTimeout==null?void 0:setTimeout(()=>{s(Date.now())},16)}function m(s){var n;let e=[],t=Array.from(s.querySelectorAll(T));for(let o of t){let i=(n=window==null?void 0:window.getComputedStyle)==null?void 0:n.call(window,o);(i==null||i.display!=="none"&&i.visibility!=="hidden")&&e.push(o)}return e}function y(){return URL.createObjectURL(new Blob).replace(/^.*\/([\w-]+)$/,"$1").replace(/-/g,"_")}var f=class{static update(e,t,n,o){let{anchor:i,floater:c,parent:a}=e;function l(){if(o())return;let d=f.getType(a!=null?a:i,t),g=n(d,{anchor:i.getBoundingClientRect(),floater:c.getBoundingClientRect(),parent:a==null?void 0:a.getBoundingClientRect()});f.setPosition(c,g),p(l)}p(l)}static getType(e,t){let n=e.getAttribute("position"),o=n==null?void 0:n.trim().toLowerCase();return o!=null&&t.all.includes(o)?o:t.default}static setPosition(e,t){let{left:n,top:o}=t.coordinate;e.setAttribute("position",t.type),e.style.inset="0 auto auto 0",e.style.position="fixed",e.style.transform=`translate3d(${n}px, ${o}px, 0)`,e.hidden&&p(()=>{e.hidden=!1})}};var L=["any"].concat(...["above","below"].map(s=>[s,`${s}-left`,`${s}-right`])),r=class{static getPosition(e,t){let n=r.getValue(e,["left","right"],t,!0),o=r.getValue(e,["below","above"],t,!1);return e!=="any"?{coordinate:{left:n,top:o},type:["above","below"].includes(e)?`??? ${e}-${t.anchor.left===n?"left":"right"}`:e}:{coordinate:{left:n,top:o},type:"???"}}static getValue(e,t,n,o){var E;let{anchor:i,floater:c}=n,a=o?c.width:c.height,l=o?i.left:i.bottom,d=(o?i.right:i.top)-a;return t.some(k=>e.includes(k))?e.includes((E=t[0])!=null?E:"_")?l:d:l+a<=(o?window.innerWidth:window.innerHeight)||d<0?l:d}static onClick(e){var o;if(!(this instanceof v))return;let{anchor:t,floater:n}=u.getElements(this);t==null||n==null||t.getAttribute("aria-expanded")!=="true"||e.target!==t&&e.target!==n&&!((o=n==null?void 0:n.contains(e.target))!=null&&o)&&r.toggle.call(this,!1)}static onKeydown(e){var a;if(!(this instanceof v)||!(e instanceof KeyboardEvent))return;let{anchor:t,floater:n}=u.getElements(this);if(t==null||n==null||t.getAttribute("aria-expanded")!=="true"||(e.key==="Escape"&&r.toggle.call(this,!1),e.key!=="Tab"))return;e.preventDefault();let o=m(n);if(document.activeElement===n){p(()=>{var l;((l=o[e.shiftKey?o.length-1:0])!=null?l:n).focus()});return}let i=o.indexOf(document.activeElement),c=n;if(i>-1){let l=i+(e.shiftKey?-1:1);l<0?l=o.length-1:l>=o.length&&(l=0),c=(a=o[l])!=null?a:n}p(()=>{c.focus()})}static toggle(e){var l,d;if(!(this instanceof v))return;let{anchor:t,floater:n}=u.getElements(this);if(t==null||n==null)return;let o=typeof e=="boolean"?!e:t.getAttribute("aria-expanded")==="true",{click:i,keydown:c}=u.getCallbacks(this),a=o?"removeEventListener":"addEventListener";i!=null&&document[a]("click",i,h.passive),c!=null&&document[a]("keydown",c,h.active),o?(l=n.parentElement)==null||l.removeChild(n):document.body.appendChild(n),t.setAttribute("aria-expanded",String(!o)),(o?t:(d=m(n)[0])!=null?d:n).focus(),f.update({anchor:t,floater:n,parent:this},{all:L,default:"below"},r.getPosition,()=>t.getAttribute("aria-expanded")!=="true")}},u=class{static getCallbacks(e){return{click:this.values.click.get(e),keydown:this.values.keydown.get(e)}}static getElements(e){return{anchor:this.values.anchors.get(e),floater:this.values.floaters.get(e)}}static remove(e){this.values.anchors.delete(e),this.values.click.delete(e),this.values.floaters.delete(e),this.values.keydown.delete(e)}static setCallbacks(e){var t,n;(t=this.values.click)==null||t.set(e,r.onClick.bind(e)),(n=this.values.keydown)==null||n.set(e,r.onKeydown.bind(e))}static setElements(e,t,n){var o,i;(o=this.values.anchors)==null||o.set(e,t),(i=this.values.floaters)==null||i.set(e,n)}};b(u,"values",{anchors:new WeakMap,click:new WeakMap,floaters:new WeakMap,keydown:new WeakMap});var v=class extends HTMLElement{get content(){return u.getElements(this).floater}close(){r.toggle.call(this,!1)}connectedCallback(){var n;let e=this.querySelector(":scope > [polite-popover-button]"),t=this.querySelector(":scope > [polite-popover-content]");if(e==null)throw new Error("a");if(!(e instanceof HTMLButtonElement)&&e.getAttribute("role")!=="button")throw new Error("b");if(t==null)throw new Error("c");(n=t.parentElement)==null||n.removeChild(t),t.hidden=!0,t.id||t.setAttribute("id",y()),e.setAttribute("aria-controls",t.id),e.setAttribute("aria-expanded","false"),t.setAttribute("tabindex","-1"),u.setElements(this,e,t),u.setCallbacks(this),e.addEventListener("click",r.toggle.bind(this),h.passive)}disconnectedCallback(){u.remove(this)}open(){r.toggle.call(this,!0)}toggle(){r.toggle.call(this)}};customElements==null||customElements.define("polite-popover",v);})();

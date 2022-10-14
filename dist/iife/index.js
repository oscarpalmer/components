"use strict";(()=>{var K=Object.defineProperty;var $=(a,e,t)=>e in a?K(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var m=(a,e,t)=>($(a,typeof e!="symbol"?e+"":e,t),t);var c={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},D=["[href]","[tabindex]","button","input","select","textarea"].map(a=>`${a}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function v(a){var e;return(e=requestAnimationFrame==null?void 0:requestAnimationFrame(a))!=null?e:setTimeout==null?void 0:setTimeout(()=>{a(Date.now())},16)}function O(a,e){let t=a==null?void 0:a.parentElement;for(;t!=null;){if(t===document.body)return;if(e(t))break;t=t.parentElement}return t!=null?t:void 0}function P(a){var n;let e=[],t=Array.from(a.querySelectorAll(D));for(let i of t){let s=(n=window==null?void 0:window.getComputedStyle)==null?void 0:n.call(window,i);(s==null||s.display!=="none"&&s.visibility!=="hidden")&&e.push(i)}return e}function W(){return URL.createObjectURL(new Blob).replace(/^.*\/([\w-]+)$/,"$1").replace(/-/g,"_")}var u=class{static getChildren(e){return Array.from(e.querySelectorAll(":scope > delicious-details > details, :scope > details"))}static onKeydown(e){var h;if(e.isComposing||e.key!=="ArrowDown"&&e.key!=="ArrowUp"||!(this instanceof x))return;let{target:t}=e;if(!(t instanceof HTMLElement))return;let n=(h=f.list.children.get(this))!=null?h:[],i=t.parentElement,s=n.indexOf(i);if(s===-1)return;let o=s+(e.key==="ArrowDown"?1:-1);o<0?o=n.length-1:o>=n.length&&(o=0);let l=n[o],r=l==null?void 0:l.querySelector(":scope > summary");r==null||r.focus()}static onKeyup(e){if(e.key!=="Escape")return;let{containers:t}=f.details,n=O(document.activeElement,i=>{var s,o;return t.has(i)&&((o=(s=t.get(i))==null?void 0:s.open)!=null?o:!0)});n instanceof T&&u.onToggle.call(n,!1)}static onToggle(e){var s;if(!(this instanceof T))return;let{buttons:t,containers:n}=f.details,i=n.get(this);i!=null&&(i.open=e!=null?e:!i.open,i.open||(s=t.get(this))==null||s.focus())}static open(e,t){if(t==null)return;if(t.length>0&&!/^[\s\d,]+$/.test(t))throw new Error("The 'selected'-attribute of a 'delicious-details-list'-element must be a comma-separated string of numbers, e.g. '', '0' or '0,1,2'");let n=t.length>0?t.split(",").filter(i=>i.trim().length>0).map(i=>Number.parseInt(i,10)):[];u.update(e,n)}static update(e,t){var r,h;if(typeof t=="undefined")return;let{children:n,observer:i,open:s}=f.list,o=t.filter((d,E,C)=>C.indexOf(d)===E).sort((d,E)=>d-E);if(e.multiple||(o=o.length>0&&o[0]!=null?o.length>1?[o[0]]:o:[]),o.every((d,E)=>e.open[E]===d))return;(r=i.get(e))==null||r.disconnect();let l=(h=n.get(e))!=null?h:[];for(let d of l)o.includes(l.indexOf(d))!==d.open&&(d.open=!d.open);s.set(e,o),v(()=>{o.length===0?e.removeAttribute("open"):e.setAttribute("open",o.join(",")),v(()=>{var d;return(d=i.get(e))==null?void 0:d.observe(e,L.options)})})}},L=class{static callback(e,t){var E,C,R;if(t.length===0)return;let{children:n}=f.list,i=t[0],s=Array.from((E=i==null?void 0:i.addedNodes)!=null?E:[]),o=Array.from((C=i==null?void 0:i.removedNodes)!=null?C:[]);if(s.concat(o).some(A=>A.parentElement===e)){n.set(e,u.getChildren(e));return}if((i==null?void 0:i.type)!=="attributes"||!((i==null?void 0:i.target)instanceof HTMLDetailsElement))return;let l=i.target,h=((R=n.get(e))!=null?R:[]).indexOf(l);if(h===-1)return;let d=[];e.multiple?d=l.open?e.open.concat([h]):e.open.filter(A=>A!==h):d=l.open?[h]:[],u.update(e,d)}};m(L,"options",{attributeFilter:["open"],attributes:!0,childList:!0,subtree:!0});var f=class{};m(f,"details",{buttons:new WeakMap,containers:new WeakMap}),m(f,"list",{children:new WeakMap,observer:new WeakMap,open:new WeakMap});var T=class extends HTMLElement{close(){u.onToggle.call(this,!1)}connectedCallback(){let e=this.querySelector(":scope > details"),t=e==null?void 0:e.querySelector(":scope > summary");f.details.buttons.set(this,t),f.details.containers.set(this,e)}disconnectedCallback(){f.details.buttons.delete(this),f.details.containers.delete(this)}open(){u.onToggle.call(this,!0)}toggle(){u.onToggle.call(this)}},x=class extends HTMLElement{static get observedAttributes(){return["multiple","open"]}get multiple(){return this.getAttribute("multiple")!=null}set multiple(e){e?this.setAttribute("multiple",""):this.removeAttribute("multiple")}get open(){var e;return(e=f.list.open.get(this))!=null?e:[]}set open(e){u.update(this,e)}attributeChangedCallback(e,t,n){var i;if(t!==n)switch(e){case"multiple":u.open(this,(i=this.getAttribute("open"))!=null?i:void 0);break;case"open":u.open(this,n);break;default:break}}connectedCallback(){var i,s;let{children:e,observer:t,open:n}=f.list;e.set(this,u.getChildren(this)),n.set(this,[]),t.set(this,new MutationObserver(o=>{L.callback(this,o)})),(i=t.get(this))==null||i.observe(this,L.options),this.addEventListener("keydown",u.onKeydown.bind(this),c.passive),u.open(this,(s=this.getAttribute("open"))!=null?s:void 0)}disconnectedCallback(){var i;let{children:e,observer:t,open:n}=f.list;e.delete(this),(i=t.get(this))==null||i.disconnect(),t.delete(this),n.delete(this)}};addEventListener==null||addEventListener("keyup",u.onKeyup,c.passive);customElements==null||customElements.define("delicious-details",T);customElements==null||customElements.define("delicious-details-list",x);var b=class{static setCoordinate(e,t){let{left:n,top:i}=t;e.style.inset="0 auto auto 0",e.style.position="fixed",e.style.transform=`translate3d(${n}px, ${i}px, 0)`,e.hidden&&v(()=>{e.hidden=!1})}static update(e,t,n,i){let{anchor:s,floater:o,parent:l}=e;function r(){if(i())return;let h=b.getPosition(l!=null?l:s,t);o.setAttribute("position",h);let d=n(h,{anchor:s.getBoundingClientRect(),floater:o.getBoundingClientRect(),parent:l==null?void 0:l.getBoundingClientRect()});b.setCoordinate(o,d),v(r)}v(r)}static getPosition(e,t){let n=e.getAttribute("position"),i=n==null?void 0:n.trim().toLowerCase();return i!=null&&t.all.includes(i)?i:t.default}};var q=["any"].concat(...["above","below"].map(a=>[a,`${a}-left`,`${a}-right`])),p=class{static getCoordinate(e,t){return{left:p.getLeft(e,t),top:p.getTop(e,t)}}static getLeft(e,t){let{left:n,right:i}=t.anchor,{width:s}=t.floater,o=n+s,l=i-s;return e.includes("left")||e.includes("right")?e.includes("left")?n:i-s:o>window.innerWidth?l<0?n:i-s:n}static getTop(e,t){let{bottom:n,top:i}=t.anchor,{height:s}=t.floater,o=n+s,l=i-s;return e.includes("above")||e.includes("below")?e.includes("above")?i-s:n:o>window.innerHeight?l<0?n:l:n}static onClick(e){var i;if(!(this instanceof w))return;let{anchor:t,floater:n}=g.getElements(this);t==null||n==null||t.getAttribute("aria-expanded")!=="true"||e.target!==t&&e.target!==n&&!((i=n==null?void 0:n.contains(e.target))!=null&&i)&&p.toggle.call(this,!1)}static onKeydown(e){var l;if(!(this instanceof w)||!(e instanceof KeyboardEvent))return;let{anchor:t,floater:n}=g.getElements(this);if(t==null||n==null||t.getAttribute("aria-expanded")!=="true"||(e.key==="Escape"&&p.toggle.call(this,!1),e.key!=="Tab"))return;e.preventDefault();let i=P(n);if(document.activeElement===n){v(()=>{var r;((r=i[e.shiftKey?i.length-1:0])!=null?r:n).focus()});return}let s=i.indexOf(document.activeElement),o=n;if(s>-1){let r=s+(e.shiftKey?-1:1);r<0?r=i.length-1:r>=i.length&&(r=0),o=(l=i[r])!=null?l:n}v(()=>{o.focus()})}static toggle(e){var r,h;if(!(this instanceof w))return;let{anchor:t,floater:n}=g.getElements(this);if(t==null||n==null)return;let i=typeof e=="boolean"?!e:t.getAttribute("aria-expanded")==="true",{click:s,keydown:o}=g.getCallbacks(this),l=i?"removeEventListener":"addEventListener";s!=null&&document[l]("click",s,c.passive),o!=null&&document[l]("keydown",o,c.active),i?(r=n.parentElement)==null||r.removeChild(n):document.body.appendChild(n),t.setAttribute("aria-expanded",String(!i)),(i?t:(h=P(n)[0])!=null?h:n).focus(),b.update({anchor:t,floater:n,parent:this},{all:q,default:"below"},p.getCoordinate,()=>t.getAttribute("aria-expanded")!=="true")}},g=class{static getCallbacks(e){return{click:this.values.click.get(e),keydown:this.values.keydown.get(e)}}static getElements(e){return{anchor:this.values.anchors.get(e),floater:this.values.floaters.get(e)}}static remove(e){this.values.anchors.delete(e),this.values.click.delete(e),this.values.floaters.delete(e),this.values.keydown.delete(e)}static setCallbacks(e){var t,n;(t=this.values.click)==null||t.set(e,p.onClick.bind(e)),(n=this.values.keydown)==null||n.set(e,p.onKeydown.bind(e))}static setElements(e,t,n){var i,s;(i=this.values.anchors)==null||i.set(e,t),(s=this.values.floaters)==null||s.set(e,n)}};m(g,"values",{anchors:new WeakMap,click:new WeakMap,floaters:new WeakMap,keydown:new WeakMap});var w=class extends HTMLElement{close(){p.toggle.call(this,!1)}connectedCallback(){var n;let e=this.querySelector(":scope > [polite-popover-button]"),t=this.querySelector(":scope > [polite-popover-content]");if(e==null)throw new Error("a");if(!(e instanceof HTMLButtonElement)&&e.getAttribute("role")!=="button")throw new Error("b");if(t==null)throw new Error("c");(n=t.parentElement)==null||n.removeChild(t),t.id||t.setAttribute("id",W()),b.setCoordinate(t,{left:-1e6,top:-1e6}),e.setAttribute("aria-controls",t.id),e.setAttribute("aria-expanded","false"),t.setAttribute("tabindex","-1"),g.setElements(this,e,t),g.setCallbacks(this),e.addEventListener("click",p.toggle.bind(this),c.passive)}disconnectedCallback(){g.remove(this)}open(){p.toggle.call(this,!0)}toggle(){p.toggle.call(this)}};customElements==null||customElements.define("polite-popover",w);var H="toasty-tooltip",B=["above","below","horizontal","left","right","vertical"],k=class{static getCoordinate(e,t){return{left:k.getLeft(e,t),top:k.gettop(e,t)}}static getLeft(e,t){let{left:n,right:i}=t.anchor,{width:s}=t.floater,o=i+s,l=n-s;return e==="horizontal"?o>window.innerWidth?l<0?i:l:i:e==="left"||e==="right"?e==="left"?n-s:i:n+t.anchor.width/2-s/2}static gettop(e,t){let{bottom:n,top:i}=t.anchor,{height:s}=t.floater,o=n+s,l=i-s;return e==="vertical"?o>window.innerHeight?l<0?n:l:n:e==="above"||e==="below"?e==="above"?i-s:n:i+t.anchor.height/2-s/2}static observer(e){var t;for(let n of e){if(n.type!=="attributes")continue;let i=n.target;if(i.getAttribute(H)==null){M.destroy(i);return}let s=(t=i.getAttribute("aria-describedby"))!=null?t:i.getAttribute("aria-labelledby"),o=s==null?null:document.getElementById(s);o!=null&&M.create(i,o)}}},y=class{};m(y,"elements",new WeakMap);var M=class{constructor(e,t){this.anchor=e;m(this,"floater");m(this,"callbacks");m(this,"focusable");this.focusable=e.matches(D),this.callbacks={click:this.onClick.bind(this),hide:this.onHide.bind(this),key:this.onKey.bind(this),show:this.onShow.bind(this)},this.addCallbacks(),this.floater=this.createFloater(t)}static create(e,t){y.elements.has(e)||y.elements.set(e,new M(e,t))}static destroy(e){let t=y.elements.get(e);t!=null&&(t.removeCallbacks(),y.elements.delete(e))}onClick(){this.onHide()}onHide(){var e;document.removeEventListener("keydown",this.callbacks.key,c.passive),document.removeEventListener("pointerdown",this.callbacks.click,c.active),(e=this.floater.parentElement)==null||e.removeChild(this.floater)}onKey(e){e.key==="Escape"&&this.onHide()}onShow(){this.floater.parentElement==null&&(document.addEventListener("keydown",this.callbacks.key,c.passive),document.addEventListener("pointerdown",this.callbacks.click,c.active),document.body.appendChild(this.floater),b.update({anchor:this.anchor,floater:this.floater},{all:B,default:"above"},k.getCoordinate,()=>this.floater.parentElement==null))}addCallbacks(){let{anchor:e,callbacks:t,focusable:n}=this;e.addEventListener("mouseenter",t.show,c.passive),e.addEventListener("mouseleave",t.hide,c.passive),n&&(e.addEventListener("blur",t.hide,c.passive),e.addEventListener("focus",t.show,c.passive))}createFloater(e){let t=document.createElement("div");return t.setAttribute("aria-hidden","true"),t.setAttribute(`${H}-content`,""),t.hidden=!0,t.innerHTML=e.innerHTML,t}removeCallbacks(){let{anchor:e,callbacks:t,focusable:n}=this;e.removeEventListener("mouseenter",t.show,c.passive),e.removeEventListener("mouseleave",t.hide,c.passive),e.removeEventListener("touchstart",t.show,c.passive),n&&(e.removeEventListener("blur",t.hide,c.passive),e.removeEventListener("focus",t.show,c.passive))}},S=new MutationObserver(k.observer);S.observe(document,{attributeFilter:[H],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});v(()=>{let a=Array.from(document.querySelectorAll(`[${H}]`));for(let e of a)e.setAttribute(H,"")});})();

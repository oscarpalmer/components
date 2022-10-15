var k=Object.defineProperty;var w=(i,e,t)=>e in i?k(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var E=(i,e,t)=>(w(i,typeof e!="symbol"?e+"":e,t),t);var v={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}},P=["[href]","[tabindex]","button","input","select","textarea"].map(i=>`${i}:not([disabled]):not([hidden]):not([tabindex="-1"])`).join(",");function d(i){return requestAnimationFrame?.(i)??setTimeout?.(()=>{i(Date.now())},16)}function h(i){let e=[],t=Array.from(i.querySelectorAll(P));for(let n of t){let o=window?.getComputedStyle?.(n);(o==null||o.display!=="none"&&o.visibility!=="hidden")&&e.push(n)}return e}function b(){return URL.createObjectURL(new Blob).replace(/^.*\/([\w-]+)$/,"$1").replace(/-/g,"_")}var p=class{static update(e,t,n,o){let{anchor:a,floater:r,parent:l}=e;function u(){if(o())return;let m=p.getType(l??a,t),g=n(m,{anchor:a.getBoundingClientRect(),floater:r.getBoundingClientRect(),parent:l?.getBoundingClientRect()});p.setPosition(r,g),d(u)}d(u)}static getType(e,t){let o=e.getAttribute("position")?.trim().toLowerCase();return o!=null&&t.all.includes(o)?o:t.default}static setPosition(e,t){let{left:n,top:o}=t.coordinate;e.setAttribute("position",t.type),e.style.inset="0 auto auto 0",e.style.position="fixed",e.style.transform=`translate3d(${n}px, ${o}px, 0)`,e.hidden&&d(()=>{e.hidden=!1})}};var T=["any"].concat(...["above","below"].map(i=>[i,`${i}-left`,`${i}-right`])),s=class{static getPosition(e,t){let n=s.getValue(e,["left","right"],t,!0),o=s.getValue(e,["below","above"],t,!1);return e!=="any"?{coordinate:{left:n,top:o},type:["above","below"].includes(e)?`??? ${e}-${t.anchor.left===n?"left":"right"}`:e}:{coordinate:{left:n,top:o},type:"???"}}static getValue(e,t,n,o){let{anchor:a,floater:r}=n,l=o?r.width:r.height,u=o?a.left:a.bottom,m=(o?a.right:a.top)-l;return t.some(y=>e.includes(y))?e.includes(t[0]??"_")?u:m:u+l<=(o?window.innerWidth:window.innerHeight)||m<0?u:m}static onClick(e){if(!(this instanceof f))return;let{anchor:t,floater:n}=c.getElements(this);t==null||n==null||t.getAttribute("aria-expanded")!=="true"||e.target!==t&&e.target!==n&&!(n?.contains(e.target)??!1)&&s.toggle.call(this,!1)}static onKeydown(e){if(!(this instanceof f)||!(e instanceof KeyboardEvent))return;let{anchor:t,floater:n}=c.getElements(this);if(t==null||n==null||t.getAttribute("aria-expanded")!=="true"||(e.key==="Escape"&&s.toggle.call(this,!1),e.key!=="Tab"))return;e.preventDefault();let o=h(n);if(document.activeElement===n){d(()=>{(o[e.shiftKey?o.length-1:0]??n).focus()});return}let a=o.indexOf(document.activeElement),r=n;if(a>-1){let l=a+(e.shiftKey?-1:1);l<0?l=o.length-1:l>=o.length&&(l=0),r=o[l]??n}d(()=>{r.focus()})}static toggle(e){if(!(this instanceof f))return;let{anchor:t,floater:n}=c.getElements(this);if(t==null||n==null)return;let o=typeof e=="boolean"?!e:t.getAttribute("aria-expanded")==="true",{click:a,keydown:r}=c.getCallbacks(this),l=o?"removeEventListener":"addEventListener";a!=null&&document[l]("click",a,v.passive),r!=null&&document[l]("keydown",r,v.active),o?n.parentElement?.removeChild(n):document.body.appendChild(n),t.setAttribute("aria-expanded",String(!o)),(o?t:h(n)[0]??n).focus(),p.update({anchor:t,floater:n,parent:this},{all:T,default:"below"},s.getPosition,()=>t.getAttribute("aria-expanded")!=="true")}},c=class{static getCallbacks(e){return{click:this.values.click.get(e),keydown:this.values.keydown.get(e)}}static getElements(e){return{anchor:this.values.anchors.get(e),floater:this.values.floaters.get(e)}}static remove(e){this.values.anchors.delete(e),this.values.click.delete(e),this.values.floaters.delete(e),this.values.keydown.delete(e)}static setCallbacks(e){this.values.click?.set(e,s.onClick.bind(e)),this.values.keydown?.set(e,s.onKeydown.bind(e))}static setElements(e,t,n){this.values.anchors?.set(e,t),this.values.floaters?.set(e,n)}};E(c,"values",{anchors:new WeakMap,click:new WeakMap,floaters:new WeakMap,keydown:new WeakMap});var f=class extends HTMLElement{get content(){return c.getElements(this).floater}close(){s.toggle.call(this,!1)}connectedCallback(){let e=this.querySelector(":scope > [polite-popover-button]"),t=this.querySelector(":scope > [polite-popover-content]");if(e==null)throw new Error("a");if(!(e instanceof HTMLButtonElement)&&e.getAttribute("role")!=="button")throw new Error("b");if(t==null)throw new Error("c");t.parentElement?.removeChild(t),t.hidden=!0,t.id||t.setAttribute("id",b()),e.setAttribute("aria-controls",t.id),e.setAttribute("aria-expanded","false"),t.setAttribute("tabindex","-1"),c.setElements(this,e,t),c.setCallbacks(this),e.addEventListener("click",s.toggle.bind(this),v.passive)}disconnectedCallback(){c.remove(this)}open(){s.toggle.call(this,!0)}toggle(){s.toggle.call(this)}};customElements?.define("polite-popover",f);

"use strict";(()=>{var A=Object.defineProperty;var w=(t,i,e)=>i in t?A(t,i,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[i]=e;var m=(t,i,e)=>(w(t,typeof i!="symbol"?i+"":i,e),e);var h={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}};function c(t){return typeof t=="number"?t:Number.parseInt(typeof t=="string"?t:String(t),10)}function f(t){return(t!=null?t:"").trim().length===0}var y="palmer-splitter",g=["horizontal","vertical"],s=new WeakMap,T=0;function v(t,i){var p,b;let e=i!=null?i:s.get(t);if(e==null)return null;let n=document.createElement("div");f(t.primary.id)&&(t.primary.id=`palmer_splitter_primary_panel_${++T}`),n.setAttribute("aria-controls",t.primary.id),n.role="separator",n.tabIndex=0;let a=t.getAttribute("value");f(a)&&(a="50");let o=c(a);e.original=typeof o=="number"?o:50;let r=(p=t.getAttribute("max"))!=null?p:"",x=(b=t.getAttribute("min"))!=null?b:"";return r.length===0&&u(t,n,"maximum",100),x.length===0&&u(t,n,"minimum",0),l(t,n,e.original,!1),n.addEventListener("keydown",E=>L(t,E),h.passive),n}function L(t,i){if(!["ArrowDown","ArrowLeft","ArrowRight","ArrowUp","End","Escape","Home"].includes(i.key)||(t.type==="vertical"?["ArrowLeft","ArrowRight"]:["ArrowDown","ArrowUp"]).includes(i.key))return;let n=s.get(t);if(n==null)return;let a;switch(i.key){case"ArrowDown":case"ArrowLeft":case"ArrowRight":case"ArrowUp":a=t.value+(["ArrowLeft","ArrowUp"].includes(i.key)?-1:1);break;case"End":case"Home":a=i.key==="End"?n.maximum:n.minimum;break;case"Escape":a=n.original;break;default:break}l(t,t.separator,a,!0)}function u(t,i,e,n,a){let o=a!=null?a:s.get(t),r=c(n);o==null||Number.isNaN(r)||r===o[e]||e==="maximum"&&r<o.minimum||e==="minimum"&&r>o.maximum||(e==="maximum"&&r>100?r=100:e==="minimum"&&r<0&&(r=0),o[e]=r,i.setAttribute(e==="maximum"?"aria-valuemax":"aria-valuemin",r),(e==="maximum"&&r<o.current||e==="minimum"&&r>o.current)&&l(t,i,o,!0))}function l(t,i,e,n,a){let o=a!=null?a:s.get(t),r=c(e);o==null||Number.isNaN(r)||r===o.current||(r<o.minimum?r=o.minimum:r>o.maximum&&(r=o.maximum),i.ariaValueNow=r,t.primary.style.flex=`${r/100}`,t.secondary.style.flex=`${(100-r)/100}`,o.current=r,n&&t.dispatchEvent(new CustomEvent("change",{detail:{value:r}})))}var d=class extends HTMLElement{constructor(){var n;super();m(this,"primary");m(this,"secondary");m(this,"separator");if(this.children.length!==2)throw new Error(`A <${y}> must have exactly two direct children`);let e={current:-1,maximum:-1,minimum:-1,original:-1};s.set(this,e),this.primary=this.children[0],this.secondary=this.children[1],this.separator=v(this,e),(n=this.primary)==null||n.insertAdjacentElement("afterend",this.separator)}get max(){var e;return(e=s.get(this))==null?void 0:e.maximum}set max(e){u(this,this.separator,"maximum",e)}get min(){var e;return(e=s.get(this))==null?void 0:e.minimum}set min(e){u(this,this.separator,"minimum",e)}get type(){var n;let e=(n=this.getAttribute("type"))!=null?n:"horizontal";return g.includes(e)?e:"horizontal"}set type(e){g.includes(e)&&this.setAttribute("type",e)}get value(){var e;return(e=s.get(this))==null?void 0:e.current}set value(e){l(this,this.separator,e,!0)}attributeChangedCallback(e,n,a){switch(e){case"max":case"min":u(this,this.separator,e==="max"?"maximum":"minimum",a);break;case"value":l(this,this.separator,a,!0);break;default:break}}};m(d,"observedAttributes",["max","min","value"]);customElements.define(y,d);})();
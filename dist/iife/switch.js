(()=>{var o={active:{capture:!1,passive:!1},passive:{capture:!1,passive:!0}};function n(e){return(e??"").trim().length===0}function d(e,t,r){let i=document.createElement("span");return i.ariaHidden=!0,i.className=`${t}__label`,i.id=`${e}_label`,i.innerHTML=r,i}function h(e){let t=document.createElement("span");t.ariaHidden=!0,t.className=`${e}__status`;let r=document.createElement("span");return r.className=`${e}__status__indicator`,t.append(r),t}function f(e,t,r){let i=document.createElement("span");return i.ariaHidden=!0,i.className=`${e}__text`,i.append(c("off",e,r)),i.append(c("on",e,t)),i}function c(e,t,r){let i=document.createElement("span");return i.className=`${t}__text__${e}`,i.innerHTML=r,i}function b(e,t,r){t.parentElement?.removeChild(t),r.parentElement?.removeChild(r),e.setAttribute("aria-checked",r.checked||e.checked),e.setAttribute("aria-disabled",r.disabled||e.disabled),e.setAttribute("aria-labelledby",`${r.id}_label`),e.setAttribute("aria-readonly",r.readOnly||e.readonly),e.setAttribute("value",r.value),e.id=r.id,e.name=r.name??r.id,e.role="switch",e.tabIndex=0;let i=e.getAttribute("classNames"),s=e.getAttribute("off"),l=e.getAttribute("on");n(i)&&(i="palmer-switch"),n(s)&&(s="Off"),n(l)&&(l="On"),e.insertAdjacentElement("beforeend",d(e.id,i,t.innerHTML)),e.insertAdjacentElement("beforeend",h(i)),e.insertAdjacentElement("beforeend",f(i,l,s)),e.addEventListener("click",p.bind(e),o.passive),e.addEventListener("keydown",m.bind(e),o.active)}function m(e){[" ","Enter"].includes(e.key)&&(e.preventDefault(),u(this))}function p(){u(this)}function u(e){e.disabled||e.readonly||(e.checked=!e.checked,e.dispatchEvent(new Event("change")))}var a=class extends HTMLElement{get checked(){return this.getAttribute("aria-checked")==="true"}set checked(t){this.setAttribute("aria-checked",t)}get disabled(){return this.getAttribute("aria-disabled")==="true"}set disabled(t){this.setAttribute("aria-disabled",t)}get form(){return this.internals?.form}get labels(){return this.internals?.labels}get name(){return this.getAttribute("name")??""}set name(t){this.setAttribute("name",t)}get readonly(){return this.getAttribute("aria-readonly")==="true"}set readonly(t){this.setAttribute("aria-readonly",t)}get validationMessage(){return this.internals?.validationMessage??""}get validity(){return this.internals?.validity}get value(){return this.getAttribute("value")??(this.checked?"on":"off")}get willValidate(){return this.internals?.willValidate??!0}constructor(){super(),this.internals=this.attachInternals?.();let t=this.querySelector("[palmer-switch-input]"),r=this.querySelector("[palmer-switch-label]");if(t===null||!(t instanceof HTMLInputElement)||t.type!=="checkbox")throw new TypeError("<palmer-switch> must have an <input>-element with type 'checkbox' and the attribute 'palmer-switch-input'");if(r===null||!(r instanceof HTMLElement))throw new TypeError("<palmer-switch> must have an element with the attribute 'palmer-switch-label'");b(this,r,t)}checkValidity(){return this.internals?.checkValidity()??!0}reportValidity(){return this.internals?.reportValidity()??!0}};a.formAssociated=!0;customElements.define("palmer-switch",a);})();

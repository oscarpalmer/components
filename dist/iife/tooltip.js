(()=>{var m=Math.round(16.666666666666668),w=requestAnimationFrame??function(t){return setTimeout?.(()=>{t(Date.now())},m)};function A(t){t.state.active=!0,t.state.finished=!1;let e=t instanceof c,n=0,i;function r(o){if(!t.state.active)return;i??(i=o);let s=o-i,u=s-m,d=s+m;if(u<t.configuration.time&&t.configuration.time<d)if(t.state.active&&t.callbacks.default(e?n:void 0),n+=1,e&&n<t.configuration.count)i=void 0;else{t.state.finished=!0,t.stop();return}t.state.frame=w(r)}t.state.frame=w(r)}var x=class{get active(){return this.state.active}get finished(){return!this.active&&this.state.finished}constructor(t,e,n,i){let r=this instanceof c,o=r?"repeated":"waited";if(typeof t!="function")throw new TypeError(`A ${o} timer must have a callback function`);if(typeof e!="number"||e<0)throw new TypeError(`A ${o} timer must have a non-negative number as its time`);if(r&&(typeof n!="number"||n<2))throw new TypeError("A repeated timer must have a number above 1 as its repeat count");if(r&&i!==void 0&&typeof i!="function")throw new TypeError("A repeated timer's after-callback must be a function");this.configuration={count:n,time:e},this.callbacks={after:i,default:t},this.state={active:!1,finished:!1,frame:null}}restart(){return this.stop(),A(this),this}start(){return this.state.active||A(this),this}stop(){return this.state.active=!1,this.state.frame===void 0?this:((cancelAnimationFrame??clearTimeout)?.(this.state.frame),this.callbacks.after?.(this.finished),this.state.frame=void 0,this)}},c=class extends x{},C=class extends x{constructor(t,e){super(t,e,1,null)}};function k(t,e){return new C(t,e).start()}function E(t,e){let n=typeof e=="string";if(n?t.matches(e):e(t))return t;let i=t?.parentElement;for(;i!==null;){if(i===document.body)return;if(n?i.matches(e):e(i))break;i=i.parentElement}return i??void 0}function I(t){return getComputedStyle?.(t)?.direction==="rtl"?"rtl":"ltr"}function a(t,e){return{capture:e??!1,passive:t??!0}}var T=["above","above-left","above-right","below","below-left","below-right","horizontal","horizontal-bottom","horizontal-top","left","left-bottom","left-top","right","right-bottom","right-top","vertical","vertical-left","vertical-right"],S=["bottom","height","left","right","top","width"];function L(t,e,n,i){let r=$(!0,t,e,n);return{top:$(!1,t,e,i),left:r}}function M(t){let e=t.end+t.offset,n=t.start-t.offset;return t.preferMin?n>=0||e>t.max?n:t.end:t.max<=e||n<0?t.end:n}function z(t,e,n,i){let{anchor:r,floater:o}=n;if((t?["above","below","vertical"]:["horizontal","left","right"]).includes(e)){let s=(t?r.width:r.height)/2,u=(t?o.width:o.height)/2;return(t?r.left:r.top)+s-u}if(t?e.startsWith("horizontal"):e.startsWith("vertical"))return M({preferMin:i,end:t?r.right:r.bottom,max:t?innerWidth:innerHeight,offset:t?o.width:o.height,start:t?r.left:r.top})}function D(t,e){if(t===null)return e;let n=t.trim().toLowerCase(),i=T.indexOf(n);return i>-1?T[i]??e:e}function $(t,e,n,i){let{anchor:r,floater:o}=n;return(t?e.startsWith("right"):e.endsWith("top"))?t?r.right:r.top:(t?e.startsWith("left"):e.endsWith("bottom"))?(t?r.left:r.bottom)-(t?o.width:o.height):(t?e.endsWith("right"):e.startsWith("above"))?(t?r.right:r.top)-(t?o.width:o.height):z(t,e,n,i)??t?r.left:r.bottom}function N(t){let{anchor:e,floater:n,parent:i}=t.elements,r=I(n)==="rtl",o,s;function u(){e.after(n)}function d(){let h=D((i??e).getAttribute(t.position.attribute)??"",t.position.defaultValue),b=e.getBoundingClientRect();if(o===h&&S.every(v=>s?.[v]===b[v]))return;o=h,s=b;let W={anchor:b,floater:n.getBoundingClientRect()},g=L(h,W,r,t.position.preferAbove),y=`matrix(1, 0, 0, 1, ${g.left}, ${g.top})`;n.style.transform!==y&&(n.style.position="fixed",n.style.inset="0 auto auto 0",n.style.transform=y)}return document.body.append(n),n.hidden=!1,new c(d,0,Number.POSITIVE_INFINITY,u).start()}var O=[H,X,R,Y,j],ut=['[contenteditable]:not([contenteditable="false"])',"[tabindex]:not(slot)","a[href]","audio[controls]","button","details","details > summary:first-of-type","iframe","input","select","textarea","video[controls]"].map(t=>`${t}:not([inert])`).join(",");function P(t){return t.tabIndex>-1?t.tabIndex:/^(audio|details|video)$/i.test(t.tagName)||K(t)?q(t)?-1:0:-1}function q(t){return!Number.isNaN(Number.parseInt(t.getAttribute("tabindex"),10))}function H(t){return/^(button|input|select|textarea)$/i.test(t.element.tagName)&&V(t.element)?!0:(t.element.disabled??!1)||t.element.getAttribute("aria-disabled")==="true"}function V(t){let e=t.parentElement;for(;e!==null;){if(/^fieldset$/i.test(e.tagName)&&e.disabled){let n=Array.from(e.children);for(let i of n)if(/^legend$/i.test(i.tagName))return e.matches("fieldset[disabled] *")?!0:!i.contains(t);return!0}e=e.parentElement}return!1}function K(t){return/^(|true)$/i.test(t.getAttribute("contenteditable"))}function F(t){return B({element:t,tabIndex:P(t)})}function B(t){return!O.some(e=>e(t))}function Y(t){if(t.element.hidden||t.element instanceof HTMLInputElement&&t.element.type==="hidden")return!0;let e=getComputedStyle(t.element);if(e.display==="none"||e.visibility==="hidden")return!0;let{height:n,width:i}=t.element.getBoundingClientRect();return n===0&&i===0}function R(t){return(t.element.inert??!1)||/^(|true)$/i.test(t.element.getAttribute("inert"))||t.element.parentElement!==null&&R({element:t.element.parentElement})}function X(t){return t.tabIndex<0}function j(t){return/^details$/i.test(t.element.tagName)&&Array.from(t.element.children).some(e=>/^summary$/i.test(e.tagName))}var l="palmer-tooltip",_=`${l}-position`,f=new WeakMap;function G(t){let e=t.getAttribute("aria-describedby")??t.getAttribute("aria-labelledby"),n=e===null?null:document.querySelector(`#${e}`);if(n===null)throw new TypeError(`A '${l}'-attributed element must have a valid id reference in either the 'aria-describedby' or 'aria-labelledby'-attribute.`);return n.hidden=!0,n.setAttribute("aria-hidden",!0),n.setAttribute("role","tooltip"),n.setAttribute(`${l}-content`,""),n}function J(t){f.has(t)||f.set(t,new p(t))}function Q(t){let e=f.get(t);e!==void 0&&(e.handleCallbacks(!1),f.delete(t))}function U(t){for(let e of t)e.type==="attributes"&&(e.target.getAttribute(l)===null?Q(e.target):J(e.target))}var p=class{constructor(e){this.anchor=e,this.callbacks={click:this.onClick.bind(this),hide:this.onHide.bind(this),keydown:this.onKeyDown.bind(this),show:this.onShow.bind(this)},this.focusable=F(e),this.floater=G(e),this.timer=void 0,this.handleCallbacks(!0)}onClick(e){E(e.target,n=>[this.anchor,this.floater].includes(n))===void 0&&this.toggle(!1)}onHide(){this.toggle(!1)}onKeyDown(e){e instanceof KeyboardEvent&&e.key==="Escape"&&this.toggle(!1)}onShow(){this.toggle(!0)}toggle(e){let n=e?"addEventListener":"removeEventListener";document[n]("click",this.callbacks.click,a()),document[n]("keydown",this.callbacks.keydown,a()),e?(this.timer?.stop(),this.timer=N({elements:{anchor:this.anchor,floater:this.floater},position:{attribute:_,defaultValue:"vertical",preferAbove:!0}})):(this.floater.hidden=!0,this.timer?.stop())}handleCallbacks(e){let{anchor:n,floater:i,focusable:r}=this,o=e?"addEventListener":"removeEventListener";for(let s of[n,i])s[o]("mouseenter",this.callbacks.show,a()),s[o]("mouseleave",this.callbacks.hide,a()),s[o]("touchstart",this.callbacks.show,a());r&&(n[o]("blur",this.callbacks.hide,a()),n[o]("focus",this.callbacks.show,a()))}},Z=new MutationObserver(U);Z.observe(document,{attributeFilter:[l],attributeOldValue:!0,attributes:!0,childList:!0,subtree:!0});k(()=>{let t=Array.from(document.querySelectorAll(`[${l}]`));for(let e of t)e.setAttribute(l,"")},0);})();

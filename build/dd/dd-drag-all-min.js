YUI.add("dd-ddm-base",function(B){var A=function(){};A.NAME="DragDropMgr";A.ATTRS={clickPixelThresh:{value:3,set:function(C){this.clickPixelThresh=C;}},clickTimeThresh:{value:1000,set:function(C){this.clickTimeThresh=C;}}};B.mix(A,{clickPixelThresh:3,clickTimeThresh:1000,drags:[],activeDrag:false,regDrag:function(C){this.drags[this.drags.length]=C;},unregDrag:function(D){var C=[];B.each(this.drags,function(F,E){if(F!==D){C[C.length]=F;}});this.drags=C;},init:function(){B.Node.get("document").on("mousemove",this.move,this,true);B.Node.get("document").on("mouseup",this.end,this,true);},start:function(C,F,D,E){this.startDrag.apply(this,arguments);},startDrag:function(){},endDrag:function(){},dropMove:function(){},end:function(){if(this.activeDrag){this.endDrag();this.activeDrag.end.call(this.activeDrag);this.activeDrag=null;}},move:function(){if(this.activeDrag){this.activeDrag.move.apply(this.activeDrag,arguments);this.dropMove();}},setXY:function(E,F){var D=parseInt(E.getStyle("top"),10),C=parseInt(E.getStyle("left"),10),G=E.getStyle("position");if(G==="static"){E.setStyle("position","relative");}if(isNaN(D)){D=0;}if(isNaN(C)){C=0;}E.setStyle("top",(F[1]+D)+"px");E.setStyle("left",(F[0]+C)+"px");},cssSizestoObject:function(E){var D=E.split(" "),C={top:0,bottom:0,right:0,left:0};if(D.length){C.top=parseInt(D[0],10);if(D[1]){C.right=parseInt(D[1],10);}else{C.right=C.top;}if(D[2]){C.bottom=parseInt(D[2],10);}else{C.bottom=C.top;}if(D[3]){C.left=parseInt(D[3],10);}else{if(D[1]){C.left=C.right;}else{C.left=C.top;}}}return C;},getDrag:function(D){var C=false,E=B.Node.get(D);if(E instanceof B.Node){B.each(this.drags,function(G,F){if(E.compareTo(G.get("node"))){C=G;}});}return C;}});B.mix(A,B.Base.prototype);B.namespace("DD");B.DD.DDM=A;B.DD.DDM.init();},"@VERSION@",{skinnable:false,requires:["node","nodeextras","base"]});YUI.add("dd-ddm",function(A){A.mix(A.DD.DDM,{pg:null,_debugShim:false,_activateTargets:function(){},_deactivateTargets:function(){},startDrag:function(){if(this.activeDrag.get("useShim")){this.pg_activate();this._activateTargets();}},endDrag:function(){this.pg_deactivate();this._deactivateTargets();},pg_deactivate:function(){this.pg.setStyle("display","none");},pg_activate:function(){this.pg_size();this.pg.setStyles({top:0,left:0,display:"block",opacity:((this._debugShim)?".5":"0"),filter:"alpha(opacity="+((this._debugShim)?"50":"0")+")"});},pg_size:function(){if(this.activeDrag){var B=A.Node.get("body"),D=B.get("docHeight"),C=B.get("docWidth");this.pg.setStyles({height:D+"px",width:C+"px"});}},_createPG:function(){var C=A.Node.create(["div"]),B=A.Node.get("body");C.setStyles({top:"0",left:"0",position:"absolute",zIndex:"9999",opacity:"0",backgroundColor:"red",display:"none",height:"5px",width:"5px"});if(B.get("firstChild")){B.insertBefore(C,B.get("firstChild"));}else{B.appendChild(C);}this.pg=C;this.pg.on("mouseup",this.end,this,true);this.pg.on("mousemove",this.move,this,true);A.Event.addListener(window,"resize",this.pg_size,this,true);A.Event.addListener(window,"scroll",this.pg_size,this,true);}},true);A.DD.DDM._createPG();},"@VERSION@",{skinnable:false,requires:["dd-ddm-base"]});YUI.add("dd-drag",function(D){var E=D.DD.DDM,R="node",L="dragNode",C="offsetHeight",J="offsetWidth",P="mouseup",N="mousedown",G="drag:mouseDown",B="drag:afterMouseDown",F="drag:removeHandle",K="drag:addHandle",O="drag:removeInvalid",Q="drag:addInvalid",I="drag:start",H="drag:end",M="drag:drag";var A=function(){A.superclass.constructor.apply(this,arguments);E.regDrag(this);};A.NAME="drag";A.ATTRS={node:{set:function(S){return D.Node.get(S);}},dragNode:{set:function(S){return D.Node.get(S);}},offsetNode:{value:true},clickPixelThresh:{value:E.clickPixelThresh},clickTimeThresh:{value:E.clickTimeThresh},lock:{value:false,set:function(S){if(S){this.get(R).addClass("yui-dd-locked");}else{this.get(R).removeClass("yui-dd-locked");}}},data:{value:false},move:{value:true},useShim:{value:true},activeHandle:{value:false},primaryButtonOnly:{value:true},dragging:{value:false},target:{value:false,set:function(S){this._handleTarget(S);}},dragMode:{value:"default",set:function(S){switch(S){case"point":return 0;case"intersect":return 1;case"strict":return 2;case"default":return -1;}return"default";}},groups:{value:["default"],set:function(S){this._groups={};D.each(S,function(U,T){this._groups[U]=true;},this);}}};D.extend(A,D.Base,{target:null,_handleTarget:function(S){if(D.DD.Drop){if(S===false){if(this.target){E.unregTarget(this.target);this.target=null;}return false;}else{if(!D.Lang.isObject(S)){S={};}S.node=this.get(R);this.target=new D.DD.Drop(S);}}else{return false;}},_groups:null,_createEvents:function(){this.publish(G,{defaultFn:this._handleMouseDown,emitFacade:true});var S=[B,F,K,O,Q,I,H,M];D.each(S,function(U,T){this.publish(U,{emitFacade:true,preventable:false});},this);this.addTarget(E);},_ev_md:null,_handles:null,_invalids:null,_dragThreshMet:null,_fromTimeout:null,_clickTimeout:null,deltaXY:null,startXY:null,nodeXY:null,lastXY:null,mouseXY:null,region:null,_handleMouseUp:function(S){this._fixIEMouseUp();if(E.activeDrag){E.end();}},_ieSelectFix:function(){return false;},_ieSelectBack:null,_fixIEMouseDown:function(){if(D.UA.ie){this._ieSelectBack=document.body.onselectstart;document.body.onselectstart=this._ieSelectFix;}},_fixIEMouseUp:function(){if(D.UA.ie){document.body.onselectstart=this._ieSelectBack;}},_handleMouseDownEvent:function(S){this.fire(G,{ev:S});},_handleMouseDown:function(U){var T=U.ev;this._dragThreshMet=false;this._ev_md=T;if(this.get("primaryButtonOnly")&&T.button>1){return false;}if(this.validClick(T)){this._fixIEMouseDown();T.halt();this._setStartPosition([T.pageX,T.pageY]);E.activeDrag=this;var S=this;this._clickTimeout=setTimeout(function(){S._timeoutCheck.call(S);},this.get("clickTimeThresh"));}this.fire(B,{ev:T});},validClick:function(W){var V=false,S=W.target,U=null;if(this._handles){D.each(this._handles,function(X,Y){if(D.Lang.isString(Y)){if(S.test(Y+", "+Y+" *")){U=Y;V=true;}}});}else{if(this.get(R).contains(S)||this.get(R).compareTo(S)){V=true;
}}if(V){if(this._invalids){D.each(this._invalids,function(X,Y){if(D.Lang.isString(Y)){if(S.test(Y+", "+Y+" *")){V=false;}}});}}if(V){if(U){var T=W.originalTarget.queryAll(U);T.each(function(Y,X){if(Y.contains(S)||Y.compareTo(S)){this.set("activeHandle",T.item(X));}},this);}else{this.set("activeHandle",this.get(R));}}return V;},_setStartPosition:function(S){this.startXY=S;this.nodeXY=this.get(R).getXY();this.lastXY=this.nodeXY;if(this.get("offsetNode")){this.deltaXY=[(this.startXY[0]-this.nodeXY[0]),(this.startXY[1]-this.nodeXY[1])];}else{this.deltaXY=[0,0];}},_timeoutCheck:function(){if(!this.get("lock")){this._fromTimeout=true;this._dragThreshMet=true;this.start();this.moveNode([this._ev_md.pageX,this._ev_md.pageY],true);}},removeHandle:function(S){if(this._handles[S]){delete this._handles[S];this.fire(F,{handle:S});}return this;},addHandle:function(S){if(!this._handles){this._handles={};}if(D.Lang.isString(S)){this._handles[S]=true;this.fire(K,{handle:S});}return this;},removeInvalid:function(S){if(this._invalids[S]){delete this._handles[S];this.fire(O,{handle:S});}return this;},addInvalid:function(S){if(D.Lang.isString(S)){this._invalids[S]=true;this.fire(Q,{handle:S});}else{}return this;},initializer:function(){this._invalids={};this._createEvents();if(!this.get(L)){this.set(L,this.get(R));}this.get(R).addClass("yui-draggable");this.get(R).on(N,this._handleMouseDownEvent,this,true);this.get(R).on(P,this._handleMouseUp,this,true);this._dragThreshMet=false;},start:function(){if(!this.get("lock")){this.set("dragging",true);E.start(this.deltaXY,[this.get(R).get(C),this.get(R).get(J)]);this.get(R).addClass("yui-dd-dragging");this.fire(I);this.get(L).on(P,this._handleMouseUp,this,true);var S=this.nodeXY;this.region={"0":S[0],"1":S[1],area:0,top:S[1],right:S[0]+this.get(R).get(J),bottom:S[1]+this.get(R).get(C),left:S[0]};}},end:function(){clearTimeout(this._clickTimeout);this._dragThreshMet=false;this._fromTimeout=false;if(!this.get("lock")&&this.get("dragging")){this.fire(H);}this.get(R).removeClass("yui-dd-dragging");this.set("dragging",false);this.deltaXY=[0,0];this.get(L).detach(P,this._handleMouseUp,this,true);},_align:function(S){return[S[0]-this.deltaXY[0],S[1]-this.deltaXY[1]];},moveNode:function(S,X){var W=this._align(S),T=[],U=[];T[0]=(W[0]-this.lastXY[0]);T[1]=(W[1]-this.lastXY[1]);U[0]=(W[0]-this.nodeXY[0]);U[1]=(W[1]-this.nodeXY[1]);if(this.get("move")){E.setXY(this.get(L),T);}this.region={"0":W[0],"1":W[1],area:0,top:W[1],right:W[0]+this.get(R).get(J),bottom:W[1]+this.get(R).get(C),left:W[0]};var V=this.nodeXY;if(!X){this.fire(M,{info:{start:V,xy:W,delta:T,offset:U}});}this.lastXY=W;},move:function(U){if(this.get("lock")){return false;}else{this.mouseXY=[U.pageX,U.pageY];if(!this._dragThreshMet){var T=Math.abs(this.startXY[0]-U.pageX);var S=Math.abs(this.startXY[1]-U.pageY);if(T>this.get("clickPixelThresh")||S>this.get("clickPixelThresh")){this._dragThreshMet=true;this.start();this.moveNode([U.pageX,U.pageY]);}}else{clearTimeout(this._clickTimeout);this.moveNode([U.pageX,U.pageY]);}}},destructor:function(){E.unregDrag(this);this.get(R).detach(N,this._handleMouseDownEvent,this,true);this.get(R).detach(P,this._handleMouseUp,this,true);},toString:function(){return"Drag";}});D.namespace("DD");D.DD.Drag=A;},"@VERSION@",{skinnable:false,requires:["dd-ddm-base"]});YUI.add("dd-proxy",function(G){var E=G.DD.DDM,A="node",B="dragNode",F="firstChild",C="proxy";var H=function(){H.superclass.constructor.apply(this,arguments);};H.ATTRS={moveOnEnd:{value:true},resizeFrame:{value:true},proxy:{writeOnce:true,value:false},positionProxy:{value:true},borderStyle:{value:"1px solid #808080"}};var D={_createFrame:function(){if(!E._proxy){E._proxy=true;var J=G.Node.create(["div"]),I=G.Node.get("body");J.setStyles({position:"absolute",display:"none",border:this.get("borderStyle")});if(I.get(F)){I.insertBefore(J,I.get(F));}else{I.appendChild(J);}J.set("id",G.stamp(J));J.addClass("dd-proxy");E._proxy=J;}},_setFrame:function(){var I=this.get(A);if(this.get("resizeFrame")){E._proxy.setStyles({height:I.get("clientHeight")+"px",width:I.get("clientWidth")+"px"});}this.get(B).setStyles({visibility:"hidden",display:"block",border:this.get("borderStyle")});if(this.get("positionProxy")){this.get(B).setXY(this.nodeXY);}this.get(B).setStyle("visibility","visible");},initializer:function(){if(this.get(C)){this._createFrame();}},start:function(){if(!this.get("lock")){if(this.get(C)){if(this.get(B).compareTo(this.get(A))){this.set(B,E._proxy);}}}H.superclass.start.apply(this);if(this.get(C)){this._setFrame();}},end:function(){if(this.get(C)){if(this.get("moveOnEnd")){this.get(A).setXY(this.lastXY);}this.get(B).setStyle("display","none");}H.superclass.end.apply(this);}};G.extend(H,G.DD.Drag,D);G.DD.Drag=H;},"@VERSION@",{skinnable:false,requires:["dd-drag"]});YUI.add("dd-constrain",function(E){var A="dragNode",G="offsetHeight",F="offsetWidth";var D=function(){D.superclass.constructor.apply(this,arguments);};D.ATTRS={stickX:{value:false},stickY:{value:false},tickX:{value:false},tickY:{value:false},tickXArray:{value:false},tickYArray:{value:false},constrain2region:{value:false,get:function(C){if(E.Lang.isObject(C)){var H={};E.mix(H,C);return H;}else{return false;}},set:function(C){if(E.Lang.isObject(C)){if(C.top&&C.right&&C.left&&C.bottom){var H={};E.mix(H,C);return H;}else{return false;}}else{if(C!==false){return false;}}}},gutter:{value:"0",set:function(C){return E.DD.DDM.cssSizestoObject(C);}},constrain2node:{value:false,set:function(H){if(!this.get("constrain2region")){var C=E.Node.get(H);if(C){return C;}}else{if(this.get("constrain2region")!==false){}}return false;}},constrain2view:{value:false}};var B={getRegion:function(K){var I={};if(this.get("constrain2node")){I=this.get("constrain2node").getRegion();}else{if(this.get("constrain2region")){I=this.get("constrain2region");}else{if(this.get("constrain2view")){I=this.get("node").get("viewportRegion");}else{return false;}}}var H=this.get("gutter");E.each(H,function(L,M){if((M=="right")||(M=="bottom")){I[M]-=L;
}else{I[M]+=L;}});if(K){var J=this.get(A).get(G),C=this.get(A).get(F);I.right=I.right-C;I.bottom=I.bottom-J;}return I;},_checkRegion:function(C){var I=C,J=this.getRegion(),K=this.get(A).get(G),H=this.get(A).get(F);if(J.top>I[1]){I[1]=J.top;}if(I[1]>(J.bottom-K)){I[1]=(J.bottom-K);}if(J.left>I[0]){I[0]=J.left;}if(I[0]>(J.right-H)){I[0]=(J.right-H);}return I;},inRegion:function(I){I=I||this.get(A).getXY();var H=this._checkRegion([I[0],I[1]]),C=false;if((I[0]===H[0])&&(I[1]===H[1])){C=true;}return C;},_align:function(I){var C=D.superclass._align.apply(this,arguments),H=this.getRegion(true);if(this.get("stickX")){C[1]=(this.startXY[1]-this.deltaXY[1]);}if(this.get("stickY")){C[0]=(this.startXY[0]-this.deltaXY[0]);}if(H){C=this._checkRegion(C);}C=this._checkTicks(C,H);return C;},_calcTicks:function(N,M,J,L,K){var H=((N-M)/J),I=Math.floor(H),C=Math.ceil(H);if((I!==0)||(C!==0)){if((H>=I)&&(H<=C)){N=(M+(J*I));if(L&&K){if(N<L){N=(M+(J*(I+1)));}if(N>K){N=(M+(J*(I-1)));}}}}return N;},_calcTickArray:function(O,P,N,K){var H=0,L=P.length,J=0;if(!P||(P.length===0)){return O;}else{if(P[0]>=O){return P[0];}else{for(H=0;H<L;H++){J=(H+1);if(P[J]&&P[J]>=O){var I=O-P[H],C=P[J]-O;var M=(C>I)?P[H]:P[J];if(N&&K){if(M>K){if(P[H]){M=P[H];}else{M=P[L-1];}}}return M;}}return P[P.length-1];}}},_checkTicks:function(L,J){var K=(this.startXY[0]-this.deltaXY[0]),I=(this.startXY[1]-this.deltaXY[1]),C=this.get("tickX"),H=this.get("tickY");if(C&&!this.get("tickXArray")){L[0]=this._calcTicks(L[0],K,C,J.left,J.right);}if(H&&!this.get("tickYArray")){L[1]=this._calcTicks(L[1],I,H,J.top,J.bottom);}if(this.get("tickXArray")){L[0]=this._calcTickArray(L[0],this.get("tickXArray"),J.left,J.right);}if(this.get("tickYArray")){L[1]=this._calcTickArray(L[1],this.get("tickYArray"),J.top,J.bottom);}return L;}};E.extend(D,E.DD.Drag,B);E.DD.Drag=D;},"@VERSION@",{skinnable:false,requires:["dd-drag","dd-proxy"]});YUI.add("dd-plugin",function(B){B.Plugin=B.Plugin||{};var A=function(C){C.node=C.owner;A.superclass.constructor.apply(this,arguments);};A.NAME="dd-plugin";A.NS="dd";B.extend(A,B.DD.Drag);B.Plugin.Drag=A;},"@VERSION@",{optional:["dd-constrain","dd-proxy"],requires:["dd-drag"],skinnable:false});YUI.add("dd-drag-all",function(A){},"@VERSION@",{skinnable:false,use:["dd-ddm-base","dd-ddm","dd-drag","dd-proxy","dd-constrain","dd-plugin"]});
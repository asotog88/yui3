YUI.add("dd-ddm-base",function(B){var A=function(){};A.NAME="DragDropMgr";A.ATTRS={clickPixelThresh:{value:3,set:function(C){this.clickPixelThresh=C;}},clickTimeThresh:{value:1000,set:function(C){this.clickTimeThresh=C;}}};B.mix(A,{clickPixelThresh:3,clickTimeThresh:1000,drags:[],activeDrag:false,regDrag:function(C){this.drags[this.drags.length]=C;},unregDrag:function(D){var C=[];B.each(this.drags,function(F,E){if(F!==D){C[C.length]=F;}});this.drags=C;},init:function(){B.Node.get("document").on("mousemove",this.move,this,true);B.Node.get("document").on("mouseup",this.end,this,true);},start:function(C,F,D,E){this.startDrag.apply(this,arguments);},startDrag:function(){},endDrag:function(){},dropMove:function(){},end:function(){if(this.activeDrag){this.endDrag();this.activeDrag.end.call(this.activeDrag);this.activeDrag=null;}},move:function(){if(this.activeDrag){this.activeDrag.move.apply(this.activeDrag,arguments);this.dropMove();}},setXY:function(E,F){var D=parseInt(E.getStyle("top"),10),C=parseInt(E.getStyle("left"),10),G=E.getStyle("position");if(G==="static"){E.setStyle("position","relative");}if(isNaN(D)){D=0;}if(isNaN(C)){C=0;}E.setStyle("top",(F[1]+D)+"px");E.setStyle("left",(F[0]+C)+"px");},cssSizestoObject:function(E){var D=E.split(" "),C={top:0,bottom:0,right:0,left:0};if(D.length){C.top=parseInt(D[0],10);if(D[1]){C.right=parseInt(D[1],10);}else{C.right=C.top;}if(D[2]){C.bottom=parseInt(D[2],10);}else{C.bottom=C.top;}if(D[3]){C.left=parseInt(D[3],10);}else{if(D[1]){C.left=C.right;}else{C.left=C.top;}}}return C;},getDrag:function(D){var C=false,E=B.Node.get(D);if(E instanceof B.Node){B.each(this.drags,function(G,F){if(E.compareTo(G.get("node"))){C=G;}});}return C;}});B.mix(A,B.Base.prototype);B.namespace("DD");B.DD.DDM=A;B.DD.DDM.init();},"@VERSION@",{skinnable:false,requires:["node","nodeextras","base"]});
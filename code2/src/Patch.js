
function Patch(scene, id, degreeU, degreeV, divU, divV, controlvertexes){

	this.ID = id;
	this.updatableTexCoords=false;

	var knotsU = [];
	for(var i=0; i<=degreeU; i++){
		knotsU.push(0);
	}
	for(var i=0; i<=degreeU; i++){
		knotsU.push(1);
	}

	var knotsV = [];
	for(var i=0; i<=degreeV; i++){
		knotsV.push(0);
	}
	for(var i=0; i<=degreeV; i++){
		knotsV.push(1);
	}

	/*

	u - horizontal
	v - vertical

	A
	|
	0---B

	0 -		u = 0 ; 	v = 0 ;
	A - 	u = 0 ;		v = 1 ;
	B - 	u = 1 ;		v = 0 ;
	
	*/

	var nurbsSurface = new CGFnurbsSurface(degreeU, degreeV, knotsU, knotsV, controlvertexes);
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};

	CGFnurbsObject.call(this, scene, getSurfacePoint, divU, divV);
};

Patch.prototype = Object.create(CGFnurbsObject.prototype);
Patch.prototype.constructor=Patch;
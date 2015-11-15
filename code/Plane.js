
function Plane(scene, id, divU, divV) {
	
	var controlvertexes = 
	[
		[
			[-0.5, 0.0, 0.5, 1 ], // (u, v) = (0, 0)
			[-0.5, 0.0, -0.5, 1 ] // (u, v) = (0, 1)
		],
		[
			[ 0.5, 0.0, 0.5, 1 ], // (u, v) = (1, 0)
			[ 0.5, 0.0, -0.5, 1 ] // (u, v) = (1, 1)
		]
	];

	Patch.call(this, scene, id, 1, 1, divU, divV, controlvertexes);
};

Plane.prototype = Object.create(Patch.prototype);
Plane.prototype.constructor=Plane;
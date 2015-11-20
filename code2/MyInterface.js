/**
 * MyInterface
 * @constructor
 */
function MyInterface() {

	CGFinterface.call(this);
};

MyInterface.prototype = Object.create(CGFinterface.prototype);
MyInterface.prototype.constructor = MyInterface;

/**
 * init
 * @param {CGFapplication} application
 */
MyInterface.prototype.init = function(application) {

	CGFinterface.prototype.init.call(this, application);

	// Creates GUI on the window
    this.gui = new dat.GUI();

    var lightChecksGroup=this.gui.addFolder("Lights");
	lightChecksGroup.open();

	for(var i = 0; i<this.scene.lights.length; i++){
		if(this.scene.lights[i].ID != null){
			lightChecksGroup.add(this.scene.lights[i], 'enabled').name(""+this.scene.lights[i].ID);
		}else
			break;
	}

    return true;
};

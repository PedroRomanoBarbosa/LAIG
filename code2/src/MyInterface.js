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

    var checksGroup=this.gui.addFolder("Options");

	checksGroup.add(this.scene, 'lightsVisible').name("Visible Lights");
	checksGroup.add(this.scene, 'showAxis').name("Visible Axis");

	checksGroup.add(this.scene, 'maxTurnTime').name("Turn Time");

	checksGroup.close();

    return true;
};

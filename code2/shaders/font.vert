attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

uniform vec2 dims;
uniform vec2 charCoords;

varying vec2 vTextureCoord;
varying vec2 vTextureCoord2;

void main() {
	
	vTextureCoord = aTextureCoord;
	
	vTextureCoord2 = (charCoords + aTextureCoord) / dims;
	
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
}


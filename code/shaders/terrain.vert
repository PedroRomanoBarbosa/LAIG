attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform sampler2D uSampler2;

uniform float heightScale;

varying vec2 vTextureCoord;

void main() {
	
	//change texture coordinates
	vec2 texInver = vec2(1.0, -1.0);

	vTextureCoord = aTextureCoord*texInver;
	//--------------------------
	
	//change vertex position
	vec4 filter = texture2D(uSampler2, vTextureCoord);
	vec3 offset = vec3(0.0, filter.r * heightScale, 0.0);
	
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + offset, 1.0);
	//----------------------
}
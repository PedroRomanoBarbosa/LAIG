attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
uniform sampler2D uSampler2;

uniform float heightScale;

void main() {
	
	vec4 incHeight=vec4(0.0, 1.0, 0.0, 0.0)*heightScale;
	vec2 texInver=vec2(1.0,-1.0);

	vTextureCoord = aTextureCoord*texInver;
	
	vec4 filter = texture2D(uSampler2, vec2(0.0,0.1)+vTextureCoord);
	
	vec4 h=vec4(0.0, 0.0, 0.0, 0.0);
	
	if(filter.a > 0.5)
		h=vec4(0.0, 1.0, 0.0, 0.0);
	
	gl_Position = uPMatrix * uMVMatrix * (vec4(aVertexPosition, 1.0) + h);
}
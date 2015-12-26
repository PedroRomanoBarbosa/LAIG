#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

varying vec2 vTextureCoord;
varying vec2 vTextureCoord2;

varying vec4 filter;

void main() {
	
	if(filter.r == 0.0){
		gl_FragColor = texture2D(uSampler, vTextureCoord);
	}else{
		gl_FragColor = texture2D(uSampler2, vTextureCoord2);
	}
}



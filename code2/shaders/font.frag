#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D uSampler;
uniform sampler2D uSampler2;

varying vec2 vTextureCoord;
varying vec2 vTextureCoord2;

void main() {

	vec4 filter = texture2D(uSampler2, vTextureCoord2);
	
	if(filter.r < 0.5 && filter.g < 0.5 && filter.b < 0.5){
		gl_FragColor = texture2D(uSampler, vTextureCoord);
	}else{
		gl_FragColor = vec4(1.0, 0.067, 0.325, 1.0);
	}
}



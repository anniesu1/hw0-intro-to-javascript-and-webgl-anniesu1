#version 300 es

// This is a fragment shader for the corresponding custom-vert.glsl vertex shader
precision highp float;

// The color with which to render this instance of geometry
uniform vec4 u_Color;

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

// Final output color for the current pixel that will be output to the screen
out vec4 out_Col;

void main() {
    // Define color palette. I have chosen to use a rainbow one! 
    // (referenced from http://www.iquilezles.org/www/articles/palettes/palettes.htm)
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.00, 0.33, 0.67);

    // Define t as the Lambertian dot product
    float t = dot(normalize(fs_Nor), normalize(fs_LightVec));

    // Compute final shaded color
    vec3 palette = a + b * cos(2.0 * 3.141592653589 * (c * t + d));
    out_Col = vec4(palette[0], palette[1], palette[2], 1);
}

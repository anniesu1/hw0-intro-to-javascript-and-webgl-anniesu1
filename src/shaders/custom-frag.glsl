#version 300 es

// This is a fragment shader. 
// Unlike the vertex shader, the fragment shader actually does compute
// the shading of geometry. For every pixel in your program's output
// screen, the fragment shader is run for every bit of geometry that
// particular pixel overlaps. By implicitly interpolating the position
// data passed into the fragment shader by the vertex shader, the fragment shader
// can compute what color to apply to its pixel based on things like vertex
// position, light position, and vertex color.
precision highp float;

uniform vec4 u_Color; // The color with which to render this instance of geometry.

// These are the interpolated values out of the rasterizer, so you can't know
// their specific values without knowing the vertices that contributed to them
in vec4 fs_Nor;
in vec4 fs_LightVec;
in vec4 fs_Col;

out vec4 out_Col; // This is the final output color that you will see on your
                  // screen for the pixel that is currently being processed.

void main()
{
    // Define palette. I have chosen to use a rainbow one! 
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

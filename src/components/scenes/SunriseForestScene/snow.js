import * as THREE from 'three';

const COUNT = 1200;

/**
 * GPU-driven snowfall using a buffer of point positions and a vertex shader
 * that animates each flake on its own loop.
 * @param {THREE.Scene} scene
 * @returns {{ update: (timeSeconds: number) => void, dispose: () => void }}
 */
export function addSnow(scene) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = Math.random() * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0.0 } },
    vertexShader: `
      uniform float time;
      void main() {
        vec3 pos = position;
        float fallSpeed = 0.4 + fract(position.x * 0.3 + position.z * 0.2) * 0.8;
        pos.y = mod(pos.y - time * fallSpeed + 14.0, 14.0) - 2.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 3.0 + 2.0 * fract(position.x * 0.5 + position.z * 0.3);
      }
    `,
    fragmentShader: `
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.3, d);
        gl_FragColor = vec4(vec3(1.0), alpha);
      }
    `,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    update: (timeSeconds) => {
      material.uniforms.time.value = timeSeconds;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

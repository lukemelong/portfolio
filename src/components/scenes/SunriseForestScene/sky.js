import * as THREE from 'three';

/**
 * Adds a gradient sky dome to the scene.
 * @param {THREE.Scene} scene
 * @returns {{ dispose: () => void }}
 */
export function addSky(scene) {
  const geometry = new THREE.SphereGeometry(40, 16, 16);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0xb8e4f9) },
      bottomColor: { value: new THREE.Color(0xffd6a3) },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vPos;
      void main() {
        float h = normalize(vPos).y * 0.5 + 0.5;
        gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return {
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}

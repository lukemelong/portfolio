import * as THREE from 'three';

/**
 * Adds ambient + directional sun + a point light that follows the cursor.
 * @param {THREE.Scene} scene
 * @returns {{ cursorLight: THREE.PointLight }}
 */
export function addLighting(scene) {
  scene.add(new THREE.AmbientLight(0xcfdff2, 0.8));

  const sun = new THREE.DirectionalLight(0xffc97b, 0.8);
  sun.position.set(-2, 1.2, 1.5);
  scene.add(sun);

  const cursorLight = new THREE.PointLight(0xffb96c, 1.4, 4, 1.1);
  cursorLight.position.set(0, 0.5, 2);
  scene.add(cursorLight);

  return { cursorLight };
}

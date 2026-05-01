import * as THREE from 'three';

const TREE_COLORS = [0x3b6b3b, 0x4c8052, 0x557f4f];
const ROWS = 6;
const TREES_PER_ROW = 25;

/**
 * Adds the snowy ground plane and rows of instanced cone-trees.
 * @param {THREE.Scene} scene
 * @returns {{ group: THREE.Group, dispose: () => void }}
 */
export function addForest(scene) {
  // Ground
  const groundGeo = new THREE.PlaneGeometry(40, 40);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xfafafa,
    roughness: 0.9,
    metalness: 0,
    emissive: new THREE.Color(0xfff3cc).multiplyScalar(0.08),
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.9;
  scene.add(ground);

  // Trees
  const treeGeo = new THREE.ConeGeometry(0.4, 1.5, 8);
  const group = new THREE.Group();
  const treeMaterials = [];

  for (let row = 0; row < ROWS; row++) {
    const depth = -2.5 - row * 1.5;
    const color = TREE_COLORS[row % TREE_COLORS.length];
    const mat = new THREE.MeshStandardMaterial({ color });
    treeMaterials.push(mat);
    const instanced = new THREE.InstancedMesh(treeGeo, mat, TREES_PER_ROW);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < TREES_PER_ROW; i++) {
      dummy.position.set(
        (i - TREES_PER_ROW / 2) + Math.random() * 0.4,
        -1.25,
        depth + Math.random() * 0.4
      );
      const scale = 1 - row * 0.1 + Math.random() * 0.1;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    group.add(instanced);
  }
  scene.add(group);

  return {
    group,
    dispose: () => {
      groundGeo.dispose();
      groundMat.dispose();
      treeGeo.dispose();
      treeMaterials.forEach((m) => m.dispose());
    },
  };
}

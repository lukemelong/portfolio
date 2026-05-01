import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { addSky } from './sky';
import { addForest } from './forest';
import { addSnow } from './snow';
import { addLighting } from './lighting';

const BASE_CAMERA = { x: 1, y: -1, z: 2 };
const MOUSE_THROTTLE_MS = 30;

function SunriseForestScene() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe6f2ff, 0.07);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(BASE_CAMERA.x, BASE_CAMERA.y + 1, BASE_CAMERA.z + 1);
    camera.lookAt(0, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const sky = addSky(scene);
    const forest = addForest(scene);
    const snow = addSnow(scene);
    const { cursorLight } = addLighting(scene);

    // Mouse tracking (throttled)
    const mouse = { x: 0, y: 0 };
    let lastMove = 0;
    const onMouseMove = (e) => {
      const now = performance.now();
      if (now - lastMove < MOUSE_THROTTLE_MS) return;
      lastMove = now;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener('mousemove', onMouseMove);

    // Animation loop
    const start = performance.now();
    renderer.setAnimationLoop(() => {
      const t = (performance.now() - start) / 1000;
      snow.update(t);

      camera.position.x += (mouse.x * 0.5 + BASE_CAMERA.x - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.2 + BASE_CAMERA.y - camera.position.y) * 0.05;
      camera.position.z += (BASE_CAMERA.z - camera.position.z) * 0.05;
      camera.lookAt(0, 0.5, -2);

      cursorLight.position.x += (mouse.x * 2 - cursorLight.position.x) * 0.1;
      cursorLight.position.y += (mouse.y * 1.5 - cursorLight.position.y) * 0.1;

      forest.group.position.x = -camera.position.x * 0.3;

      renderer.render(scene, camera);
    });

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', onMouseMove);
      renderer.setAnimationLoop(null);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      sky.dispose();
      forest.dispose();
      snow.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
    </div>
  );
}

export default SunriseForestScene;

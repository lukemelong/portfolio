import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const SunriseForestScene = ({ children }) => {
  const containerRef = useRef(null);

  const baseCameraX = 1;
  const baseCameraY = -1;
  const baseCameraZ = 2;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // === Scene ===
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe6f2ff, 0.07);

    // === Camera ===
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(baseCameraX, baseCameraY, baseCameraZ);
    camera.lookAt(0, 0, 1);

    // === Renderer ===
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // === Gradient Sky ===
    const skyGeo = new THREE.SphereGeometry(40, 16, 16);
    const skyMat = new THREE.ShaderMaterial({
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
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // === Lighting ===
    scene.add(new THREE.AmbientLight(0xcfdff2, 0.8));
    const sunLight = new THREE.DirectionalLight(0xffc97b, 0.8);
    sunLight.position.set(-2, 1.2, 1.5);
    scene.add(sunLight);

    // === Ground ===
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({
        color: 0xfafafa,
        roughness: 0.9,
        metalness: 0,
        emissive: new THREE.Color(0xfff3cc).multiplyScalar(0.08),
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.9;
    scene.add(ground);

    // === Trees (Instanced) ===
    const treeColors = [0x3b6b3b, 0x4c8052, 0x557f4f];
    const treeGeo = new THREE.ConeGeometry(0.4, 1.5, 8);
    const forestGroup = new THREE.Group();
    const rows = 6;
    const treesPerRow = 25;

    for (let row = 0; row < rows; row++) {
      const depth = -2.5 - row * 1.5;
      const color = treeColors[row % treeColors.length];
      const mat = new THREE.MeshStandardMaterial({ color });
      const instanced = new THREE.InstancedMesh(treeGeo, mat, treesPerRow);

      const dummy = new THREE.Object3D();
      for (let i = 0; i < treesPerRow; i++) {
        dummy.position.set(
          (i - treesPerRow / 2) + Math.random() * 0.4,
          -1.25,
          depth + Math.random() * 0.4
        );
        const scale = 1 - row * 0.1 + Math.random() * 0.1;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      }
      forestGroup.add(instanced);
    }
    scene.add(forestGroup);

    // === Snow (GPU animation, improved fall depth) ===
    const snowCount = 1200;
    const snowGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 12; // start a bit higher
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    snowGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const snowMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      uniforms: {
        time: { value: 0.0 },
      },
      vertexShader: `
        uniform float time;
        void main() {
          vec3 pos = position;
          // Each flake falls at a unique speed
          float fallSpeed = 0.4 + fract(position.x * 0.3 + position.z * 0.2) * 0.8;
          // Increase total fall range to 14 units, loop lower (starts at y=12, resets at -2)
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
    const snow = new THREE.Points(snowGeo, snowMat);
    scene.add(snow);



    // === Cursor Light ===
    const cursorLight = new THREE.PointLight(0xffb96c, 1.4, 4, 1.1);
    cursorLight.position.set(0, 0.5, 2);
    scene.add(cursorLight);

    // === Mouse Tracking (throttled) ===
    const mouse = { x: 0, y: 0 };
    let lastMove = 0;
    container.addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - lastMove < 30) return; // throttle to 30ms
      lastMove = now;
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    // === Animation Loop ===
    let start = performance.now();
    renderer.setAnimationLoop(() => {
      const t = (performance.now() - start) / 1000;
      snowMat.uniforms.time.value = t;

      camera.position.x += (mouse.x * 0.5 + baseCameraX - camera.position.x) * 0.05;
      camera.position.y += (mouse.y * 0.2 + baseCameraY - camera.position.y) * 0.05;
      camera.position.z += (baseCameraZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0.5, -2);

      cursorLight.position.x += (mouse.x * 2 - cursorLight.position.x) * 0.1;
      cursorLight.position.y += (mouse.y * 1.5 - cursorLight.position.y) * 0.1;

      forestGroup.position.x = -camera.position.x * 0.3;

      renderer.render(scene, camera);
    });

    // === Resize Handling ===
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    // === Cleanup ===
    return () => {
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      treeGeo.dispose();
      snowGeo.dispose();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "70%",
          color: "#fff",
          marginLeft: "100px",
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto", width: "100%" }}>{children}</div>
      </div>
    </div>
  );
};

export default SunriseForestScene;

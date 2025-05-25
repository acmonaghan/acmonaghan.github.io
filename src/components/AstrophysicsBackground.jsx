import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const AstrophysicsBackground = ({ hasQuasar = false, planetCount = 3 }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);
  const pokemonSpritesRef = useRef([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    camera.position.z = 100;

    // ... (createStarfield, createOrbitalRing, createQuasar, createNebulaParticles, createCosmicDust, createOrbitingPlanet remain the same as previous correct version) ...
    const createStarfield = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const colors = [];
      for (let i = 0; i < 3000; i++) {
        vertices.push((Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500);
        const colorChoice = Math.random();
        if (colorChoice < 0.5) colors.push(1, 1, 1);
        else if (colorChoice < 0.75) colors.push(0.6, 0.8, 1);
        else colors.push(0.9, 0.7, 1);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({ size: 2, vertexColors: true, transparent: true, opacity: 0.9 });
      return new THREE.Points(geometry, material);
    };

    const createOrbitalRing = (radius, particleCount, ringColor, speed) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const colorsAttribute = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = (Math.random() - 0.5) * 15;
        vertices.push(x, y, z);
        colorsAttribute.push(ringColor.r, ringColor.g, ringColor.b);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsAttribute, 3));
      const material = new THREE.PointsMaterial({ size: 2.5, vertexColors: true, transparent: true, opacity: 0.7 });
      const ring = new THREE.Points(geometry, material);
      ring.userData = { speed, originalPositions: [...vertices] };
      return ring;
    };

    const createQuasar = () => {
      const quasarGroup = new THREE.Group();
      const coreGeometry = new THREE.SphereGeometry(3, 16, 16);
      const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1.0 });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      quasarGroup.add(core);
      const glowGeometry = new THREE.SphereGeometry(8, 16, 16);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, intensity: { value: 1.0 } },
        vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform float time; uniform float intensity; varying vec3 vNormal; void main() { float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0); float pulse = 0.8 + 0.4 * sin(time * 3.0); vec3 color = vec3(0.9, 0.95, 1.0) * fresnel * pulse * intensity; gl_FragColor = vec4(color, fresnel * 0.6); }`,
        transparent: true, blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      quasarGroup.add(glow);
      const diskGeometry = new THREE.RingGeometry(12, 35, 64);
      const diskMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `varying vec2 vUv; varying float vDistance; void main() { vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vDistance = length(position); gl_Position = projectionMatrix * mvPosition; }`,
        fragmentShader: `uniform float time; varying vec2 vUv; varying float vDistance; void main() { float angle = atan(vUv.y - 0.5, vUv.x - 0.5); float radius = length(vUv - 0.5) * 2.0; float spiral = sin(angle * 3.0 + radius * 8.0 - time * 2.0) * 0.5 + 0.5; vec3 hotColor = vec3(0.9, 0.95, 1.0); vec3 coolColor = vec3(1.0, 0.6, 0.3); vec3 localColor = mix(hotColor, coolColor, radius); float intensity = spiral * (1.0 - radius) * 0.8; gl_FragColor = vec4(localColor * intensity, intensity * 0.6); }`,
        transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
      });
      const disk = new THREE.Mesh(diskGeometry, diskMaterial);
      disk.rotation.x = Math.PI / 2;
      quasarGroup.add(disk);
      const torusGeometry = new THREE.TorusGeometry(25, 8, 16, 64);
      const torusMaterial = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `varying vec2 vUv; varying vec3 vPosition; void main() { vUv = uv; vPosition = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `uniform float time; varying vec2 vUv; varying vec3 vPosition; void main() { float noise = sin(vPosition.x * 3.0 + time) * cos(vPosition.y * 2.0 + time * 0.5) * 0.5 + 0.5; vec3 dustColor = mix(vec3(0.8, 0.4, 0.2), vec3(0.9, 0.6, 0.3), noise); float alpha = 0.4 * noise; gl_FragColor = vec4(dustColor, alpha); }`,
        transparent: true, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.rotation.x = Math.PI / 2;
      quasarGroup.add(torus);
      const createJet = (direction) => {
        const jetGeometry = new THREE.CylinderGeometry(1, 4, 100, 12);
        const jetMaterial = new THREE.ShaderMaterial({
          uniforms: { time: { value: 0 } },
          vertexShader: `varying vec2 vUv; varying float vY; void main() { vUv = uv; vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `uniform float time; varying vec2 vUv; varying float vY; void main() { float distanceFromCenter = length(vUv - vec2(0.5, 0.5)) * 2.0; float intensity = (1.0 - distanceFromCenter) * (1.0 - abs(vY) / 50.0); float flicker = 0.7 + 0.4 * sin(time * 3.0 + vY * 0.05); vec3 jetColor = vec3(0.6, 0.8, 1.0); gl_FragColor = vec4(jetColor * intensity * flicker, intensity * 0.8); }`,
          transparent: true, blending: THREE.AdditiveBlending
        });
        const jet = new THREE.Mesh(jetGeometry, jetMaterial);
        jet.position.y = direction * 50;
        return jet;
      };
      quasarGroup.add(createJet(1));
      quasarGroup.add(createJet(-1));
      quasarGroup.position.set(-100, 30, -50);
      quasarGroup.userData = { core, glow, disk, torus, jets: [quasarGroup.children[4], quasarGroup.children[5]] };
      return quasarGroup;
    };

    const createNebulaParticles = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const nebulaColors = [];
      const sizes = [];
      for (let i = 0; i < 150; i++) {
        vertices.push((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 200);
        const colorChoice = Math.random();
        if (colorChoice < 0.3) nebulaColors.push(0.9, 0.5, 1.0);
        else if (colorChoice < 0.6) nebulaColors.push(0.5, 0.8, 1.0);
        else nebulaColors.push(1.0, 0.7, 0.9);
        sizes.push(Math.random() * 15 + 10);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(nebulaColors, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
      const material = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          attribute float size; 
          varying vec3 vColor;
          uniform float time;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float pulseFactor = 0.5 + 0.8 * sin(time * 2.0 + position.x * 0.01 + position.y * 0.008);
            gl_PointSize = size * pulseFactor;
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float r = length(center);
            float alpha = 1.0 - smoothstep(0.0, 0.5, r);
            alpha = pow(alpha, 0.5);
            gl_FragColor = vec4(vColor * 1.5, alpha * 0.6);
          }
        `,
        transparent: true, blending: THREE.AdditiveBlending, vertexColors: true, depthWrite: false
      });
      return new THREE.Points(geometry, material);
    };

    const createCosmicDust = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const velocities = [];
      for (let i = 0; i < 800; i++) {
        vertices.push((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 300);
        velocities.push((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const material = new THREE.PointsMaterial({ size: 0.8, color: 0xaaaaaa, transparent: true, opacity: 0.3 });
      const dust = new THREE.Points(geometry, material);
      dust.userData = { velocities };
      return dust;
    };

    const createOrbitingPlanet = (orbitRadius, orbitSpeed, planetRadius, planetColor, offsetAngle = 0) => {
      const geometry = new THREE.SphereGeometry(planetRadius, 20, 20);
      const material = new THREE.MeshBasicMaterial({ color: planetColor, transparent: true, opacity: 0.6 });
      const planet = new THREE.Mesh(geometry, material);
      planet.userData = { orbitRadius, orbitSpeed, offsetAngle, rotationSpeed: Math.random() * 0.002 + 0.001 };
      return planet;
    };


    const createPokemonWebMSprite = (videoUrl, initialPosition, spriteScale, animParams) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.play().catch(error => {
        console.warn(`Autoplay prevented for ${videoUrl}: `, error);
      });

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;

      const material = new THREE.SpriteMaterial({
        map: videoTexture,
        transparent: true,      // <<< VERY IMPORTANT for WebM with Alpha
        alphaTest: 0.01,        // <<< Helps clean up edges if alpha isn't perfect
                                // Adjust this value (0.0 to 1.0). 0.01 or 0.1 is common.
        blending: THREE.NormalBlending,
        color: 0xffffff,
        depthTest: true,
        // depthWrite: false,   // Often set to false for transparent objects to prevent Z-fighting
                                // with other transparent objects. Test what looks best.
                                // If sprites are always in front of opaque objects, true might be fine.
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.copy(initialPosition);
      sprite.scale.set(spriteScale.x, spriteScale.y, spriteScale.z || 1);
      sprite.userData = {
        videoElement: video, videoTexture,
        initialY: initialPosition.y, floatAmplitude: animParams.floatAmplitude || 5, floatSpeed: animParams.floatSpeed || 0.4,
        driftParams: {
            initialX: initialPosition.x, initialZ: initialPosition.z,
            xAmplitude: animParams.xAmplitude || 10, zAmplitude: animParams.zAmplitude || 6,
            xSpeed: animParams.xSpeed || 0.07, zSpeed: animParams.zSpeed || 0.05,
        },
        angleOffset: Math.random() * Math.PI * 2
      };
      return sprite;
    };

    const starfield = createStarfield();
    scene.add(starfield);
    const nebulaParticles = createNebulaParticles();
    scene.add(nebulaParticles);
    const rings = [
      createOrbitalRing(70, 60, { r: 0.4, g: 0.6, b: 1 }, 0.002),
      createOrbitalRing(100, 50, { r: 0.8, g: 0.4, b: 1 }, -0.002),
      createOrbitalRing(140, 40, { r: 1, g: 0.6, b: 0.8 }, 0.002)
    ];
    rings.forEach(ring => scene.add(ring));
    const cosmicDust = createCosmicDust();
    scene.add(cosmicDust);
    const planets = [];
    const planetConfigs = [
      { orbitRadius: 200, orbitSpeed: 0.00001, planetRadius: 10, color: 0x7A85FF, offsetAngle: Math.PI / 4 },
      { orbitRadius: 120, orbitSpeed: -0.00015, planetRadius: 8, color: 0xC673FF, offsetAngle: Math.PI/8 },
      { orbitRadius: 160, orbitSpeed: 0.0001, planetRadius: 12, color: 0x73C6FF, offsetAngle: Math.PI / 2 },
      { orbitRadius: 200, orbitSpeed: -0.0008, planetRadius: 6, color: 0xFF73C6, offsetAngle: Math.PI * 1.5 },
      { orbitRadius: 200, orbitSpeed: 0.00025, planetRadius: 9, color: 0x85FF7A, offsetAngle: Math.PI / 3 }
    ];
    for (let i = 0; i < Math.min(planetCount, planetConfigs.length); i++) {
      const config = planetConfigs[i];
      const planet = createOrbitingPlanet(config.orbitRadius, config.orbitSpeed, config.planetRadius, config.color, config.offsetAngle);
      planets.push(planet);
      scene.add(planet);
    }

    let quasar = null;
    if (hasQuasar) {
      quasar = createQuasar();
      quasar.rotation.x = Math.PI / 4;
      scene.add(quasar);
    }

    pokemonSpritesRef.current = [];
    const pikachuPosition = new THREE.Vector3(120, 15, -25);
    const pikachuScale = { x: 15, y: 15 };
    const pikachu = createPokemonWebMSprite( // Changed function name
      '/assets/pikachu-f.webm', // USE WEBM PATH
      pikachuPosition, pikachuScale,
      { floatAmplitude: 4, floatSpeed: 0.35, xAmplitude: 8, xSpeed: 0.06, zAmplitude: 4, zSpeed: 0.04 }
    );
    pokemonSpritesRef.current.push(pikachu);
    scene.add(pikachu);

    const darkraiPosition = new THREE.Vector3(170, -10, -35);
    const darkraiScale = { x: 18, y: 18 };
    const darkrai = createPokemonWebMSprite( // Changed function name
      '/assets/darkrai.webm', // USE WEBM PATH
      darkraiPosition, darkraiScale,
      { floatAmplitude: 5, floatSpeed: 0.3, xAmplitude: 10, xSpeed: 0.04, zAmplitude: 6, zSpeed: 0.03 }
    );
    pokemonSpritesRef.current.push(darkrai);
    scene.add(darkrai);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      starfield.rotation.y += 0.0001;
      starfield.rotation.x += 0.00005;
      if (nebulaParticles.material.uniforms) nebulaParticles.material.uniforms.time.value = time;
      rings.forEach((ring) => {
        ring.rotation.z += ring.userData.speed;
        const positions = ring.geometry.attributes.position.array;
        const originalPositions = ring.userData.originalPositions;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 2] = originalPositions[i + 2] + Math.sin(time * 0.5 + i * 0.01) * 3;
        }
        ring.geometry.attributes.position.needsUpdate = true;
      });
      const dustPositions = cosmicDust.geometry.attributes.position.array;
      const velocities = cosmicDust.userData.velocities;
      for (let i = 0; i < dustPositions.length; i += 3) {
        dustPositions[i] += velocities[i]; dustPositions[i + 1] += velocities[i + 1]; dustPositions[i + 2] += velocities[i + 2];
        if (Math.abs(dustPositions[i]) > 200) velocities[i] *= -1;
        if (Math.abs(dustPositions[i + 1]) > 200) velocities[i + 1] *= -1;
        if (Math.abs(dustPositions[i + 2]) > 150) velocities[i + 2] *= -1;
      }
      cosmicDust.geometry.attributes.position.needsUpdate = true;
      planets.forEach((planet) => {
        const { orbitRadius, orbitSpeed, offsetAngle, rotationSpeed } = planet.userData;
        const currentAngle = time * orbitSpeed + offsetAngle;
        planet.position.x = Math.cos(currentAngle) * orbitRadius;
        planet.position.z = Math.sin(currentAngle) * orbitRadius - 100;
        planet.position.y = Math.sin(currentAngle * 0.5) * 20;
        planet.rotation.y += rotationSpeed;
      });
      if (quasar) {
        quasar.rotation.y += 0.005;
        if (quasar.userData.glow.material.uniforms) quasar.userData.glow.material.uniforms.time.value = time;
        if (quasar.userData.disk.material.uniforms) quasar.userData.disk.material.uniforms.time.value = time;
        if (quasar.userData.torus.material.uniforms) quasar.userData.torus.material.uniforms.time.value = time;
        quasar.userData.jets.forEach(jet => { if (jet.material.uniforms) jet.material.uniforms.time.value = time; });
        quasar.userData.disk.rotation.z += 0.005;
      }
      pokemonSpritesRef.current.forEach(p => {
        const { initialY, floatAmplitude, floatSpeed, driftParams, angleOffset } = p.userData;
        p.position.y = initialY + Math.sin(time * floatSpeed + angleOffset) * floatAmplitude;
        p.position.x = driftParams.initialX + Math.cos(time * driftParams.xSpeed + angleOffset) * driftParams.xAmplitude;
        p.position.z = driftParams.initialZ + Math.sin(time * driftParams.zSpeed + angleOffset * 0.7) * driftParams.zAmplitude;
      });
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
      pokemonSpritesRef.current.forEach(sprite => {
        if (sprite.userData.videoElement) {
          sprite.userData.videoElement.pause();
          sprite.userData.videoElement.removeAttribute('src');
          sprite.userData.videoElement.load();
        }
        if (sprite.userData.videoTexture) sprite.userData.videoTexture.dispose();
        if (sprite.material) sprite.material.dispose();
        if (sprite.parent) sprite.parent.remove(sprite);
      });
      pokemonSpritesRef.current = [];
      if (mountRef.current && rendererRef.current && rendererRef.current.domElement) {
        if (mountRef.current.contains(rendererRef.current.domElement)) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      if (rendererRef.current) rendererRef.current.dispose();
      sceneRef.current?.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => { if (material.map) material.map.dispose(); material.dispose(); });
          } else {
            if (object.material.map) material.map.dispose();
            object.material.dispose();
          }
        }
      });
      sceneRef.current = null;
    };
  }, [hasQuasar, planetCount]);

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  );
};

export default AstrophysicsBackground;

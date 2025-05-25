import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

const AstrophysicsBackground = ({ hasQuasar = false, planetCount = 3 }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Camera position
    camera.position.z = 100;

    // Create starfield
    const createStarfield = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const colors = [];

      for (let i = 0; i < 3000; i++) {
        vertices.push(
          (Math.random() - 0.5) * 500,
          (Math.random() - 0.5) * 500,
          (Math.random() - 0.5) * 500
        );

        // Star colors - mix of white, blue, and purple
        const colorChoice = Math.random();
        if (colorChoice < 0.5) {
          colors.push(1, 1, 1); // White
        } else if (colorChoice < 0.75) {
          colors.push(0.6, 0.8, 1); // Blue
        } else {
          colors.push(0.9, 0.7, 1); // Purple
        }
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true,
        opacity: 0.9
      });

      return new THREE.Points(geometry, material);
    };

    // Create orbital rings
    const createOrbitalRing = (radius, particleCount, color, speed) => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const colors = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const z = (Math.random() - 0.5) * 15;

        vertices.push(x, y, z);
        colors.push(color.r, color.g, color.b);
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 2.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
      });

      const ring = new THREE.Points(geometry, material);
      ring.userData = { speed, originalPositions: [...vertices] };
      return ring;
    };

    // Create quasar with accretion disk and jets
    const createQuasar = () => {
      const quasarGroup = new THREE.Group();

      // Central bright core
      const coreGeometry = new THREE.SphereGeometry(3, 16, 16);
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      quasarGroup.add(core);

      // Bright glow around core
      const glowGeometry = new THREE.SphereGeometry(8, 16, 16);
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          intensity: { value: 1.0 }
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform float intensity;
          varying vec3 vNormal;
          
          void main() {
            float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            float pulse = 0.8 + 0.4 * sin(time * 3.0);
            vec3 color = vec3(0.9, 0.95, 1.0) * fresnel * pulse * intensity;
            gl_FragColor = vec4(color, fresnel * 0.6);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      quasarGroup.add(glow);

      // Accretion disk
      const diskGeometry = new THREE.RingGeometry(12, 35, 64);
      const diskMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vDistance;
          void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vDistance = length(position);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          varying float vDistance;
          
          void main() {
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            float radius = length(vUv - 0.5) * 2.0;
            
            // Spiral pattern
            float spiral = sin(angle * 3.0 + radius * 8.0 - time * 2.0) * 0.5 + 0.5;
            
            // Temperature gradient (hotter = bluer toward center)
            vec3 hotColor = vec3(0.9, 0.95, 1.0);  // Blue-white (hot)
            vec3 coolColor = vec3(1.0, 0.6, 0.3);  // Orange-red (cool)
            vec3 color = mix(hotColor, coolColor, radius);
            
            float intensity = spiral * (1.0 - radius) * 0.8;
            gl_FragColor = vec4(color * intensity, intensity * 0.6);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const disk = new THREE.Mesh(diskGeometry, diskMaterial);
      disk.rotation.x = Math.PI / 2;
      quasarGroup.add(disk);

      // Dusty torus around black hole
      const torusGeometry = new THREE.TorusGeometry(25, 8, 16, 64);
      const torusMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          void main() {
            vUv = uv;
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            float noise = sin(vPosition.x * 3.0 + time) * cos(vPosition.y * 2.0 + time * 0.5) * 0.5 + 0.5;
            vec3 dustColor = mix(vec3(0.8, 0.4, 0.2), vec3(0.9, 0.6, 0.3), noise);
            float alpha = 0.4 * noise;
            gl_FragColor = vec4(dustColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const torus = new THREE.Mesh(torusGeometry, torusMaterial);
      torus.rotation.x = Math.PI / 2;
      quasarGroup.add(torus);

      // Polar jets (fixed and symmetric)
      const createJet = (direction) => {
        const jetGeometry = new THREE.CylinderGeometry(1, 4, 100, 12);
        const jetMaterial = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 }
          },
          vertexShader: `
            varying vec2 vUv;
            varying float vY;
            void main() {
              vUv = uv;
              vY = position.y;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float time;
            varying vec2 vUv;
            varying float vY;
            
            void main() {
              float distanceFromCenter = length(vUv - vec2(0.5, 0.5)) * 2.0;
              float intensity = (1.0 - distanceFromCenter) * (1.0 - abs(vY) / 50.0);
              float flicker = 0.7 + 0.4 * sin(time * 3.0 + vY * 0.05);
              vec3 jetColor = vec3(0.6, 0.8, 1.0);
              
              gl_FragColor = vec4(jetColor * intensity * flicker, intensity * 0.8);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending
        });

        const jet = new THREE.Mesh(jetGeometry, jetMaterial);
        jet.position.y = direction * 50;
        return jet;
      };

      quasarGroup.add(createJet(1));
      quasarGroup.add(createJet(-1));

      // Position quasar off to one side
      quasarGroup.position.set(-100, 30, -50);
      quasarGroup.userData = {
        core,
        glow,
        disk,
        torus,
        jets: [quasarGroup.children[4], quasarGroup.children[5]]
      };

      return quasarGroup;
    };

    // Create visible nebula clouds
    const createNebulaParticles = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const colors = [];
      const sizes = [];

      for (let i = 0; i < 150; i++) {
        vertices.push(
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 200
        );

        // Bright nebula colors
        const colorChoice = Math.random();
        if (colorChoice < 0.3) {
          colors.push(0.9, 0.5, 1.0); // Bright Purple
        } else if (colorChoice < 0.6) {
          colors.push(0.5, 0.8, 1.0); // Bright Blue
        } else {
          colors.push(1.0, 0.7, 0.9); // Bright Pink
        }

        sizes.push(Math.random() * 15 + 10); // Much larger sizes
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 }
        },
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
            
            // Create soft, cloud-like appearance
            float alpha = 1.0 - smoothstep(0.0, 0.5, r);
            alpha = pow(alpha, 0.5); // Softer falloff
            
            gl_FragColor = vec4(vColor * 1.5, alpha * 0.6);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        depthWrite: false
      });

      return new THREE.Points(geometry, material);
    };

    // Create floating cosmic dust
    const createCosmicDust = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const velocities = [];

      for (let i = 0; i < 800; i++) {
        vertices.push(
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 300
        );

        velocities.push(
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05,
          (Math.random() - 0.5) * 0.05
        );
      }

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

      const material = new THREE.PointsMaterial({
        size: 0.8,
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.3
      });

      const dust = new THREE.Points(geometry, material);
      dust.userData = { velocities };
      return dust;
    };

    // Create distant planets with orbital parameters
    const createOrbitingPlanet = (orbitRadius, orbitSpeed, planetRadius, color, offsetAngle = 0) => {
      const geometry = new THREE.SphereGeometry(planetRadius, 20, 20);
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6
      });

      const planet = new THREE.Mesh(geometry, material);
      planet.userData = {
        orbitRadius,
        orbitSpeed,
        offsetAngle,
        rotationSpeed: Math.random() * 0.002 + 0.001
      };
      return planet;
    };

    // Add all elements to scene
    const starfield = createStarfield();
    scene.add(starfield);

    const nebulaParticles = createNebulaParticles();
    scene.add(nebulaParticles);

    // Create multiple orbital rings
    const rings = [
      createOrbitalRing(70, 60, { r: 0.4, g: 0.6, b: 1 }, 0.002),
      createOrbitalRing(100, 50, { r: 0.8, g: 0.4, b: 1 }, -0.002),
      createOrbitalRing(140, 40, { r: 1, g: 0.6, b: 0.8 }, 0.002)
    ];

    rings.forEach(ring => scene.add(ring));

    const cosmicDust = createCosmicDust();
    scene.add(cosmicDust);

    // Add orbiting planets
    const planets = [];
    const planetConfigs = [
      { orbitRadius: 200, orbitSpeed: 0.00001, planetRadius: 10, color: 0x7A85FF, offsetAngle: Math.PI / 4 },
      { orbitRadius: 120, orbitSpeed: -0.00015, planetRadius: 8, color: 0xC673FF, offsetAngle: Math.PI },
      { orbitRadius: 160, orbitSpeed: 0.0001, planetRadius: 12, color: 0x73C6FF, offsetAngle: Math.PI / 2 },
      { orbitRadius: 200, orbitSpeed: -0.0008, planetRadius: 6, color: 0xFF73C6, offsetAngle: Math.PI * 1.5 },
      { orbitRadius: 200, orbitSpeed: 0.00025, planetRadius: 9, color: 0x85FF7A, offsetAngle: Math.PI / 3 }
    ];

    for (let i = 0; i < Math.min(planetCount, planetConfigs.length); i++) {
      const config = planetConfigs[i];
      const planet = createOrbitingPlanet(
        config.orbitRadius,
        config.orbitSpeed,
        config.planetRadius,
        config.color,
        config.offsetAngle
      );
      planets.push(planet);
      scene.add(planet);
    }

    // Add quasar if enabled
    let quasar = null;
    if (hasQuasar) {
      quasar = createQuasar();
      quasar.rotation.x = Math.PI / 4;
      scene.add(quasar);
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;

      // Rotate starfield slowly
      starfield.rotation.y += 0.0001;
      starfield.rotation.x += 0.00005;

      // Update nebula particles
      if (nebulaParticles.material.uniforms) {
        nebulaParticles.material.uniforms.time.value = time;
      }

      // Animate orbital rings
      rings.forEach((ring, index) => {
        ring.rotation.z += ring.userData.speed;

        // Add slight vertical oscillation
        const positions = ring.geometry.attributes.position.array;
        const originalPositions = ring.userData.originalPositions;

        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 2] = originalPositions[i + 2] + Math.sin(time * 0.5 + i * 0.01) * 3;
        }

        ring.geometry.attributes.position.needsUpdate = true;
      });

      // Animate cosmic dust
      const dustPositions = cosmicDust.geometry.attributes.position.array;
      const velocities = cosmicDust.userData.velocities;

      for (let i = 0; i < dustPositions.length; i += 3) {
        dustPositions[i] += velocities[i];
        dustPositions[i + 1] += velocities[i + 1];
        dustPositions[i + 2] += velocities[i + 2];

        // Wrap around boundaries
        if (Math.abs(dustPositions[i]) > 200) velocities[i] *= -1;
        if (Math.abs(dustPositions[i + 1]) > 200) velocities[i + 1] *= -1;
        if (Math.abs(dustPositions[i + 2]) > 150) velocities[i + 2] *= -1;
      }

      cosmicDust.geometry.attributes.position.needsUpdate = true;

      // Animate orbiting planets
      planets.forEach((planet) => {
        const { orbitRadius, orbitSpeed, offsetAngle, rotationSpeed } = planet.userData;
        const angle = time * orbitSpeed + offsetAngle;

        // Orbital position
        planet.position.x = Math.cos(angle) * orbitRadius;
        planet.position.z = Math.sin(angle) * orbitRadius - 100; // Offset behind camera
        planet.position.y = Math.sin(angle * 0.5) * 20; // Slight vertical oscillation

        // Planet rotation
        planet.rotation.y += rotationSpeed;
      });

      // Animate quasar if present
      if (quasar) {
        // Rotate the entire quasar slowly
        quasar.rotation.y += 0.01;

        // Update shader uniforms
        if (quasar.userData.glow.material.uniforms) {
          quasar.userData.glow.material.uniforms.time.value = time;
        }
        if (quasar.userData.disk.material.uniforms) {
          quasar.userData.disk.material.uniforms.time.value = time;
        }
        if (quasar.userData.torus.material.uniforms) {
          quasar.userData.torus.material.uniforms.time.value = time;
        }

        // Animate jets
        quasar.userData.jets.forEach(jet => {
          if (jet.material.uniforms) {
            jet.material.uniforms.time.value = time;
          }
        });

        // Rotate accretion disk
        quasar.userData.disk.rotation.z += 0.005;
      }

      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [hasQuasar, planetCount]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default AstrophysicsBackground;
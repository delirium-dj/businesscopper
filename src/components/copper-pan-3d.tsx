/**
 * File: src/components/copper-pan-3d.tsx
 * Purpose: Hero showpiece — a real-time PBR frying pan (lathe-turned copper
 * bowl, tinned interior, iron handle, rivets) lit by a studio HDRI-style
 * environment. Slow quasi-random tumble on all three axes, mouse parallax,
 * scroll-driven spin + sink + fade. Desktop-only, client-side, DPR-aware,
 * single static frame when reduced motion is requested.
 *
 * NOTE: if a downloaded Sketchfab FBX/GLB becomes available, only the geometry
 * section needs swapping — loader: `new FBXLoader().load("/models/pan.fbx")`.
 */

import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
import type * as THREE from "three";

const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export const CopperPan3D = component$(() => {
  const canvasRef = useSignal<HTMLCanvasElement>();

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async ({ cleanup }) => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    let raf = 0;
    let cancelled = false;
    const disposables: Array<{ dispose: () => void }> = [];
    const track = <T extends { dispose: () => void }>(d: T): T => {
      disposables.push(d);
      return d;
    };

    try {
      const THREE = await import("three");
      const { RoomEnvironment } = await import(
        "three/examples/jsm/environments/RoomEnvironment.js"
      );
      if (cancelled) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const renderer = track(
        new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        }),
      );
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = track(pmrem.fromScene(new RoomEnvironment(), 0.04));
      scene.environment = envTex.texture;
      if ("environmentIntensity" in scene) {
        (scene as unknown as { environmentIntensity: number })
          .environmentIntensity = 0.55;
      }
      track(pmrem);

      const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
      camera.position.set(0.5, 1.5, 5.6);
      camera.lookAt(0.5, 0.02, 0);

      // -- Studio lights -----------------------------------------------------
      const key = new THREE.DirectionalLight(0xfff1dd, 2.2);
      key.position.set(3, 5, 4);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -4;
      key.shadow.camera.right = 4;
      key.shadow.camera.top = 4;
      key.shadow.camera.bottom = -4;
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xd97757, 1.1);
      rim.position.set(-4, 2, -3);
      scene.add(rim);

      // -- Materials ----------------------------------------------------------
      const copperMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xa0622d,
          metalness: 1.0,
          roughness: 0.3,
          side: THREE.DoubleSide,
        }),
      );
      const tinMat = track(
        new THREE.MeshStandardMaterial({
          color: 0xc9bda9,
          metalness: 1.0,
          roughness: 0.38,
          side: THREE.BackSide,
        }),
      );
      const ironMat = track(
        new THREE.MeshStandardMaterial({
          color: 0x35302b,
          metalness: 0.9,
          roughness: 0.5,
        }),
      );

      const pan = new THREE.Group();

      // -- Bowl: lathe-turned profile, flared walls, rolled rim --------------
      const profile: THREE.Vector2[] = [
        new THREE.Vector2(0.0, 0.02),
        new THREE.Vector2(0.55, 0.02),
        new THREE.Vector2(0.72, 0.03),
        new THREE.Vector2(0.85, 0.07),
        new THREE.Vector2(0.94, 0.14),
        new THREE.Vector2(0.99, 0.24),
        new THREE.Vector2(1.0, 0.3),
        new THREE.Vector2(0.995, 0.325),
      ];
      const outerGeo = track(
        new THREE.LatheGeometry(profile, 96),
      );
      const outer = new THREE.Mesh(outerGeo, copperMat);
      outer.castShadow = true;
      outer.receiveShadow = true;
      pan.add(outer);

      // Tinned interior shell nested just inside the copper.
      const innerGeo = track(
        new THREE.LatheGeometry(
          profile.map((p) => new THREE.Vector2(p.x * 0.955, 0.035 + p.y * 0.9)),
          96,
        ),
      );
      const inner = new THREE.Mesh(innerGeo, tinMat);
      inner.receiveShadow = true;
      pan.add(inner);

      // -- Handle: tapered iron strap with a hanging hole --------------------
      const handleShape = new THREE.Shape();
      handleShape.moveTo(0, -0.085);
      handleShape.lineTo(1.68, -0.06);
      handleShape.absarc(1.68, 0, 0.06, -Math.PI / 2, Math.PI / 2, false);
      handleShape.lineTo(0, 0.085);
      handleShape.quadraticCurveTo(-0.06, 0, 0, -0.085);
      const hole = new THREE.Path();
      hole.absarc(1.6, 0, 0.028, 0, Math.PI * 2, true);
      handleShape.holes.push(hole);
      const handleGeo = track(
        new THREE.ExtrudeGeometry(handleShape, {
          depth: 0.07,
          bevelEnabled: true,
          bevelThickness: 0.015,
          bevelSize: 0.015,
          bevelSegments: 2,
          curveSegments: 24,
        }),
      );
      handleGeo.translate(0, 0, -0.035);
      const handleMesh = new THREE.Mesh(handleGeo, ironMat);
      handleMesh.rotation.x = -Math.PI / 2;
      handleMesh.castShadow = true;
      const handleGroup = new THREE.Group();
      handleGroup.add(handleMesh);
      handleGroup.position.set(0.9, 0.3, 0);
      handleGroup.rotation.z = 0.1;
      pan.add(handleGroup);

      // -- Rivets where the handle meets the wall -----------------------------
      const rivetGeo = track(new THREE.SphereGeometry(0.032, 24, 16));
      for (const z of [-0.06, 0.06]) {
        const rivet = new THREE.Mesh(rivetGeo, tinMat.clone());
        track(rivet.material as THREE.Material);
        rivet.scale.set(0.55, 1, 1);
        rivet.position.set(0.955, 0.215, z);
        pan.add(rivet);
      }

      pan.position.set(1.45, -0.5, 0);
      pan.scale.setScalar(0.85);
      scene.add(pan);

      // -- Soft studio shadow catcher -----------------------------------------
      const shadowPlane = new THREE.Mesh(
        track(new THREE.PlaneGeometry(10, 10)),
        track(new THREE.ShadowMaterial({ opacity: 0.32 })),
      );
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -1.0;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // -- Interaction state ----------------------------------------------------
      let scrollProgress = 0;
      const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

      const resize = (): void => {
        const rect = canvas.getBoundingClientRect();
        const wpx = Math.max(1, rect.width);
        const hpx = Math.max(1, rect.height);
        renderer.setSize(wpx, hpx, false);
        camera.aspect = wpx / hpx;
        camera.updateProjectionMatrix();
        // Anchor the pan toward the right but pulled left on big screens:
        // near-zero margin around 1024px widths, growing with the viewport,
        // so the bowl hugs the right edge on small desktop and sits further
        // into the composition on large monitors. The rim never clips.
        const dist = camera.position.distanceTo(
          new THREE.Vector3(0.5, 0.02, 0),
        );
        const halfW =
          Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
          dist *
          camera.aspect;
        const margin = clamp((halfW - 2.2) * 0.8, 0.15, 2.0);
        pan.position.x = 0.5 + halfW - 0.9 - margin;
      };

      const pose = (t: number): void => {
        tilt.x += (tilt.tx - tilt.x) * 0.06;
        tilt.y += (tilt.ty - tilt.y) * 0.06;
        const sway = 1 - scrollProgress;
        pan.rotation.y =
          2.6 +
          tilt.x * 0.45 +
          (0.35 * Math.sin(t * 0.000105) +
            0.15 * Math.sin(t * 0.000285 + 1.3)) *
            sway +
          scrollProgress * 2.4;
        pan.rotation.x =
          0.12 +
          tilt.y * 0.28 +
          (0.25 * Math.sin(t * 0.000165 + 0.7) +
            0.1 * Math.sin(t * 0.000345 + 2.1)) *
            sway;
        pan.rotation.z =
          0.3 +
          (0.12 * Math.sin(t * 0.000135 + 2.0) +
            0.06 * Math.sin(t * 0.000405 + 0.5)) *
            sway;
        pan.position.y = -0.5 - scrollProgress * 1.4;
        canvas.style.opacity = String(1 - scrollProgress * 0.85);
      };

      const frame = (t: number): void => {
        if (cancelled) return;
        pose(t);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };

      const onScroll = (): void => {
        const max = Math.max(1, window.innerHeight * 0.9);
        scrollProgress = Math.max(0, Math.min(1, window.scrollY / max));
      };
      const onMouse = (e: MouseEvent): void => {
        const rect = canvas.getBoundingClientRect();
        tilt.tx = clamp(
          ((e.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1,
          -1,
          1,
        );
        tilt.ty = clamp(
          ((e.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1,
          -1,
          1,
        );
      };
      const onLeave = (): void => {
        tilt.tx = 0;
        tilt.ty = 0;
      };

      resize();
      onScroll();
      if (reduced) {
        pose(1200);
        renderer.render(scene, camera);
      } else {
        raf = requestAnimationFrame(frame);
      }
      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("mousemove", onMouse, { passive: true });
      document.documentElement.addEventListener("mouseleave", onLeave);
      cleanup(() => {
        cancelled = true;
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("mousemove", onMouse);
        document.documentElement.removeEventListener("mouseleave", onLeave);
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry?.dispose?.();
          }
        });
        for (const d of disposables) {
          try {
            d.dispose();
          } catch {
            /* already disposed */
          }
        }
        renderer.dispose();
      });
    } catch {
      // WebGL unavailable — leave the hero as clean text.
      canvas.style.display = "none";
    }
  });

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      class="absolute inset-0 h-full w-full"
    />
  );
});

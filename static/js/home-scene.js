import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js';

function initSystemsScene() {
    var canvas = document.querySelector('[data-systems-scene]');
    var home = document.querySelector('.portfolio-home');

    if (!canvas || !home) {
        return;
    }

    var renderer;

    try {
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: window.innerWidth > 768,
            powerPreference: 'low-power'
        });
    } catch (error) {
        canvas.remove();
        return;
    }

    var root = document.documentElement;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(48, 1, 0.1, 90);
    var topology = new THREE.Group();
    var nodeGeometry = new THREE.BoxGeometry(0.62, 0.62, 0.62);
    var nodeMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.72
    });
    var lineGeometry = new THREE.BufferGeometry();
    var lineMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.3
    });
    var hubGeometry = new THREE.OctahedronGeometry(1.25, 0);
    var hubMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        transparent: true,
        opacity: 0.82
    });
    var layers = [
        {
            z: -5,
            x: -1.2,
            y: 1.1,
            points: [[0, 0], [-4.4, 2.5], [-3.8, -2.7], [3.8, 2.4], [4.6, -2.5], [0.4, 4.1], [0.2, -4.2]]
        },
        {
            z: -14,
            x: 1.8,
            y: -0.7,
            points: [[0, 0], [-4.1, 2.9], [-4.8, -1.8], [3.4, 3.3], [4.5, -2.2], [0.1, 4.6], [-0.4, -4.1]]
        },
        {
            z: -23,
            x: -1.7,
            y: 0.5,
            points: [[0, 0], [-4.7, 2.1], [-3.4, -3.2], [4.5, 2.5], [4.1, -3.2], [-0.3, 4.2], [0.7, -4.5]]
        },
        {
            z: -32,
            x: 1.2,
            y: -0.9,
            points: [[0, 0], [-4.2, 3], [-4.5, -2.4], [3.8, 3.1], [4.7, -2.1], [0.5, 4.4], [-0.2, -4.3]]
        }
    ];
    var positions = [];
    var layerIndexes = [];
    var edgePairs = [];
    var localEdges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [1, 2], [3, 5], [3, 4], [2, 6], [4, 6]];

    layers.forEach(function (layer, layerIndex) {
        var indexes = [];

        layer.points.forEach(function (point) {
            indexes.push(positions.length);
            positions.push(new THREE.Vector3(
                point[0] + layer.x,
                point[1] + layer.y,
                layer.z
            ));
        });

        localEdges.forEach(function (edge) {
            edgePairs.push([indexes[edge[0]], indexes[edge[1]]]);
        });

        if (layerIndex > 0) {
            var previous = layerIndexes[layerIndex - 1];
            edgePairs.push([previous[0], indexes[0]]);
            edgePairs.push([previous[3], indexes[1]]);
            edgePairs.push([previous[4], indexes[2]]);
            edgePairs.push([previous[1], indexes[3]]);
            edgePairs.push([previous[2], indexes[4]]);
        }

        layerIndexes.push(indexes);
    });

    var nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, positions.length);
    var matrix = new THREE.Matrix4();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();

    positions.forEach(function (position, index) {
        var isHub = index % layers[0].points.length === 0;
        var nodeScale = isHub ? 1.35 : 0.72 + (index % 4) * 0.09;

        quaternion.setFromEuler(new THREE.Euler(index * 0.21, index * 0.13, index * 0.08));
        scale.setScalar(nodeScale);
        matrix.compose(position, quaternion, scale);
        nodes.setMatrixAt(index, matrix);
    });

    nodes.instanceMatrix.needsUpdate = true;
    nodes.frustumCulled = false;

    var linePositions = [];

    edgePairs.forEach(function (edge) {
        var start = positions[edge[0]];
        var end = positions[edge[1]];

        linePositions.push(start.x, start.y, start.z, end.x, end.y, end.z);
    });

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    var routes = new THREE.LineSegments(lineGeometry, lineMaterial);
    var hubs = layers.map(function (layer, index) {
        var hub = new THREE.Mesh(hubGeometry, hubMaterial);

        hub.position.copy(positions[layerIndexes[index][0]]);
        hub.userData.phase = index * 0.9;
        return hub;
    });

    topology.add(routes, nodes);
    hubs.forEach(function (hub) {
        topology.add(hub);
    });
    scene.add(topology);

    function readThemeColor(name, fallback) {
        var value = window.getComputedStyle(root).getPropertyValue(name).trim();
        return value || fallback;
    }

    function syncThemeColors() {
        nodeMaterial.color.set(readThemeColor('--portfolio-teal', '#7dcfff'));
        lineMaterial.color.set(readThemeColor('--portfolio-blue', '#7aa2f7'));
        hubMaterial.color.set(readThemeColor('--portfolio-amber', '#e0af68'));
    }

    var targetProgress = 0;
    var currentProgress = 0;
    var elapsed = 0;
    var frameId = 0;
    var lastFrameTime = performance.now();
    var isDisposed = false;
    var isMobile = false;
    var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    var scrollTrigger = null;
    var usesNativeScroll = false;

    function nativeScrollProgress() {
        var scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        return THREE.MathUtils.clamp(window.scrollY / scrollRange, 0, 1);
    }

    function updateScene(progress, time) {
        var smoothProgress = progress * progress * (3 - 2 * progress);
        var focusZ = THREE.MathUtils.lerp(-7, -30, smoothProgress);
        var cameraDistance = isMobile ? 24 : 18;

        camera.position.set(
            THREE.MathUtils.lerp(-3.8, 3.4, smoothProgress),
            THREE.MathUtils.lerp(2.8, -2.2, smoothProgress),
            focusZ + cameraDistance
        );
        camera.lookAt(
            THREE.MathUtils.lerp(-0.9, 0.8, smoothProgress),
            THREE.MathUtils.lerp(0.8, -0.7, smoothProgress),
            focusZ
        );
        camera.rotateZ(THREE.MathUtils.lerp(-0.015, 0.018, smoothProgress));

        topology.rotation.y = smoothProgress * 0.34 + Math.sin(time * 0.16) * 0.018;
        topology.rotation.x = -0.08 + smoothProgress * 0.15;
        topology.position.x = Math.sin(smoothProgress * Math.PI * 2) * 0.65;

        hubs.forEach(function (hub, index) {
            var direction = index % 2 === 0 ? 1 : -1;
            var pulse = 1 + Math.sin(time * 0.7 + hub.userData.phase) * 0.035;

            hub.rotation.x = time * 0.12 * direction + smoothProgress * 0.9;
            hub.rotation.y = time * 0.16 + smoothProgress * 1.2 * direction;
            hub.scale.setScalar(pulse);
        });
    }

    function renderStaticFrame() {
        currentProgress = motionQuery.matches ? 0.22 : targetProgress;
        updateScene(currentProgress, 0);
        renderer.render(scene, camera);
    }

    function stopAnimation() {
        if (frameId) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
        }
    }

    function animate(now) {
        frameId = 0;

        if (isDisposed || document.hidden || motionQuery.matches) {
            return;
        }

        var delta = Math.min((now - lastFrameTime) / 1000, 0.05);
        var blend = 1 - Math.exp(-delta * 5.5);

        lastFrameTime = now;
        elapsed += delta;
        currentProgress = THREE.MathUtils.lerp(currentProgress, targetProgress, blend);
        updateScene(currentProgress, elapsed);
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (frameId || isDisposed || document.hidden || motionQuery.matches) {
            return;
        }

        lastFrameTime = performance.now();
        frameId = window.requestAnimationFrame(animate);
    }

    function resizeScene() {
        var width = window.innerWidth;
        var height = window.innerHeight;

        isMobile = width <= 768;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        camera.fov = isMobile ? 58 : 48;
        camera.updateProjectionMatrix();
        renderStaticFrame();
    }

    function handleNativeScroll() {
        targetProgress = nativeScrollProgress();

        if (motionQuery.matches) {
            renderStaticFrame();
        }
    }

    function syncMotionPreference() {
        stopAnimation();

        if (motionQuery.matches) {
            renderStaticFrame();
        } else {
            targetProgress = scrollTrigger ? scrollTrigger.progress : nativeScrollProgress();
            currentProgress = targetProgress;
            startAnimation();
        }
    }

    function handleVisibilityChange() {
        if (document.hidden) {
            stopAnimation();
        } else {
            syncMotionPreference();
        }
    }

    function handleContextLost(event) {
        event.preventDefault();
        stopAnimation();
        canvas.classList.remove('is-ready');
    }

    function handleContextRestored() {
        resizeScene();
        canvas.classList.add('is-ready');
        syncMotionPreference();
    }

    syncThemeColors();
    resizeScene();

    if (window.ScrollTrigger) {
        scrollTrigger = window.ScrollTrigger.create({
            trigger: home,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: function (self) {
                targetProgress = self.progress;

                if (motionQuery.matches) {
                    renderStaticFrame();
                }
            }
        });
        targetProgress = scrollTrigger.progress;
    } else {
        usesNativeScroll = true;
        targetProgress = nativeScrollProgress();
        window.addEventListener('scroll', handleNativeScroll, { passive: true });
    }

    var themeObserver = new MutationObserver(function () {
        syncThemeColors();

        if (motionQuery.matches) {
            renderStaticFrame();
        }
    });

    themeObserver.observe(root, {
        attributes: true,
        attributeFilter: ['data-portfolio-theme']
    });

    window.addEventListener('resize', resizeScene, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    motionQuery.addEventListener('change', syncMotionPreference);

    canvas.classList.add('is-ready');
    syncMotionPreference();

    window.addEventListener('pagehide', function (event) {
        if (event.persisted) {
            return;
        }

        isDisposed = true;
        stopAnimation();
        themeObserver.disconnect();

        if (scrollTrigger) {
            scrollTrigger.kill();
        }
        if (usesNativeScroll) {
            window.removeEventListener('scroll', handleNativeScroll);
        }

        window.removeEventListener('resize', resizeScene);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        canvas.removeEventListener('webglcontextlost', handleContextLost);
        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
        motionQuery.removeEventListener('change', syncMotionPreference);

        nodeGeometry.dispose();
        nodeMaterial.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        hubGeometry.dispose();
        hubMaterial.dispose();
        renderer.dispose();
    }, { once: true });
}

initSystemsScene();

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
        opacity: 0.1,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1
    });
    var nodeEdgeTemplate = new THREE.EdgesGeometry(nodeGeometry);
    var nodeOutlineGeometry = new THREE.BufferGeometry();
    var nodeOutlineMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.82,
        depthWrite: false
    });
    var lineGeometry = new THREE.BufferGeometry();
    var lineMaterial = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.3,
        depthWrite: false
    });
    var hubSourceGeometry = new THREE.BoxGeometry(1.12, 1.12, 1.12);
    var hubGeometry = new THREE.EdgesGeometry(hubSourceGeometry);
    var nodeThemeColor = new THREE.Color();
    var hubThemeColor = new THREE.Color();

    hubSourceGeometry.dispose();

    var layers = [
        {
            z: -6,
            x: -0.8,
            y: 0.8,
            points: [[0, 0], [-3.8, 2.4], [-3.2, -2.5], [3.4, 2.2], [3.8, -2.3]]
        },
        {
            z: -18,
            x: 1.4,
            y: -0.5,
            points: [[0, 0], [-3.4, 2.6], [-3.8, -2.1], [3.3, 2.5], [3.7, -2.4]]
        },
        {
            z: -30,
            x: -1.2,
            y: 0.3,
            points: [[0, 0], [-3.7, 2.2], [-3.1, -2.7], [3.6, 2.3], [3.5, -2.5]]
        }
    ];
    var positions = [];
    var layerIndexes = [];
    var edgePairs = [];
    var localEdges = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3], [3, 4], [4, 2], [2, 1]];

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
        }

        layerIndexes.push(indexes);
    });

    var satellites = [];

    layerIndexes.forEach(function (indexes) {
        indexes.slice(1).forEach(function (positionIndex) {
            satellites.push(positions[positionIndex]);
        });
    });

    var nodes = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, satellites.length);
    var matrix = new THREE.Matrix4();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    var edgeVertex = new THREE.Vector3();
    var nodeEdgePositions = [];
    var nodeEdgeAttribute = nodeEdgeTemplate.getAttribute('position');

    satellites.forEach(function (satellite, index) {
        var nodeScale = 0.78 + (index % 3) * 0.08;

        quaternion.setFromEuler(new THREE.Euler(index * 0.17, index * 0.11, index * 0.07));
        scale.setScalar(nodeScale);
        matrix.compose(satellite, quaternion, scale);
        nodes.setMatrixAt(index, matrix);

        for (var edgeIndex = 0; edgeIndex < nodeEdgeAttribute.count; edgeIndex += 1) {
            edgeVertex.fromBufferAttribute(nodeEdgeAttribute, edgeIndex).applyMatrix4(matrix);
            nodeEdgePositions.push(edgeVertex.x, edgeVertex.y, edgeVertex.z);
        }
    });

    nodes.instanceMatrix.needsUpdate = true;
    nodes.frustumCulled = false;
    nodes.renderOrder = 1;
    nodeEdgeTemplate.dispose();
    nodeOutlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nodeEdgePositions, 3));

    var nodeOutlines = new THREE.LineSegments(nodeOutlineGeometry, nodeOutlineMaterial);

    nodeOutlines.frustumCulled = false;
    nodeOutlines.renderOrder = 2;

    var linePositions = [];

    edgePairs.forEach(function (edge) {
        var start = positions[edge[0]];
        var end = positions[edge[1]];

        linePositions.push(start.x, start.y, start.z, end.x, end.y, end.z);
    });

    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    var routes = new THREE.LineSegments(lineGeometry, lineMaterial);
    var hubMaterials = [];
    var hubs = layers.map(function (layer, index) {
        var material = new THREE.LineBasicMaterial({
            transparent: true,
            opacity: 0.3,
            depthWrite: false
        });
        var hub = new THREE.LineSegments(hubGeometry, material);

        hub.position.copy(positions[layerIndexes[index][0]]);
        hub.rotation.set(index * 0.12, index * 0.18, index * 0.06);
        hub.userData.phase = index * 0.9;
        hub.renderOrder = 3;
        hubMaterials.push(material);
        return hub;
    });

    routes.frustumCulled = false;
    topology.add(routes, nodes, nodeOutlines);
    hubs.forEach(function (hub) {
        topology.add(hub);
    });
    scene.add(topology);

    function readThemeColor(name, fallback) {
        var value = window.getComputedStyle(root).getPropertyValue(name).trim();
        return value || fallback;
    }

    function syncThemeColors() {
        nodeThemeColor.set(readThemeColor('--portfolio-blue', '#7aa2f7'));
        hubThemeColor.set(readThemeColor('--portfolio-amber', '#e0af68'));
        nodeMaterial.color.copy(nodeThemeColor);
        nodeOutlineMaterial.color.copy(nodeThemeColor);
        lineMaterial.color.set(readThemeColor('--portfolio-quiet', '#565f89'));
        hubMaterials.forEach(function (material) {
            material.color.copy(nodeThemeColor);
        });
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
        var focusZ = THREE.MathUtils.lerp(layers[0].z, layers[layers.length - 1].z, smoothProgress);
        var cameraDistance = isMobile ? 25 : 19;

        camera.position.set(
            THREE.MathUtils.lerp(-6.4, 5.4, smoothProgress),
            THREE.MathUtils.lerp(4.2, -3.2, smoothProgress),
            focusZ + cameraDistance
        );
        camera.lookAt(
            THREE.MathUtils.lerp(-0.6, 0.5, smoothProgress),
            THREE.MathUtils.lerp(0.6, -0.4, smoothProgress),
            focusZ
        );
        camera.rotateZ(THREE.MathUtils.lerp(-0.01, 0.012, smoothProgress));

        topology.rotation.y = 0.22 + smoothProgress * 0.16 + Math.sin(time * 0.12) * 0.012;
        topology.rotation.x = -0.12 + smoothProgress * 0.08;
        topology.position.x = Math.sin(smoothProgress * Math.PI * 2) * 0.3;

        var activeLayer = smoothProgress * (layers.length - 1);

        hubs.forEach(function (hub, index) {
            var direction = index % 2 === 0 ? 1 : -1;
            var pulse = 1 + Math.sin(time * 0.55 + hub.userData.phase) * 0.02;
            var focus = Math.max(0, 1 - Math.abs(activeLayer - index));

            hub.rotation.x = index * 0.12 + time * 0.06 * direction + smoothProgress * 0.35;
            hub.rotation.y = index * 0.18 + time * 0.08 + smoothProgress * 0.45 * direction;
            hub.scale.setScalar(pulse);
            hub.material.opacity = 0.24 + focus * 0.58;
            hub.material.color.copy(nodeThemeColor).lerp(hubThemeColor, focus * 0.85);
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
        nodeOutlineGeometry.dispose();
        nodeOutlineMaterial.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        hubGeometry.dispose();
        hubMaterials.forEach(function (material) {
            material.dispose();
        });
        renderer.dispose();
    });
}

initSystemsScene();

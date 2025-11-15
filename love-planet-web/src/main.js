const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 50, 200);
controls.update();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(50, 50, 50);
scene.add(pointLight);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Photo upload handler: lắng nghe 'photos-selected' và chèn ảnh vào photoRings ---
(function () {
    // đảm bảo photoRings tồn tại; nếu không, tạo một group để chứa ảnh upload
    if (typeof photoRings === 'undefined') window.photoRings = new THREE.Group();
    if (!scene.getObjectByName?.('photoRings')) {
        window.photoRings.name = 'photoRings';
        scene.add(window.photoRings);
    }

    const loader = new THREE.TextureLoader();

    function addPhotoToRing(file) {
        const url = URL.createObjectURL(file);
        loader.load(url, (tex) => {
            tex.minFilter = THREE.LinearFilter;
            const img = tex.image;
            const aspect = (img && img.width && img.height) ? img.width / img.height : 1;
            const height = 8; // điều chỉnh kích thước hiển thị ảnh
            const width = height * aspect;
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
            const geom = new THREE.PlaneGeometry(width, height);
            const mesh = new THREE.Mesh(geom, mat);

            // vị trí: nếu có ringRadii / photoIndex thì dùng, nếu không rải ngẫu nhiên xung quanh
            const radii = (typeof ringRadii !== 'undefined' && Array.isArray(ringRadii)) ? ringRadii : [40, 55, 70];
            const idx = (typeof photoIndex === 'number') ? (photoIndex % radii.length) : Math.floor(Math.random() * radii.length);
            const baseRadius = radii[idx] || 50;
            const radius = baseRadius + (Math.random() - 0.5) * 6;
            const angle = Math.random() * Math.PI * 2;
            mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 6, Math.sin(angle) * radius);
            mesh.lookAt(0, 0, 0);
            mesh.userData.uploaded = true;

            window.photoRings.add(mesh);

            if (typeof photoIndex === 'number') photoIndex++;

            // giải phóng URL sau khi texture đã nạp
            setTimeout(() => URL.revokeObjectURL(url), 3000);
        }, undefined, (err) => {
            console.warn('Error loading uploaded image', err);
            URL.revokeObjectURL(url);
        });
    }

    // lắng nghe event từ index.html
    window.addEventListener('photos-selected', (e) => {
        const files = e.detail || [];
        files.forEach(f => addPhotoToRing(f));
    });
})();

// --- Audio setup: listener + loader + raycast để click bật audio ---
const listener = new THREE.AudioListener();
camera.add(listener);
const audioLoader = new THREE.AudioLoader();
const textureLoader = new THREE.TextureLoader();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// đảm bảo photoRings tồn tại
if (typeof photoRings === 'undefined') {
    window.photoRings = new THREE.Group();
    photoRings.name = 'photoRings';
    scene.add(photoRings);
}

// helper: tạo mesh ảnh và gắn audio (audioFile có thể là File hoặc URL string)
function addPhotoWithOptionalAudio(imageSource, audioSource) {
    // imageSource: URL string or File object; audioSource: URL string or File object or undefined
    const loadImage = (src, onLoad) => {
        if (src instanceof File) {
            const url = URL.createObjectURL(src);
            textureLoader.load(url, (tex) => { onLoad(tex); URL.revokeObjectURL(url); }, undefined, () => URL.revokeObjectURL(url));
        } else {
            textureLoader.load(src, (tex) => onLoad(tex), undefined, (e) => console.warn('Image load error', e));
        }
    };

    loadImage(imageSource, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        const img = tex.image;
        const aspect = (img && img.width && img.height) ? img.width / img.height : 1;
        const height = 8;
        const width = height * aspect;
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide });
        const geom = new THREE.PlaneGeometry(width, height);
        const mesh = new THREE.Mesh(geom, mat);

        const radii = (typeof ringRadii !== 'undefined' && Array.isArray(ringRadii)) ? ringRadii : [40, 55, 70];
        const idx = (typeof photoIndex === 'number') ? (photoIndex % radii.length) : Math.floor(Math.random() * radii.length);
        const baseRadius = radii[idx] || 50;
        const radius = baseRadius + (Math.random() - 0.5) * 6;
        const angle = Math.random() * Math.PI * 2;
        mesh.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 6, Math.sin(angle) * radius);
        mesh.lookAt(0, 0, 0);
        mesh.userData.uploaded = true;

        // nếu có audio, tạo THREE.Audio và gán vào mesh.userData.audio
        if (audioSource) {
            const sound = new THREE.PositionalAudio(listener); // positional để cảm giác không gian
            const loadAudio = (src) => {
                if (src instanceof File) {
                    const url = URL.createObjectURL(src);
                    audioLoader.load(url, (buffer) => {
                        sound.setBuffer(buffer);
                        sound.setRefDistance(20);
                        URL.revokeObjectURL(url);
                    }, undefined, (e) => { console.warn('Audio load error', e); URL.revokeObjectURL(url); });
                } else {
                    audioLoader.load(src, (buffer) => sound.setBuffer(buffer), undefined, (e) => console.warn('Audio load error', e));
                }
            };
            loadAudio(audioSource);
            mesh.add(sound);
            mesh.userData.audio = sound;
        }

        photoRings.add(mesh);
        if (typeof photoIndex === 'number') photoIndex++;
    });
}

// mapping upload: ghép image <-> audio theo base filename nếu cùng upload
function handleUploadedFiles(files) {
    const images = files.filter(f => f.type && f.type.startsWith('image/'));
    const audios = files.filter(f => f.type && f.type.startsWith('audio/'));

    // map audios by basename (without extension)
    const audioMap = {};
    audios.forEach(a => {
        const name = a.name.replace(/\.[^/.]+$/, '');
        audioMap[name] = a;
    });

    images.forEach(img => {
        const base = img.name.replace(/\.[^/.]+$/, '');
        const matchedAudio = audioMap[base];
        addPhotoWithOptionalAudio(img, matchedAudio);
    });

    // nếu còn audio không khớp, chúng ta có thể thêm audio-only objects hoặc ignore
}

// preload example: thêm ảnh+audio có sẵn trong project (assets)
const preloadedPairs = [
    // sửa path tương ứng folder assets của bạn
    { image: 'assets/images/pic1.jpg', audio: 'assets/audio/sound1.mp3' },
    { image: 'assets/images/pic2.jpg', audio: 'assets/audio/sound2.mp3' },
    { image: 'assets/images/pic3.jpg' } // ảnh không kèm audio
];

preloadedPairs.forEach(p => addPhotoWithOptionalAudio(p.image, p.audio));

// lắng nghe event từ index.html
window.addEventListener('photos-selected', (e) => {
    const files = e.detail || [];
    if (!files.length) return;
    handleUploadedFiles(files);
});

// click để bật/tắt audio cho ảnh (raycast)
renderer.domElement.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(photoRings.children, true);
    if (intersects.length) {
        const obj = intersects[0].object;
        const sound = obj.userData.audio;
        if (sound) {
            if (sound.isPlaying) sound.stop(); else sound.play();
        }
    }
});

// ---- Camera focus + orbit animation helpers ----
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOutQuad(t) { return t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; }

function animateCamera(fromPos, toPos, duration = 1000) {
    return new Promise(resolve => {
        const start = performance.now();
        function frame(now) {
            const elapsed = now - start;
            const tRaw = Math.min(1, elapsed / duration);
            const t = easeInOutQuad(tRaw);
            camera.position.x = lerp(fromPos.x, toPos.x, t);
            camera.position.y = lerp(fromPos.y, toPos.y, t);
            camera.position.z = lerp(fromPos.z, toPos.z, t);
            camera.lookAt(toPos.target || new THREE.Vector3(0,0,0));
            if (tRaw < 1) requestAnimationFrame(frame); else resolve();
        }
        requestAnimationFrame(frame);
    });
}

function orbitAround(targetVec, radius, duration = 4000, rotations = 1, heightOffset = 0) {
    return new Promise(resolve => {
        const start = performance.now();
        const startAngle = Math.atan2(camera.position.z - targetVec.z, camera.position.x - targetVec.x);
        function frame(now) {
            const elapsed = now - start;
            const tRaw = Math.min(1, elapsed / duration);
            const t = easeInOutQuad(tRaw);
            const angle = startAngle + (Math.PI * 2 * rotations * t);
            const x = targetVec.x + Math.cos(angle) * radius;
            const z = targetVec.z + Math.sin(angle) * radius;
            const y = targetVec.y + heightOffset + lerp(camera.position.y, targetVec.y + heightOffset, 0.02);
            camera.position.set(x, y, z);
            camera.lookAt(targetVec);
            if (tRaw < 1) requestAnimationFrame(frame); else resolve();
        }
        requestAnimationFrame(frame);
    });
}

// High-level sequence: zoom in -> orbit -> zoom out
async function focusAndOrbitOn(object3D, opts = {}) {
    if (!object3D) return;
    const target = new THREE.Vector3();
    object3D.getWorldPosition(target);

    // durations (ms)
    const inDuration = (opts.inDurationMs !== undefined) ? opts.inDurationMs : 1000;
    const outDuration = (opts.outDurationMs !== undefined) ? opts.outDurationMs : 1200;

    // if object has audio buffer, use its duration for orbit phase
    const audio = object3D.userData && object3D.userData.audio;
    let orbitDurationMs = (opts.orbitDurationMs !== undefined) ? opts.orbitDurationMs : 4000;
    if (audio && audio.buffer && audio.buffer.duration) {
        // keep some margin: orbit for most of audio but not necessarily whole time
        const sec = audio.buffer.duration;
        orbitDurationMs = Math.max(3000, Math.min(60000, Math.floor(sec * 1000 * 0.9)));
    }

    // distance values
    const originalPos = camera.position.clone();
    const closeDist = opts.closeDistance !== undefined ? opts.closeDistance : 14; // distance from target when zoomed in
    const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
    const closePos = new THREE.Vector3().addVectors(target, dir.multiplyScalar(closeDist));
    closePos.y = target.y + (opts.closeHeightOffset || 4);

    // disable controls if present
    if (window.controls) window.controls.enabled = false;

    try {
        // zoom in straight
        await animateCamera(originalPos, { x: closePos.x, y: closePos.y, z: closePos.z, target });

        // optionally ensure audio plays
        if (audio && !audio.isPlaying) {
            try { audio.play(); } catch (e) { /* autoplay may be blocked; user can click again */ }
        }

        // slow orbit: choose rotations based on orbitDuration
        const rotations = opts.rotations || Math.max(1, Math.floor(orbitDurationMs / 8000));
        await orbitAround(target, closeDist, orbitDurationMs, rotations, opts.closeHeightOffset || 4);

        // zoom out back to original
        await animateCamera(camera.position.clone(), { x: originalPos.x, y: originalPos.y, z: originalPos.z, target });
    } finally {
        if (window.controls) window.controls.enabled = true;
    }
}

// Replace existing click handler (or augment it) to trigger focus sequence when clicking a photo
renderer.domElement.addEventListener('click', (e) => {
    // existing raycast logic: compute mouse and intersect
    const rect = renderer.domElement.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    const mouseVec = new THREE.Vector2(mx, my);
    const rc = new THREE.Raycaster();
    rc.setFromCamera(mouseVec, camera);
    const objs = photoRings ? photoRings.children : [];
    const intersects = rc.intersectObjects(objs, true);
    if (intersects.length) {
        const picked = intersects[0].object;
        const sound = picked.userData && picked.userData.audio;
        // start audio if present
        if (sound) {
            if (!sound.isPlaying) {
                try { sound.play(); } catch (err) { /* may require user gesture */ }
            } else {
                // if already playing, keep it
            }
        }
        // trigger camera sequence; orbit duration will use audio length if available
        focusAndOrbitOn(picked, { closeDistance: 12 });
    }
});

// Auto-load tất cả ảnh + audio từ API
fetch('/api/assets')
    .then(res => res.json())
    .then(data => {
        data.pairs.forEach(p => {
            if (p.image) {
                addPhotoWithOptionalAudio(p.image, p.audio);
            }
        });
    })
    .catch(err => console.warn('Assets API error', err));

animate();
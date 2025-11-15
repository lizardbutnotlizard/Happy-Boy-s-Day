const loadImage = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    });
};

const loadAudio = (url) => {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = url;
        audio.onloadeddata = () => resolve(audio);
        audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
    });
};

const loadAssets = async (assets) => {
    const promises = assets.map(asset => {
        if (asset.type === 'image') {
            return loadImage(asset.url);
        } else if (asset.type === 'audio') {
            return loadAudio(asset.url);
        }
    });
    return Promise.all(promises);
};

export { loadImage, loadAudio, loadAssets };
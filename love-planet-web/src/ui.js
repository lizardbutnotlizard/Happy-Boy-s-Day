const uploadImage = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const imgElement = document.createElement('img');
        imgElement.src = event.target.result;
        imgElement.alt = 'Uploaded Image';
        imgElement.style.width = '100%';
        imgElement.style.height = 'auto';
        document.getElementById('image-gallery').appendChild(imgElement);
    };
    reader.readAsDataURL(file);
};

const setupImageUpload = () => {
    const fileInput = document.getElementById('image-upload');
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            uploadImage(files[i]);
        }
    });
};

const initializeUI = () => {
    setupImageUpload();
};

document.addEventListener('DOMContentLoaded', initializeUI);
const galleryContainer = document.getElementById('gallery-container');

function displayImages(imageUrls) {
    galleryContainer.innerHTML = ''; // Clear existing images
    imageUrls.forEach(url => {
        const imgElement = document.createElement('img');
        imgElement.src = url;
        imgElement.alt = 'Uploaded Image';
        imgElement.classList.add('gallery-image');
        galleryContainer.appendChild(imgElement);
    });
}

function addImageToGallery(imageUrl) {
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = 'Uploaded Image';
    imgElement.classList.add('gallery-image');
    galleryContainer.appendChild(imgElement);
}

export { displayImages, addImageToGallery };
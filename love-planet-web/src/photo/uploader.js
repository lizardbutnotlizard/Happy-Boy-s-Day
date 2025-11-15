const uploader = (() => {
    const uploadImage = (inputElement, callback) => {
        inputElement.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                const file = files[0];
                const reader = new FileReader();

                reader.onload = (e) => {
                    const imageUrl = e.target.result;
                    callback(imageUrl);
                };

                reader.readAsDataURL(file);
            }
        });
    };

    return {
        uploadImage,
    };
})();

export default uploader;
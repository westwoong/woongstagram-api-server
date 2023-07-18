const { createPhotos, modifyPhotosByPostId } = require('../repository/photoRepository');

module.exports.upload = async (photos) => {
    return new Promise(async (successCallback) => {
        const locations = [];
        for (let PhotoArrayLength = 0; PhotoArrayLength < photos.length; PhotoArrayLength++) {
            const { location } = photos[PhotoArrayLength];
            await createPhotos(location, PhotoArrayLength);
            locations.push({ location, sequence: PhotoArrayLength });
        }
        successCallback(locations);
    });
}

module.exports.modify = async (photoId, photos) => {
    return new Promise(async (successCallback) => {
        for (let PhotoArrayLength = 0; PhotoArrayLength < photos.length; PhotoArrayLength++) {
            const { location } = photos[PhotoArrayLength];
            await modifyPhotosByPostId(location, PhotoArrayLength, photoId);
        }
        successCallback();
    });
}
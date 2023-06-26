const { Photo } = require('../models');

const createPhotos = async (photoUrl, photoSequence) => {
    return Photo.create({ url: photoUrl, sequence: photoSequence });
}

const modifyPhotosByPostId = async (photoUrl, photoSequence, photoId) => {
    return Photo.update({ url: photoUrl, sequence: photoSequence }, { where: { id: photoId } });
}

const findPhotosUrl = async (photoUrl) => {
    return Photo.findOne({ where: { url: photoUrl } });
}

const getPhotoByPostId = async (postId, limit, offset) => {
    return Photo.findAll({ where: { postId }, order: [['created_at', 'DESC']], limit, offset });
}

module.exports = {
    createPhotos,
    modifyPhotosByPostId,
    findPhotosUrl,
    getPhotoByPostId
}
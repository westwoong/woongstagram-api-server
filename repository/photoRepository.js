const { Photo } = require('../models');

const findPhotosUrl = async (photoUrl) => {
    return Photo.findOne({ where: { url: photoUrl } });
}

const getPhotoByPostId = async (postId, limit, offset) => {
    return Photo.findAll({ where: { postId }, order: [['created_at', 'DESC']], limit, offset });
}

module.exports = {
    findPhotosUrl,
    getPhotoByPostId
}
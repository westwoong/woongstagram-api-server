const { Photo } = require('../models');

const findPhotosUrl = async (photoUrl) => {
    return Photo.findOne({ where: { url: photoUrl } });
}

module.exports = {
    findPhotosUrl
}
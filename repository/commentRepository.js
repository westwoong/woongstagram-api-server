const { Comment } = require('../models');

const getCommentByUserId = async (commentId, userId) => {
  return Comment.findOne({ where: { id: commentId, userId } });
}

const getCommentsByPostId = async (postId, limit, offset) => {
  return Comment.findAll({ where: { postId }, limit: limit, offset: offset });
};

const getCommentCountByPostId = async (postId) => {
  return Comment.count({ where: { postId } });
};

const createComment = async (userId, postId, comment) => {
  return Comment.create({ userId, postId, content: comment });
}

const deleteUserComment = async (commentId, userId) => {
  return Comment.destroy({ where: { id: commentId, userId } });
}

const deleteCommentByPostId = async (postId, transaction) => {
  return Comment.destroy({ where: { postId }, transaction });
};

const modifyCommet = async (comment, commentId, userId) => {
  return Comment.update({ content: comment }, { where: { id: commentId, userId } });
}



module.exports = {
  getCommentByUserId,
  getCommentsByPostId,
  getCommentCountByPostId,
  createComment,
  deleteUserComment,
  deleteCommentByPostId,
  modifyCommet
}
const { Comment } = require('../models');

const findOneUserComment = async (commentId, userId) => {
  return Comment.findOne({ where: { id: commentId, userId } });
}

const createComment = async (userId, postId, comment) => {
  return Comment.create({ userId, postId, content: comment });
}

const deleteUserComment = async (commentId, userId) => {
  return Comment.destroy({ where: { id: commentId, userId } });
}

module.exports = {
  findOneUserComment,
  createComment,
  deleteUserComment
}
const createError = require("http-errors");
const uuid = require("uuid").v4;
const {
  getCommentsData: getAllComments,
  saveCommentData,
} = require("../utils/comment.util");
const { getSuccessResponse } = require("../utils/response.util");

exports.getAllCommnets = async (req, res, next) => {
  try {
    const comments = await getAllComments();
    const { userId, postId } = req.params;

    const filteredComments = comments.filter(
      (comment) => comment.userId === userId && comment.postId === postId
    );

    return res.json(
      getSuccessResponse("Comments fetched successfully", filteredComments)
    );
  } catch (err) {
    next(err);
  }
};

exports.getCommentById = async (req, res, next) => {
  try {
    const comments = await getAllComments();
    const { userId, postId, commentId } = req.params;

    const userComments = comments.find(
      (comment) =>
        comment.userId === userId &&
        comment.postId === postId &&
        comment.id === commentId
    );

    if (!userComments) throw createError(404, "comment does not exists");

    return res.json(
      getSuccessResponse("Comment fetched successfully", userComments)
    );
  } catch (err) {
    next(e);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    const comments = await getAllComments();
    const payload = req.body;
    const { userId, postId } = req.params;

    const comment = {
      id: uuid(),
      userId,
      postId,
      ...payload,
    };
    comments.push(comment);

    await saveCommentData(comments);
    return res.json(
      getSuccessResponse("Comment created successfully", comment)
    );
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { userId, postId, commentId } = req.params;
    const payload = req.body;

    const comments = await getAllComments();

    const existingComment = comments.find(
      (comment) =>
        comment.userId === userId &&
        comment.postId === postId &&
        comment.id === commentId
    );

    if (!existingComment) throw createError(404, "comment does not exists");

    const updateComment = {
      ...existingComment,
      ...payload,
    };
    const updatedComment = comments.map((comment) =>
      comment.id === commentId ? updateComment : comment
    );

    await saveCommentData(updateComment);
    return res.json(
      getSuccessResponse("Comment updated successfully", updatedComment)
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comments = await getAllComments();
    const { userId, postId, commentId } = req.params;

    const isCommentExists = comments.some(
      (comment) =>
        comment.userId === userId &&
        comment.postId === postId &&
        comment.id === commentId
    );

    if (!isCommentExists) throw createError(404, "comment does not exist");

    const filteredComments = comments.filter(
      (comment) => comment.id !== commentId
    );
    await saveCommentData(filteredComments);
    return res.json(filteredComments);
  } catch (err) {
    next(err);
  }
};

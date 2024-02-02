const uuid = require("uuid").v4;
const createError = require("http-errors");
const { getPostsdata, savePostData } = require("../utils/post.utils");
const { getCommentsData, saveCommentData } = require("../utils/comment.util");
const { getSuccessResponse } = require("../utils/response.util");

exports.getAllPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const posts = await getPostsdata();

    const userPosts = posts.filter((post) => post.userId === userId);

    return res.json(
      getSuccessResponse("Posts fetched successfully", userPosts)
    );
  } catch (error) {
    next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const { userId, postId } = req.params;
    const posts = await getPostsdata();

    const userPost = posts.find(
      (post) => post.userId === userId && post.id === postId
    );

    if (!userPost) throw createError(404, "Post does not exists");

    return res.json(getSuccessResponse("Post fetched successfully", userPost));
  } catch (e) {
    next(e);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const payload = req.body;
    const { userId } = req.params;
    let posts = await getPostsdata();
    const post = {
      id: uuid(),
      userId,
      ...payload,
    };

    posts.push(post);

    await savePostData(posts);
    return res
      .status(201)
      .json(getSuccessResponse("Post created successfully", post));
  } catch (e) {
    next(e);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    let posts = await getPostsdata();
    const { userId, postId } = req.params;
    const payload = req.body;

    const existingPost = posts.find(
      (post) => post.userId === userId && post.id === postId
    );

    if (!existingPost) {
      throw createError(404, "post does not exist");
    }

    const updatePost = {
      ...existingPost,
      ...payload,
    };

    const updatedPost = posts.map((post) =>
      post.id === postId ? updatePost : post
    );

    await savePostData(updatedPost);
    res.json(getSuccessResponse("Post updated successfully", updatedPost));
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const posts = await getPostsdata();
    const { userId, postId } = req.params;

    const isPostExists = posts.some(
      (post) => post.userId == userId && post.id == postId
    );

    if (!isPostExists) {
      throw createError(404, "Post does not exist");
    }

    const comments = getCommentsData();
    const updatedComments = comments.filter(
      (comment) => comment.postId !== postId
    );

    await savePostData(updatedPost);
    await saveCommentData(updatedComments);
    res.json(getSuccessResponse("Post deleted successfully"));
  } catch (err) {
    next(err);
  }
};

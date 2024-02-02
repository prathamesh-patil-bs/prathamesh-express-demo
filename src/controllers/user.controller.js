const uuid = require("uuid").v4;
const createError = require("http-errors");
const { getUserData, saveUserData } = require("../utils/user.utils");
const { getSuccessResponse } = require("../utils/response.util");
const { getPostsdata, savePostData } = require("../utils/post.utils");
const { getCommentsData, saveCommentData } = require("../utils/comment.util");

exports.getAllUsers = async (req, res, next) => {
  const users = await getUserData();
  return res.json(getSuccessResponse("Users fetched successfully", users));
};

exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const users = await getUserData();

    const user = users.find((user) => user.id == userId);

    if (!user) throw createError(404, "User does not exists");

    return res.json(getSuccessResponse("User fetched successfully", user));
  } catch (e) {
    next(e);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const payload = req.body;
    let users = await getUserData();

    const isEmailInUse = users.find((user) => user.email == payload.email);

    if (isEmailInUse) {
      throw createError(409, "Email already in use");
    }

    const user = {
      id: uuid(),
      ...payload,
    };

    users.push(user);

    await saveUserData(users);

    return res
      .status(201)
      .json(getSuccessResponse("User created successfully", user));
  } catch (e) {
    next(e);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    let users = await getUserData();
    const { userId } = req.params;
    const payload = req.body;

    const existingUser = users.find((user) => user.id === userId);

    if (!existingUser) {
      throw createError(404, "User does not exist");
    }

    if (payload.email) {
      const isEmailExists = users.find(
        (user) => user.email == payload.email && user.id !== userId
      );

      if (isEmailExists) {
        throw createError(409, "Email already in use");
      }
    }

    const updatedUser = {
      ...existingUser,
      ...payload,
    };

    const updatedData = users.map((user) =>
      user.id === userId ? updatedUser : user
    );
    await saveUserData(updatedData);
    res.json(getSuccessResponse("User updated successfully", updatedUser));
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const users = await getUserData();
    const { userId } = req.params;

    const isUserExists = users.some((user) => user.id === userId);

    if (!isUserExists) {
      throw createError(404, "User does not exist");
    }

    const posts = await getPostsdata();
    const comments = await getCommentsData();

    const postsToBeDeleted = posts
      .filter((post) => post.userId === userId)
      .map((post) => post.id);

    const updatedComments = comments.filter(
      (comment) =>
        !postsToBeDeleted.includes(comment.postId) || comment.userId !== userId
    );
    const updatedPosts = posts.filter((post) => post.userId !== userId);
    const updatedUsers = users.filter((user) => user.id !== userId);

    await Promise.all([
      saveUserData(updatedUsers),
      savePostData(updatedPosts),
      saveCommentData(updatedComments),
    ]);

    res.json(getSuccessResponse("User deleted successfully"));
  } catch (err) {
    next(err);
  }
};

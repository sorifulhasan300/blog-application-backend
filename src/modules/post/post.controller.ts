import { NextFunction, Request, Response } from "express";
import { postService } from "./post.service";
import { boolean, success } from "better-auth/*";
import { stat } from "node:fs";
import { PostType } from "../../../generated/prisma/enums";
import { paginationHelper, PaginationType } from "../../helper/helper";
import { Result } from "pg";
import { prisma } from "../../lib/prisma";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  const post = req.body;
  const user = req.user;
  console.log(post);
  if (!user) {
    return "user not found";
  }
  try {
    const result = await postService.createPost(post, user.id as string);
    res.send(result);
  } catch (error) {
    next(error);
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const result = await postService.getAllPost();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something was wrong",
    });
  }
};

const searchPost = async (req: Request, res: Response) => {
  const search = req.query.search;
  const tagsParams = req.query.tags;
  const data = paginationHelper(req.query);
  const tags = typeof tagsParams === "string" ? tagsParams.split(",") : [];
  let isFeatured: boolean | undefined;
  if (req.query.isFeatured === "true") {
    isFeatured = true;
  } else if (req.query.isFeatured === "false") {
    isFeatured = false;
  }
  const status = req.query.status;
  const authorId = req.query.authorId;
  const totalItem = await prisma.post.count();
  try {
    const result = await postService.searchPost(
      search as string,
      tags,
      isFeatured,
      status as PostType | undefined,
      authorId as string,
      data.limit,
      data.page,
      data.skip,
      data.sortBy,
      data.sortOrder,
      totalItem,
    );
    res.status(200).json({
      success: true,
      data: {
        result,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
    console.log(error);
  }
};

const getSinglePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Id is not available");
  }
  try {
    const result = await postService.getSinglePost(id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const myPost = async (req: Request, res: Response) => {
  const authorId = req.user?.id;
  console.log("author id", authorId);
  try {
    const result = await postService.myPost(authorId as string);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error || "Something was wrong",
    });
  }
};

const updateOwnPost = async (req: Request, res: Response) => {
  const authorId = req.user?.id;
  const { postId } = req.params;
  const data = req.body;

  if (!authorId) {
    return "author id not found";
  }
  const isAdmin = req.user?.role === "ADMIN";
  try {
    const result = await postService.updateOwnPost(
      data,
      postId,
      authorId,
      isAdmin,
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error || "Something was wrong",
    });
  }
};

const deletePost = async (req: Request, res: Response) => {
  const authorId = req.user?.id;
  const { postId } = req.params;

  if (!authorId) {
    return "author id not found";
  }
  const isAdmin = req.user?.role === "ADMIN";
  try {
    const result = await postService.deletePost(postId, authorId, isAdmin);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error || "Something was wrong",
    });
  }
};

const analytics = async (req: Request, res: Response) => {
  try {
    const result = await postService.analytics();
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error || "Something was wrong",
    });
  }
};

export const postController = {
  createPost,
  getAllPost,
  searchPost,
  getSinglePost,
  myPost,
  updateOwnPost,
  deletePost,
  analytics,
};

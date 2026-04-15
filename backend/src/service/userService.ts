import prisma from "../config/prisma";
import { saveAvatar, saveBanner } from "../lib/imageProcessing";
import { safeUnlink, urlToAbsoluteUploadPath } from "../lib/files";
import { ServiceError } from "../errors/ServiceError";
import {
  UserProfileDto,
  SearchResultDto,
  UpdateProfileInput,
  UpdateAvatarInput,
  UpdateBannerInput,
  SearchUsersInput,
  UpdatedUserImageResponse,
  SearchUsersResponse,
} from "../types/userTypes";

export const getUserByUsername = async (
  username: string,
): Promise<UserProfileDto> => {
  if (!username) {
    throw new ServiceError(400, "Username is required");
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      createdAt: true,
      avatarUrl: true,
      bannerUrl: true,
      description: true,
      isCreator: true,
      creatorActivatedAt: true,
    },
  });

  if (!user) {
    throw new ServiceError(404, "User not found");
  }

  const now = new Date();

  const paidSubscriberCount = await prisma.subscription.count({
    where: {
      authorId: user.id,
      kind: "paid",
      status: "active",
      expiresAt: { gt: now },
      tier: { priceCents: { gt: 0 } },
    },
  });

  // Followers = everyone who follows (free follow record).
  // Paying users always have a follow row too, so this is the honest
  // "how many people are subscribed to this author" number.
  const totalSubscriberCount = await prisma.subscription.count({
    where: {
      authorId: user.id,
      kind: "follow",
      status: "active",
    },
  });

  const followerCount = totalSubscriberCount;

  return { ...user, paidSubscriberCount, totalSubscriberCount: followerCount };
};

export const updateUserDescription = async ({
  username,
  authUserId,
  description,
}: UpdateProfileInput): Promise<UserProfileDto> => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new ServiceError(404, "User not found");
  }

  if (user.id !== authUserId) {
    throw new ServiceError(403, "You can edit only your profile");
  }

  const updated = await prisma.user.update({
    where: { username },
    data: { description: description?.trim() || null },
    select: {
      id: true,
      username: true,
      createdAt: true,
      avatarUrl: true,
      bannerUrl: true,
      description: true,
    },
  });

  return updated;
};

export const updateUserAvatar = async ({
  username,
  authUserId,
  fileBuffer,
}: UpdateAvatarInput): Promise<UpdatedUserImageResponse> => {
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true, avatarUrl: true, username: true },
  });

  if (!target) {
    throw new ServiceError(404, "User not found");
  }

  if (target.id !== authUserId) {
    throw new ServiceError(403, "You cannot edit another user's profile");
  }

  const newAvatarUrl = await saveAvatar(fileBuffer);

  if (target.avatarUrl) {
    const oldPath = urlToAbsoluteUploadPath(target.avatarUrl);
    safeUnlink(oldPath);
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { avatarUrl: newAvatarUrl },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bannerUrl: true,
    },
  });

  return updated;
};

export const updateUserBanner = async ({
  username,
  authUserId,
  fileBuffer,
}: UpdateBannerInput): Promise<UpdatedUserImageResponse> => {
  const target = await prisma.user.findUnique({
    where: { username },
    select: { id: true, bannerUrl: true, username: true },
  });

  if (!target) {
    throw new ServiceError(404, "User not found");
  }

  if (target.id !== authUserId) {
    throw new ServiceError(403, "You cannot edit another user's profile");
  }

  const newBannerUrl = await saveBanner(fileBuffer);

  if (target.bannerUrl) {
    const oldPath = urlToAbsoluteUploadPath(target.bannerUrl);
    safeUnlink(oldPath);
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { bannerUrl: newBannerUrl },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      bannerUrl: true,
    },
  });

  return updated;
};

export const searchUsers = async ({
  query,
}: SearchUsersInput): Promise<SearchUsersResponse> => {
  if (!query.trim()) {
    return { items: [] };
  }

  const items = await prisma.user.findMany({
    where: {
      isCreator: true,
      username: {
        contains: query.trim(),
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      username: true,
      avatarUrl: true,
      description: true,
      createdAt: true,
    },
  });

  return { items };
};

export const activateCreatorMode = async (
  authUserId: string,
): Promise<UserProfileDto> => {
  const user = await prisma.user.findUnique({
    where: { id: authUserId },
    select: { id: true, isCreator: true },
  });

  if (!user) {
    throw new ServiceError(404, "User not found");
  }

  if (user.isCreator) {
    throw new ServiceError(400, "Creator mode is already active");
  }

  const updated = await prisma.user.update({
    where: { id: authUserId },
    data: {
      isCreator: true,
      creatorActivatedAt: new Date(),
    },
    select: {
      id: true,
      username: true,
      createdAt: true,
      avatarUrl: true,
      bannerUrl: true,
      description: true,
      isCreator: true,
      creatorActivatedAt: true,
    },
  });

  return updated;
};

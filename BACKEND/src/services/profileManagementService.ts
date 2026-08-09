import prisma from "../lib/prisma";
import { deleteImageFromCloudinary } from "./importService";
import { sanitizeProfile } from "./profileService";

type ProfileFailure = { status: 400 | 404; message: string };
type ProfileSuccess<T> = { value: T };
type ProfileResult<T> = ProfileFailure | ProfileSuccess<T>;

export const updateUserProfile = async (
  userId: string,
  profile: Record<string, unknown>,
): Promise<ProfileResult<Awaited<ReturnType<typeof prisma.user.update>>>> => {
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return { status: 404, message: "User not found" };

  const firstName = typeof profile.firstName === "string" && profile.firstName.trim()
    ? profile.firstName.trim()
    : dbUser.firstName;
  const lastName = typeof profile.lastName === "string" ? profile.lastName.trim() : dbUser.lastName;
  const nameChanged = dbUser.firstName !== firstName || dbUser.lastName !== lastName;
  const now = new Date();

  if (nameChanged && dbUser.lastNameChange) {
    const daysSince = (now.getTime() - dbUser.lastNameChange.getTime()) / 86_400_000;
    if (daysSince < 30) {
      return { status: 400, message: `Name can only be changed once every 30 days. Remaining: ${Math.ceil(30 - daysSince)} days.` };
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...sanitizeProfile(profile),
      firstName,
      lastName,
      ...(nameChanged ? { lastNameChange: now } : {}),
      ...(profile.onboarded === true ? { onboarded: true } : {}),
    },
  });
  return { value: user };
};

export const replaceUserPhoto = async (userId: string, newPhoto: string): Promise<ProfileResult<string | null>> => {
  let newPhotoIsCurrent = false;
  try {
    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { photo: true } });
    if (!currentUser) {
      await deleteImageFromCloudinary(newPhoto);
      return { status: 404, message: "User not found" };
    }

    const updatedUser = await prisma.user.update({ where: { id: userId }, data: { photo: newPhoto } });
    newPhotoIsCurrent = true;
    if (currentUser.photo && currentUser.photo !== newPhoto) {
      try {
        await deleteImageFromCloudinary(currentUser.photo);
      } catch (error) {
        await prisma.user.update({ where: { id: userId }, data: { photo: currentUser.photo } });
        newPhotoIsCurrent = false;
        throw error;
      }
    }
    return { value: updatedUser.photo };
  } catch (error) {
    if (!newPhotoIsCurrent) {
      try {
        await deleteImageFromCloudinary(newPhoto);
      } catch (cleanupError) {
        console.error("New photo cleanup error:", cleanupError);
      }
    }
    throw error;
  }
};

export const removeUserPhoto = async (userId: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.photo) await deleteImageFromCloudinary(user.photo);
  await prisma.user.update({ where: { id: userId }, data: { photo: null } });
};

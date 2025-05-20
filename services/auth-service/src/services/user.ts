import { ERROR_MESSAGES } from "../config/constants";
import { CreateUserProfileDTO } from "../dtos/UserDTO";
import { Profile } from "../models/Profile";
import { User } from "../models/User";

// Create a user Profile
export const createUserProfile = async (
  userId: string,
  userProfileData: CreateUserProfileDTO
) => {
  const { firstName, lastName, userName, phone, dob, gender } = userProfileData;

  if (!firstName || !lastName || !userName || !phone || !gender || !dob) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  if (user.profile) {
    throw new Error(ERROR_MESSAGES.PROFILE_ALREADY_EXISTS);
  }

  if (!user?.isPhoneVerified) {
    throw new Error("Phone verification required");
  }

  // Check for unique fields
  const existingProfile = await Profile.findOne({
    $or: [{ userName }, { phone }],
  });

  if (existingProfile) {
    throw new Error(
      existingProfile.userName === userName
        ? ERROR_MESSAGES.USERNAME_EXISTS
        : ERROR_MESSAGES.EMAIL_EXISTS
    );
  }

  // Create new profile
  const profile = await Profile.create({
    ...userProfileData,
    user: userId,
  });

  await User.updateOne(
    { _id: userId },
    {
      $set: {
        profile: profile._id,
        isActivated: true,
      },
    }
  );
  await user.save();

  return profile;
};

// Get user Profile
export const getUserProfile = async (userId: string) => {
  const userProfile = await Profile.findOne({ user: userId });
  if (!userProfile) {
    throw new Error(ERROR_MESSAGES.PROFILE_NOT_FOUND);
  }
  return userProfile;
};

// Suggest userName to user
export const suggestUsernames = async (
  firstName: string,
  lastName: string,
  maxAttempts = 10
) => {
  if (!firstName || !lastName) {
    throw new Error(ERROR_MESSAGES.REQUIRED_FIELDS);
  }

  const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
  const suggestions = new Set<string>();
  let attempts = 0;

  const generateVariants = () => [
    `${cleanFirst}${cleanLast}`,
    `${cleanFirst}.${cleanLast}`,
    `${cleanFirst}_${cleanLast}`,
    `${cleanFirst.charAt(0)}${cleanLast}`,
    `${cleanFirst}${cleanLast.charAt(0)}`,
    `${cleanFirst}${Math.floor(Math.random() * 1000)}`,
    `${cleanLast}${cleanFirst}`,
    `${cleanFirst}${cleanLast}${Math.floor(Math.random() * 100)}`,
  ];

  while (suggestions.size < 5 && attempts < maxAttempts) {
    const variants = generateVariants();

    for (const variant of variants) {
      if (suggestions.size >= 5) break;

      if (!suggestions.has(variant)) {
        const exists = await Profile.exists({ userName: variant });
        if (!exists) {
          suggestions.add(variant);
        }
      }
    }
    attempts++;
  }

  if (suggestions.size === 0) {
    throw new Error(ERROR_MESSAGES.USERNAME_GENERATION_FAILED);
  }

  return Array.from(suggestions).slice(0, 5);
};

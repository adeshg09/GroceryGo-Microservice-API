export const sanitizeUser = (user: any) => {
  const {
    password,
    refreshTokens,
    phoneOtp,
    phoneOtpExpiry,
    otpAttempts,
    otpData,
    __v,
    ...safeUser
  } = user.toObject?.() || user;
  console.log("safeUser", safeUser);
  return safeUser;
};

export const sanitizeProfile = (profile: any) => {
  const { __v, user, ...safeProfile } = profile.toObject?.() || profile;
  return safeProfile;
};

export const sanitizeUserAndProfile = (user: any) => {
  const { profile, ...safeUser } = sanitizeUser(user);
  return { ...safeUser, profile: sanitizeProfile(profile) };
};

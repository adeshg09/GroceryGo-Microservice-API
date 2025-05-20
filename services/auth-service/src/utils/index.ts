export const sanitizeUser = (user: any) => {
  const {
    password,
    refreshTokens,
    phoneOtp,
    phoneOtpExpiry,
    otpAttempts,
    __v,
    ...safeUser
  } = user.toObject?.() || user;
  return safeUser;
};

export const sanitizeProfile = (profile: any) => {
  const { __v, ...safeProfile } = profile.toObject?.() || profile;
  return safeProfile;
};

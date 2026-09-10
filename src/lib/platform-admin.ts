export type PlatformAdminIdentity = {
  userId?: string | null;
  email?: string | null;
};

function normalized(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isPlatformAdminIdentity(identity: PlatformAdminIdentity) {
  const configuredIdentity = process.env.PLATFORM_ADMIN_USER_ID?.trim() ?? "";
  const configuredEmail = normalized(process.env.PLATFORM_ADMIN_EMAIL);
  const legacyEmail = configuredIdentity.includes("@")
    ? normalized(configuredIdentity)
    : "";
  const userId = identity.userId?.trim() ?? "";
  const email = normalized(identity.email);

  return Boolean(
    (configuredIdentity && !legacyEmail && userId === configuredIdentity) ||
      (email && (email === configuredEmail || email === legacyEmail)),
  );
}

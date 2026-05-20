/** User id from JWT claims (v2) or legacy User object (v1). */
export function getAuthUserId(user: { sub?: string; id?: string }): string {
  const userId = user.sub ?? user.id
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }
  return userId
}

export const SESSION_COOKIE = 'vxp_session'

/** Cap on submitted token length, so compare cost is bounded. */
export const MAX_TOKEN_LENGTH = 512

/** Cap on session lifetime: 12 hours. */
export const SESSION_MAX_AGE = 60 * 60 * 12
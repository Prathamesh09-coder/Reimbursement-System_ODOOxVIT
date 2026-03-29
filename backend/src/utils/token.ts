import * as crypto from "crypto";

const TOKEN_SECRET = process.env.TOKEN_SECRET || "reimburse-integration-dev-secret";

type TokenPayload = {
  id: number;
  role: string;
  company_id: number;
  email: string;
};

const toBase64Url = (value: string): string => Buffer.from(value).toString("base64url");
const fromBase64Url = (value: string): string => Buffer.from(value, "base64url").toString("utf8");

export const signAuthToken = (payload: TokenPayload): string => {
  const body = toBase64Url(JSON.stringify(payload));
  const signature = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  return `${body}.${signature}`;
};

export const verifyAuthToken = (token: string): TokenPayload | null => {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(body).digest("base64url");
  if (expected !== signature) return null;

  try {
    const payload = JSON.parse(fromBase64Url(body)) as TokenPayload;
    if (!payload.id || !payload.company_id || !payload.role || !payload.email) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};

import { prisma } from "../../config/db";
import axios from "axios";
import { comparePassword, hashPassword, generatePassword } from "../../utils/password";
import { sendEmail } from "../../services/emailService";
import { signAuthToken } from "../../utils/token";

type CountryCurrencyApiResponse = Array<{
  name?: {
    common?: string;
    official?: string;
  };
  currencies?: Record<string, unknown>;
}>;

let countryCurrencyCache: Map<string, string> | null = null;

const buildCountryCurrencyCache = async (): Promise<Map<string, string>> => {
  if (countryCurrencyCache) return countryCurrencyCache;

  const map = new Map<string, string>();
  const response = await axios.get<CountryCurrencyApiResponse>(
    "https://restcountries.com/v3.1/all?fields=name,currencies"
  );

  response.data.forEach((country) => {
    const currencyCode = Object.keys(country.currencies || {})[0];
    if (!currencyCode) return;

    const commonName = country.name?.common?.trim().toLowerCase();
    const officialName = country.name?.official?.trim().toLowerCase();
    if (commonName) map.set(commonName, currencyCode);
    if (officialName) map.set(officialName, currencyCode);
  });

  countryCurrencyCache = map;
  return map;
};

const resolveCurrencyByCountry = async (country?: string): Promise<string> => {
  if (!country?.trim()) return "INR";

  try {
    const map = await buildCountryCurrencyCache();
    return map.get(country.trim().toLowerCase()) || "INR";
  } catch {
    return "INR";
  }
};

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
  country?: string;
  companyName?: string;
}) => {
  const { name, email, password, country, companyName } = data;

  // Get ADMIN role
  const adminRole = await prisma.role.findUnique({
    where: { name: "ADMIN" },
  });

  if (!adminRole) throw new Error("ADMIN role not found in system");

  const currency = await resolveCurrencyByCountry(country);

  const company = await prisma.company.create({
    data: {
      name: companyName || name,
      country: country || null,
      currency,
      is_active: true,
    }
  });

  const user = await prisma.user.create({
    data: {
      company_id: company.id,
      role_id: adminRole.id,
      name,
      email,
      password_hash: await hashPassword(password),
      must_change_password: false,
      is_active: true,
    }
  });

  await prisma.expenseCategory.createMany({
    data: [
      { company_id: company.id, name: "Meals & Entertainment" },
      { company_id: company.id, name: "Travel" },
      { company_id: company.id, name: "Office Supplies" },
      { company_id: company.id, name: "Software" },
      { company_id: company.id, name: "Transportation" },
      { company_id: company.id, name: "Accommodation" },
      { company_id: company.id, name: "Training" },
      { company_id: company.id, name: "Other" },
    ],
    skipDuplicates: true,
  });

  const token = signAuthToken({
    id: user.id,
    email: user.email,
    role: adminRole.name,
    company_id: company.id,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Welcome to ReimburseIQ",
      text: `Hi ${name}, your company ${company.name} has been created successfully. You can now submit and track reimbursements.`,
    });
  } catch {
    // Signup should not fail if mail provider is unavailable.
  }

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: adminRole.name,
      company_id: user.company_id,
      company_name: company.name,
      currency: company.currency,
    },
    company,
  };
};

export const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("User not found");

  const newPass = generatePassword();

  await prisma.passwordToken.create({
    data: {
      user_id: user.id,
      token: await hashPassword(newPass),
      type: "PASSWORD_RESET",
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }
  });

  await sendEmail({
    to: user.email,
    subject: "ReimburseIQ Password Reset Token",
    text: `Your password reset token: ${newPass}`,
  });

  return { message: "Password reset token sent to email" };
};

export const login = async (data: { email: string; password: string }) => {
  const { email, password } = data;
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true, company: true }
  });

  if (!user || !user.password_hash) {
    const error = new Error("Invalid credentials") as any;
    error.statusCode = 400;
    throw error;
  }

  const isValid = await comparePassword(password, user.password_hash);

  if (!isValid) {
    const error = new Error("Invalid credentials") as any;
    error.statusCode = 400;
    throw error;
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
    company_id: user.company_id,
    company_name: user.company.name,
    currency: user.company.currency,
  };

  const token = signAuthToken({
    id: user.id,
    email: user.email,
    role: user.role.name,
    company_id: user.company_id,
  });

  return {
    token,
    user: payload,
  };
};
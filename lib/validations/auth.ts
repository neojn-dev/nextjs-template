/**
 * AUTHENTICATION VALIDATION SCHEMAS
 * 
 * This module defines Zod schemas for all authentication-related forms.
 * 
 * WHY ZOD?
 * - Type-safe validation (TypeScript integration)
 * - Works on both client and server
 * - Provides detailed error messages
 * - Easy to compose and reuse
 * 
 * HOW IT WORKS:
 * 1. Define schema with validation rules
 * 2. Use schema in forms (React Hook Form)
 * 3. Use schema in API routes (server-side validation)
 * 4. TypeScript infers types from schema
 * 
 * BENEFITS:
 * - Single source of truth for validation rules
 * - Consistent validation across client and server
 * - Type safety prevents bugs
 * - Auto-generated TypeScript types
 * 
 * USAGE:
 * ```typescript
 * import { signupSchema } from '@/lib/validations/auth'
 * 
 * // In form:
 * const { register } = useForm({
 *   resolver: zodResolver(signupSchema)
 * })
 * 
 * // In API route:
 * const data = signupSchema.parse(request.body)
 * ```
 */

import { z } from "zod"

/**
 * COMMON PASSWORD VALIDATION RULES
 * 
 * Defines password requirements that are reused across multiple schemas.
 * 
 * REQUIREMENTS:
 * - Minimum 8 characters
 * - At least one lowercase letter (a-z)
 * - At least one uppercase letter (A-Z)
 * - At least one number (0-9)
 * - At least one special character (!@#$%^&* etc.)
 * 
 * REGEX EXPLANATION:
 * - /[a-z]/: Matches any lowercase letter
 * - /[A-Z]/: Matches any uppercase letter
 * - /\d/: Matches any digit (0-9)
 * - /[^a-zA-Z0-9]/: Matches any character that's NOT alphanumeric (special chars)
 * 
 * WHY THESE RULES?
 * - 8 characters: Industry standard minimum
 * - Mixed case: Increases password strength
 * - Numbers: Increases complexity
 * - Special chars: Maximum security
 * 
 * USAGE:
 * Reused in signupSchema and resetPasswordSchema
 */
const passwordValidation = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character")

/**
 * SIGN IN SCHEMA
 * 
 * Validates sign-in form data.
 * 
 * FIELDS:
 * - identifier: Username or email (flexible login)
 * - password: User's password
 * - rememberMe: Optional checkbox for extended session
 * 
 * VALIDATION RULES:
 * - identifier: Required, non-empty string
 * - password: Required, non-empty string
 * - rememberMe: Optional boolean
 * 
 * NOTE: Password validation is basic here (just required).
 * Actual password verification happens server-side with bcrypt.
 */
export const signinSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

/**
 * SIGN UP SCHEMA
 * 
 * Validates user registration form data.
 * 
 * FIELDS:
 * - firstName: User's first name
 * - lastName: User's last name
 * - username: Unique username
 * - email: Email address
 * - password: Secure password
 * - confirmPassword: Password confirmation
 * - agreeToTerms: Must be checked (required)
 * - marketingEmails: Optional marketing consent
 * 
 * VALIDATION RULES:
 * 
 * firstName/lastName:
 * - Required, 1-50 characters
 * - Only letters, spaces, hyphens, apostrophes
 * - Regex: /^[a-zA-Z\s'-]+$/
 * 
 * username:
 * - Required, 3-20 characters
 * - Only letters, numbers, underscores
 * - Regex: /^[a-zA-Z0-9_]+$/
 * 
 * email:
 * - Required, valid email format
 * - Uses Zod's built-in email validation
 * 
 * password:
 * - Uses passwordValidation schema (see above)
 * - All security requirements enforced
 * 
 * confirmPassword:
 * - Must match password (checked with refine)
 * 
 * agreeToTerms:
 * - Must be true (required)
 * - Custom validation with refine
 * 
 * CUSTOM VALIDATION (.refine):
 * - Checks that password === confirmPassword
 * - Sets error on confirmPassword field if mismatch
 */
export const signupSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: passwordValidation, // Reuse common password validation
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
  marketingEmails: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Attach error to confirmPassword field
})

/**
 * FORGOT PASSWORD SCHEMA
 * 
 * Validates forgot password form data.
 * 
 * FIELDS:
 * - email: Email address to send reset link to
 * 
 * VALIDATION RULES:
 * - email: Required, valid email format
 * 
 * SIMPLEST SCHEMA:
 * Only one field needed - user's email address.
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

/**
 * RESET PASSWORD SCHEMA
 * 
 * Validates password reset form data.
 * 
 * FIELDS:
 * - password: New password
 * - confirmPassword: Password confirmation
 * 
 * VALIDATION RULES:
 * - password: Uses passwordValidation schema (all requirements)
 * - confirmPassword: Must match password
 * 
 * CUSTOM VALIDATION (.refine):
 * - Checks that password === confirmPassword
 * - Sets error on confirmPassword field if mismatch
 */
export const resetPasswordSchema = z.object({
  password: passwordValidation, // Reuse common password validation
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Attach error to confirmPassword field
})

/**
 * VERIFICATION SCHEMA
 * 
 * Validates email verification token.
 * 
 * FIELDS:
 * - token: Verification token from email link
 * 
 * VALIDATION RULES:
 * - token: Required, non-empty string
 * 
 * NOTE: Token format validation happens server-side.
 * This just ensures token is provided.
 */
export const verifySchema = z.object({
  token: z.string().min(1, "Verification token is required"),
})

/**
 * TYPE EXPORTS
 * 
 * TypeScript types inferred from Zod schemas.
 * 
 * HOW IT WORKS:
 * - z.infer<typeof schema> extracts TypeScript type from Zod schema
 * - Type matches exactly what schema validates
 * - Used in React Hook Form for type safety
 * 
 * BENEFITS:
 * - Type safety: TypeScript knows exact shape of form data
 * - Auto-completion: IDE suggests available fields
 * - Type errors: Catches mismatches at compile time
 * 
 * USAGE:
 * ```typescript
 * import { SignupForm } from '@/lib/validations/auth'
 * 
 * const onSubmit = (data: SignupForm) => {
 *   // TypeScript knows data has firstName, lastName, etc.
 * }
 * ```
 */
export type SigninForm = z.infer<typeof signinSchema>
export type SignupForm = z.infer<typeof signupSchema>
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>
export type VerifyForm = z.infer<typeof verifySchema>

/**
 * PASSWORD REQUIREMENTS FOR UI DISPLAY
 * 
 * Array of password requirements used to show real-time feedback in forms.
 * 
 * STRUCTURE:
 * - id: Unique identifier for requirement
 * - label: Human-readable label (shown to user)
 * - regex: Regular expression to test password against
 * 
 * USAGE:
 * Used in signup and reset-password forms to show:
 * - ✅ Green checkmark when requirement is met
 * - ❌ Gray X when requirement is not met
 * 
 * EXAMPLE:
 * ```typescript
 * passwordRequirements.map(req => {
 *   const isMet = req.regex.test(password)
 *   return <div>{isMet ? '✅' : '❌'} {req.label}</div>
 * })
 * ```
 * 
 * REGEX EXPLANATIONS:
 * - /.{8,}/: At least 8 characters (any character)
 * - /[a-z]/: Contains at least one lowercase letter
 * - /[A-Z]/: Contains at least one uppercase letter
 * - /\d/: Contains at least one digit
 * - /[^a-zA-Z0-9]/: Contains at least one special character (not alphanumeric)
 */
export const passwordRequirements = [
  { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
  { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
  { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
  { id: "number", label: "One number", regex: /\d/ },
  { id: "special", label: "One special character", regex: /[^a-zA-Z0-9]/ },
]

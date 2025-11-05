/**
 * TEST EMAIL API ROUTE
 * 
 * This API route provides a testing endpoint for email configuration.
 * 
 * ENDPOINT: POST /api/test-email
 * 
 * FLOW OVERVIEW:
 * 1. Extract email parameters from request body
 * 2. Create SMTP transporter with environment variables
 * 3. Verify SMTP connection
 * 4. Send test email
 * 5. Return success response with message ID
 * 
 * USE CASE:
 * - Testing email configuration during setup
 * - Verifying SMTP credentials
 * - Debugging email delivery issues
 * - Development/testing purposes
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - SMTP_HOST: SMTP server hostname
 * - SMTP_PORT: SMTP server port (default: 587)
 * - SMTP_SECURE: Use TLS/SSL (true/false)
 * - SMTP_USER: SMTP username
 * - SMTP_PASS: SMTP password
 * - FROM_EMAIL: Sender email address
 * 
 * REQUEST BODY:
 * ```json
 * {
 *   "to": "recipient@example.com",
 *   "subject": "Test Email Subject",
 *   "message": "Test email message body"
 * }
 * ```
 * 
 * ALL PARAMETERS ARE OPTIONAL:
 * - to: Recipient email (default: "mail.gyansh@gmail.com")
 * - subject: Email subject (default: "Test Email from NextJS Template")
 * - message: Email message (default: "This is a test email...")
 * 
 * RESPONSE (SUCCESS):
 * ```json
 * {
 *   "success": true,
 *   "message": "Test email sent successfully!",
 *   "messageId": "message-id-from-smtp-server"
 * }
 * ```
 * 
 * RESPONSE (ERROR):
 * ```json
 * {
 *   "success": false,
 *   "error": "SMTP Authentication failed",
 *   "details": "Check your SMTP_USER and SMTP_PASS in .env file",
 *   "code": "EAUTH"
 * }
 * ```
 * 
 * ERROR CODES:
 * - EAUTH: SMTP authentication failed (invalid credentials)
 * - ECONNECTION: SMTP connection failed (host/port issues)
 * - Other: Generic SMTP errors
 * 
 * SECURITY:
 * - No authentication required (for testing purposes)
 * - Should be disabled in production
 * - Only sends emails, doesn't expose sensitive data
 * 
 * NOTE:
 * This endpoint is for development/testing only.
 * Consider disabling or adding authentication in production.
 */

import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

/**
 * POST HANDLER
 * 
 * Sends a test email using configured SMTP settings.
 * 
 * PROCESS:
 * 1. Parse request body
 * 2. Create SMTP transporter
 * 3. Verify connection
 * 4. Send email
 * 5. Return result
 * 
 * @param request - Next.js request object containing email parameters
 * @returns JSON response with success status and message ID or error details
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * STEP 1: EXTRACT EMAIL PARAMETERS
     * 
     * Gets email parameters from request body.
     * All parameters are optional with defaults.
     * 
     * PARAMETERS:
     * - to: Recipient email address
     * - subject: Email subject line
     * - message: Email message body
     */
    const { to, subject, message } = await request.json()
    
    /**
     * STEP 2: CREATE SMTP TRANSPORTER
     * 
     * Creates nodemailer transporter with SMTP configuration.
     * 
     * CONFIGURATION:
     * - host: SMTP server hostname (from environment)
     * - port: SMTP server port (default: 587)
     * - secure: Use TLS/SSL (true for port 465, false for others)
     * - auth: SMTP authentication credentials
     * 
     * NOTE: Configuration comes from environment variables.
     * Make sure .env file is properly configured.
     */
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    /**
     * STEP 3: VERIFY SMTP CONNECTION
     * 
     * Tests SMTP connection and credentials.
     * 
     * WHAT IT DOES:
     * - Connects to SMTP server
     * - Verifies authentication
     * - Logs success message
     * 
     * THROWS ERROR IF:
     * - Cannot connect to SMTP server
     * - Authentication fails
     * - Configuration is invalid
     */
    await transporter.verify()
    console.log("✅ SMTP connection verified")

    /**
     * STEP 4: SEND TEST EMAIL
     * 
     * Sends email with test content.
     * 
     * EMAIL CONTENT:
     * - from: Sender email (from environment, with display name)
     * - to: Recipient email (from request or default)
     * - subject: Email subject (from request or default)
     * - text: Plain text version
     * - html: HTML version
     * 
     * DEFAULTS:
     * - to: "mail.gyansh@gmail.com" (if not provided)
     * - subject: "Test Email from NextJS Template"
     * - message: "This is a test email to verify..."
     */
    const info = await transporter.sendMail({
      from: `"NextJS Template" <${process.env.FROM_EMAIL}>`,
      to: to || "mail.gyansh@gmail.com",
      subject: subject || "Test Email from NextJS Template",
      text: message || "This is a test email to verify the email configuration is working.",
      html: `<h1>Test Email</h1><p>${message || "This is a test email to verify the email configuration is working."}</p>`,
    })

    /**
     * STEP 5: RETURN SUCCESS RESPONSE
     * 
     * Returns success status with message ID.
     * Message ID comes from SMTP server.
     */
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
    })

  } catch (error: any) {
    /**
     * ERROR HANDLING
     * 
     * Catches SMTP errors and provides helpful error messages.
     * 
     * ERROR TYPES:
     * - EAUTH: Authentication failed (wrong credentials)
     * - ECONNECTION: Connection failed (wrong host/port)
     * - Other: Generic SMTP errors
     */
    console.error("Test email failed:", error)
    
    /**
     * STEP 6A: DETERMINE ERROR MESSAGE
     * 
     * Provides specific error messages based on error code.
     * Helps users debug email configuration issues.
     */
    let errorMessage = "Failed to send test email"
    let errorDetails = error.message
    
    /**
     * AUTHENTICATION ERROR
     * 
     * SMTP authentication failed.
     * Usually means wrong username or password.
     */
    if (error.code === "EAUTH") {
      errorMessage = "SMTP Authentication failed"
      errorDetails = "Check your SMTP_USER and SMTP_PASS in .env file"
    } 
    /**
     * CONNECTION ERROR
     * 
     * Cannot connect to SMTP server.
     * Usually means wrong host or port.
     */
    else if (error.code === "ECONNECTION") {
      errorMessage = "SMTP Connection failed"
      errorDetails = "Check your SMTP_HOST and SMTP_PORT in .env file"
    }

    /**
     * STEP 6B: RETURN ERROR RESPONSE
     * 
     * Returns detailed error information for debugging.
     * Includes error code for programmatic handling.
     */
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
        code: error.code,
      },
      { status: 500 }
    )
  }
}

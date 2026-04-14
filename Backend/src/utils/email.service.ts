import nodemailer from 'nodemailer';
import { env } from '../config/env';

const frontendBaseUrl = String(env.FRONTEND_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
const frontendHostLabel = (() => {
    try {
        return new URL(frontendBaseUrl).host;
    } catch {
        return frontendBaseUrl;
    }
})();
const studentDashboardLink = `${frontendBaseUrl}/student-dashboard`;
const institutionDashboardLink = `${frontendBaseUrl}/institution-dashboard`;
const languageTrainingLink = `${frontendBaseUrl}/language-training`;
const skillTrainingLink = `${frontendBaseUrl}/skill-training`;

const formatCurrencyAmount = (amount?: number, currency: string = 'INR') => {
    if (typeof amount !== 'number' || !Number.isFinite(amount)) {
        return 'Not available';
    }

    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
};

const formatDateTime = (value?: Date | string) => {
    if (!value) {
        return 'Not available';
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return 'Not available';
    }

    return parsedDate.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

/* ━━━ Skyline Brand Color Palette ━━━
 * These hex values are extracted directly from the website's design system
 * defined in Frontend/sprachweg/src/index.css under the @theme block.
 *
 * brand-black       #1C1C1A   — Primary dark / email header background
 * brand-red         #C8232B   — Accent red (alerts, urgent)
 * brand-gold        #E8A020   — Primary gold accent / headings in dark bg
 * brand-gold-hover  #C8860E   — Darker gold for text on light backgrounds
 * brand-olive       #6E6E50   — Muted body text
 * brand-olive-light #A0A07A   — Secondary text
 * brand-olive-dark  #4A4A34   — Strong muted text / sub-headings
 * brand-off-white   #F7F6F2   — Email body / page background
 * brand-surface     #EEEEE8   — Info card background / borders
 */

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.EMAIL_HOST,
            port: env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: env.EMAIL_USER,
                pass: env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    private getProgramEmailTemplate(options: {
        name: string;
        title: string;
        paragraphs: string[];
        infoRows?: Array<{ label: string; value: string }>;
        actionButton?: { label: string; href: string };
    }): string {
        const infoSection = options.infoRows?.length
            ? `
                <div class="info-card">
                    ${options.infoRows
                .map(
                    (row) => `
                                <div class="info-row">
                                    <span class="info-label">${row.label}</span>
                                    <span class="info-value">${row.value}</span>
                                </div>
                            `
                )
                .join('')}
                </div>
            `
            : '';

        const actionButton = options.actionButton
            ? `
                <div style="margin-top: 26px;">
                    <a href="${options.actionButton.href}" class="action-button">${options.actionButton.label}</a>
                </div>
            `
            : '';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #4A4A34;
                    margin: 0;
                    padding: 0;
                    background-color: #F7F6F2;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                }
                .header {
                    background-color: #1C1C1A;
                    color: #ffffff;
                    padding: 36px 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: #E8A020;
                    letter-spacing: 0.02em;
                }
                .header-divider {
                    width: 48px;
                    height: 3px;
                    background-color: #E8A020;
                    margin: 14px auto 0;
                    border-radius: 2px;
                }
                .content {
                    padding: 40px 30px;
                    background-color: #ffffff;
                }
                .welcome-text {
                    font-size: 18px;
                    color: #1C1C1A;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .message-body {
                    color: #6E6E50;
                    font-size: 15px;
                    line-height: 1.7;
                }
                .message-body strong {
                    color: #1C1C1A;
                }
                .info-card {
                    margin: 24px 0;
                    padding: 18px 20px;
                    border: 1px solid #EEEEE8;
                    border-radius: 14px;
                    background-color: #F7F6F2;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 10px 0;
                    border-bottom: 1px solid #EEEEE8;
                }
                .info-row:last-child {
                    border-bottom: 0;
                }
                .info-label {
                    color: #6E6E50;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .info-value {
                    color: #1C1C1A;
                    font-size: 14px;
                    font-weight: 700;
                    text-align: right;
                }
                .action-button {
                    display: inline-block;
                    background-color: #E8A020;
                    color: #1C1C1A !important;
                    padding: 14px 28px;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 14px;
                    letter-spacing: 0.02em;
                }
                .footer {
                    background-color: #F7F6F2;
                    padding: 24px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #A0A07A;
                    border-top: 1px solid #EEEEE8;
                }
                .footer a {
                    color: #C8860E;
                    text-decoration: none;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Skyline Skilling &amp; Training Center<br>Training &amp; Skilling Program</h1>
                    <div class="header-divider"></div>
                </div>
                <div class="content">
                    <div class="welcome-text">Dear ${options.name},</div>
                    <div class="message-body">
                        <p><strong>${options.title}</strong></p>
                        ${options.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}
                        ${infoSection}
                        ${actionButton}
                        <p style="margin-top: 32px; border-top: 1px solid #EEEEE8; padding-top: 20px;">
                            Warm regards,<br>
                            <strong style="color: #1C1C1A;">Skyline Skilling &amp; Training Center Team</strong>
                        </p>
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Skyline Skilling &amp; Training Center. All rights reserved.<br>
                    <a href="https://www.skylinetechnologies.in">www.skylinetechnologies.in</a>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    private getOtpTemplate(name: string, otp: string, purpose: string): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #4A4A34;
                    margin: 0;
                    padding: 0;
                    background-color: #F7F6F2;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                }
                .header {
                    background-color: #1C1C1A;
                    color: #ffffff;
                    padding: 36px 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: #E8A020;
                    letter-spacing: 0.02em;
                }
                .header-divider {
                    width: 48px;
                    height: 3px;
                    background-color: #E8A020;
                    margin: 14px auto 0;
                    border-radius: 2px;
                }
                .content {
                    padding: 40px 30px;
                    background-color: #ffffff;
                }
                .welcome-text {
                    font-size: 18px;
                    color: #1C1C1A;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .message-body {
                    color: #6E6E50;
                    font-size: 15px;
                    line-height: 1.7;
                }
                .message-body strong {
                    color: #1C1C1A;
                }
                .otp-box {
                    background-color: #F7F6F2;
                    border: 2px dashed #E8A020;
                    color: #1C1C1A;
                    font-size: 28px;
                    font-weight: bold;
                    text-align: center;
                    padding: 18px;
                    margin: 24px 0;
                    letter-spacing: 8px;
                    border-radius: 14px;
                }
                .footer {
                    background-color: #F7F6F2;
                    padding: 24px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #A0A07A;
                    border-top: 1px solid #EEEEE8;
                }
                .footer a {
                    color: #C8860E;
                    text-decoration: none;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Skyline Skilling &amp; Training Center</h1>
                    <div class="header-divider"></div>
                </div>
                <div class="content">
                    <div class="welcome-text">Dear ${name},</div>
                    
                    <div class="message-body">
                        <p>Welcome to the <strong>Skyline Skilling &amp; Training Center</strong>.</p>
                        
                        <p>We are delighted to have you with us. As requested, here is your One-Time Password (OTP) for <strong>${purpose}</strong>.</p>
                        
                        <div class="otp-box">${otp}</div>
                        
                        <p>This OTP is valid for <strong>3 minutes</strong>. Please do not share this code with anyone.</p>
                        
                        <p>All further information, updates, and important announcements will be shared through your registered login email ID. Kindly check your email regularly to stay informed.</p>

                        <p style="margin-top: 30px;">Once again, thank you for choosing Skyline Skilling &amp; Training Center as your skilling partner.</p>
                        
                        <p style="margin-top: 40px; border-top: 1px solid #EEEEE8; padding-top: 20px;">
                            Warm regards,<br>
                            <strong style="color: #1C1C1A;">Skyline Skilling &amp; Training Center Team</strong>
                        </p>
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Skyline Skilling &amp; Training Center. All rights reserved.<br>
                    <a href="${frontendBaseUrl}">${frontendHostLabel}</a>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    public async sendOtp(to: string, otp: string, name: string = 'Participant', purpose: string = 'Verification'): Promise<void> {
        const htmlContent = this.getOtpTemplate(name, otp, purpose);

        const mailOptions = {
            from: `"Skyline Skilling & Training Center" <${env.EMAIL_USER}>`,
            to,
            subject: `${purpose} OTP - Skyline Skilling & Training Center`,
            text: `Dear ${name},\n\nYour OTP for ${purpose} is: ${otp}. It is valid for 3 minutes.\n\nWarm regards,\nSkyline Skilling & Training Center Team`,
            html: htmlContent,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Email service failed');
        }
    }



    public async sendEnrollmentEmail(
        to: string,
        name: string,
        courseTitle: string,
        status: 'PENDING' | 'APPROVED',
        paymentDetails?: {
            amount?: number;
            currency?: string;
            paymentStatus?: string;
            paymentMethod?: string;
            transactionId?: string;
            paymentId?: string;
            bankReferenceNumber?: string;
            paidAt?: Date | string;
        },
        institutionName?: string
    ): Promise<void> {

        const isApproved = status === 'APPROVED';
        const normalizedInstitutionName = String(institutionName || '').trim();
        const hasPaymentDetails = !!(
            paymentDetails?.amount !== undefined
            || paymentDetails?.paymentMethod
            || paymentDetails?.transactionId
            || paymentDetails?.paymentId
        );

        if (hasPaymentDetails) {
            const paymentRows = [
                { label: 'Payment Status', value: paymentDetails?.paymentStatus || 'Paid' },
                { label: 'Amount', value: formatCurrencyAmount(paymentDetails?.amount, paymentDetails?.currency || 'INR') },
                { label: 'Payment Method', value: paymentDetails?.paymentMethod || 'Not available' },
                { label: 'Transaction ID', value: paymentDetails?.transactionId || 'Not available' },
                { label: 'Payment ID', value: paymentDetails?.paymentId || 'Not available' },
                { label: 'Bank Reference Number', value: paymentDetails?.bankReferenceNumber || 'Not available' },
                { label: 'Paid At', value: formatDateTime(paymentDetails?.paidAt) },
            ];

            const subject = isApproved
                ? `Enrollment Approved and Payment Confirmed - ${courseTitle}`
                : `Enrollment Request and Payment Received - ${courseTitle}`;

            const html = this.getProgramEmailTemplate({
                name,
                title: isApproved
                    ? 'Your enrollment has been approved and your payment is confirmed.'
                    : 'Your enrollment request and payment have been received successfully.',
                paragraphs: isApproved
                    ? [
                        normalizedInstitutionName
                            ? `We are pleased to confirm that your enrollment under <strong>${normalizedInstitutionName}</strong> for <strong>${courseTitle}</strong> has been approved.`
                            : `We are pleased to confirm that your enrollment for <strong>${courseTitle}</strong> has been approved.`,
                        'Your payment has been recorded successfully, and the transaction details are included below for your records.',
                        'You can now continue through your student dashboard and keep checking your registered email for class schedules and updates from our admissions team.',
                    ]
                    : [
                        `We have successfully received your enrollment request for <strong>${courseTitle}</strong>.`,
                        'Your payment has been confirmed successfully, and the transaction details are included below for your records.',
                        'Our admissions team will review your request and contact you through your registered email with the next updates.',
                    ],
                infoRows: [
                    { label: 'Course', value: courseTitle },
                    ...(isApproved && normalizedInstitutionName
                        ? [{ label: 'Institution', value: normalizedInstitutionName }]
                        : []),
                    { label: 'Status', value: isApproved ? 'Approved' : 'Pending Approval' },
                    ...paymentRows,
                ],
                actionButton: {
                    label: 'Open Student Dashboard',
                    href: studentDashboardLink,
                },
            });

            const mailOptions = {
                from: `"Skyline Skilling & Training Center" <${env.EMAIL_USER}>`,
                to,
                subject,
                html,
                text: isApproved
                    ? `Dear ${name},\n\nYour enrollment${normalizedInstitutionName ? ` under ${normalizedInstitutionName}` : ''} for ${courseTitle} has been approved and your payment is confirmed.\n${normalizedInstitutionName ? `Institution: ${normalizedInstitutionName}\n` : ''}Status: Approved\nPayment Status: ${paymentDetails?.paymentStatus || 'Paid'}\nAmount: ${formatCurrencyAmount(paymentDetails?.amount, paymentDetails?.currency || 'INR')}\nPayment Method: ${paymentDetails?.paymentMethod || 'Not available'}\nTransaction ID: ${paymentDetails?.transactionId || 'Not available'}\nPayment ID: ${paymentDetails?.paymentId || 'Not available'}\nBank Reference Number: ${paymentDetails?.bankReferenceNumber || 'Not available'}\nPaid At: ${formatDateTime(paymentDetails?.paidAt)}\n\nStudent Dashboard: ${studentDashboardLink}\n\nWarm regards,\nSkyline Skilling & Training Center Team`
                    : `Dear ${name},\n\nWe have received your enrollment request and payment for ${courseTitle} successfully.\nStatus: Pending Approval\nPayment Status: ${paymentDetails?.paymentStatus || 'Paid'}\nAmount: ${formatCurrencyAmount(paymentDetails?.amount, paymentDetails?.currency || 'INR')}\nPayment Method: ${paymentDetails?.paymentMethod || 'Not available'}\nTransaction ID: ${paymentDetails?.transactionId || 'Not available'}\nPayment ID: ${paymentDetails?.paymentId || 'Not available'}\nBank Reference Number: ${paymentDetails?.bankReferenceNumber || 'Not available'}\nPaid At: ${formatDateTime(paymentDetails?.paidAt)}\n\nOur admissions team will contact you with the next updates.\nStudent Dashboard: ${studentDashboardLink}\n\nWarm regards,\nSkyline Skilling & Training Center Team`,
            };

            try {
                await this.transporter.sendMail(mailOptions);
            } catch (error) {
                console.error('Error sending enrollment payment email:', error);
            }

            return;
        }

        const subject = isApproved
            ? `Enrollment Approved - ${courseTitle}`
            : `Enrollment Request Received - ${courseTitle}`;

        // Updated content based on user request - used for both pending/approved for now as general welcome, 
        // but keeping the logic if approved specific action is needed.
        // The user provided text is a "Welcome" message.

        const actionButton = isApproved
            ? `
            <a href="${studentDashboardLink}" style="display:inline-block; background-color:#E8A020; color:#1C1C1A; padding:14px 28px; text-decoration:none; border-radius:12px; font-weight:bold; margin-top:20px; font-size:14px; letter-spacing:0.02em;">
                Access Student Dashboard
            </a>
            `
            : '';
        const institutionApprovalNotice = isApproved && normalizedInstitutionName
            ? `<p>Your enrollment has been approved under <span class="highlight">${normalizedInstitutionName}</span>.</p>`
            : '';

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #4A4A34;
                    margin: 0;
                    padding: 0;
                    background-color: #F7F6F2;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                }
                .header {
                    background-color: #1C1C1A;
                    color: #ffffff;
                    padding: 36px 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: #E8A020;
                    letter-spacing: 0.02em;
                }
                .header-divider {
                    width: 48px;
                    height: 3px;
                    background-color: #E8A020;
                    margin: 14px auto 0;
                    border-radius: 2px;
                }
                .content {
                    padding: 40px 30px;
                    background-color: #ffffff;
                }
                .welcome-text {
                    font-size: 18px;
                    color: #1C1C1A;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .message-body {
                    color: #6E6E50;
                    font-size: 15px;
                    line-height: 1.7;
                }
                .message-body strong {
                    color: #1C1C1A;
                }
                .footer {
                    background-color: #F7F6F2;
                    padding: 24px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #A0A07A;
                    border-top: 1px solid #EEEEE8;
                }
                .footer a {
                    color: #C8860E;
                    text-decoration: none;
                    font-weight: 600;
                }
                .highlight {
                    color: #1C1C1A;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Skyline Skilling &amp; Training Center</h1>
                    <div class="header-divider"></div>
                </div>
                <div class="content">
                    <div class="welcome-text">Dear ${name},</div>
                    
                    <div class="message-body">
                        <p>Welcome to the <span class="highlight">Skyline Skilling &amp; Training Center</span>.</p>
                        ${institutionApprovalNotice}
                        
                        <p>We are delighted to have you with us. Our program is designed and delivered by industry-specific professional trainers, ensuring practical knowledge and real-world skill development.</p>
                        
                        <p>All further information, updates, and important announcements will be shared through your registered login email ID. Kindly check your email regularly to stay informed.</p>
                        
                        ${actionButton}

                        <p style="margin-top: 30px;">Once again, thank you for choosing Skyline Skilling &amp; Training Center as your skilling partner. We wish you a successful and enriching learning journey with us.</p>
                        
                        <p style="margin-top: 40px; border-top: 1px solid #EEEEE8; padding-top: 20px;">
                            Warm regards,<br>
                            <strong style="color: #1C1C1A;">Skyline Skilling &amp; Training Center Team</strong>
                        </p>
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Skyline Skilling &amp; Training Center. All rights reserved.<br>
                    <a href="https://www.skylinetechnologies.in">www.skylinetechnologies.in</a>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `"Skyline Skilling & Training Center" <${env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
            text: `Dear ${name},\n\nWelcome to Skyline Skilling & Training Center.\n${isApproved && normalizedInstitutionName ? `\nYour enrollment has been approved under ${normalizedInstitutionName}.\n` : '\n'}\nWe are delighted to have you with us. Our program is designed and delivered by industry-specific professional trainers, ensuring practical knowledge and real-world skill development.\n\nAll further information, updates, and important announcements will be shared through your registered login email ID. Kindly check your email regularly to stay informed.\n\nOnce again, thank you for choosing Skyline Skilling & Training Center as your skilling partner. We wish you a successful and enriching learning journey with us.\n\nWarm regards,\nSkyline Skilling & Training Center Team`
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending enrollment email:', error);
        }
    }

    public async sendInstitutionSubmissionDecisionEmail(params: {
        to: string;
        institutionName: string;
        status: 'APPROVED' | 'REJECTED';
        courseTitle: string;
        levelName: string;
        studentCount: number;
    }): Promise<boolean> {
        const isApproved = params.status === 'APPROVED';
        const subject = isApproved
            ? `Institution Enrollment Request Approved - ${params.courseTitle} ${params.levelName}`
            : `Institution Enrollment Request Rejected - ${params.courseTitle} ${params.levelName}`;

        const html = this.getProgramEmailTemplate({
            name: params.institutionName,
            title: isApproved
                ? 'Your institution enrollment request has been approved.'
                : 'Your institution enrollment request has been rejected.',
            paragraphs: isApproved
                ? [
                    `We have approved your institution submission for <strong>${params.courseTitle} - ${params.levelName}</strong>.`,
                    `All ${params.studentCount} student account(s) in this request are now active and enrolled in the selected course level.`,
                    'Please coordinate directly with your students to share the credentials you created for them.',
                ]
                : [
                    `We reviewed your institution submission for <strong>${params.courseTitle} - ${params.levelName}</strong>.`,
                    'This request was not approved, so no student accounts or course enrollments were created from this submission.',
                    'Please review your submission and create a new request if you would like to try again.',
                ],
            infoRows: [
                { label: 'Language', value: 'German' },
                { label: 'Course', value: params.courseTitle },
                { label: 'Level', value: params.levelName },
                { label: 'Students', value: String(params.studentCount) },
                { label: 'Decision', value: isApproved ? 'Approved' : 'Rejected' },
            ],
            actionButton: {
                label: 'Open Institution Portal',
                href: institutionDashboardLink,
            },
        });

        try {
            await this.transporter.sendMail({
                from: `"Skyline Skilling & Training Center" <${env.EMAIL_USER}>`,
                to: params.to,
                subject,
                html,
                text: `Dear ${params.institutionName},\n\nYour institution request for ${params.courseTitle} - ${params.levelName} has been ${isApproved ? 'approved' : 'rejected'}.\nStudents in request: ${params.studentCount}\n\nInstitution Portal: ${institutionDashboardLink}\n\nWarm regards,\nSkyline Skilling & Training Center Team`,
            });
            return true;
        } catch (error) {
            console.error('Error sending institution decision email:', error);
            return false;
        }
    }

    public async sendInstitutionStudentWelcomeEmail(params: {
        to: string;
        studentName: string;
        courseTitle: string;
        levelName: string;
        institutionName?: string;
        institutionLogo?: string;
        institutionTagline?: string;
    }): Promise<boolean> {
        const normalizedInstitutionName = String(params.institutionName || '').trim();
        const displayName = normalizedInstitutionName || 'Your Institution';
        const displayCourse = `${params.courseTitle} – ${params.levelName}`;
        const logoUrl = String(params.institutionLogo || '').trim();
        const tagline = String(params.institutionTagline || '').trim();

        const logoSection = logoUrl
            ? `<img src="${logoUrl}" alt="${displayName}" style="max-height:52px; max-width:180px; margin-bottom:14px; border-radius:8px;" /><br>`
            : '';

        const taglineSection = tagline
            ? `<p style="margin:8px 0 0; font-size:13px; color:#A0A07A; letter-spacing:0.04em;">${tagline}</p>`
            : '';

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #4A4A34;
                    margin: 0;
                    padding: 0;
                    background-color: #F7F6F2;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                }
                .header {
                    background-color: #1C1C1A;
                    color: #ffffff;
                    padding: 36px 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: #E8A020;
                    letter-spacing: 0.02em;
                }
                .header-divider {
                    width: 48px;
                    height: 3px;
                    background-color: #E8A020;
                    margin: 14px auto 0;
                    border-radius: 2px;
                }
                .content {
                    padding: 40px 30px;
                    background-color: #ffffff;
                }
                .welcome-text {
                    font-size: 18px;
                    color: #1C1C1A;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .message-body {
                    color: #6E6E50;
                    font-size: 15px;
                    line-height: 1.7;
                }
                .message-body strong {
                    color: #1C1C1A;
                }
                .info-card {
                    margin: 24px 0;
                    padding: 18px 20px;
                    border: 1px solid #EEEEE8;
                    border-radius: 14px;
                    background-color: #F7F6F2;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    padding: 10px 0;
                    border-bottom: 1px solid #EEEEE8;
                }
                .info-row:last-child {
                    border-bottom: 0;
                }
                .info-label {
                    color: #6E6E50;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .info-value {
                    color: #1C1C1A;
                    font-size: 14px;
                    font-weight: 700;
                    text-align: right;
                }
                .action-button {
                    display: inline-block;
                    background-color: #E8A020;
                    color: #1C1C1A !important;
                    padding: 14px 28px;
                    text-decoration: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 14px;
                    letter-spacing: 0.02em;
                }
                .footer {
                    background-color: #F7F6F2;
                    padding: 24px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #A0A07A;
                    border-top: 1px solid #EEEEE8;
                }
                .footer a {
                    color: #C8860E;
                    text-decoration: none;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    ${logoSection}
                    <h1>${displayName}</h1>
                    ${taglineSection}
                    <div class="header-divider"></div>
                </div>
                <div class="content">
                    <div class="welcome-text">Dear ${params.studentName},</div>

                    <div class="message-body">
                        <p><strong>Your student account is ready.</strong></p>

                        <p>We are pleased to inform you that <strong>${displayName}</strong> has enrolled you in <strong>${displayCourse}</strong>. Your student account has been created and is ready to use.</p>

                        <p>Your login credentials have been set up by ${displayName}. If you have not received your password, please contact your institution coordinator directly for assistance.</p>

                        <div class="info-card">
                            <div class="info-row">
                                <span class="info-label">Institution</span>
                                <span class="info-value">${displayName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Course</span>
                                <span class="info-value">${params.courseTitle}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Level</span>
                                <span class="info-value">${params.levelName}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">Login Email</span>
                                <span class="info-value">${params.to}</span>
                            </div>
                        </div>

                        <p>Once you have your credentials, sign in to the student portal below to access your course materials, schedules, and progress tracking.</p>

                        <div style="margin-top: 26px;">
                            <a href="${studentDashboardLink}" class="action-button">Open Student Portal</a>
                        </div>

                        <p style="margin-top: 32px; border-top: 1px solid #EEEEE8; padding-top: 20px;">
                            Warm regards,<br>
                            <strong style="color: #1C1C1A;">${displayName}</strong>
                        </p>
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} ${displayName}. All rights reserved.<br>
                    Powered by <a href="https://www.skylinetechnologies.in">Skyline Skilling &amp; Training Center</a>
                </div>
            </div>
        </body>
        </html>
        `;

        try {
            await this.transporter.sendMail({
                from: `"${displayName}" <${env.EMAIL_USER}>`,
                to: params.to,
                subject: `Welcome to ${displayCourse} – ${displayName}`,
                html,
                text: `Dear ${params.studentName},\n\nWe are pleased to inform you that ${displayName} has enrolled you in ${displayCourse}.\n\nYour student account has been created and is ready to use. Your login credentials have been set up by ${displayName}. If you have not received your password, please contact your institution coordinator directly.\n\nInstitution: ${displayName}\nCourse: ${params.courseTitle}\nLevel: ${params.levelName}\nLogin Email: ${params.to}\n\nSign in to the student portal: ${studentDashboardLink}\n\nWarm regards,\n${displayName}\n\nPowered by Skyline Skilling & Training Center`,
            });
            return true;
        } catch (error) {
            console.error('Error sending institution student welcome email:', error);
            return false;
        }
    }

    public async sendTrainingPaymentFailureEmail(params: {
        to: string;
        name: string;
        courseTitle: string;
        trainingType: 'language' | 'skill';
        levelName?: string;
        amount?: number;
        currency?: string;
        paymentStatus?: string;
        paymentMethod?: string;
        failureReason?: string;
        status?: 'failed' | 'cancelled';
        retryUrl?: string;
    }): Promise<boolean> {
        const fallbackRetryUrl = params.trainingType === 'language'
            ? languageTrainingLink
            : skillTrainingLink;
        const retryUrl = params.retryUrl || fallbackRetryUrl;
        const normalizedStatus = String(params.status ?? '').trim().toLowerCase();
        const isCancelled = normalizedStatus === 'cancelled';
        const trainingTypeLabel = params.trainingType === 'language' ? 'Language Training' : 'Skill Training';
        const displayCourseTitle = params.levelName
            ? `${params.courseTitle} - ${params.levelName}`
            : params.courseTitle;
        const amountLabel = formatCurrencyAmount(params.amount, params.currency || 'INR');
        const subject = isCancelled
            ? `Training Payment Not Completed - ${displayCourseTitle}`
            : `Training Payment Failed - ${displayCourseTitle}`;

        const html = this.getProgramEmailTemplate({
            name: params.name,
            title: isCancelled
                ? 'Your training checkout was not completed.'
                : 'We could not complete your training payment.',
            paragraphs: [
                `We were unable to complete the payment step for <strong>${displayCourseTitle}</strong>.`,
                isCancelled
                    ? 'The checkout was closed before payment could be completed. You can return to the course page and try again whenever you are ready.'
                    : 'Your enrollment request was not submitted because the payment did not complete successfully. You can try the checkout again from the course page.',
                'If the amount was debited from your account but the enrollment request was not submitted, please contact our support team with your payment details so we can assist you quickly.',
            ],
            infoRows: [
                { label: 'Training', value: displayCourseTitle },
                { label: 'Program Type', value: trainingTypeLabel },
                { label: 'Amount', value: amountLabel },
                { label: 'Status', value: isCancelled ? 'Not Completed' : 'Payment Failed' },
                { label: 'Gateway Status', value: params.paymentStatus || 'Not available' },
                { label: 'Payment Method', value: params.paymentMethod || 'Not available' },
                { label: 'Reason', value: params.failureReason || 'Payment could not be completed.' },
            ],
            actionButton: {
                label: 'Try Again',
                href: retryUrl,
            },
        });

        const mailOptions = {
            from: `"Skyline Skilling & Training Center" <${env.EMAIL_USER}>`,
            to: params.to,
            subject,
            html,
            text: `Dear ${params.name},\n\nWe were unable to complete the payment step for ${displayCourseTitle}.\nProgram Type: ${trainingTypeLabel}\nAmount: ${amountLabel}\nStatus: ${isCancelled ? 'Not Completed' : 'Payment Failed'}\nGateway Status: ${params.paymentStatus || 'Not available'}\nPayment Method: ${params.paymentMethod || 'Not available'}\nReason: ${params.failureReason || 'Payment could not be completed.'}\n\nNo enrollment request was submitted. Please try again from the course page.\nStudent Dashboard: ${studentDashboardLink}\nRetry Link: ${retryUrl}\n\nWarm regards,\nSkyline Skilling & Training Center Team`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error('Error sending training payment failure email:', error);
            return false;
        }
    }

    public async forwardContactMessage(data: { name: string; email: string; subject: string; message: string }): Promise<void> {
        const to = env.EMAIL_USER || "info@skylinetechnologies.in";
        const subject = `New Contact Form Submission: ${data.subject}`;

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #4A4A34;
                    margin: 0;
                    padding: 0;
                    background-color: #F7F6F2;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                }
                .header {
                    background-color: #1C1C1A;
                    color: #ffffff;
                    padding: 30px;
                    text-align: center;
                }
                .header h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #E8A020;
                    letter-spacing: 0.02em;
                }
                .header-divider {
                    width: 48px;
                    height: 3px;
                    background-color: #E8A020;
                    margin: 12px auto 0;
                    border-radius: 2px;
                }
                .content {
                    padding: 30px;
                }
                .field-label {
                    font-weight: 700;
                    color: #6E6E50;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 4px;
                }
                .field-value {
                    margin-bottom: 18px;
                    color: #1C1C1A;
                    font-size: 15px;
                }
                .message-box {
                    background: #F7F6F2;
                    padding: 18px;
                    border-left: 4px solid #E8A020;
                    border-radius: 0 12px 12px 0;
                    color: #4A4A34;
                    font-size: 15px;
                    line-height: 1.7;
                }
                .footer {
                    background-color: #F7F6F2;
                    padding: 18px 20px;
                    text-align: center;
                    font-size: 11px;
                    color: #A0A07A;
                    border-top: 1px solid #EEEEE8;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>New Contact Message</h2>
                    <div class="header-divider"></div>
                </div>
                <div class="content">
                    <div class="field-label">Name</div>
                    <div class="field-value">${data.name}</div>
                    
                    <div class="field-label">Email</div>
                    <div class="field-value">${data.email}</div>
                    
                    <div class="field-label">Subject</div>
                    <div class="field-value">${data.subject}</div>
                    
                    <div class="field-label">Message</div>
                    <div class="message-box">${data.message.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="footer">
                    Received via contact form &middot; Skyline Skilling &amp; Training Center
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `"Contact Form" <${env.EMAIL_USER}>`,
            replyTo: data.email,
            to,
            subject,
            html: htmlContent,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error forwarding contact email:', error);
        }
    }

    public async sendContactAutoReply(to: string): Promise<void> {
        const subject = "Thank you for contacting Skyline Skilling & Training Center";
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.7;
                    color: #4A4A34;
                    margin: 0;
                    padding: 0;
                    background-color: #F7F6F2;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                }
                .header {
                    background-color: #1C1C1A;
                    color: #ffffff;
                    padding: 36px 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: #E8A020;
                    letter-spacing: 0.02em;
                }
                .header-divider {
                    width: 48px;
                    height: 3px;
                    background-color: #E8A020;
                    margin: 14px auto 0;
                    border-radius: 2px;
                }
                .content {
                    padding: 36px 30px;
                }
                .content p {
                    color: #6E6E50;
                    font-size: 15px;
                    margin: 0 0 14px;
                }
                .content strong {
                    color: #1C1C1A;
                }
                .sign-off {
                    margin-top: 32px;
                    border-top: 1px solid #EEEEE8;
                    padding-top: 20px;
                    font-size: 15px;
                    color: #6E6E50;
                }
                .footer {
                    background-color: #F7F6F2;
                    padding: 24px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #A0A07A;
                    border-top: 1px solid #EEEEE8;
                }
                .footer a {
                    color: #C8860E;
                    text-decoration: none;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Skyline Skilling &amp; Training Center</h1>
                    <div class="header-divider"></div>
                </div>
                <div class="content">
                    <p>Dear Sir/Madam,</p>

                    <p>Greetings from <strong>Skyline Skilling &amp; Training Center</strong>.</p>

                    <p>Thank you for reaching out to us. We appreciate your interest in our organization. Our team of experts will review your details and get in touch with you shortly to discuss your requirements.</p>

                    <p>You may share your profile with us for any service requirements, collaboration opportunities, or strategic partnerships. We look forward to exploring potential avenues of mutual growth and cooperation.</p>

                    <p>Thank you for connecting with Skyline Skilling &amp; Training Center.</p>

                    <div class="sign-off">
                        <p>Yours sincerely,<br>
                        <strong>Skyline Skilling &amp; Training Center</strong></p>
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Skyline Skilling &amp; Training Center. All rights reserved.<br>
                    <a href="https://www.skylinetechnologies.in">www.skylinetechnologies.in</a>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `"Skyline Skilling & Training Center" <${env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending auto-reply email:', error);
        }
    }
    public async sendTrialEmail(to: string, name: string): Promise<void> {
        const subject = "Welcome to Skyline Skilling & Training Center Training & Skilling Program";
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #4A4A34;
                    margin: 0;
                    padding: 0;
                    background-color: #F7F6F2;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0,0,0,0.06);
                }
                .header {
                    background-color: #1C1C1A;
                    color: #ffffff;
                    padding: 36px 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: #E8A020;
                    letter-spacing: 0.02em;
                }
                .header-divider {
                    width: 48px;
                    height: 3px;
                    background-color: #E8A020;
                    margin: 14px auto 0;
                    border-radius: 2px;
                }
                .content {
                    padding: 40px 30px;
                    background-color: #ffffff;
                }
                .welcome-text {
                    font-size: 18px;
                    color: #1C1C1A;
                    font-weight: 600;
                    margin-bottom: 20px;
                }
                .message-body {
                    color: #6E6E50;
                    font-size: 15px;
                    line-height: 1.7;
                }
                .message-body strong {
                    color: #1C1C1A;
                }
                .footer {
                    background-color: #F7F6F2;
                    padding: 24px 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #A0A07A;
                    border-top: 1px solid #EEEEE8;
                }
                .footer a {
                    color: #C8860E;
                    text-decoration: none;
                    font-weight: 600;
                }
                .highlight {
                    color: #1C1C1A;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Skyline Skilling &amp; Training Center<br>Training &amp; Skilling Program</h1>
                    <div class="header-divider"></div>
                </div>
                <div class="content">
                    <div class="welcome-text">Dear ${name},</div>
                    
                    <div class="message-body">
                        <p>Welcome to the <span class="highlight">Skyline Skilling &amp; Training Center</span>.</p>
                        
                        <p>We are delighted to have you with us. Our program is designed and delivered by industry-specific professional trainers, ensuring practical knowledge and real-world skill development.</p>
                        
                        <p>All further information, updates, and important announcements will be shared through your registered login email ID. Kindly check your email regularly to stay informed.</p>
                        
                        <p style="margin-top: 30px;">Once again, thank you for choosing Skyline Skilling &amp; Training Center as your skilling partner. We wish you a successful and enriching learning journey with us.</p>
                        
                        <p style="margin-top: 40px; border-top: 1px solid #EEEEE8; padding-top: 20px;">
                            Warm regards,<br>
                            <strong style="color: #1C1C1A;">Skyline Skilling &amp; Training Center Team</strong>
                        </p>
                    </div>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} Skyline Skilling &amp; Training Center. All rights reserved.<br>
                    <a href="https://www.skylinetechnologies.in">www.skylinetechnologies.in</a>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `"Skyline Skilling & Training Center" <${env.EMAIL_USER}>`,
            to,
            subject,
            html: htmlContent,
            text: `Dear ${name},\n\nWelcome to Skyline Skilling & Training Center.\n\nWe are delighted to have you with us. Our program is designed and delivered by industry-specific professional trainers, ensuring practical knowledge and real-world skill development.\n\nAll further information, updates, and important announcements will be shared through your registered login email ID. Kindly check your email regularly to stay informed.\n\nOnce again, thank you for choosing Skyline Skilling & Training Center as your skilling partner. We wish you a successful and enriching learning journey with us.\n\nWarm regards,\nSkyline Skilling & Training Center Team`
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending trial email:', error);
        }
    }

    public async sendTrialBookingConfirmation(params: {
        to: string;
        fullName: string;
        language: string;
        level: string;
        phone: string;
    }): Promise<boolean> {
        const subject = `Free Consultation Booking Confirmed – ${params.language} (${params.level})`;

        const html = this.getProgramEmailTemplate({
            name: params.fullName,
            title: 'Your Free Consultation Has Been Booked!',
            paragraphs: [
                `Thank you for your interest in our <strong>${params.language}</strong> training program. We have received your request for a free consultation for the <strong>${params.level}</strong> level.`,
                'One of our academic counselors will reach out to you shortly on the phone number you provided to schedule a convenient time for your session.',
                'In the meantime, feel free to explore our language training programs on our website.',
            ],
            infoRows: [
                { label: 'Language', value: params.language },
                { label: 'Level', value: params.level },
                { label: 'Phone', value: params.phone },
            ],
            actionButton: {
                label: 'Explore Language Courses',
                href: languageTrainingLink,
            },
        });

        const emailSubject = `Free Consultation Booking Confirmed - ${params.language} (${params.level})`;

        const mailOptions = {
            from: `"Skyline Skilling & Training Center" <${env.EMAIL_USER}>`,
            to: params.to,
            subject: emailSubject,
            html,
            text: `Dear ${params.fullName},\n\nThank you for your interest in our ${params.language} training program. We have received your request for a free consultation for the ${params.level} level.\n\nOne of our academic counselors will reach out to you shortly on the phone number you provided to schedule a convenient time for your session.\n\nLanguage: ${params.language}\nLevel: ${params.level}\nPhone: ${params.phone}\n\nExplore our courses: ${languageTrainingLink}\n\nWarm regards,\nSkyline Skilling & Training Center Team`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.error(`Error sending trial booking confirmation email to ${params.to}:`, error);
            return false;
        }
    }

}

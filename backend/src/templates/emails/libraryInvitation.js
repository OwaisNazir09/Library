export const libraryInvitationTemplate = ({ ownerName, libraryName, email, password, loginUrl, plan, trialExpiry }) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Welib</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #044343 0%, #065f46 100%);
            padding: 60px 40px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -0.025em;
        }
        .header p {
            color: #a7f3d0;
            margin: 12px 0 0;
            font-size: 18px;
            font-weight: 500;
        }
        .content {
            padding: 48px 40px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 16px;
        }
        .body-text {
            font-size: 16px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 32px;
        }
        .credentials-card {
            background-color: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            padding: 32px;
            margin-bottom: 32px;
        }
        .card-title {
            font-size: 14px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 24px;
            display: block;
        }
        .credential-item {
            margin-bottom: 20px;
        }
        .credential-label {
            font-size: 12px;
            font-weight: 600;
            color: #94a3b8;
            margin-bottom: 4px;
            display: block;
        }
        .credential-value {
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
            word-break: break-all;
        }
        .credential-value.url {
            color: #044343;
        }
        .credential-value.password {
            color: #b91c1c;
            font-family: monospace;
            font-size: 18px;
        }
        .stats-grid {
            display: table;
            width: 100%;
            margin-top: 24px;
            padding-top: 24px;
            border-top: 1px dashed #cbd5e1;
        }
        .stat-col {
            display: table-cell;
            width: 50%;
        }
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            background-color: #044343;
            color: #ffffff !important;
            padding: 18px 40px;
            border-radius: 16px;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 10px 15px -3px rgba(4, 67, 67, 0.2);
        }
        .footer {
            background-color: #f8fafc;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
        }
        .footer p {
            font-size: 14px;
            color: #94a3b8;
            margin: 0;
        }
        .footer-links {
            margin-top: 16px;
        }
        .footer-links a {
            color: #64748b;
            text-decoration: none;
            margin: 0 8px;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Congratulations! </h1>
                <p>Your Library is live on Welib</p>
            </div>
            <div class="content">
                <p class="greeting">Hello ${ownerName},</p>
                <p class="body-text">
                    Welcome to the future of library management. Your institution, <strong>${libraryName}</strong>, is now part of the global Welib network. 
                    You have full authority to manage students, inventory, finance, and reports from your dedicated dashboard.
                </p>

                <div class="credentials-card">
                    <span class="card-title">Access Credentials</span>
                    
                    <div class="credential-item">
                        <span class="credential-label">Admin Console URL</span>
                        <span class="credential-value url">${loginUrl}</span>
                    </div>

                    <div class="credential-item">
                        <span class="credential-label">Authority Email</span>
                        <span class="credential-value">${email}</span>
                    </div>

                    <div class="credential-item">
                        <span class="credential-label">Master Password</span>
                        <span class="credential-value password">${password}</span>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-col">
                            <span class="credential-label">Service Plan</span>
                            <span class="credential-value" style="text-transform: uppercase; color: #044343;">${plan}</span>
                        </div>
                        <div class="stat-col">
                            <span class="credential-label">Trial Expiry</span>
                            <span class="credential-value">${trialExpiry}</span>
                        </div>
                    </div>
                </div>

                <div class="button-container">
                    <a href="${loginUrl}" class="button">Launch Admin Console</a>
                </div>

                <p class="body-text" style="text-align: center; font-size: 14px; margin-top: 40px;">
                    Need assistance setting up? Our technical support team is available 24/7 to help you migrate your data.
                </p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Welib Team. All rights reserved.</p>
                <p style="margin-top: 8px;">123 Library Square, Digital City</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

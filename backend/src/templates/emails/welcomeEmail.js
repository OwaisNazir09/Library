

export const welcomeEmailTemplate = (data) => {
  const { fullName, idNumber, email, status } = data;

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #044343; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Welcome to Welib</h1>
        <p style="color: #99f6e4; margin: 10px 0 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Library Registration Successful</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Hello <strong>${fullName}</strong>,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Your registration at the library has been processed successfully. We're excited to have you as part of our community!
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
          <h3 style="margin: 0 0 16px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Your Account Details</h3>
          
          <div style="display: flex; margin-bottom: 12px;">
            <div style="width: 140px; font-size: 13px; color: #94a3b8; font-weight: 600;">Library Name</div>
            <div style="font-size: 14px; color: #1e293b; font-weight: 800;">${data.libraryName || 'Welib Central Library'}</div>
          </div>
          
          <div style="display: flex; margin-bottom: 12px;">
            <div style="width: 140px; font-size: 13px; color: #94a3b8; font-weight: 600;">Username/Email</div>
            <div style="font-size: 14px; color: #1e293b; font-weight: 600;">${email}</div>
          </div>

          <div style="display: flex; margin-bottom: 12px;">
            <div style="width: 140px; font-size: 13px; color: #94a3b8; font-weight: 600;">Password</div>
            <div style="font-size: 14px; color: #b91c1c; font-weight: 800;">${data.password || 'password123'}</div>
          </div>
          
          <div style="display: flex;">
            <div style="width: 140px; font-size: 13px; color: #94a3b8; font-weight: 600;">Account Status</div>
            <div style="font-size: 12px; font-weight: 700; color: #044343; background: #ccfbf1; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">${status}</div>
          </div>
        </div>
        
        <p style="font-size: 15px; line-height: 1.6; color: #64748b; margin-bottom: 0;">
          You can now use your ID Number to borrow books, book study desks, and access our digital resources.
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">
          This is an automated message from Welib Library Management System.
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin: 5px 0 0;">
          © ${new Date().getFullYear()} Welib. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

// export const getVerifyEmailHtml = ({ email, token }) => {
//   const appName = "Authentication App"; 
//   const baseUrl = "http://localhost:5173";

//   const verifyUrl = `${baseUrl.replace(/\/+$/, "")}/token/${encodeURIComponent(token)}`;

//   return `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <title>${appName} - Verify Your Email</title>
//     <style>
//       body {
//         font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
//         background-color: #f4f6f8;
//         margin: 0;
//         padding: 0;
//         color: #333;
//       }
//       .container {
//         max-width: 500px;
//         margin: 40px auto;
//         background: #ffffff;
//         border-radius: 10px;
//         box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
//         overflow: hidden;
//       }
//       .header {
//         background: linear-gradient(135deg, #3b82f6, #06b6d4);
//         color: #ffffff;
//         text-align: center;
//         padding: 25px 15px;
//       }
//       .header h1 {
//         margin: 0;
//         font-size: 22px;
//       }
//       .content {
//         padding: 25px 30px;
//         text-align: center;
//       }
//       .content p {
//         font-size: 16px;
//         margin-bottom: 20px;
//         color: #444;
//       }
//       .button {
//         display: inline-block;
//         background: #2563eb;
//         color: #ffffff;
//         text-decoration: none;
//         padding: 12px 25px;
//         border-radius: 8px;
//         font-weight: 600;
//         transition: background 0.3s ease;
//       }
//       .button:hover {
//         background: #1e40af;
//       }
//       .footer {
//         background: #f9fafb;
//         text-align: center;
//         padding: 18px;
//         font-size: 13px;
//         color: #64748b;
//       }
//       .small {
//         font-size: 13px;
//         color: #64748b;
//         margin-top: 20px;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <div class="header">
//         <h1>${appName}</h1>
//       </div>

//       <div class="content">
//         <p>Hi ${email},</p>
//         <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>

//         <a href="${verifyUrl}" class="button">Verify Email</a>

//         <p class="small">
//           If the button doesn’t work, you can also copy and paste the following link into your browser:<br/>
//           <a href="${verifyUrl}" style="color: #2563eb; word-break: break-all;">${verifyUrl}</a>
//         </p>
//       </div>

//       <div class="footer">
//         &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
//       </div>
//     </div>
//   </body>
//   </html>
//   `;
// };

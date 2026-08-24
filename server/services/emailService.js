const nodemailer=require("nodemailer");
async function sendMail({to,subject,html,attachments=[]}){
 if(!process.env.EMAIL_HOST||!process.env.EMAIL_USER||!process.env.EMAIL_PASSWORD){
   console.log(`[EMAIL MOCK] to=${to} subject=${subject}`); return;
 }
 const transporter=nodemailer.createTransport({
   host:process.env.EMAIL_HOST,port:Number(process.env.EMAIL_PORT||587),
   secure:String(process.env.EMAIL_SECURE)==="true",
   auth:{user:process.env.EMAIL_USER,pass:process.env.EMAIL_PASSWORD}
 });
 return transporter.sendMail({from:process.env.EMAIL_FROM||process.env.EMAIL_USER,to,subject,html,attachments});
}
module.exports={sendMail};

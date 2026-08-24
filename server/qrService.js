const QRCode=require("qrcode");
async function createQR(reference){return QRCode.toDataURL(reference);}
module.exports={createQR};

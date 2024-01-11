const sharp =require("sharp");
const fs = require("fs");

sharp.cache(false);

const cropAndSaveImage = async (filename) => {
    const inputPath = `public/images/productImages/${filename}`;
  
    const buffer = await sharp(inputPath)
      .resize(900, 900, {
        fit: sharp.fit.cover,
        withoutEnlargement: true,
      })
      .extend({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .toBuffer();
    fs.writeFileSync(inputPath, buffer);
  
    return inputPath;
  };
  
  module.exports ={cropAndSaveImage}
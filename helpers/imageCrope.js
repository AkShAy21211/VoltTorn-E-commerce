const sharp =require("sharp");
const fs = require("fs");

sharp.cache(false);

const cropAndSaveImage = async (filename) => {
    const inputPath = `public/images/productImages/${filename}`;
  
    const buffer = await sharp(inputPath)
      .resize(1000, 1000, {
        fit: sharp.fit.contain,
        withoutEnlargement: true,
      })
      .toBuffer();
    fs.writeFileSync(inputPath, buffer);
  
    return inputPath;
  };
  
  module.exports ={cropAndSaveImage}
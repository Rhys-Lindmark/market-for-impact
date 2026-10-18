// Reproduce missing card assets from their organizations' websites.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const images={
 saga:'https://saga.org/wp-content/uploads/2024/06/Homepage_Banner.png',
 bottomline:'https://www.bottomline.org/wp-content/uploads/2024/08/img-03.webp',
 cra:'https://anypositivechange.org/wp-content/uploads/yootheme/cache/7c/DSC07389-7c4e0b02.jpg',
 tchp:'https://tchpfreeclinic.org/wp-content/uploads/2026/02/DSC051922-1024x715.png',
 hrac:'https://images.squarespace-cdn.com/content/v1/60748f6caec59b3ffb27b07b/25a7f3b1-3b23-40c4-a534-dab7fb2304a8/414692422_745064200991354_2384544122736914536_n.jpg?format=1000w',
 crisis:'https://images.squarespace-cdn.com/content/v1/5ae7cbd73e2d09565d3534bb/1525202036835-2WJ3SOAN2G6SMZN12HDS/crisis-hotline-homepage-help.jpg?format=1000w',
 christ:'https://christclinickaty.org/wp-content/uploads/2023/11/Home_TotalExpressCare_D-1024x734.jpg',
 kids:'https://www.kidsandcars.org/assets/images/layout/social_share.png',
};
for(const [name,url] of Object.entries(images)){
 const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error(`${name}: HTTP ${response.status}`);
 const buffer=await response.arrayBuffer();
 if(buffer.byteLength>12e6)throw new Error('Image exceeds bounded download size');
 await sharp(Buffer.from(buffer)).rotate().resize({width:960,height:960,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toFile(new URL(`../public/images/edition-${name}.webp`,import.meta.url).pathname);
 console.log(name,await fs.stat(new URL(`../public/images/edition-${name}.webp`,import.meta.url)).then(s=>s.size));
}

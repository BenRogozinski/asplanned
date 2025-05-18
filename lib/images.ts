// At least this part runs on edge runtime :D
import jpeg from "jpeg-js";

export type ImageData = {
  width: number;
  height: number;
  data: Uint8Array;
};

export async function decodeImageResponse(response: Response): Promise<ImageData> {
  const buffer = new Uint8Array(await response.arrayBuffer());
  const decoded = jpeg.decode(buffer, { useTArray: true });
  return decoded;
}

// Had to write my own function for this because
// APPARENTLY there is NOT ONE GOOD LIBRARY to
// do this that will run in Next.js edge runtime...
// Makes the images look really weird if the aspect
// ratio is different but I can NOT be bothered to
// fix it.
export function nearestNeighborResize(
  input: ImageData,
  targetWidth: number,
  targetHeight: number
): ImageData {
  const { width: srcW, height: srcH, data: srcData } = input;
  const dstData = new Uint8Array(targetWidth * targetHeight * 4);

  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      // I don't know how the fuck this math works but it does
      // Thank you Wikipedia!
      const srcX = Math.floor((x / targetWidth) * srcW);
      const srcY = Math.floor((y / targetHeight) * srcH);

      const srcIdx = (srcY * srcW + srcX) * 4;
      const dstIdx = (y * targetWidth + x) * 4;

      dstData[dstIdx] = srcData[srcIdx];        // R
      dstData[dstIdx + 1] = srcData[srcIdx + 1]; // G
      dstData[dstIdx + 2] = srcData[srcIdx + 2]; // B
      dstData[dstIdx + 3] = srcData[srcIdx + 3]; // A
    }
  }

  return {
    width: targetWidth,
    height: targetHeight,
    data: dstData,
  };
}

export function encodeImageBase64(image: ImageData, quality: number = 80): string {
  const jpegImageData = jpeg.encode(image, quality);
  return Buffer.from(jpegImageData.data).toString('base64');
}
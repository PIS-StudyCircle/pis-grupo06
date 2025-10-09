export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const radians = (rotation * Math.PI) / 180;

  const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(
    image.width,
    image.height,
    radians
  );

  const tempCanvas = document.createElement("canvas");
  const tCtx = tempCanvas.getContext("2d");

  tempCanvas.width = bBoxWidth;
  tempCanvas.height = bBoxHeight;

  tCtx.translate(bBoxWidth / 2, bBoxHeight / 2);
  tCtx.rotate(radians);
  tCtx.drawImage(image, -image.width / 2, -image.height / 2);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    tempCanvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return;

      const fileUrl = URL.createObjectURL(blob);
      const file = new File([blob], "cropped_photo.jpg", {
        type: "image/jpeg",
      });

      resolve({ fileUrl, file });
    }, "image/jpeg");
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function getRotatedSize(width, height, rotation) {
  const w =
    Math.abs(Math.cos(rotation) * width) +
    Math.abs(Math.sin(rotation) * height);
  const h =
    Math.abs(Math.sin(rotation) * width) +
    Math.abs(Math.cos(rotation) * height);
  return { width: w, height: h };
}

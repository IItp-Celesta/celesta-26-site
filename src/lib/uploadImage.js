export async function uploadImage(file, authUserOrToken, options = {}) {
  if (!file) throw new Error("Please select an image file to upload.");

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only PNG, JPG, or JPEG images are allowed.");
  }

  if (!authUserOrToken) throw new Error("Please log in again and retry.");

  const token =
    typeof authUserOrToken === "string"
      ? authUserOrToken
      : await authUserOrToken.getIdToken();

  const folder = options.folder || "celesta_secure_ids";

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folder }),
  });

  const signData = await signRes.json().catch(() => ({}));
  if (!signRes.ok || !signData.signature) {
    throw new Error(
      signData.error || "Failed to initialize upload authorization.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signData.apiKey);
  formData.append("timestamp", signData.timestamp);
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);
  formData.append("transformation", signData.transformation);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const uploadData = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok || !uploadData.secure_url) {
    throw new Error(
      uploadData.error?.message ||
        "Cloud upload failed. Please check your connection.",
    );
  }

  return uploadData.secure_url;
}

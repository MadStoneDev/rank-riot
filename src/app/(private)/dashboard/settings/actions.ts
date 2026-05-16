"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing R2 configuration (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update your profile" };
  }

  const full_name = formData.get("full_name") as string;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be logged in to update your avatar" };
  }

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) {
    return { error: "No file selected" };
  }

  if (file.size > 2 * 1024 * 1024) {
    return { error: "File must be smaller than 2 MB" };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "File must be a JPEG, PNG, WebP, or GIF image" };
  }

  const bucket = process.env.R2_BUCKET_NAME || "rankriot-uploads";
  const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || process.env.R2_PUBLIC_DOMAIN;
  if (!publicDomain) {
    return { error: "NEXT_PUBLIC_R2_PUBLIC_DOMAIN is not configured" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const key = `avatars/${user.id}.${ext}`;

  try {
    const r2 = getR2Client();
    const buffer = Buffer.from(await file.arrayBuffer());

    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: key,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      return { error: `Failed to update profile: ${updateError.message}` };
    }

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    const avatarUrl = `${publicDomain}/${key}?t=${Date.now()}`;
    return { success: true, avatarUrl };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { error: `Upload failed: ${message}` };
  }
}

import { createClient } from "@supabase/supabase-js";

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log("Creating storage buckets: vn-public and vn-private...");

  const { data: publicData, error: publicError } = await supabase.storage.createBucket("vn-public", {
    public: true,
    fileSizeLimit: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "audio/mpeg", "audio/wav", "audio/m4a", "video/mp4"],
  });

  if (publicError) {
    if (publicError.message.includes("already exists")) {
      console.log("Bucket 'vn-public' already exists.");
    } else {
      console.error("Failed to create 'vn-public':", publicError.message);
    }
  } else {
    console.log("Bucket 'vn-public' created successfully.");
  }

  const { data: privateData, error: privateError } = await supabase.storage.createBucket("vn-private", {
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf", "audio/mpeg", "audio/wav"],
  });

  if (privateError) {
    if (privateError.message.includes("already exists")) {
      console.log("Bucket 'vn-private' already exists.");
    } else {
      console.error("Failed to create 'vn-private':", privateError.message);
    }
  } else {
    console.log("Bucket 'vn-private' created successfully.");
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

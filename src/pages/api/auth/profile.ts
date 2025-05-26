// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "@lib/supabase";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const user_id = formData.get("user_id")?.toString();
  const full_name = formData.get("full_name")?.toString();

  if (!user_id || !full_name) {
    return new Response("User ID and full name are required", { status: 400 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response("User not authenticated", { status: 401 });
  }

  // Confirm user id matches form user_id for security
  if (user.id !== user_id) {
    return new Response("User ID mismatch", { status: 403 });
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user_id, full_name, email: user.email }, { onConflict: "id" });

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(`<script>alert("Profile updated!"); window.location.href = "/";</script>`, {
    headers: { "Content-Type": "text/html" },
    status: 200,
  });
};

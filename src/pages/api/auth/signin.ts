// With `output: 'static'` configured:
// export const prerender = false;
import type { APIRoute } from "astro";
import { supabase } from "@lib/supabase";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const action = formData.get("auth-action");

  if (!email || !password || !action) {
    return new Response("Email, password, and action are required", { status: 400 });
  }

  if (action === "register") {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response(
      `<script>alert("Check your email to confirm your account."); window.location.href = "/";</script>`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  if (action === "login") {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return new Response(error.message, { status: 500 });
    }

    const { access_token, refresh_token } = data.session;
    cookies.set("sb-access-token", access_token, { path: "/" });
    cookies.set("sb-refresh-token", refresh_token, { path: "/" });

    return redirect("/");
  }

  return new Response("Invalid auth action", { status: 400 });
};

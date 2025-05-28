export const LoginForm = () => {
  return (
    <form
      id="auth-form"
      method="POST"
      action="/api/auth/signin"
      className="flex flex-col justify-between items-center gap-md">
      <div className="flex flex-col items-baseline gap-md">
        <input type="email" name="email" placeholder="E-post" className="w-[220px] border-b border-dashed" required />
        <input
          type="password"
          name="password"
          placeholder="Lösenord"
          className="w-[220px] border-b border-dashed"
          required
        />
      </div>
      <div className="repel mt-lg" data-reverse>
        <button type="submit" name="auth-action" value="login" className="button" data-variant="white">
          Logga in
        </button>
        <button type="submit" name="auth-action" value="register" className="button" data-variant="text">
          Ny användare
        </button>
      </div>
    </form>
  );
};

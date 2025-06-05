import EyeClosed from "@assets/icons/eyeClosed";
import EyeOpened from "@assets/icons/eyeOpened";
import React, { useState } from "react";

interface PasswordInputProps {
  name: string;
  placeholder: string;
  className: string;
  required?: boolean;
}

export const LoginForm = () => {
  const PasswordInput = ({ name, placeholder, className, required }: PasswordInputProps) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          className={`${className} pr-8`}
          required={required}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}>
          {showPassword ? <EyeClosed /> : <EyeOpened />}
        </button>
      </div>
    );
  };

  return (
    <form
      id="auth-form"
      method="POST"
      action="/api/auth/signin"
      className="flex flex-col justify-between items-center gap-md">
      <div className="flex flex-col items-baseline gap-md">
        <input type="email" name="email" placeholder="E-post" className="w-[220px] border-b border-dashed" required />
        <PasswordInput name="password" placeholder="Lösenord" className="w-[220px] border-b border-dashed" required />
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

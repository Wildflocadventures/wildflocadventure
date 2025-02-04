import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthFormField } from "./AuthFormField";

interface ProviderAuthFormProps {
  isSignUp: boolean;
  isLoading: boolean;
  onSubmit: (formData: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => void;
  onToggleMode: () => void;
}

export const ProviderAuthForm = ({
  isSignUp,
  isLoading,
  onSubmit,
  onToggleMode,
}: ProviderAuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, fullName, phone });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthFormField
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
      />
      <AuthFormField
        id="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
      />
      {isSignUp && (
        <>
          <AuthFormField
            id="fullName"
            label="Full Name"
            type="text"
            value={fullName}
            onChange={setFullName}
          />
          <AuthFormField
            id="phone"
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={setPhone}
          />
        </>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onToggleMode}
      >
        {isSignUp
          ? "Already have an account? Sign In"
          : "Need an account? Sign Up"}
      </Button>
    </form>
  );
};
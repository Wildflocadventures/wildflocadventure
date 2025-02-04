import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AuthFormFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const AuthFormField = ({
  id,
  label,
  type,
  value,
  onChange,
  required = true,
}: AuthFormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
};
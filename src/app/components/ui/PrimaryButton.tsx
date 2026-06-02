import AppPrimaryButton from "@/app/components/PrimaryButton";

interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
}

export default function PrimaryButton({ text, onClick }: PrimaryButtonProps) {
  return (
    <AppPrimaryButton onClick={onClick} variant="surface" labelSize="16" className="w-full">
      {text}
    </AppPrimaryButton>
  );
}

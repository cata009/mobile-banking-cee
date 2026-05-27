interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  className = '',
}: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex w-[327px] h-[48px] px-0 py-3
        justify-center items-center gap-4
        rounded
        bg-[#007A91]
        text-white font-['UniCredit',sans-serif] text-base font-bold
        transition-all duration-200
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-100 cursor-pointer hover:bg-[#006580] active:scale-[0.98]'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
interface PrimaryButtonProps {
  text: string;
  onClick?: () => void;
}

export default function PrimaryButton({ text, onClick }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-[48px] py-[12px] justify-center items-center gap-[16px] self-stretch rounded-[4px] bg-white cursor-pointer hover:opacity-90 transition-opacity"
    >
      <p className="text-[#262626] text-center font-['UniCredit'] text-[18px] font-bold leading-[normal]">
        {text}
      </p>
    </button>
  );
}

import type { ReactNode } from "react";

interface AccountActionBarProps {
  onOptionsClick?: () => void;
}

function DetailsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M16.0002 12.5546C14.9617 12.5546 14.1202 11.7131 14.1202 10.6746C14.1202 9.63692 14.9617 8.79462 16.0002 8.79462C17.0386 8.79462 17.8802 9.63692 17.8802 10.6746C17.8802 11.7131 17.0386 12.5546 16.0002 12.5546ZM17.5492 20.2177C17.5492 21.7846 17.0369 23.2062 14.4723 23.2062V14.8623H17.5492V20.2177ZM16 6C10.4769 6 6 10.4777 6 16C6 21.5231 10.4769 26 16 26C21.5231 26 26 21.5231 26 16C26 10.4777 21.5231 6 16 6Z" fill="#262626" />
    </svg>
  );
}

function OptionsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M17.0212 18.5281C15.6247 19.0923 14.0369 18.4188 13.4712 17.0222C12.9071 15.6255 13.5821 14.036 14.9786 13.4719C16.3752 12.9077 17.963 13.5828 18.527 14.9794C19.0911 16.3761 18.4162 17.964 17.0212 18.5281ZM24.9875 21.1543L25.9807 18.7805L23.7196 16.8052V15.2527L26 13.2887L25.0229 10.9084L22.0161 11.1109L20.9297 10.0228L21.1531 7.01093L18.7794 6.01929L16.7947 8.29187H15.2616L13.2881 6L10.908 6.97718L11.1105 9.98264L10.0241 11.0707L7.01085 10.8457L6.01768 13.2195L8.28043 15.1948V16.749L6 18.7113L6.9771 21.0932L9.95982 20.8907L11.0687 21.9997L10.8453 24.9891L13.2206 25.9823L15.1828 23.7322H16.7577L18.7119 26L21.0904 25.0244L20.8895 22.0399L21.9984 20.9325L24.9875 21.1543Z" fill="#262626" />
    </svg>
  );
}

function AddMoneyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C15.5225 0 20 4.4775 20 10C20 15.5225 15.5225 20 10 20C4.47688 20 0 15.5225 0 10C0 4.4775 4.47688 0 10 0ZM9.0625 4.375V9.0625H4.375V10.9375H9.0625V15.625H10.9375V10.9375H15.625V9.0625H10.9375V4.375H9.0625Z" fill="#262626" />
    </svg>
  );
}

function MCashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.5 5H1.25V3.125H7.5V5ZM6.25 7.5C6.25 7.845 6.53 8.125 6.875 8.125C7.22 8.125 7.5 7.845 7.5 7.5C7.5 7.155 7.22 6.875 6.875 6.875C6.53 6.875 6.25 7.155 6.25 7.5ZM6.25 10C6.25 10.345 6.53 10.625 6.875 10.625C7.22 10.625 7.5 10.345 7.5 10C7.5 9.655 7.22 9.375 6.875 9.375C6.53 9.375 6.25 9.655 6.25 10ZM6.25 12.5C6.25 12.845 6.53 13.125 6.875 13.125C7.22 13.125 7.5 12.845 7.5 12.5C7.5 12.155 7.22 11.875 6.875 11.875C6.53 11.875 6.25 12.155 6.25 12.5ZM3.75 7.5C3.75 7.845 4.03 8.125 4.375 8.125C4.72 8.125 5 7.845 5 7.5C5 7.155 4.72 6.875 4.375 6.875C4.03 6.875 3.75 7.155 3.75 7.5ZM3.75 10C3.75 10.345 4.03 10.625 4.375 10.625C4.72 10.625 5 10.345 5 10C5 9.655 4.72 9.375 4.375 9.375C4.03 9.375 3.75 9.655 3.75 10ZM3.75 12.5C3.75 12.845 4.03 13.125 4.375 13.125C4.72 13.125 5 12.845 5 12.5C5 12.155 4.72 11.875 4.375 11.875C4.03 11.875 3.75 12.155 3.75 12.5ZM1.25 7.5C1.25 7.845 1.53 8.125 1.875 8.125C2.22 8.125 2.5 7.845 2.5 7.5C2.5 7.155 2.22 6.875 1.875 6.875C1.53 6.875 1.25 7.155 1.25 7.5ZM1.25 10C1.25 10.345 1.53 10.625 1.875 10.625C2.22 10.625 2.5 10.345 2.5 10C2.5 9.655 2.22 9.375 1.875 9.375C1.53 9.375 1.25 9.655 1.25 10ZM1.25 12.5C1.25 12.845 1.53 13.125 1.875 13.125C2.22 13.125 2.5 12.845 2.5 12.5C2.5 12.155 2.22 11.875 1.875 11.875C1.53 11.875 1.25 12.155 1.25 12.5ZM16.25 0V1.875H11.875C10.1494 1.875 8.75 3.27437 8.75 5V15H0V3.75C0 1.67937 1.67937 0 3.75 0H16.25ZM18.75 16.25H11.25V5H18.75V16.25ZM14.0625 17.8125C14.0625 18.33 14.4825 18.75 15 18.75C15.5175 18.75 15.9375 18.33 15.9375 17.8125C15.9375 17.295 15.5175 16.875 15 16.875C14.4825 16.875 14.0625 17.295 14.0625 17.8125ZM10 5C10 3.96438 10.8394 3.125 11.875 3.125H20V18.125C20 19.1606 19.1606 20 18.125 20H10V5ZM14.375 8.75V7.5H11.875V10H13.125V11.25H11.875V13.75H14.375V12.5H15.625V13.75H16.875V12.5H18.125V11.25H16.875V10H18.125V7.5H15.625V8.75H16.875V10H15.625V11.25H14.375V10H13.125V8.75H14.375ZM15.625 11.25H16.875V12.5H15.625V11.25ZM14.375 11.25V12.5H13.125V11.25H14.375Z" fill="#262626" />
    </svg>
  );
}

function AccountActionItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-[4px]"
      data-ds-label={`Account action ${label}`}
    >
      <span className="flex h-[32px] w-[32px] items-center justify-center" data-ds-label="Account action icon 32x32">
        {icon}
      </span>
      <span className="font-['UniCredit',sans-serif] text-center text-[14px] font-normal leading-normal text-[#262626]">
        {label}
      </span>
    </button>
  );
}

export default function AccountActionBar({ onOptionsClick }: AccountActionBarProps) {
  return (
    <div className="flex items-start justify-between px-[16px] py-[8px]" data-ds-label="AccountActionBar">
      <AccountActionItem icon={<DetailsIcon />} label="Details" />
      <AccountActionItem icon={<OptionsIcon />} label="Options" onClick={onOptionsClick} />
      <AccountActionItem icon={<AddMoneyIcon />} label="Add money" />
      <AccountActionItem icon={<MCashIcon />} label="mCash" />
    </div>
  );
}

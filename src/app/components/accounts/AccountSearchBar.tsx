interface AccountSearchBarProps {
  placeholder?: string;
  onClick?: () => void;
  onFilterClick?: () => void;
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M19.6751 13.5921C19.6751 16.3828 17.4006 18.6534 14.6051 18.6534C11.8097 18.6534 9.53524 16.3828 9.53524 13.5921C9.53524 10.8013 11.8097 8.53069 14.6051 8.53069C17.4006 8.53069 19.6751 10.8013 19.6751 13.5921ZM22.2098 13.5921C22.2098 9.39934 18.8046 6 14.6049 6C10.4051 6 7 9.39934 7 13.5921C7 17.7848 10.4051 21.1841 14.6049 21.1841C16.0631 21.1841 17.4199 20.7671 18.5771 20.0567L24.5971 26C25.8962 24.703 25.8962 22.5994 24.5971 21.3024L20.9917 17.7038C21.7591 16.5181 22.2098 15.1086 22.2098 13.5921ZM16.5064 13.5921C16.5064 12.5437 15.6553 11.694 14.6051 11.694C13.555 11.694 12.7039 12.5437 12.7039 13.5921C12.7039 14.6404 13.555 15.4901 14.6051 15.4901C15.6553 15.4901 16.5064 14.6404 16.5064 13.5921Z" fill="#262626" />
    </svg>
  );
}

function FiltersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M8.80974 6.5C9.87052 6.50579 10.8371 7.09886 11.3073 8.03237H25.9803V10.4842H11.326C10.8725 11.3814 9.95999 11.9677 8.94086 12.0165H8.80974C7.25796 12.0165 6 10.7816 6 9.25827C6 7.73492 7.25796 6.5 8.80974 6.5ZM23.1706 13.2424C24.5589 13.233 25.7461 14.2204 25.9647 15.5663C26.1833 16.9121 25.3678 18.213 24.0454 18.6279C22.723 19.0429 21.2901 18.4474 20.6731 17.2266H6V14.7748H20.6543C21.1275 13.8354 22.1031 13.2413 23.1706 13.2424ZM16.9267 21.5172C16.4566 20.5837 15.49 19.9906 14.4292 19.9849H14.2981C13.2785 20.0324 12.3654 20.619 11.9129 21.5172H6V23.969H11.9129C12.3876 24.9069 13.3624 25.5 14.4292 25.5C15.496 25.5 16.4708 24.9069 16.9455 23.969H25.9803V21.5172H16.9267Z" fill="#262626" />
    </svg>
  );
}

export default function AccountSearchBar({
  placeholder = "Search",
  onClick,
  onFilterClick,
}: AccountSearchBarProps) {
  return (
    <div
      className="flex h-[36px] flex-col items-start gap-[10px] self-stretch rounded-[10px] bg-[#F5F5F5] px-0 py-[2px]"
      data-ds-label="AccountSearchBar 36px"
    >
      <div className="flex h-[32px] w-full items-center justify-between">
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-center gap-[8px] text-left"
        >
          <span className="h-[32px] w-[32px] shrink-0" data-ds-label="Search icon 32x32">
            <SearchIcon />
          </span>
          <span className="truncate font-['UniCredit',sans-serif] text-[14px] font-bold leading-normal text-[#666666]">
            {placeholder}
          </span>
        </button>
        <button
          type="button"
          onClick={onFilterClick}
          className="h-[32px] w-[32px] shrink-0"
          aria-label="Filters"
          data-ds-label="Filter icon 32x32"
        >
          <FiltersIcon />
        </button>
      </div>
    </div>
  );
}

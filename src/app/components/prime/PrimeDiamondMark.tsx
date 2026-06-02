type PrimeDiamondMarkProps = {
  className?: string;
  color?: string;
  size?: number;
  title?: string;
};

export function PrimeDiamondMark({
  className,
  color = "currentColor",
  size = 16,
  title,
}: PrimeDiamondMarkProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={className}
      color={color}
      fill="none"
      height={size}
      role={title ? "img" : undefined}
      viewBox="0 0 16 16"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M7.98926 15L4.69434 6H11.2812L7.98926 15ZM9.70215 13.2139L12.3457 6H16L9.70215 13.2139ZM6.24316 13.2129L0 6H3.63184L6.24316 13.2129ZM3.7041 5H0L2.86523 1.5H5.2334L3.7041 5ZM9.65527 1.5L11.1846 5H4.79395L6.32324 1.5H9.65527ZM15.9785 5H12.2744L10.7451 1.5H13.1133L15.9785 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

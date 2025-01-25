import React from "react";

const IconProvider: React.FC<{
  type: "Clip" | "Clear" | "Full" | "Pagination" | "Copy" | "Check";
  className?: string;
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: string | number;
  strokeLinecap?: "inherit" | "butt" | "round" | "square";
  strokeLinejoin?: "inherit" | "round" | "miter" | "bevel";
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}> = ({
  type,
  className = "",
  size = 24,
  fill = "none",
  stroke = "currentColor",
  strokeWidth = 2,
  strokeLinecap = "round",
  strokeLinejoin = "round",
  onClick,
}) => {
  let iconComponent;

  switch (type) {
    case "Clip":
      iconComponent = (
        <>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z"
            fill="currentColor"
          ></path>
        </>
      );
      break;
    case "Clear":
      iconComponent = (
        <>
          <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10m3.6 5.2a1 1 0 0 0 -1.4 .2l-2.2 2.933l-2.2 -2.933a1 1 0 1 0 -1.6 1.2l2.55 3.4l-2.55 3.4a1 1 0 1 0 1.6 1.2l2.2 -2.933l2.2 2.933a1 1 0 0 0 1.6 -1.2l-2.55 -3.4l2.55 -3.4a1 1 0 0 0 -.2 -1.4" />
        </>
      );
      break;
    case "Pagination":
      iconComponent = (
        <>
          <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
          <path d="M12 4l0 16" />
        </>
      );
      break;
    case "Full":
      iconComponent = (
        <>
          <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
        </>
      );
      break;
    case "Copy":
      iconComponent = (
        <>
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </>
      );
      break;
    case "Check":
      iconComponent = (
        <>
          <path d="M20 6 9 17l-5-5" />
        </>
      );
      break;
    default:
      iconComponent = <></>;
      break;
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      onClick={onClick}
      viewBox="0 0 24 24"
    >
      {iconComponent}
    </svg>
  );
};

export default IconProvider;

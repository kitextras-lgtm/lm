export function EditIcon() {
  return (
    <div className="group cursor-pointer flex items-center justify-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 transition-transform duration-300 group-hover:rotate-[-12deg]"
      >
        <path
          d="M28 8L38 18L18 38H8V28L28 8Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
        <path
          d="M24 12L34 22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
        <path
          d="M8 38L18 38"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-300 group-hover:stroke-dasharray-[10] group-hover:stroke-dashoffset-[10]"
          style={{ strokeDasharray: 20, strokeDashoffset: 0 }}
        />
      </svg>
    </div>
  );
}

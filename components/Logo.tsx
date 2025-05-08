type LogoProps = {
  size?: number
  className?: string
}

export function Logo({ size = 40, className = "" }: LogoProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2"
      >
        {/* Outer circle */}
        <circle cx="50" cy="50" r="45" stroke="#10B981" strokeWidth="6" />

        {/* Progress arc */}
        <path d="M50 5 A45 45 0 0 1 95 50" stroke="#059669" strokeWidth="10" strokeLinecap="round" />

        {/* Inner circle with checkmark */}
        <circle cx="50" cy="50" r="30" fill="#10B981" />

        {/* Checkmark */}
        <path d="M35 50 L45 60 L65 40" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

        {/* Small circles representing habit tracking */}
        <circle cx="50" cy="15" r="4" fill="#059669" />
        <circle cx="75" cy="25" r="4" fill="#059669" />
        <circle cx="85" cy="50" r="4" fill="#059669" />
      </svg>
      <span className="text-xl font-bold text-gray-800">Bitz</span>
    </div>
  )
}

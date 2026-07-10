export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer pulsing ring */}
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
        {/* Inner static icon/text */}
        <div className="text-xl font-bold text-white">
          S<span className="text-blue-500">D</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-400 animate-pulse">
        Decrypting Ledgers...
      </p>
    </div>
  );
}

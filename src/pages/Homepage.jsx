import { Link } from "react-router-dom";

export default function Homepage() {
  return (
    <div className="relative flex h-screen items-center justify-center bg-purple-100">
      {/* Center title */}
      <h1 className="text-4xl font-extrabold text-gray-900">Welcome!</h1>

      {/* Bottom-left: Login */}
      <Link
        to="/login"
        className="absolute bottom-8 left-8 rounded-md border-2 border-blue-500 bg-white px-10 py-4 text-lg text-blue-600 transition hover:bg-blue-100"
      >
        Login
      </Link>

      {/* Bottom-right: Sign up */}
      <Link
        to="/signup"
        className="absolute bottom-8 right-8 rounded-md border-2 border-green-500 bg-white px-10 py-4 text-lg text-green-600 transition hover:bg-green-100"
      >
        Create Account
      </Link>
    </div>
  );
}

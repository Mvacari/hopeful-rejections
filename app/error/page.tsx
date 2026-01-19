export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sorry, something went wrong</h1>
        <p className="text-gray-600 mb-6">
          There was an error with your authentication. Please try again.
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  )
}


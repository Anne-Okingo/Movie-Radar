import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-400">
          MovieRadar - React + Tailwind Setup
        </h1>

        <div className="max-w-md mx-auto bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Test Counter</h2>
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
          >
            Count is {count}
          </button>
          <p className="mt-4 text-gray-300">
            ✅ React is working!<br/>
            ✅ Tailwind CSS is working!
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

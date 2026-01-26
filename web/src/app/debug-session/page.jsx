"use client";

import { useSession } from "@auth/create/react";

export default function DebugSession() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Session Debug</h1>

      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Status: {status}</h2>

        <h3 className="text-lg font-semibold mb-2">Full Session Data:</h3>
        <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>

        <h3 className="text-lg font-semibold mb-2 mt-6">User Role:</h3>
        <p className="text-2xl font-bold text-yellow-400">
          {session?.user?.user_role || "NOT SET"}
        </p>

        <h3 className="text-lg font-semibold mb-2 mt-6">User Email:</h3>
        <p className="text-lg">{session?.user?.email || "NOT SET"}</p>
      </div>
    </div>
  );
}

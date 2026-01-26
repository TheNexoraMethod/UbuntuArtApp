export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Ubuntu Art Village API</h1>
      <p>If you can see this page, the backend is deployed.</p>
      <ul>
        <li><a href="/api/ping">/api/ping</a></li>
        <li><a href="/api/rooms">/api/rooms</a></li>
        <li><a href="/api/gallery">/api/gallery</a></li>
        <li><a href="/api/events">/api/events</a></li>
      </ul>
    </main>
  );
}

import server from "react-dom/server"

function App() {
  return (
    <html>
      <body>
        <h2>Hi.</h2>
      </body>
    </html>
  )
}

export default defineEventHandler(async () => {
    const stream = await server.renderToReadableStream(<App />);
      return new Response(stream, {
        headers: { 'content-type': 'text/html' },
      });
})
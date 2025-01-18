import { app, HttpResponse } from "@azure/functions";
import { renderToString } from "react-dom/server";

function Component(props: { message: string }) {
  return (
    <body>
      <h1>{props.message}</h1>
    </body>
  );
}

app.http('web', {
  async handler(request, context) {
    context.log(`Http function processed request for url "${request.url}"`);

    const stream = renderToString(
      <Component message="Hello from server!" />,
    );
  
    return new HttpResponse({
      body: stream
    })
  },
  methods: ['GET', 'POST'],
  authLevel: 'anonymous'
});

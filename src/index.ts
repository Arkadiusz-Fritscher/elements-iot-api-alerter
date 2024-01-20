"use strict";
import app from "./app";
import { handleDevices } from "./services/deviceModule";

// Start the server
const port = process.env.PORT || 3333;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

// Logic
handleDevices();

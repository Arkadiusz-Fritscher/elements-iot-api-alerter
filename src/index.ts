import app from "./app";
import cronJobs from "./cronJobs";
import main from "./services/dataAnalyze";

const port = process.env.PORT || 3333;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

cronJobs();
main();

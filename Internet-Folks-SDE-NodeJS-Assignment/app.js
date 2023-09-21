const express = require("express");
const app = express();

app.use(express.json());
app.use(require("./controller/controller"));

app.listen(8000, () => {
  console.log("Server started on port 8000");
});

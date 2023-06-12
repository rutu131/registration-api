const express = require("express");
const { open } = require("sqlite");
const app = express();
const sqlite3 = require("sqlite3");
app.use(express.json());

const path = require("path");
const bcrypt = require("bcrypt");

const dbPath = path.join(__dirname, "userData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//REGISTER API
app.post("/users/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `
    SELECT
    *
    FROM
    user
    WHERE
    username=${username};`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const addUserQuery = `
        INSERT INTO
        user(username,name,password,gender,location)
        VALUES
        (
            '${username}',
            '${name}',
            ${hashedPassword},
            '${gender}',
            '${location}'
        );`;
      await db.run(addUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

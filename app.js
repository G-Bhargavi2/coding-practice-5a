const express = require("express");

const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running Successfully at http:localhost:3000/");
    });
  } catch (e) {
    console.log(`DB ERROR ${e.message}`);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT * FROM movie ORDER BY movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);

  response.send(
    moviesArray.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );
});

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;

  const createMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES (
            ${directorId},
            '${movieName}',
            '${leadActor}'
    );
    `;
  const result = db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMoviesQuery = `
    SELECT * FROM movie WHERE  movie_id = ${movieId};`;

  const getMovie = await db.all(getMoviesQuery);
  response.send(
    getMovie.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  );

  //   const getMovie = await db.get(getMoviesQuery);
  //   response.send(
  //     getMovie.map((eachMovie) => convertDbObjectToResponseObject(eachMovie))
  //   );
});

app.put("/movies/:movieId/", async (request, response) => {
  const updateMovieDetails = request.body;

  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = updateMovieDetails;

  const updateMovieQuery = `
    UPDATE movie SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}' ;`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMoviesQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;

  await db.run(getMoviesQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director ORDER BY director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getDirectorMovieQuery = `
    SELECT movie.movie_name AS movie_name FROM movie INNER JOIN 
    director ON 
    movie.director_id = director.director_id 
    ORDER BY director.director_id;`;
  const directorMoviesArray = await db.all(getDirectorMovieQuery);
  response.send(
    directorMoviesArray.map((eachMovie) =>
      convertDbObjectToResponseObject(eachMovie)
    )
  );
});

module.exports = app;

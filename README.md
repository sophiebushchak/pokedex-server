# Pokédex REST Server
Node.JS Pokédex REST API back-end with searching and filtering.
The data is sourced from PokéApi.

## Motivation
The motivation behind creating this application was that PokeApi was simply too slow for the purpose that I wanted to use it for.
While creating my PokeData Pokedex Android Application, I wanted the pages of Pokemon to load quickly. The PokeApi currently does not have
endpoints for simple retrieval of a full Pokemon. First, the basic data must be loaded, and then additional data must be loaded
to display all necessary information. Because it is a small project, I thought it would be nice to just write my own NodeJS back-end for which I could trust
that running it would result in fast response times for the specific data that I needed.

## Features
* REST Endpoints for retrieving data necessary to display a Pokédex.

* The data is sourced from PokéApi. To source this data, there is a database build tool.

## Setup
To set up the API, edit the database connection in DatabaseCreate.ts. It has only been tested to work with Postgres, so
this may be preferable to use. 

You must also specify the url of PokéApi. To not overload the real hosted free API, it is heavily recommended to 
[visit PokeApi's GitHub repository and set up the project locally.](https://github.com/PokeAPI/pokeapi) 

If you do not want to locally host the PokeApi server on your computer just to populate this database, 

Then, run "ts-node DatabaseCreate.ts" or "npm run db-setup". The database should be populated with the data that is used by the API now.

## Running the application
To run the application, the database must be set up first. Afterwards, it can be ran by either entering "npm run start" or
"ts-node src/app.ts".

## Endpoints
The API has two main endpoints, the "/sprites" endpoint and the "/api" endpoint. 

When the database is populated, each Pokemon
gets a reference to sprite urls minus the base url. With this, the consumer of the API can combine the base url of the back-end
with the sprite endpoint url to retrieve sprites.

There are 4 Pokedex related endpoints.

Endpoint | Functionality | Example
--- | --- | ---
GET /pokedex | Simply returns a list of Pokemon. For this endpoint, query parameters can be supplied to filter the results. An offset and limit can be supplied for pagination, and then there are query parameters for "name", "generation", "color", "minWeight", "maxWeight", "minHeight", and "maxHeight". With these query parameters, simple filtering can be done. | GET http://localhost:8080/api/pokedex?name=oon&generation=3
GET /pokedex/count | Simply returns the total amount of Pokemon currently in the Pokedex. This can be useful for getting the limit to the pagination. | GET http://localhost:8080/api/pokedex/count
GET /pokemon/evolutions/:pokedexNumber | Returns the full evolution line of a Pokemon. This works on any Pokemon in the line. For example, both querying for Charmander's evolution line or Charizard's evolution line will return the same results. This can be useful for showing a Pokemon's evolutions in the Pokedex. | GET http://localhost:8080/pokemon/evolutions/4
GET /pokemon/:pokedexNumbewr | Simply returns a response with the data about a single Pokemon. This can be useful to get full information about a Pokemon, in case the Pokedex route will ever support a minimal response with only the data that is necessary. | http://localhost/8080/api/pokemon/1

## Example Front-End
I have [developed a Pokedex Android application that consumes this API.](https://github.com/sophiebushchak/pokedex-android) It can be used as an example to develop other front-ends that consume this API.

## Missing Features
There were some features that I would have wanted to fit into the API, but did not have the motivation for to do so.
Here is a list of some features that could potentially be added in the future if I continue work on this project or in case someone would like to fork this repository and contribute.
* Currently, it is not possible to get the alternate evolutions of a Pokemon. The functionality for retrieving all evolutions is relatively simple and only looks at Pokemon without branching evolutions.
* There is no way to filter on type.
* The main GET /pokedex endpoint always returns the full result set. It would be nice to either minimize this or to provide options for a shallower response.
* The database creation tool does not import the full list of Pokedex entries. It only imports the Black and White games' Pokedex entries for every Pokemon before Gen 6. Then, it starts importing the PokeDex entries for the respective first game of each following generation, as it can guarantee that the games will hold PokeDex data for these Pokemon. In the end it would be better to import all Pokedex entries for all languages and games, and then add filtering based on language.
* There is generally no multi-language support. Everything is in English right now.

import express from "express";

import Config from "../config";
import {performance} from "perf_hooks"

import pokemonRoutes from "./rest-api/routes/PokemonRoutes"
import errorResponse from "./middleware/ErrorResponse"
import helloRoutes from "./rest-api/routes/HelloRoutes";

const app = express();
const port = Config.PORT;

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`)
    next()
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

const serverStartTimer = performance.now()

app.use('/sprites', express.static("./src/sprites"))

app.use('/api', pokemonRoutes)
app.use('/api', helloRoutes)

app.use(errorResponse)

app.listen(port, () => {
    const serverStartedTimer = performance.now()
    console.log(`Launched server on port ${port} in ${Math.round(((serverStartedTimer - serverStartTimer) +
        Number.EPSILON) * 100) / 100} milliseconds.`)
})






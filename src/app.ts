import express from "express";
// @ts-ignore
import helmet from "helmet";
import { doubleCsrf} from "csrf-csrf";

import Config from "../config";
import {performance} from "perf_hooks"

import pokemonRoutes from "./rest-api/routes/PokemonRoutes"
import errorResponse from "./middleware/ErrorResponse"
import helloRoutes from "./rest-api/routes/HelloRoutes";

const app = express();
app.use(helmet());

const {generateToken, doubleCsrfProtection} = doubleCsrf({
    getSecret: () => "Secret", // A function that optionally takes the request and returns a secret
    getSessionIdentifier: (req) => "", // A function that should return the session identifier for a given request
    cookieName: "__Host-psifi.x-csrf-token", // The name of the cookie to be used, recommend using Host prefix.
    cookieOptions: {
        sameSite: "lax",  // Recommend you make this strict if posible
        path: "/",
        secure: true,
    },
    size: 64, // The size of the generated tokens in bits
    ignoredMethods: ["HEAD", "OPTIONS"], // A list of request methods that will not be protected.
    getTokenFromRequest: (req) => req.headers["x-csrf-token"], // A function that returns the token from the request
});

const port = Config.PORT;

app.get('/csrf-token', (req, res) => {
    const csrfToken = generateToken(req, res);
    // You could also pass the token into the context of a HTML response.
    res.json({ csrfToken });
})

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






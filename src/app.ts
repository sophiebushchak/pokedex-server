import express from "express";

import Config from "../config";
import {performance} from "perf_hooks"

import * as database from "./database/database"
import {Connection} from "typeorm";

const app = express();
const port = Config.PORT;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

const serverStartTimer = performance.now()


database
    .connect()
    .then(() => {
        app.listen(port, () => {
            const serverStartedTimer = performance.now()
            console.log(`Launched server on port ${port} in ${Math.round(((serverStartedTimer - serverStartTimer) +
                Number.EPSILON) * 100) / 100} milliseconds.`)
        })
    })
    .catch(error => {
        console.log(error)
    })





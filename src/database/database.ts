import {createConnection, Connection} from "typeorm"

const connect = async () => {
    const connection = await createConnection({
        type: "postgres",
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: '',
        database: 'pokedex-backend'
    })
}


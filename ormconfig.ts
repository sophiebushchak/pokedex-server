export default {
    "type": "postgres",
    "host": 'localhost',
    "port": 5432,
    "username": 'postgres',
    "password": 'password',
    "database": 'postgres',
    "schema": "pokedex-backend",
    "connectTimeoutMS": 10000,
    "entities": ["./src/database/entities/*.ts"]
}

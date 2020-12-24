import {createConnection, getConnection, Repository} from "typeorm";
import {Pokemon} from "../../database/entities/Pokemon";


export default class PokemonController {

    private pokemonRepository: Repository<Pokemon>;

    constructor() {
        createConnection()
            .then(connection => {
                this.pokemonRepository = connection.getRepository(Pokemon)
            })
    }

    getPokedex = async (req, res, next) => {
        try {
            let offset: number = req.query.offset;
            let limit: number = req.query.limit;
            if (!offset || !limit) {
                offset = 0;
                limit = 20;
            }
            const pokemon = await this.pokemonRepository.find({
                skip: offset,
                take: limit
            })
            return res.status(200).json(
                {
                    message: `Found ${pokemon.length} Pokémon.`,
                    statusCode: 200,
                    pokemon: pokemon
                })
        } catch (errorThrown) {
            const error = {
                errorThrown
            }
            next(error)
        }
    }
}

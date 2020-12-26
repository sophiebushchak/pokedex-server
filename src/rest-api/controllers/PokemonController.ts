import {createConnection, getConnection, Repository} from "typeorm";
import {Pokemon} from "../../database/entities/Pokemon";

import Wait from "../../utils/Wait"
import wait from "../../utils/Wait";

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
            if (!offset) {
                offset = 0;
            }
            if (!limit) {
                limit = 20;
            }
            const pokemon = await this.pokemonRepository.find({
                select: [
                    "pokedexNumber",
                    "pokemonName",
                    "primaryType",
                    "secondaryType",
                ],
                relations: [
                    "sprites"
                ],
                skip: offset,
                take: limit,
                order: {
                    pokedexNumber: "ASC"
                }
            })
            await wait(3000)
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

    getTotalPokemon = async (req, res, next) => {
        try {
            const count = await this.pokemonRepository.count()
            return res.status(200).json(
                {
                    statusCode: 200,
                    count: count
                }
            )
        } catch (errorThrown) {
            const error = {
                errorThrown
            }
            next(error)
        }
    }
}

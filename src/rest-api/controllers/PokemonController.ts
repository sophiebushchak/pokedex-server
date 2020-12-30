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
            let name: String = req.query.name || null;
            let generation: number = req.query.generation || null;
            let color: String = req.query.color || null;
            let minWeight: number = req.query.minWeight || null;
            let maxWeight: number = req.query.maxWeight || null;
            let minHeight: number = req.query.minHeight || null;
            let maxHeight: number = req.query.maxHeight || null;
            if (!offset) {
                offset = 0;
            }
            if (!limit) {
                limit = 20;
            }
            const query = this.pokemonRepository
                .createQueryBuilder("pokemon")
                .select("pokemon")
            let usedWhere: boolean = false;
            if (name) {
                query.where("pokemon.pokemonName ILIKE :name", { name: `%${name}%` })
                usedWhere = true
            }
            if (generation) {
                if (usedWhere) {
                    query.andWhere("pokemon.generation = :generation", { generation: generation })
                } else {
                    query.where("pokemon.generation = :generation", { generation: generation })
                    usedWhere = true
                }
            }
            if (color) {
                if (usedWhere) {
                    query.andWhere("pokemon.color = :color", { color: color})
                } else {
                    query.where("pokemon.color = :color", { color: color})
                    usedWhere = true
                }
            }
            if (minWeight) {
                if (usedWhere) {
                    query.andWhere("pokemon.weight > :minWeight", { minWeight: minWeight})
                } else {
                    query.where("pokemon.weight > :minWeight", { minWeight: minWeight})
                    usedWhere = true
                }
            }
            if (maxWeight) {
                if (usedWhere) {
                    query.andWhere("pokemon.weight < :maxWeight", { maxWeight: maxWeight})
                } else {
                    query.where("pokemon.weight < :maxWeight", { maxWeight: maxWeight})
                    usedWhere = true
                }
            }
            if (minHeight) {
                if (usedWhere) {
                    query.andWhere("pokemon.height > :minHeight", { minHeight: minHeight})
                } else {
                    query.where("pokemon.height > :minHeight", { minHeight: minHeight})
                    usedWhere = true
                }
            }
            if (maxHeight) {
                if (usedWhere) {
                    query.andWhere("pokemon.height < :maxHeight", { maxHeight: maxHeight})
                } else {
                    query.where("pokemon.height < :maxHeight", { maxHeight: maxHeight})
                    usedWhere = true
                }
            }
            query.leftJoinAndSelect("pokemon.sprites", "sprites").orderBy("pokemon.pokedexNumber")
            if (!usedWhere) {
                query.limit(limit).offset(offset)
            }
            const pokemon = await query.getMany()
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
            return next(error)
        }
    }

    getPokemon = async (req, res, next) => {
        try {
            const pokedexNumber = req.params.pokedexNumber
            if (!pokedexNumber) {
                const errorThrown = new Error("No Pokemon specified")
                const error = {
                    errorThrown,
                    statusCode: 400
                }
                return next(error)
            }
            const pokemon = await this.pokemonRepository.findOne({
                where: {
                    pokedexNumber: pokedexNumber
                }
            })
            if (!pokemon) {
                const errorThrown = new Error("No Pokemon found with Pokedex number: " + pokedexNumber)
                const error = {
                    errorThrown,
                    statusCode: 404
                }
                return next(error)
            }
            return res.status(200).json({
                message: "Found Pokemon with Pokedex number " + pokedexNumber,
                statusCode: 200,
                pokemon: pokemon
            })
        } catch (errorThrown) {
            const error = {
                errorThrown
            }
            return next(error)
        }
    }

    getEvolutions = async (req, res, next) => {
        try {
            const pokedexNumber = req.params.pokedexNumber
            if (!pokedexNumber) {
                const errorThrown = new Error("No Pokemon specified")
                const error = {
                    errorThrown,
                    statusCode: 400
                }
                return next(error)
            }
            let first = await this.pokemonRepository.findOne({
                where: {
                    pokedexNumber: pokedexNumber
                },
                relations: [
                    "sprites",
                    "evolvesFrom"
                ]
            })
            console.log(first)
            if (!first) {
                const errorThrown = new Error("No Pokemon found with Pokedex number: " + pokedexNumber)
                const error = {
                    errorThrown,
                    statusCode: 404
                }
                return next(error)
            }
            console.log(`First: ${first.pokemonName}`)
            let second: Pokemon = null
            let third: Pokemon = null;
            if (first.evolvesFrom) {
                second = first;
                first = await this.pokemonRepository.findOne({
                    where: {
                        pokedexNumber: second.evolvesFrom.pokedexNumber
                    },
                    relations: [
                        "sprites",
                        "evolvesFrom"
                    ]
                })
                second.evolvesFrom = null
            }
            if (second) {
                if (first.evolvesFrom) {
                    third = second;
                    second = first;
                    first = second.evolvesFrom
                    third.evolvesFrom = null
                    second.evolvesFrom = null
                    return res.status(200).json({
                        first: first,
                        second: second,
                        third: third
                    })
                }
            }
            const evolutionOfPokemon = await this.pokemonRepository.findOne({
                where: {
                    evolvesFrom: pokedexNumber
                },
                relations: [
                    "sprites",
                    "evolvesFrom"
                ]
            })
            if (evolutionOfPokemon) {
                if (second) {
                    third = evolutionOfPokemon;
                    third.evolvesFrom = null
                } else {
                    second = evolutionOfPokemon
                }
            }
            if (second && !third) {
                second.evolvesFrom = null
                third = await this.pokemonRepository.findOne({
                    where: {
                        evolvesFrom: second.pokedexNumber
                    },
                    relations: [
                        "sprites",
                    ]
                })
            }
            return res.status(200).json({
                first: first,
                second: second,
                third: third
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

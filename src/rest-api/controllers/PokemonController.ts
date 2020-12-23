import {getConnection} from "typeorm";
import {Pokemon} from "../../database/entities/Pokemon";


export default class PokemonController {

    private pokemonRepository = getConnection().getRepository(Pokemon)

    getPokedex = async (req, res, next) => {
        const offset = req.query.offset;
        const limit = req.query.limit;
        res.status(200).json({message: "Okay"})
    }
}

import * as express from "express";
import PokemonController from "../controllers/PokemonController";

const router = express.Router()
const controller = new PokemonController()

router.get('/pokedex', controller.getPokedex)

router.get('/pokedex/count', controller.getTotalPokemon)
export default router;

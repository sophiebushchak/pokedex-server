import {connect} from "../database/database"
import {Pokemon} from "../database/entities/Pokemon";
import axios from 'axios';

const pokeApiSourceUrl = 'https://pokeapi.co/api/v2/'

const setupDatabase = async () => {
    const connection = await connect()
    const pokemonRepository = connection.getRepository(Pokemon)

    const nationalPokedex = await axios.get(pokeApiSourceUrl + "/pokedex/1")
    const totalPokemon = nationalPokedex.data.pokemon_entries.length

    console.log("Retrieving " + totalPokemon + " Pokemon in total..")

    const pokemonResources = []
    const pokemonSpeciesResources = []

    let requestCount = 0;

    for (let i = 1; i <= totalPokemon; i++) {
        const retrievedPokemon = await axios.get(pokeApiSourceUrl + "/pokemon/" + i)
        pokemonResources.push(retrievedPokemon)
        requestCount++;
        const retrievedPokemonSpecies = await axios.get(pokeApiSourceUrl + "/pokemon-species/" + i)
        pokemonSpeciesResources.push(retrievedPokemonSpecies)
        requestCount++;
        console.log(i + ". " + retrievedPokemonSpecies.data.name)
        if (requestCount % 100 == 0) {
            console.log('Retrieved ' + i + " Pokemon from PokeAPI so far.")
            console.log("Waiting 30 seconds to not overload the API..")
            await wait(30000)
            requestCount = 0;
            console.log("Continuing..")
        }
    }
}

const wait = (waitTimeMS) => {
    return new Promise(resolve => setTimeout(resolve, waitTimeMS))
}

setupDatabase()
    .then(result => {})
    .catch(error => {
        console.log(error)
    })



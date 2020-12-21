import {connect} from "../database/database"
import {Pokemon} from "../database/entities/Pokemon";
import * as fs from "fs"
import axios from 'axios';
import {createWriteStream} from "fs";
import {response} from "express";

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

    for (let i = 1; i <= 5; i++) {
        const retrievedPokemon = await axios.get(pokeApiSourceUrl + "/pokemon/" + i)
        pokemonResources.push(retrievedPokemon.data)
        requestCount++;
        const retrievedPokemonSpecies = await axios.get(pokeApiSourceUrl + "/pokemon-species/" + i)
        pokemonSpeciesResources.push(retrievedPokemonSpecies.data)
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

    const image = await axios.get(pokemonResources[1].sprites.front_default)
    fs.createWriteStream("./images/" + 1 + ".png")
    axios.request({
        method: "GET",
        url: image,
        responseType: "blob"
    }).then(response => {

            }
        )

    for (let i = 0; i < 5; i++) {
        const createdPokemon = new Pokemon()
        const basicData = pokemonResources[i]
        const speciesData = pokemonSpeciesResources[i]
        createdPokemon.pokedexNumber = i + 1;
        createdPokemon.pokemonName = speciesData.names.find(name => name.language.name == "en").name
        createdPokemon.primaryType = basicData.types.find(type => type.slot == 1).type.name
        const secondaryType = basicData.types.find(type => type.slot == 2)
        createdPokemon.secondaryType = secondaryType ? secondaryType.type.name : null;
        createdPokemon.genus = speciesData.genera.find(genus => genus.language.name == "en").genus

    }


}

const wait = (waitTimeMS) => {
    return new Promise(resolve => setTimeout(resolve, waitTimeMS))
}

setupDatabase()
    .then(result => {
    })
    .catch(error => {
        console.log(error)
    })



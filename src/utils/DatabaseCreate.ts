import {Pokemon} from "../database/entities/Pokemon";
import * as fs from "fs"
import axios from 'axios';
import {createWriteStream} from "fs";
import {response} from "express";
import path from "path";
import {createConnection} from "typeorm";

const pokeApiSourceUrl = 'http://localhost:8000/api/v2'

const setupDatabase = async () => {
    const entityPath = path.join(__dirname, "..", "database", "entities", "*.ts")
    const connection = await createConnection({
        "type": "postgres",
        "host": 'localhost',
        "port": 5432,
        "username": 'postgres',
        "password": 'password',
        "database": 'postgres',
        "schema": "pokedex-backend",
        "connectTimeoutMS": 10000,
        "synchronize": true,
        "entities": [entityPath]
    })
    const pokemonRepository = connection.getRepository(Pokemon)

    const nationalPokedex = await axios.get(pokeApiSourceUrl + "/pokedex/1")
    const totalPokemon = nationalPokedex.data.pokemon_entries.length

    console.log("Retrieving " + totalPokemon + " Pokemon in total..")

    const pokemonResources = []
    const pokemonSpeciesResources = []

    let requestCount = 0;

    for (let i = 1; i <= 20; i++) {
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

    const pokemon: Pokemon[] = []

    for (let i = 0; i < pokemonResources.length; i++) {
        const createdPokemon: Pokemon = await createPokemon(pokemonResources[i], pokemonSpeciesResources[i])
        pokemon.push(createdPokemon)
    }

    console.log(pokemon)

    const result = await pokemonRepository.save(pokemon)
    console.log(result)

    console.log("Database has been filled with data.")
}

const wait = (waitTimeMS) => {
    return new Promise(resolve => setTimeout(resolve, waitTimeMS))
}

const saveImage = async (imageUrl: string, pokemonNumber: number): Promise<string> => {
    const imageResponseData = await axios({
        method: "get",
        url: imageUrl,
        responseType: "stream"
    })
    const spriteLocation = path.join(__dirname, "..", "sprites", pokemonNumber + ".png")
    imageResponseData.data.pipe(createWriteStream(spriteLocation))
    return `/sprites/${pokemonNumber}.png`
}

const createPokemon = async (basicData: any, speciesData: any): Promise<Pokemon> => {
    const createdPokemon = new Pokemon()
    createdPokemon.pokedexNumber = speciesData.id;
    createdPokemon.pokemonName = speciesData.names.find(name => name.language.name == "en").name
    createdPokemon.primaryType = basicData.types.find(type => type.slot == 1).type.name
    const secondaryType = basicData.types.find(type => type.slot == 2)
    createdPokemon.secondaryType = secondaryType ? secondaryType.type.name : null;
    createdPokemon.genus = speciesData.genera.find(genus => genus.language.name == "en").genus
    if (basicData.sprites.front_default) {
        createdPokemon.spriteUrl = await saveImage(basicData.sprites.front_default, basicData.id)
    }
    const generationUrl: string = speciesData.generation.url
    createdPokemon.generation = parseInt(generationUrl.charAt(generationUrl.length - 2))
    const flavorTextVersion: string = createdPokemon.generation <= 6 ? "omega-ruby" : createdPokemon.generation == 7 ? "ultra-sun" : "sword"
        createdPokemon.pokedexEntryDescription = speciesData.flavor_text_entries
        .find(entry => entry.language.name == "en" && entry.version.name == flavorTextVersion).flavor_text
    createdPokemon.height = basicData.height
    createdPokemon.weight = basicData.weight
    createdPokemon.color = speciesData.color.name
    return createdPokemon
}

setupDatabase()
    .then(result => {
    })
    .catch(error => {
        console.log(error)
    })



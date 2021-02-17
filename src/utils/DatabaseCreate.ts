import {Pokemon} from "../database/entities/Pokemon";
import * as fs from "fs"
import {createWriteStream} from "fs"
import axios from 'axios';
import path from "path";
import Wait from "./Wait"
import {createConnection} from "typeorm";
import {PokemonSprites} from "../database/entities/PokemonSprites";

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

    const nationalPokedex = await axios.get(pokeApiSourceUrl + "/pokedex/1")
    const totalPokemon = nationalPokedex.data.pokemon_entries.length

    console.log("Retrieving " + totalPokemon + " Pokemon in total..")

    const pokemonResources = []
    const pokemonSpeciesResources = []

    let requestCount = 0;

    for (let i = 1; i <= totalPokemon; i++) {
        const retrievedPokemon = await axios.get(pokeApiSourceUrl + "/pokemon/" + i)
        pokemonResources.push(retrievedPokemon.data)
        requestCount++;
        const retrievedPokemonSpecies = await axios.get(pokeApiSourceUrl + "/pokemon-species/" + i)
        pokemonSpeciesResources.push(retrievedPokemonSpecies.data)
        requestCount++;
        console.log(i + ". " + retrievedPokemonSpecies.data.name)
        if (requestCount % 100 == 0) {
            console.log('Retrieved ' + i + " Pokemon from PokeAPI so far.")
/*          await Wait(30000)
            console.log("Waiting 30 seconds to not overload the API..") */
            requestCount = 0;
            console.log("Continuing..")
        }
    }

    console.log("\n")
    console.log("Populating database now.")

    for (let i = 0; i < pokemonResources.length; i++) {
        const pokemon = await createPokemon(pokemonResources[i], pokemonSpeciesResources[i])
        console.log("Populated Pokemon entity for " + pokemonResources[i].name)
        const sprites = await createSprites(pokemonResources[i].sprites, pokemonResources[i].id)
        console.log("Loaded Sprites for " + pokemonResources[i].name)
        await connection.manager.save(sprites)
        pokemon.sprites = sprites
        await connection.manager.save(pokemon)
        console.log(pokemonResources[i].name + "has been loaded into the database.")
        console.log("\n")
    }

    for (let i = 0; i < pokemonSpeciesResources.length; i++) {
        if (pokemonSpeciesResources[i].evolves_from_species) {
            const pokemon: Pokemon = await connection.manager.findOne(Pokemon, {
                where: [
                    {pokedexNumber: pokemonSpeciesResources[i].id}
                ]
            })
            const evolvesFromSpeciesData: any = await axios.get(pokemonSpeciesResources[i].evolves_from_species.url)
            const evolvesFromPokedexNumber = evolvesFromSpeciesData.data.id
            pokemon.evolvesFrom = await connection.manager.findOne(Pokemon, {
                where: [
                    {pokedexNumber: evolvesFromPokedexNumber}
                ]
            });
            await connection.manager.save(pokemon)
        }
    }

    console.log("Database has been filled with data.")
}

const saveImage = async (imageUrl: string, pokemonId: number, filename: string): Promise<string> => {
    const imageResponseData = await axios({
        method: "get",
        url: imageUrl,
        responseType: "stream"
    })
    const spriteLocation = path.join(__dirname, "..", "sprites", String(pokemonId))
    if (!fs.existsSync(spriteLocation)) {
        fs.mkdir(spriteLocation, () => {
        })
    }
    const file = `${filename}.png`
    imageResponseData.data.pipe(createWriteStream(path.join(spriteLocation, file)))
    return `sprites/${pokemonId}/${filename}.png`
}

const createPokemon = async (basicData: any, speciesData: any): Promise<Pokemon> => {
    const createdPokemon = new Pokemon()
    createdPokemon.pokedexNumber = speciesData.id;
    createdPokemon.pokemonName = speciesData.names.find(name => name.language.name == "en").name
    createdPokemon.primaryType = basicData.types.find(type => type.slot == 1).type.name
    const secondaryType = basicData.types.find(type => type.slot == 2)
    createdPokemon.secondaryType = secondaryType ? secondaryType.type.name : null;
    createdPokemon.genus = speciesData.genera.find(genus => genus.language.name == "en").genus
    const generationUrl: string = speciesData.generation.url
    createdPokemon.generation = parseInt(generationUrl.charAt(generationUrl.length - 2))
    const flavorTextVersion: string = createdPokemon.generation <= 6 ? "omega-ruby" : createdPokemon.generation == 7 && createdPokemon.pokedexNumber < 808 ? "ultra-sun" : "sword"
    createdPokemon.pokedexEntryDescription = speciesData.flavor_text_entries
        .find(entry => entry.language.name == "en" && entry.version.name == flavorTextVersion).flavor_text
    createdPokemon.height = basicData.height
    createdPokemon.weight = basicData.weight
    createdPokemon.color = speciesData.color.name
    return createdPokemon
}

const createSprites = async (sprites: any, pokemonId: number): Promise<PokemonSprites> => {
    const pokemonSprites = new PokemonSprites()
    if (sprites.front_default) {
        pokemonSprites.front = await saveImage(
            sprites.front_default,
            pokemonId,
            "front")
    } else {
        pokemonSprites.front = `sprites/error/nosprite.png`
    }
    if (sprites.back_default) {
        pokemonSprites.back = await saveImage(
            sprites.back_default,
            pokemonId,
            "back")
    } else {
        pokemonSprites.back = `sprites/error/nosprite.png`
    }
    if (sprites.front_shiny) {
        pokemonSprites.frontShiny = await saveImage(
            sprites.front_shiny,
            pokemonId,
            "frontShiny")
    } else {
        pokemonSprites.frontShiny = `sprites/error/nosprite.png`
    }
    if (sprites.back_shiny) {
        pokemonSprites.backShiny = await saveImage(
            sprites.back_shiny,
            pokemonId,
            "backShiny")
    } else {
        pokemonSprites.backShiny = `sprites/error/nosprite.png`
    }
    return pokemonSprites
}

setupDatabase()
    .then(result => {
    })
    .catch(error => {
        console.log(error)
    })



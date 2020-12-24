import {Entity, Column, PrimaryColumn, OneToOne, JoinColumn} from "typeorm"
import {PokemonSprites} from "./PokemonSprites";

@Entity()
export class Pokemon {
    @PrimaryColumn()
    pokedexNumber: number;

    @Column()
    pokemonName: string;

    @Column()
    genus: string;

    @Column()
    primaryType: string;

    @Column({nullable: true})
    secondaryType: string;

    @Column()
    generation: number;

    @Column()
    pokedexEntryDescription: string

    @Column()
    height: number

    @Column()
    weight: number

    @Column()
    color: string

    @OneToOne(() => PokemonSprites)
    @JoinColumn()
    sprites: PokemonSprites;
}

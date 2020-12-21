import { Entity, Column, PrimaryColumn } from "typeorm"

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

    @Column()
    secondaryType: string;

    @Column()
    spriteUrl: string;

    @Column()
    generation: number;

    @Column()
    pokedexEntryDescription: string

    @Column()
    height: number

    @Column()
    weight: number

    @Column("simple-array")
    colors: string[]
}

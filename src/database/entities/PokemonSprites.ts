import {Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Pokemon} from "./Pokemon";


@Entity()
export class PokemonSprites {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    front: string

    @Column({nullable: true})
    back: string

    @Column({nullable: true})
    frontShiny: string

    @Column({nullable: true})
    backShiny: string
}

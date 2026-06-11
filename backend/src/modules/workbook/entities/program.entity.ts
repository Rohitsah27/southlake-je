import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column('jsonb')
  rates: {
    comm?: number;
    ulae?: number;
    lossPick?: number;
    laeDcc?: number;
    laeAoe?: number;
    boardsCharge?: number;
    lossRatioCap?: number;
  };
}

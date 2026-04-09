import { IsString, IsNotEmpty } from 'class-validator';

export class CreateItemDto {
    @IsString()
    @IsNotEmpty()
    public name!: string; // Using ! to assert assignment, or use strictPropertyInitialization: false

    @IsString()
    public description?: string;
}

import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateSkillCourseDto {
    @IsString()
    @IsNotEmpty()
    public title!: string;

    @IsString()
    @IsNotEmpty()
    public description!: string;

    @IsArray()
    @IsOptional()
    public features?: string[];

    @IsString()
    @IsOptional() // Handled by Multer, but good to have
    public category?: string;
}

export class UpdateSkillCourseDto {
    @IsString()
    @IsOptional()
    public title?: string;

    @IsString()
    @IsOptional()
    public description?: string;

    @IsArray()
    @IsOptional()
    public features?: string[];

    @IsString()
    @IsOptional()
    public category?: string;
}

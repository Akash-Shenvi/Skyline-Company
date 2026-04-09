import { Request, Response } from 'express';
import Item from '../models/item.model';
import { CreateItemDto } from '../dtos/item.dto';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

export const getItems = async (req: Request, res: Response) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createItem = async (req: Request, res: Response) => {
    const itemDto = plainToClass(CreateItemDto, req.body);
    const errors = await validate(itemDto);

    if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
    }

    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

import Whiskey, { IWhiskey } from "../models/Whiskey";
import { CreateWhiskeyDTO } from "../validations/whiskey.schema";

export class WhiskeyRepository {
  async findAll(): Promise<IWhiskey[]> {
    return await Whiskey.find().sort({ createdAt: -1 }).lean();
  }

  async findById(id: string): Promise<IWhiskey | null> {
    return await Whiskey.findById(id).lean();
  }

  async create(data: CreateWhiskeyDTO): Promise<IWhiskey> {
    const whiskey = new Whiskey(data);
    return await whiskey.save();
  }

  async update(id: string, data: Partial<CreateWhiskeyDTO>): Promise<IWhiskey | null> {
    return await Whiskey.findByIdAndUpdate(id, data, { new: true }).lean();
  }
}

export const whiskeyRepository = new WhiskeyRepository();

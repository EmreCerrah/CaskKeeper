import { whiskeyRepository } from "../repositories/WhiskeyRepository";
import { CreateWhiskeyDTO, CreateWhiskeySchema } from "../validations/whiskey.schema";

export class WhiskeyService {
  async getAllWhiskeys() {
    return await whiskeyRepository.findAll();
  }

  async getWhiskeyById(id: string) {
    const whiskey = await whiskeyRepository.findById(id);
    if (!whiskey) {
      throw new Error("Whiskey not found");
    }
    return whiskey;
  }

  async createWhiskey(data: unknown) {
    // 1. Zod Validation
    const parsedData = CreateWhiskeySchema.safeParse(data);
    if (!parsedData.success) {
      throw new Error(`Validation Error: ${parsedData.error.message}`);
    }

    // 2. Business Logic (Check if exact brand & name exist)
    // could be added here in phase 2

    // 3. Save to DB via Repository
    return await whiskeyRepository.create(parsedData.data);
  }
}

export const whiskeyService = new WhiskeyService();

import { NextRequest } from "next/server";
import { createResponse, createErrorResponse } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";

export async function GET() {
  try {
    await connectToDatabase();
    const whiskeys = await whiskeyService.getAllWhiskeys();
    return createResponse(whiskeys, "Whiskeys fetched successfully");
  } catch (error: any) {
    return createErrorResponse(error.message, "Failed to fetch whiskeys");
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    // Pass strictly to service
    const newWhiskey = await whiskeyService.createWhiskey(body);
    
    return createResponse(newWhiskey, "Whiskey created successfully", 201);
  } catch (error: any) {
    if (error.message.includes("Validation Error")) {
      return createErrorResponse(error.message, "Invalid data", 400);
    }
    return createErrorResponse(error.message, "Failed to create whiskey");
  }
}

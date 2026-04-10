import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { createResponse, createErrorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    // Attempt to connect to the database to ensure connection is healthy
    await connectToDatabase();
    
    return createResponse(
      {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString()
      },
      "Health check passed"
    );
  } catch (error: any) {
    return createErrorResponse(
      error.message,
      "Health check failed: Database connection error",
      503
    );
  }
}

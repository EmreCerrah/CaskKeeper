import connectToDatabase from "@/lib/db";
import { createResponse, createErrorResponse } from "@/lib/api-response";

// Build sırasında prerender edilmesin — her istekte DB sağlığı kontrol edilir
export const dynamic = "force-dynamic";

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

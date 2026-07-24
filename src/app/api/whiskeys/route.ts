import { NextRequest } from "next/server";
import { createResponse, handleApiError } from "@/lib/api-response";
import connectToDatabase from "@/lib/db";
import { whiskeyService } from "@/server/services/WhiskeyService";
import type { WhiskeyFilterOptions, WhiskeyPaginationOptions } from "@/server/repositories/WhiskeyRepository";

/**
 * GET /api/whiskeys
 * Query parametreleri: search, type, region, country, limitedEdition, page, limit, sortBy, sortOrder
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const params = req.nextUrl.searchParams;

    const filters: WhiskeyFilterOptions = {
      search: params.get("search") ?? undefined,
      type: params.get("type") ?? undefined,
      region: params.get("region") ?? undefined,
      country: params.get("country") ?? undefined,
      limitedEdition: params.get("limitedEdition") === "true" ? true : undefined,
    };

    const pagination: WhiskeyPaginationOptions = {
      page: params.get("page") ? Number(params.get("page")) : undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : undefined,
      sortBy: (params.get("sortBy") as WhiskeyPaginationOptions["sortBy"]) ?? undefined,
      sortOrder: (params.get("sortOrder") as "asc" | "desc") ?? undefined,
    };

    const whiskeys = await whiskeyService.getAllWhiskeys(filters, pagination);
    return createResponse(whiskeys, "Viskiler listelendi");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const newWhiskey = await whiskeyService.createWhiskey(body);

    return createResponse(newWhiskey, "Viski oluşturuldu", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

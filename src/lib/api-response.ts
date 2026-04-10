import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export function createResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    } as ApiResponse<T>,
    { status }
  );
}

export function createErrorResponse(error: any, message: string = "An error occurred", status: number = 500) {
  return NextResponse.json(
    {
      success: false,
      message,
      error,
    } as ApiResponse<null>,
    { status }
  );
}

import { NextResponse } from "next/server";
import { getFigmaFile } from "@/src/lib/figma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get("fileKey");

    if (!fileKey) {
      return NextResponse.json(
        { 
          error: "Missing fileKey parameter",
          message: "Add ?fileKey=YOUR_FILE_KEY to the URL",
          example: "/api/figma/test-connection?fileKey=abc123def456"
        },
        { status: 400 }
      );
    }

    // Test connection by fetching file metadata using fetch-based API
    const file = await getFigmaFile(fileKey);

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Figma API!",
      file: {
        name: file.name,
        lastModified: file.lastModified,
      },
      document: {
        id: file.document?.id,
        name: file.document?.name,
        type: file.document?.type,
      },
      components: Object.keys(file.components || {}).length,
      styles: Object.keys(file.styles || {}).length,
      // Include raw response for debugging (only in dev)
      ...(process.env.NODE_ENV === 'development' && { 
        raw: {
          documentId: file.document?.id,
          componentCount: Object.keys(file.components || {}).length,
          styleCount: Object.keys(file.styles || {}).length,
        }
      }),
    });
  } catch (error: any) {
    console.error("Figma API test error:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      response: error?.response,
      status: error?.status,
      statusCode: error?.statusCode,
    });
    
    const errorMessage = 
      error?.response?.data?.err || 
      error?.response?.data?.message || 
      error?.message || 
      "Unknown error";
    
    const statusCode = 
      error?.statusCode || 
      error?.response?.status || 
      error?.status || 
      500;

    return NextResponse.json(
      {
        error: "Failed to connect to Figma API",
        message: errorMessage,
        statusCode,
        details: {
          responseData: error?.response?.data,
          originalError: error?.message,
          stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        },
      },
      { status: statusCode }
    );
  }
}


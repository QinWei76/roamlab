import { NextResponse } from "next/server";
import { getRidbRecAreas } from "@/lib/destination/ridb";

export async function GET() {
  try {
    const areas = await getRidbRecAreas({
      limit: 5,
    });

    return NextResponse.json({
      success: true,
      count: areas.length,
      areas,
    });
  } catch (error) {
    console.error("RIDB test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown RIDB error",
      },
      {
        status: 500,
      }
    );
  }
}

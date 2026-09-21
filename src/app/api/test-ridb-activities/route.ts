import { NextResponse } from "next/server";

import {
  getRidbRecAreaActivities,
  getRidbRecAreas,
} from "@/lib/destination/ridb";

export async function GET() {
  try {
    /*
     * First find a real RIDB recreation area.
     *
     * Using a query instead of hard-coding an ID
     * keeps this test independent from the previous
     * matching response.
     */
    const areas =
      await getRidbRecAreas({
        query: "Cerbat Foothills",
        limit: 5,
      });

    if (areas.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No matching RIDB recreation area found.",
        },
        {
          status: 404,
        }
      );
    }

    const area = areas[0];

    /*
     * Ask RIDB for the structured activities
     * associated with this real recreation area.
     */
    const activities =
      await getRidbRecAreaActivities(
        area.id
      );

    return NextResponse.json({
      success: true,

      area: {
        id: area.id,
        name: area.name,
        latitude:
          area.latitude,
        longitude:
          area.longitude,
      },

      activityCount:
        activities.length,

      activities:
        activities.map(
          (activity) => ({
            id: activity.id,
            name: activity.name,
            level:
              activity.level,
          })
        ),

      note:
        "Activities are returned directly from RIDB structured recreation-area activity data.",
    });
  } catch (error) {
    console.error(
      "RIDB activities test failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown RIDB activities error",
      },
      {
        status: 500,
      }
    );
  }
}

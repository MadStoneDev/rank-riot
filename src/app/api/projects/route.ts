import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Extract data from the form
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const description = formData.get("description") as string;
    const scan_frequency = formData.get("scan_frequency") as string;

    // Validate inputs
    if (!name || !url) {
      return NextResponse.json(
        { error: "Name and URL are required" },
        { status: 400 },
      );
    }

    // Ensure URL has proper format
    let formattedUrl = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      formattedUrl = `https://${url}`;
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const token = await supabase.auth
      .getSession()
      .then(({ data }) => data.session?.access_token);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to create a project" },
        { status: 401 },
      );
    }

    // Create project in database
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        url: formattedUrl,
        description,
        scan_frequency: scan_frequency || "weekly",
        notification_email: user.email,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger a scan using the backend API
    try {
      const scanResponse = await axios.post(
        `${process.env.CRAWLER_API_URL}/api/scan`,
        {
          project_id: data.id,
          email: user.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error("Error initiating scan:", error);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in project creation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to view projects" },
        { status: 401 },
      );
    }

    // Get user's projects
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in projects fetch:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

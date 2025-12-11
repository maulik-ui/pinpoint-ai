import { NextResponse } from "next/server";
import {
  figmaClient,
  getFile,
  getFileNodes,
  getTeamProjects,
  getProjectFiles,
} from "@/src/lib/figmaClient";

export async function GET(request: Request) {
  try {
    if (!figmaClient) {
      return NextResponse.json(
        { error: "Figma API token not configured. Please set FIGMA_API_TOKEN in your environment variables." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const fileKey = searchParams.get("fileKey");
    const nodeIds = searchParams.get("nodeIds");
    const teamId = searchParams.get("teamId");
    const projectId = searchParams.get("projectId");

    switch (action) {
      case "file": {
        if (!fileKey) {
          return NextResponse.json(
            { error: "fileKey parameter is required" },
            { status: 400 }
          );
        }
        const file = await getFile(fileKey);
        return NextResponse.json({ data: file });
      }

      case "nodes": {
        if (!fileKey || !nodeIds) {
          return NextResponse.json(
            { error: "fileKey and nodeIds parameters are required" },
            { status: 400 }
          );
        }
        const nodeIdsArray = nodeIds.split(",").map((id) => id.trim());
        const nodes = await getFileNodes(fileKey, nodeIdsArray);
        return NextResponse.json({ data: nodes });
      }

      case "team-projects": {
        if (!teamId) {
          return NextResponse.json(
            { error: "teamId parameter is required" },
            { status: 400 }
          );
        }
        const projects = await getTeamProjects(teamId);
        return NextResponse.json({ data: projects });
      }

      case "project-files": {
        if (!projectId) {
          return NextResponse.json(
            { error: "projectId parameter is required" },
            { status: 400 }
          );
        }
        const files = await getProjectFiles(projectId);
        return NextResponse.json({ data: files });
      }

      default:
        return NextResponse.json(
          {
            error: "Invalid action. Supported actions: file, nodes, team-projects, project-files",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Figma API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch from Figma API",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!figmaClient) {
      return NextResponse.json(
        { error: "Figma API token not configured. Please set FIGMA_API_TOKEN in your environment variables." },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.action) {
      return NextResponse.json(
        { error: "Request body must include an 'action' field" },
        { status: 400 }
      );
    }

    const { action, fileKey, nodeIds, teamId, projectId } = body;

    switch (action) {
      case "file": {
        if (!fileKey) {
          return NextResponse.json(
            { error: "fileKey is required" },
            { status: 400 }
          );
        }
        const file = await getFile(fileKey);
        return NextResponse.json({ data: file });
      }

      case "nodes": {
        if (!fileKey || !nodeIds) {
          return NextResponse.json(
            { error: "fileKey and nodeIds are required" },
            { status: 400 }
          );
        }
        const nodeIdsArray = Array.isArray(nodeIds)
          ? nodeIds
          : nodeIds.split(",").map((id: string) => id.trim());
        const nodes = await getFileNodes(fileKey, nodeIdsArray);
        return NextResponse.json({ data: nodes });
      }

      case "team-projects": {
        if (!teamId) {
          return NextResponse.json(
            { error: "teamId is required" },
            { status: 400 }
          );
        }
        const projects = await getTeamProjects(teamId);
        return NextResponse.json({ data: projects });
      }

      case "project-files": {
        if (!projectId) {
          return NextResponse.json(
            { error: "projectId is required" },
            { status: 400 }
          );
        }
        const files = await getProjectFiles(projectId);
        return NextResponse.json({ data: files });
      }

      default:
        return NextResponse.json(
          {
            error: "Invalid action. Supported actions: file, nodes, team-projects, project-files",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Figma API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch from Figma API",
      },
      { status: 500 }
    );
  }
}


// src/lib/figmaClient.ts
import { Api } from "figma-api";

const figmaApiToken = process.env.FIGMA_API_TOKEN;

if (!figmaApiToken) {
  console.warn(
    "Missing FIGMA_API_TOKEN env var. Figma API features will be unavailable."
  );
}

export const figmaClient = figmaApiToken
  ? new Api({ personalAccessToken: figmaApiToken })
  : null;

export type FigmaFile = {
  key: string;
  name: string;
  thumbnail_url?: string;
  last_modified: string;
};

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  [key: string]: any;
};

/**
 * Get file metadata
 * Works with both regular files and Figma Make files
 */
export async function getFile(fileKey: string, options?: { branch_data?: boolean }) {
  if (!figmaClient) {
    throw new Error("Figma API token not configured");
  }
  try {
    const params: any = { file_key: fileKey };
    if (options?.branch_data) {
      params.branch_data = "true";
    }
    return await figmaClient.getFile(params);
  } catch (error: any) {
    // Provide more detailed error information
    console.error("Figma API error details:", {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
    });
    
    const errorMessage = error?.response?.data?.err || error?.response?.data?.message || error?.message || "Unknown error";
    const statusCode = error?.response?.status || error?.status || 500;
    const detailedError = new Error(`Figma API error (${statusCode}): ${errorMessage}`);
    (detailedError as any).statusCode = statusCode;
    (detailedError as any).originalError = error;
    (detailedError as any).responseData = error?.response?.data;
    throw detailedError;
  }
}

/**
 * Get file nodes
 */
export async function getFileNodes(fileKey: string, nodeIds: string[]) {
  if (!figmaClient) {
    throw new Error("Figma API token not configured");
  }
  return await figmaClient.getFileNodes(
    { file_key: fileKey },
    { ids: nodeIds.join(",") }
  );
}

/**
 * Get team projects
 */
export async function getTeamProjects(teamId: string) {
  if (!figmaClient) {
    throw new Error("Figma API token not configured");
  }
  return await figmaClient.getTeamProjects({ team_id: teamId });
}

/**
 * Get project files
 */
export async function getProjectFiles(projectId: string) {
  if (!figmaClient) {
    throw new Error("Figma API token not configured");
  }
  return await figmaClient.getProjectFiles({ project_id: projectId });
}


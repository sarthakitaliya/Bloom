import { config } from "@bloom/config";
import { type Sandbox as sandboxType, Sandbox } from "@e2b/code-interpreter";
import { connection as redis } from "@bloom/queue";

type SandboxClient = sandboxType;

type Entry = {
  sandbox: SandboxClient;
  lastAccessed: number;
};
let sandboxes: Map<string, Entry> = new Map();
class SandboxManager {
  private TEMPLATE_ID = "ziksdofsuxuq20ijo96k";

  public Sandboxes() {
    return sandboxes.forEach((value, key) => {
      console.log(
        `Project ID: ${key}, Last Accessed: ${new Date(value.lastAccessed).toISOString()}`
      );
    });
  }
  public async createSandbox(projectId: string) {
    try {
      const client = await Sandbox.create(this.TEMPLATE_ID, {
        apiKey: config.e2bApiKey,
        timeoutMs: 10 * 60 * 1000, // 10 minutes
      });
      console.log("Sandbox created with ID:", client.sandboxId);
      const existing = sandboxes.get(projectId);
      if (existing) {
        sandboxes.delete(projectId);
        try {
          existing.sandbox.kill();
        } catch (error) {
          console.error(
            `Error cleaning up existing sandbox for project ${projectId}:`,
            error
          );
        }
      }
      const entry: Entry = { sandbox: client, lastAccessed: Date.now() };
      sandboxes.set(projectId, entry);
      return client;
    } catch (error) {
      console.error("Error creating sandbox:", error);
      throw error;
    }
  }

  public async getSandbox(projectId: string): Promise<SandboxClient | null> {
    try {
      const existing = await redis.get(`sandbox-${projectId}`);
      if (existing) {
        const { sandboxId } = JSON.parse(existing);
        const client = await Sandbox.connect(sandboxId);
        return client;
      }
    } catch (error) {
      // If NotFoundError, proceed to create new sandbox
      if (error instanceof Error && error.name === "NotFoundError") {
        console.log(
          `No existing sandbox found for project ${projectId}, creating new one.`
        );
        return this.createSandbox(projectId);
      } else {
        console.error(
          `Error retrieving sandbox for project ${projectId}:`,
          error
        );
      }
    }

    return null;
  }

  public killSandbox(projectId: string) {
    const entry = sandboxes.get(projectId);
    if (entry) {
      try {
        entry.sandbox.kill();
      } catch (error) {
        console.error(`Error cleaning up sandbox ${projectId}:`, error);
        throw error;
      } finally {
        sandboxes.delete(projectId);
      }
    }
  }
}
export const sandboxManager = new SandboxManager();

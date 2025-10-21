import { config } from "@bloom/config";
import { Sandbox, type Sandbox as sandbox } from "@e2b/code-interpreter";

type SandboxClient = sandbox;

type Entry = {
  sandbox: SandboxClient;
  lastAccessed: number;
};
class SandboxManager {
  private sandboxes: Map<string, Entry> = new Map();
  private TEMPLATE_ID = "ziksdofsuxuq20ijo96k";

  public async createSandbox() {
    try {
      const client = await Sandbox.betaCreate(this.TEMPLATE_ID, {
        apiKey: config.e2bApiKey,
        autoPause: false,
        timeoutMs: 10 * 60 * 1000, // 10 minutes
      });
      const entry: Entry = { sandbox: client, lastAccessed: Date.now() };
      this.sandboxes.set(client.sandboxId, entry);
      return client;
    } catch (error) {
      console.error("Error creating sandbox:", error);
      throw error;
    }
  }

  public async getSandbox(sandboxId: string): Promise<SandboxClient> {
    const existing = this.sandboxes.get(sandboxId);
    if (existing) {
      existing.lastAccessed = Date.now();
      return existing.sandbox;
    }

    try {
      const client = await Sandbox.betaCreate(this.TEMPLATE_ID, {
        apiKey: config.e2bApiKey,
        autoPause: false,
      });
      const entry: Entry = { sandbox: client, lastAccessed: Date.now() };
      this.sandboxes.set(client.sandboxId, entry);
      return client;
    } catch (error) {
      console.error(`Error creating sandbox ${sandboxId}:`, error);
      throw new Error(`Sandbox with ID ${sandboxId} not found.`);
    }
  }

  public killSandbox(sandboxId: string) {
    const entry = this.sandboxes.get(sandboxId);
    if (entry) {
      try {
        entry.sandbox.kill();
      } catch (error) {
        console.error(`Error cleaning up sandbox ${sandboxId}:`, error);
        throw error;
      } finally {
        this.sandboxes.delete(sandboxId);
      }
    }
  }
}
export const sandboxManager = new SandboxManager();

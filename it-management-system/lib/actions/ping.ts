"use server";

import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export async function ping(ip: string) {
  if (!ip) return { error: "IP is required" };

  try {
    const { stdout } = await execPromise(`ping ${ip}`);
    return { status: "success", output: stdout };
  } catch (err: any) {
    return { status: "error", message: err.stderr || err.message };
  }
}
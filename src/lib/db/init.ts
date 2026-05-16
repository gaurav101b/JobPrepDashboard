import "server-only";
import { ensureMigrated } from "./migrate";
import { ensureSeeded } from "./seed";

let initialized = false;

export function ensureDb() {
  if (initialized) return;
  ensureMigrated();
  ensureSeeded();
  initialized = true;
}

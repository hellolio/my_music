import { join } from '@tauri-apps/api/path';
import { readTextFile, writeFile } from '@tauri-apps/api/fs';
import { appConfigDir } from '@tauri-apps/api/path';

import { convertFileSrc } from '@tauri-apps/api/tauri';

export async function getWindowStatePath() {
  return await join(await appConfigDir(), 'window_state.json');
}

export async function readWindowState() {
  const path = await getWindowStatePath();
  try {
    const content = await readTextFile(path);
    return JSON.parse(content);
  } catch (e) {
  return null;
  }
}

export async function writeWindowState(window_state) {
  const path = await getWindowStatePath();
  await writeFile({ path, contents: JSON.stringify(window_state, null, 2) });
}
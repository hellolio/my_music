import { join } from "@tauri-apps/api/path";
import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { appConfigDir } from "@tauri-apps/api/path";

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600); // 获取小时数
  const minutes = Math.floor((seconds - hours * 3600) / 60); // 获取分钟数
  const remainingSeconds = seconds % 60; // 获取剩余的秒数

  // 返回格式化的时间，确保秒数为两位数
  return `${hours === 0 ? "" : hours + ":"}${minutes}:${
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds
  }`;
};

export const calculatePercentage = (part, total) => {
  if (total === 0) {
    return 0; // 防止除以零
  }
  return Math.round((part / total) * 100);
};

export async function getWindowStatePath() {
  return await join(await appConfigDir(), "window_state.json");
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

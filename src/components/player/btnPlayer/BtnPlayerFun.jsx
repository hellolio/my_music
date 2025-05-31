// import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

export const importMusic = async (
  musicListImportState,
  setMusicListImportState
) => {
  let selectedFiles = await open({ multiple: true });

  let musicListImportState_new = await invoke("import_music_to_db", {
    fileNames: selectedFiles,
  });
  setMusicListImportState(
    musicListImportState.concat(musicListImportState_new)
  );
};

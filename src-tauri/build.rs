use std::{env, fs, path::PathBuf};

fn main() {
    copy_dll();
    tauri_build::build()
}

/// 拷贝必要的dll文件到target/debug路径
fn copy_dll() {
    // 要拷贝的 DLL 列表
    let files = [
        "avcodec-61.dll",
        "avdevice-61.dll",
        "avfilter-10.dll",
        "avformat-61.dll",
        "avutil-59.dll",
        "swresample-5.dll",
        "swscale-8.dll",
    ];
    let current_path = env::current_dir().unwrap();

    // 获取 target/debug 目录（从 OUT_DIR 向上3级）
    let out_dir = PathBuf::from(env::var("OUT_DIR").unwrap());
    let target_dir = out_dir
        .ancestors()
        .nth(3)
        .expect("Failed to find target/debug")
        .to_path_buf();

    for file in files.iter() {
        let src = current_path.join("bin").join(file);
        let dest = target_dir.join(file);

        println!("cargo:info=Copying {:?} to {:?}", src, dest);
        fs::copy(src, &dest).expect(&format!("Failed to copy {:?}", file));
    }
}

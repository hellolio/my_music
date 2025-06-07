fn main() {
    if cfg!(target_os = "windows") {
        println!("cargo:rustc-link-lib=uuid");
        println!("cargo:rustc-link-lib=ole32");
        println!("cargo:rustc-link-lib=oleaut32");
        println!("cargo:rustc-link-lib=strmiids");

        println!("cargo:rustc-link-lib=mf");
        println!("cargo:rustc-link-lib=mfplat");
        println!("cargo:rustc-link-lib=mfreadwrite");
        println!("cargo:rustc-link-lib=mfuuid");
    }
    tauri_build::build();
}

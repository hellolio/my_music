cd my-music
npm install
npm run tauri dev
npm run tauri build


export FFMPEG_DIR=D://source//rust//learn//learn//vcpkg//installed//x64-windows
export VCPKG_ROOT=D://source//rust//learn//learn//vcpkg
export LIBCLANG_PATH="C://Program Files//LLVM//bin"

cp avutil-*.dll  /d/source/rust/my_music/src-tauri/target/debug/
cp avcodec-*.dll  /d/source/rust/my_music/src-tauri/target/debug/
cp avformat-*.dll  /d/source/rust/my_music/src-tauri/target/debug/
cp swresample-*.dll  /d/source/rust/my_music/src-tauri/target/debug/
cp swscale-*.dll  /d/source/rust/my_music/src-tauri/target/debug/
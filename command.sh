cd my-music
npm install
npm run tauri dev
npm run tauri build


export FFMPEG_DIR=D://source//rust//learn//learn//vcpkg//installed//x64-windows
export VCPKG_ROOT=D://source//rust//learn//learn//vcpkg
export LIBCLANG_PATH="C://Program Files//LLVM//bin"

cp /d/source/rust/learn/learn/vcpkg/installed/x64-windows/bin/*.dll /d/source/rust/my_music/src-tauri/target/debug/

cp /d/source/rust/my_music/src-tauri/bin/*.dll /d/source/rust/my_music/src-tauri/target/debug/
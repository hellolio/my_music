# Rust(Tauri) + JSX(React)

简单的音乐播放器，无聊玩玩

计划：
- [x] 基本播放
- [x] 多格式音频支持
- [x] 简单的视频播放
- [x] AB复读
- [ ] 联网查找适配歌词（如果使用音频智能分析，似乎不需要了）
- [ ] 根据音频断句，以实现歌词自动补全，听力练习中的反复循环播放某一句（Whisper-rs?目前似乎还不成熟。是否要等待？还是嵌入python？）
- [ ] 插件支持主流音乐网站登录（可能支持可能不支持，看心情）
- [ ] 换肤
- [ ] 格式转换
- [ ] 桌面模式
- [ ] bug改善，特别是遇见错误时不能向上抛错
- [ ] 换构架到tauri2，以支持多平台（特别是移动端）

Windows 下载：[my-music_latest](https://github.com/hellolio/my_music/releases)

log：
- 换用ffmpeg，以支持更多格式
- 多歌单创建
- AB复读
- 简单的视频播放


界面效果：

![1](markdown/mobile1.png)
![2](markdown/mobile2.png)
![3](markdown/mobile3.png)
![4](markdown/pc1.png)
![5](markdown/pc2.png)
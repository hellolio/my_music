import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export default function CreatePlaylistButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  const handleCreate = async () => {
    if (playlistName.trim() === '') {
      alert('歌单名不能为空');
      return;
    }

    try {
      await invoke('create_playlist', { name: playlistName });
      setShowDialog(false);
      setPlaylistName('');
      alert('歌单创建成功！');
    } catch (error) {
      console.error('创建失败', error);
      alert('创建失败');
    }
  };

  return (
    <div>
      <button onClick={() => setShowDialog(true)}>新建歌单</button>

      {showDialog && (
        <div className="dialog">
          <h3>请输入歌单名称</h3>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="歌单名"
          />
          <br />
          <button onClick={handleCreate}>确认</button>
          <button onClick={() => setShowDialog(false)}>取消</button>
        </div>
      )}
    </div>
  );
}

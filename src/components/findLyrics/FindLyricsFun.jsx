
import CryptoJS from 'crypto-js';

import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";


const NeteaseCloudMusicHeaders = {
    "Accept": "*/*",
    "Content-Type": "application/x-www-form-urlencoded",
    "MG-Product-Name": "music",
    "Nm-GCore-Status": "1",
    "Origin": "orpheus://orpheus",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) \
                   Chrome/35.0.1916.157 NeteaseMusicDesktop/2.9.7.199711 Safari/537.36",
    "Accept-Encoding": "gzip,deflate",
    "Accept-Language": "en-us,en;q=0.8",
    "Cookie": "os=pc; osver=Microsoft-Windows-10--build-22621-64bit; appver=2.9.7.199711; channel=netease; WEVNSM=1.0.0; WNMCID=slodmo.1709434129796.01.0;",
};

function eapiGetParamsHeader() {
    return JSON.stringify({
        "os": "pc",
        "appver": "2.9.7.199711",
        "deviceId": "",
        "requestId": Math.floor(Math.random() * 100000000),  // 随机整数
        "clientSign": "",
        "osver": "Microsoft-Windows-10--build-22621-64bit",
        "Nm-GCore-Status": "1",
    });
}

const path = "/eapi/cloudsearch/pc";
const keyword = "月光";
const page = 1;
const params = {
    "hlpretag": '<span class="s-fc2">',
    "hlposttag": "</span>",
    "type": "1",
    "queryCorrect": "true",
    "s": keyword,
    "offset": String((page - 1) * 20),
    "total": "true",
    "limit": "20",
    "e_r": true,
    "header": eapiGetParamsHeader(),
};

const encoder = new TextEncoder(); // 默认 UTF-8
// const bytes = encoder.encode('nobody');



function eapiParamsEncrypt(path, params) {
    // params_bytes = json.dumps(params, separators=(',', ':')).encode()
    // sign_src = b'nobody' + path + b'use' + params_bytes + b'md5forencrypt'
    // sign = hashlib.md5(sign_src).hexdigest()  # noqa: S324
    // aes_src = path + b'-36cd479b6b5-' + params_bytes + b'-36cd479b6b5-' + sign.encode()
    // encrypted_data = aes_encrypt(aes_src, b'e82ckenh8dichen8')
    // return f"params={binascii.hexlify(encrypted_data).upper().decode()}"

    // def aes_encrypt(data: str | bytes, key: bytes) -> bytes:
    // if isinstance(data, str):
    //     data = data.encode()
    // padded_data = pkcs7_pad(data)  # Ensure the data is padded
    // aes = AESModeOfOperationECB(key)  # Using ECB mode
    // encrypted_data = b''
    // for i in range(0, len(padded_data), 16):
    //     encrypted_data += aes.encrypt(padded_data[i:i + 16])  # Encrypt in 16-byte blocks
    // return encrypted_data

    const paramsString = JSON.stringify(params);
    const signSrc = 'nobody' + path + 'use' + paramsString + 'md5forencrypt';
    const hash = CryptoJS.MD5(signSrc).toString();
    const aesSrc = path + '-36cd479b6b5-' + paramsString + '-36cd479b6b5-' + hash;
    
    // const encryptedData = aesEncrypt(aesSrc, Buffer.from('e82ckenh8dichen8'));  // 注意这里的aesEncrypt要有实现
    // return `params=${Buffer.from(encryptedData).toString('hex').toUpperCase()}`;
}
const encryptedParams = eapiParamsEncrypt(path.replace("eapi", "api"), params);



const url = "https://u.y.qq.com/cgi-bin/musicu.fcg";

const qqHeader = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN",
    "User-Agent": "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)",
};

const data = JSON.stringify({
    comm: {
      g_tk: 997034911,
      uin: Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000,  // 随机生成 uin
      format: "json",
      inCharset: "utf-8",
      outCharset: "utf-8",
      notice: 0,
      platform: "h5",
      needNewCode: 1,
      ct: 23,
      cv: 0,
    },
    req_0: {
      method: "DoSearchForQQMusicDesktop",
      module: "music.search.SearchCgiService",
      param: {
        num_per_page: 20,
        page_num: parseInt(1),  // 转换为整数
        query: "月光",
        search_type: 0,
      },
    },
  });

export const get_lyrics_targets = async (keyword) => {

    let lyrics_targets = await invoke('get_lyrics_targets', { keyword: keyword });
    return lyrics_targets;

}

export const get_lyrics = async (album, singer, songName, duration, id, savePath) => {

    let lyrics = await invoke('get_lyrics', {album: album, singer: singer, songName: songName, duration: duration, id: id, savePath: savePath});
    return lyrics;
}

export const selectSavePath = async (setSavePath, resultList, selectedRow, songTitle) => {
  let selectedPath = '';
  let title = songTitle;

  if (resultList !== undefined && resultList.length != 0) {
    title = resultList[selectedRow].title;
  }

  selectedPath = await open({
    directory: true, // 让用户选择目录
    multiple: false, // 禁止选择多个目录
  });
  setSavePath(selectedPath +'\\'+ title+ '.lrc');
}


export const searchLyrics = async (songTitle, setResultList) => {
  if (songTitle) {
    const results = await get_lyrics_targets(songTitle);
    setResultList(results);
  } else {
    alert('请填写歌名');
  }
};

export const saveLyrics = async (resultList, selectedRow, savePath, selected, data, setData) => {
  const target = resultList[selectedRow];
  if (savePath === '') {
    alert('请指定保存路径');
  } else if (target === undefined){
    alert('请先检索歌曲');
  }
  else {
    const lyrics = await get_lyrics(target.album, target.artist[0], target.title, target.duration, target.id, savePath);
    if (selected) {
      setData(prevData => ({
        ...prevData,
        lyrics: lyrics,
      }));
      const _ = await invoke('add_lyrics', { lyricsFile: savePath, id: data.id });
    }
    alert('保存成功');
  }
};

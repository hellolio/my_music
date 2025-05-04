use anyhow::Result;
// 使用zlib解压缩数据
use flate2::read::ZlibDecoder;
use std::io::Read;

const ENCRYPT: u8 = 1;
const DECRYPT: u8 = 0;

const SBOX: [[u8; 64]; 8] = [
    // sbox1
    [
        14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7, 
        0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8, 
        4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0, 
        15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13
    ],
    // sbox2
    [
        15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10, 
        3, 13, 4, 7, 15, 2, 8, 15, 12, 0, 1, 10, 6, 9, 11, 5, 
        0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15, 
        13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9
    ],
    // sbox3
    [
        10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8, 
        13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1, 
        13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7, 
        1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12
    ],
    // sbox4
    [
        7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15, 
        13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9, 
        10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4, 
        3, 15, 0, 6, 10, 10, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14
    ],
    // sbox5
    [
        2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9, 
        14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6, 
        4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14, 
        11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3
    ],
    // sbox6
    [
        12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11, 
        10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8, 
        9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6, 
        4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13
    ],
    // sbox7
    [
        4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1, 
        13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6, 
        1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2, 
        6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12
    ],
    // sbox8
    [
        13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7, 
        1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2, 
        7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8, 
        2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11
    ],
];

fn bitnum(a: &[u8], b: usize, c: usize) -> u32 {
    let block_offset = (b / 32) * 4;
    let byte_in_block = 3 - (b % 32) / 8;
    let byte_index = block_offset + byte_in_block;

    let bit_pos = 7 - (b % 8); // 高位在前
    let byte = a[byte_index];
    let bit = (byte >> bit_pos) & 1;

    (bit as u32) << c
}

/// 从整数中提取指定位置的位，并左移指定偏移量
fn bitnum_intr(a: u32, b: usize, c: usize) -> u32 {
    ((a >> (31 - b)) & 1) << c
}

/// 从整数中提取指定位置的位，并右移指定偏移量
fn bitnum_intl(a: u32, b: usize, c: usize) -> u32 {
    ((a << b) & 0x80000000) >> c
}

/// 对输入整数进行位运算，重新组合位
fn sbox_bit(a: u32) -> usize {
    ((a & 32) | ((a & 31) >> 1) | ((a & 1) << 4)) as usize
}

/// 密钥调度算法
fn key_schedule(key: &[u8], mode: u8) -> Vec<[u32; 6]> {

    let key_rnd_shift: [u32; 16] = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
    let key_perm_c = [
        56, 48, 40, 32, 24, 16, 8, 0, 57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35
    ];
    let key_perm_d = [
        62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 60, 52, 44, 36, 28, 20, 12, 4, 27, 19, 11, 3
    ];
    let key_compression = [
        13, 16, 10, 23, 0, 4, 2, 27, 14, 5, 20, 9, 22, 18, 11, 3, 25, 7, 15, 6, 26, 19, 12, 1, 
        40, 51, 30, 36, 46, 54, 29, 39, 50, 44, 32, 47, 43, 48, 38, 55, 33, 52, 45, 41, 49, 35, 28, 31
    ];

    let mut t_c: Vec<u32> = vec![];
    for i in 0..28{
        let t = bitnum(&key, key_perm_c[i], 31 - i);
        t_c.push(t as u32);
    }
    let mut c = t_c.iter().sum();

    let mut t_d = vec![];
    for i in 0..28{
        let t = bitnum(key, key_perm_d[i], 31 - i);
        t_d.push(t);
    }
    let mut d: u32 = t_d.iter().sum();

    let mut schedule = vec![[0u32; 6]; 16];

    for i in 0..16 {
        c = ((c << key_rnd_shift[i]) | (c >> (28 - key_rnd_shift[i]))) & 0xfffffff0;
        d = ((d << key_rnd_shift[i]) | (d >> (28 - key_rnd_shift[i]))) & 0xfffffff0;

        let togen = if mode == DECRYPT { 15 - i } else { i };

        for j in 0..24 {
            schedule[togen][j / 8] |= bitnum_intr(c, key_compression[j] as usize, 7 - (j % 8));
        }

        for j in 24..48 {
            schedule[togen][j / 8] |= bitnum_intr(d, (key_compression[j] - 27) as usize, 7 - (j % 8));
        }
    }

    schedule
}

/// 三重DES密钥设置
fn tripledes_key_setup(key: &[u8], mode: u8) -> Vec<Vec<[u32; 6]>> {
    if mode == ENCRYPT {
        vec![
            key_schedule(&key[0..8], ENCRYPT),
            key_schedule(&key[8..16], DECRYPT),
            key_schedule(&key[16..24], ENCRYPT)
        ]
    } else {
        vec![
            key_schedule(&key[16..24], DECRYPT),
            key_schedule(&key[8..16], ENCRYPT),
            key_schedule(&key[0..8], DECRYPT)
        ]
    }
}

/// 初始置换
fn initial_permutation(input_data: &[u8]) -> (u32, u32) {
    let s0 = 
        bitnum(input_data, 57, 31) | bitnum(input_data, 49, 30) | bitnum(input_data, 41, 29) | bitnum(input_data, 33, 28) |
        bitnum(input_data, 25, 27) | bitnum(input_data, 17, 26) | bitnum(input_data, 9, 25) | bitnum(input_data, 1, 24) |
        bitnum(input_data, 59, 23) | bitnum(input_data, 51, 22) | bitnum(input_data, 43, 21) | bitnum(input_data, 35, 20) |
        bitnum(input_data, 27, 19) | bitnum(input_data, 19, 18) | bitnum(input_data, 11, 17) | bitnum(input_data, 3, 16) |
        bitnum(input_data, 61, 15) | bitnum(input_data, 53, 14) | bitnum(input_data, 45, 13) | bitnum(input_data, 37, 12) |
        bitnum(input_data, 29, 11) | bitnum(input_data, 21, 10) | bitnum(input_data, 13, 9) | bitnum(input_data, 5, 8) |
        bitnum(input_data, 63, 7) | bitnum(input_data, 55, 6) | bitnum(input_data, 47, 5) | bitnum(input_data, 39, 4) |
        bitnum(input_data, 31, 3) | bitnum(input_data, 23, 2) | bitnum(input_data, 15, 1) | bitnum(input_data, 7, 0);
    
    let s1 = 
        bitnum(input_data, 56, 31) | bitnum(input_data, 48, 30) | bitnum(input_data, 40, 29) | bitnum(input_data, 32, 28) |
        bitnum(input_data, 24, 27) | bitnum(input_data, 16, 26) | bitnum(input_data, 8, 25) | bitnum(input_data, 0, 24) |
        bitnum(input_data, 58, 23) | bitnum(input_data, 50, 22) | bitnum(input_data, 42, 21) | bitnum(input_data, 34, 20) |
        bitnum(input_data, 26, 19) | bitnum(input_data, 18, 18) | bitnum(input_data, 10, 17) | bitnum(input_data, 2, 16) |
        bitnum(input_data, 60, 15) | bitnum(input_data, 52, 14) | bitnum(input_data, 44, 13) | bitnum(input_data, 36, 12) |
        bitnum(input_data, 28, 11) | bitnum(input_data, 20, 10) | bitnum(input_data, 12, 9) | bitnum(input_data, 4, 8) |
        bitnum(input_data, 62, 7) | bitnum(input_data, 54, 6) | bitnum(input_data, 46, 5) | bitnum(input_data, 38, 4) |
        bitnum(input_data, 30, 3) | bitnum(input_data, 22, 2) | bitnum(input_data, 14, 1) | bitnum(input_data, 6, 0);
    
    (s0, s1)
}

/// 逆置换
fn inverse_permutation(s0: u32, s1: u32) -> Vec<u8> {
    let mut data = vec![0u8; 8];
    
    data[3] = (bitnum_intr(s1, 7, 7) | bitnum_intr(s0, 7, 6) | bitnum_intr(s1, 15, 5) |
               bitnum_intr(s0, 15, 4) | bitnum_intr(s1, 23, 3) | bitnum_intr(s0, 23, 2) |
               bitnum_intr(s1, 31, 1) | bitnum_intr(s0, 31, 0)) as u8;
    
    data[2] = (bitnum_intr(s1, 6, 7) | bitnum_intr(s0, 6, 6) | bitnum_intr(s1, 14, 5) |
               bitnum_intr(s0, 14, 4) | bitnum_intr(s1, 22, 3) | bitnum_intr(s0, 22, 2) |
               bitnum_intr(s1, 30, 1) | bitnum_intr(s0, 30, 0)) as u8;
    
    data[1] = (bitnum_intr(s1, 5, 7) | bitnum_intr(s0, 5, 6) | bitnum_intr(s1, 13, 5) |
               bitnum_intr(s0, 13, 4) | bitnum_intr(s1, 21, 3) | bitnum_intr(s0, 21, 2) |
               bitnum_intr(s1, 29, 1) | bitnum_intr(s0, 29, 0)) as u8;
    
    data[0] = (bitnum_intr(s1, 4, 7) | bitnum_intr(s0, 4, 6) | bitnum_intr(s1, 12, 5) |
               bitnum_intr(s0, 12, 4) | bitnum_intr(s1, 20, 3) | bitnum_intr(s0, 20, 2) |
               bitnum_intr(s1, 28, 1) | bitnum_intr(s0, 28, 0)) as u8;
    
    data[7] = (bitnum_intr(s1, 3, 7) | bitnum_intr(s0, 3, 6) | bitnum_intr(s1, 11, 5) |
               bitnum_intr(s0, 11, 4) | bitnum_intr(s1, 19, 3) | bitnum_intr(s0, 19, 2) |
               bitnum_intr(s1, 27, 1) | bitnum_intr(s0, 27, 0)) as u8;
    
    data[6] = (bitnum_intr(s1, 2, 7) | bitnum_intr(s0, 2, 6) | bitnum_intr(s1, 10, 5) |
               bitnum_intr(s0, 10, 4) | bitnum_intr(s1, 18, 3) | bitnum_intr(s0, 18, 2) |
               bitnum_intr(s1, 26, 1) | bitnum_intr(s0, 26, 0)) as u8;
    
    data[5] = (bitnum_intr(s1, 1, 7) | bitnum_intr(s0, 1, 6) | bitnum_intr(s1, 9, 5) |
               bitnum_intr(s0, 9, 4) | bitnum_intr(s1, 17, 3) | bitnum_intr(s0, 17, 2) |
               bitnum_intr(s1, 25, 1) | bitnum_intr(s0, 25, 0)) as u8;
    
    data[4] = (bitnum_intr(s1, 0, 7) | bitnum_intr(s0, 0, 6) | bitnum_intr(s1, 8, 5) |
               bitnum_intr(s0, 8, 4) | bitnum_intr(s1, 16, 3) | bitnum_intr(s0, 16, 2) |
               bitnum_intr(s1, 24, 1) | bitnum_intr(s0, 24, 0)) as u8;
    
    data
}

/// Feistel 函数
fn f(state: u32, key: &[u32; 6]) -> u32 {
    let t1 = bitnum_intl(state, 31, 0) | ((state & 0xf0000000) >> 1) | bitnum_intl(state, 4, 5) |
              bitnum_intl(state, 3, 6) | ((state & 0x0f000000) >> 3) | bitnum_intl(state, 8, 11) |
              bitnum_intl(state, 7, 12) | ((state & 0x00f00000) >> 5) | bitnum_intl(state, 12, 17) |
              bitnum_intl(state, 11, 18) | ((state & 0x000f0000) >> 7) | bitnum_intl(state, 16, 23);
    
    let t2 = bitnum_intl(state, 15, 0) | ((state & 0x0000f000) << 15) | bitnum_intl(state, 20, 5) |
              bitnum_intl(state, 19, 6) | ((state & 0x00000f00) << 13) | bitnum_intl(state, 24, 11) |
              bitnum_intl(state, 23, 12) | ((state & 0x000000f0) << 11) | bitnum_intl(state, 28, 17) |
              bitnum_intl(state, 27, 18) | ((state & 0x0000000f) << 9) | bitnum_intl(state, 0, 23);
    
    let mut lrgstate = [
        ((t1 >> 24) & 0xff) as u8,
        ((t1 >> 16) & 0xff) as u8,
        ((t1 >> 8) & 0xff) as u8,
        ((t2 >> 24) & 0xff) as u8,
        ((t2 >> 16) & 0xff) as u8,
        ((t2 >> 8) & 0xff) as u8,
    ];
    
    // 与密钥进行异或运算
    for i in 0..6 {
        lrgstate[i] ^= (key[i] & 0xff) as u8;
    }
    
    // S盒操作
    let state = ((SBOX[0][sbox_bit((lrgstate[0] >> 2).into()) as usize] as u32) << 28) |
                ((SBOX[1][sbox_bit((((lrgstate[0] & 0x03) << 4) | (lrgstate[1] >> 4)).into()) as usize] as u32) << 24) |
                ((SBOX[2][sbox_bit((((lrgstate[1] & 0x0f) << 2) | (lrgstate[2] >> 6)).into()) as usize] as u32) << 20) |
                ((SBOX[3][sbox_bit((lrgstate[2] & 0x3f).into()) as usize] as u32) << 16) |
                ((SBOX[4][sbox_bit((lrgstate[3] >> 2).into()) as usize] as u32) << 12) |
                ((SBOX[5][sbox_bit((((lrgstate[3] & 0x03) << 4) | (lrgstate[4] >> 4)).into()) as usize] as u32) << 8) |
                ((SBOX[6][sbox_bit((((lrgstate[4] & 0x0f) << 2) | (lrgstate[5] >> 6)).into()) as usize] as u32) << 4) |
                (SBOX[7][sbox_bit((lrgstate[5] & 0x3f).into()) as usize] as u32);
    
    // 位运算
    bitnum_intl(state, 15, 0) | bitnum_intl(state, 6, 1) | bitnum_intl(state, 19, 2) |
     bitnum_intl(state, 20, 3) | bitnum_intl(state, 28, 4) | bitnum_intl(state, 11, 5) |
     bitnum_intl(state, 27, 6) | bitnum_intl(state, 16, 7) | bitnum_intl(state, 0, 8) |
     bitnum_intl(state, 14, 9) | bitnum_intl(state, 22, 10) | bitnum_intl(state, 25, 11) |
     bitnum_intl(state, 4, 12) | bitnum_intl(state, 17, 13) | bitnum_intl(state, 30, 14) |
     bitnum_intl(state, 9, 15) | bitnum_intl(state, 1, 16) | bitnum_intl(state, 7, 17) |
     bitnum_intl(state, 23, 18) | bitnum_intl(state, 13, 19) | bitnum_intl(state, 31, 20) |
     bitnum_intl(state, 26, 21) | bitnum_intl(state, 2, 22) | bitnum_intl(state, 8, 23) |
     bitnum_intl(state, 18, 24) | bitnum_intl(state, 12, 25) | bitnum_intl(state, 29, 26) |
     bitnum_intl(state, 5, 27) | bitnum_intl(state, 21, 28) | bitnum_intl(state, 10, 29) |
     bitnum_intl(state, 3, 30) | bitnum_intl(state, 24, 31)
}

/// 单次DES加密/解密
fn crypt(input_data: &[u8], key: &[[u32; 6]]) -> Vec<u8> {
    let (mut s0, mut s1) = initial_permutation(input_data);
    
    for idx in 0..15 {
        let previous_s1 = s1;
        s1 = f(s1, &key[idx]) ^ s0;
        s0 = previous_s1;
    }
    
    s0 = f(s1, &key[15]) ^ s0;
    
    inverse_permutation(s0, s1)
}

/// 三重DES加密/解密
fn tripledes_crypt(data: &[u8], key: &[Vec<[u32; 6]>]) -> Vec<u8> {
    let mut result = data.to_vec();
    for i in 0..3 {
        result = crypt(&result, &key[i]);
    }
    result
}

pub fn decrypt_qq_lyrics(encrypted_qrc: &str) -> Result<String>{
    let qrc_key: &[u8] = b"!@#)(*$%123ZXC!@!@#)(NHL";
    // let krc_key: &[u8] = b"@Gaw^2tGQ61-\xce\xd2ni";

    let schedule = tripledes_key_setup(qrc_key, DECRYPT);
    
    // 将文本解析为字节数组
    let encrypted_text_byte = hex::decode(encrypted_qrc).expect("无效的十六进制字符串");
    let mut data = Vec::new();
    
    // 以8字节为单位迭代处理
    for i in (0..encrypted_text_byte.len()).step_by(8) {
        if i + 8 <= encrypted_text_byte.len() {
            data.extend(tripledes_crypt(&encrypted_text_byte[i..i+8], &schedule));
        } else {
            data.extend(tripledes_crypt(&encrypted_text_byte[i..], &schedule));
        }
    }
   
    let mut decoder = ZlibDecoder::new(&data[..]);
    let mut decrypted_qrc = Vec::new();
    decoder.read_to_end(&mut decrypted_qrc).expect("解压缩失败");
    
    match String::from_utf8(decrypted_qrc) {
        Ok(decoded_str) => Ok(decoded_str),
        Err(e) => Err(e.into()),
    }

}

// fn main() {
    
//     let encrypted_qrc = "902166D639E1D224A8F76AC01F9547967180AFC73412F1F9ECE57677047D30562E749E69E68E53013E4CDC193BA87E0549B630E0E189671D53E8F22300D3BE7C706D74C51A8E2B51B7BC35168FCE0B7A6AA76AED8A823951E1D4D2171E87B2BBF89801CBB1DB15BBABD7D970F23178F140B70DF1F9D5C96066589DF7974CE1B8B40FB2DA2E5F348B91792449802A664AABAACBF24CA912822329D68D8EEBAC611D68F90D62B71B6669BD5344CC077E7459F021BB51EC2448A24ABE9FC91C95FCA638E792C4922EB76EEEB8DBA21D4386C6138EC3478A605D9F0309731EBF9DE7EA1E07FBA01B005A3C6D2E131757465263D903A5F0AB8AE79FAD0E79816B9BBA92035C199B37E978BB09033457A4F45D397E7D8CDED2701F15DB6619190B38DF68673495ED5A4040B26AB2FC0C4CDEEDC644D73F37B278BB24A00BC147CA818AE0F0C15905CFD4E0FF41DC80F93A7F0CAA153520824A8A7AC4C1CB8F7AC93D6B90C527496B58DB11D6E98C33C1C113C75EA89654170663106EE236C022DEB14FCFF916D7ED7F26139CE8D155DBD4BD4166CCAF3F231DDBCA598F6C851B9363B615FC78A14638CF6E9263BD8A35D37A50501B4FE25FA603DE8E6D31F2131E9EA13E7F5D7F9476625863C90802C186BFED73C0F0075CD741BD7E51CB4B306641236D2A6876144595F521F3B4B9D3C0D6B5408EC54752D9853EFDBDA0FB1CDB581069EF64AAAC01215BFC7EF4D3D71C761F1A54F3C2FE57E3E8D039944389AF3602C2C66FC63D9605917756A323BF4F94E84E28A8ED7629F2EFFD550CE8361C67FDE953B1C18AB445A44A04FA5449DBE3BE406AF940F6633943CB9AE70210BE666D0E8E873363C8BD564C3BEA4A332F27E58A0A677239705E6005F34027FAD155093DEE70A49532F462527FFFADAD910C3D0C21115C1B966E8FA29A4850B051AB80BFE31BC397AE2980E4AA2E7440DF0CC4EED32EA7F6179A88C1EB2E4A453A46CCCFC150DD4490FD17DDEC85F5C225B8CD727D54A546C0FFF9C9F5D825355C4F6F0ADB9B76BA0C288AF67CD83A47F7AE8A927E54D45A74761FE4852D92EAB3641CFB0D565ABB38EC05BA4A253F5A8164152C37BDF93F4930D9BCC6EFC7AEE4EC3BB1B18686D127A02351CDB3C474D414703EB2BDD426E3F35F588A0C1A5CD522A70064BA8FDF0A8776192447D992587DAAC1855BA9729862C80DD04B023C54AE9D8655F3FA1CB67D19EF75959192D3AB7134C13FC9CEA5120B9F1BFE5DF4376D699F93C3CA97A41DA2E85833C583A438055A2C3EEC49BDAC506C7CBFC17F0721415B27128BCC8D1160A5895B80C037C87F8660AC6D0F163EAA8F9D73D8AF266474E9F8156061C804ACC8BD013D5212F6D7FF20C73BEFD32453EAAD4B04224329062C37A31F5E642805FCDC86138D8194D3D14A1726745CDCA3C31C869487C1EC35648EC299D59901B60B9167ADEDDC7D5076992864B95B15548E16D7698E2592170A578055AAF8483EFABFD4FB4AEF01C90071499DDA1BF7D75575512F3400195A47CF9A8FA90E392ECA5D54828A22744A5C25361E37FBE7104C7003E1CD63FF98EE0E7311906F138720997C2B3120FB6F5AE42E0983626A05074595F0414702F60FABA3A0DFC0DB495C90E27B044EA6CA88D68DC1C9C1C1F59C617746EFFE8962D6882F4A5716ED1E6ED7DF1BD14C18C893AE1E908247DF1C29D13414F2693127177BDF65116D9474A35573D1F78A6EB9DE02148D5D7EAE3D4B8A1BC92C1A5B278B451CDB16EEC926ED5D1383252C3EC5AC1B42A997CEC7CA5B846BB0C976AFD8B0C5A9A3FB41293D7AAA93580E579872AAE1362455DD8A3C21D387B0BCE6FEEC5CE7E4BC3AD5FB5BDEE81A30D51ED6F65DAFF3607F3B49716684EE7C7C9AB8A6BE997B87C4BDD68E4595335A4A5B0D44C0002A5499711BCE012BEBE9FAB0EFD1AEA4DB3DB947BBD74B94AA75D5C1FFBB130B93E64B36E820693CD1DE39480B8310A52BFEF125ABE1629951B274D31A20C805845D7C0E8905B512787C1297E3ED7C7628A7D6BD3216254B1F53B5C0DD86965561C4A05C80740396020377E069D2F086E29C1D84ED743535C74729FF8F058FE700FB5AF64CA4077473E32FE10936E9BC08B1AA763589AEB8ACE7ECEF9E1F7AC98E3E06E55325A107689986BE412272852F8F9757DE0CD43AC87444E4D95E8A63628A695AC1F4C08DAF2D938AE2BE98D46B52EC1A096C8DDE6E303E9F109645F4A9F051EBB96F6EE008CC3E768AA3815C0760ADCF90C736CD71A39395828D00D026A4DA2FDC1D971195BBA706615F570DE203188A35EE46E970EC591E7C12711D410FC5F7F2B506B4018ACC9B50C75786A697A0D12A450BC40703E14295466A41521D9BF1F96827110E8AD3497DF7AEDBFDE5E6EA96CAB32472787F329942E09C8791AABBD582950CBA9AB5DC5325DDAFB6FE456E65EA6A4B6F43469E08CB62730E08568DB6FA698D37447139F04233BA043C072560B9544B92B0C022A418C4857CEBB110FA6581B0CCC101F0499BB7068422390450C1E4DF02A221DAE4306EBF24508B4FC634B2FC13E344F54E375AC04436243E460217ABCBD81CE943BF608CCBBBE2639368DBB389A554409E0DD16F23DBFCC6A2FAE55928F264A8F867FA1919094EE3A69EB8FAB436C850363CFF396826BCB8EBD15358914530DC539E4A80B8BCB77AC9A8FCB7358F1A544CD6C34554C30E0D5F459D49D3E159D639EB764457C6AE0D5025427B9A27D44F2C8CFF4FA69BE68C03ED4AB6E8B78A8AFF7552C5005AF4241061F8330E1A06294A00D88A1D5B5E88A3221EBF7C47922A75CC97B9C68B82E84DE0F4DAB33C1579A826A6A4D5BA527EFE2B8290C56285BBD33B0666BB24F5447971242A78C5C72CA6848D568807186864A80439D25093E3A2F5618FE47F0BA967A5644C4957EEE348DA8198624DA2CA71415A552C3D9ACD4D99C916DA2447FC35B6F7AA6C08A058D4A5F6E10BC38625652F431C3984B02C5D31E3DDF7EF56F32C9800894AA010A22A3715A32A1C3744CF43600D7E526605F8BD81D49CED53FBA7A712DD38135B924C722D312D57E9DC668136F6014EAF67F3AB9B194C34BDB37314C909026262C35FF3F588ADEA1426B70C9D78661A58037CB5F88D91465B9F48D57D656C09F70114738436174530D6F583635790E49125F98603C6D78F3FF8878AC6E925BD652B50864259888154EC8234ED5CDFCFBD6EF3F302944AA2CEE73FB24EB200595BECCF0A3525099B7EF185C81FDFE9CB8A45E13196637460075706CA932FA7BCA6C848F9C72B9A4747E2D81D";

//     let lyrics = decrypt_qq_lyrics(encrypted_qrc).unwrap();
//     println!("解密歌词：{}", lyrics);
    
// }
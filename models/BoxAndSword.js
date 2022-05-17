//下面存储不同的立方体Box,顶点和索引数据
const SkyBoxVer=
[
    -40,  40, -40,
	-40, -40, -40,
	 40, -40, -40,
	 40,  40, -40,
	-40, -40,  40,
	-40,  40,  40,
	 40, -40,  40,
	 40,  40,  40
]
const BoxIdx=
[
    0,1,2,
	2,3,0,
	4,1,0,
	0,5,4,
	2,6,7,
	7,3,2,
	4,5,7,
	7,6,4,
	0,3,7,
	7,5,0,
	1,4,2,
	2,4,6
]
//下面存储Sword的顶点数据和索引数据
const SwordVer =
    [
        0, 0, 0, 0.8, 0.3, 0.1,
        0.1, 0, 0, 0.8, 0.3, 0.1,
        0.092388, 0, 0.0382684, 0.8, 0.3, 0.1,
        0.0707106, 0, 0.0707106, 0.8, 0.3, 0.1,
        0.0382684, 0, 0.092388, 0.8, 0.3, 0.1,
        0, 0, 0.1, 0.8, 0.3, 0.1,
        -0.0382684, 0, 0.092388, 0.8, 0.3, 0.1,
        -0.0707106, 0, 0.0707106, 0.8, 0.3, 0.1,
        -0.092388, 0, 0.0382684, 0.8, 0.3, 0.1,
        -0.1, 0, 0, 0.8, 0.3, 0.1,
        -0.092388, 0, -0.0382684, 0.8, 0.3, 0.1,
        -0.0707106, 0, -0.0707106, 0.8, 0.3, 0.1,
        -0.0382684, 0, -0.092388, 0.8, 0.3, 0.1,
        -0, 0, -0.1, 0.8, 0.3, 0.1,
        0.0382684, 0, -0.092388, 0.8, 0.3, 0.1,
        0.0707106, 0, -0.0707106, 0.8, 0.3, 0.1,
        0.092388, 0, -0.0382684, 0.8, 0.3, 0.1,
        0, 0.45, 0, 0.8, 0.3, 0.1,
        0.1, 0.45, 0, 0.8, 0.3, 0.1,
        0.092388, 0.45, 0.0382684, 0.8, 0.3, 0.1,
        0.0707106, 0.45, 0.0707106, 0.8, 0.3, 0.1,
        0.0382684, 0.45, 0.092388, 0.8, 0.3, 0.1,
        0, 0.45, 0.1, 0.8, 0.3, 0.1,
        -0.0382684, 0.45, 0.092388, 0.8, 0.3, 0.1,
        -0.0707106, 0.45, 0.0707106, 0.8, 0.3, 0.1,
        -0.092388, 0.45, 0.0382684, 0.8, 0.3, 0.1,
        -0.1, 0.45, 0, 0.8, 0.3, 0.1,
        -0.092388, 0.45, -0.0382684, 0.8, 0.3, 0.1,
        -0.0707106, 0.45, -0.0707106, 0.8, 0.3, 0.1,
        -0.0382684, 0.45, -0.092388, 0.8, 0.3, 0.1,
        -0, 0.45, -0.1, 0.8, 0.3, 0.1,
        0.0382684, 0.45, -0.092388, 0.8, 0.3, 0.1,
        0.0707106, 0.45, -0.0707106, 0.8, 0.3, 0.1,
        0.092388, 0.45, -0.0382684, 0.8, 0.3, 0.1,
        0.08, 0.45, 0, 0.8, 0.3, 0.1,
        0.0739104, 0.45, 0.0306148, 0.8, 0.3, 0.1,
        0.0565684, 0.45, 0.0565684, 0.8, 0.3, 0.1,
        0.0306148, 0.45, 0.0739104, 0.8, 0.3, 0.1,
        0, 0.45, 0.08, 0.8, 0.3, 0.1,
        -0.0306148, 0.45, 0.0739104, 0.8, 0.3, 0.1,
        -0.0565684, 0.45, 0.0565684, 0.8, 0.3, 0.1,
        -0.0739104, 0.45, 0.0306148, 0.8, 0.3, 0.1,
        -0.08, 0.45, 0, 0.8, 0.3, 0.1,
        -0.0739104, 0.45, -0.0306148, 0.8, 0.3, 0.1,
        -0.0565684, 0.45, -0.0565684, 0.8, 0.3, 0.1,
        -0.0306148, 0.45, -0.0739104, 0.8, 0.3, 0.1,
        -0, 0.45, -0.08, 0.8, 0.3, 0.1,
        0.0306148, 0.45, -0.0739104, 0.8, 0.3, 0.1,
        0.0565684, 0.45, -0.0565684, 0.8, 0.3, 0.1,
        0.0739104, 0.45, -0.0306148, 0.8, 0.3, 0.1,
        0.08, 0.9, 0, 0.8, 0.3, 0.1,
        0.0739104, 0.9, 0.0306148, 0.8, 0.3, 0.1,
        0.0565684, 0.9, 0.0565684, 0.8, 0.3, 0.1,
        0.0306148, 0.9, 0.0739104, 0.8, 0.3, 0.1,
        0, 0.9, 0.08, 0.8, 0.3, 0.1,
        -0.0306148, 0.9, 0.0739104, 0.8, 0.3, 0.1,
        -0.0565684, 0.9, 0.0565684, 0.8, 0.3, 0.1,
        -0.0739104, 0.9, 0.0306148, 0.8, 0.3, 0.1,
        -0.08, 0.9, 0, 0.8, 0.3, 0.1,
        -0.0739104, 0.9, -0.0306148, 0.8, 0.3, 0.1,
        -0.0565684, 0.9, -0.0565684, 0.8, 0.3, 0.1,
        -0.0306148, 0.9, -0.0739104, 0.8, 0.3, 0.1,
        -0, 0.9, -0.08, 0.8, 0.3, 0.1,
        0.0306148, 0.9, -0.0739104, 0.8, 0.3, 0.1,
        0.0565684, 0.9, -0.0565684, 0.8, 0.3, 0.1,
        0.0739104, 0.9, -0.0306148, 0.8, 0.3, 0.1,
        0, 0.9, 0, 0.8, 0.3, 0.1,
        0.1, 0.9, 0, 0.8, 0.3, 0.1,
        0.092388, 0.9, 0.0382684, 0.8, 0.3, 0.1,
        0.0707106, 0.9, 0.0707106, 0.8, 0.3, 0.1,
        0.0382684, 0.9, 0.092388, 0.8, 0.3, 0.1,
        0, 0.9, 0.1, 0.8, 0.3, 0.1,
        -0.0382684, 0.9, 0.092388, 0.8, 0.3, 0.1,
        -0.0707106, 0.9, 0.0707106, 0.8, 0.3, 0.1,
        -0.092388, 0.9, 0.0382684, 0.8, 0.3, 0.1,
        -0.1, 0.9, 0, 0.8, 0.3, 0.1,
        -0.092388, 0.9, -0.0382684, 0.8, 0.3, 0.1,
        -0.0707106, 0.9, -0.0707106, 0.8, 0.3, 0.1,
        -0.0382684, 0.9, -0.092388, 0.8, 0.3, 0.1,
        -0, 0.9, -0.1, 0.8, 0.3, 0.1,
        0.0382684, 0.9, -0.092388, 0.8, 0.3, 0.1,
        0.0707106, 0.9, -0.0707106, 0.8, 0.3, 0.1,
        0.092388, 0.9, -0.0382684, 0.8, 0.3, 0.1,
        0.1, 1.05, 0, 0.8, 0.3, 0.1,
        0.092388, 1.05, 0.0382684, 0.8, 0.3, 0.1,
        0.0707106, 1.05, 0.0707106, 0.8, 0.3, 0.1,
        0.0382684, 1.05, 0.092388, 0.8, 0.3, 0.1,
        0, 1.05, 0.1, 0.8, 0.3, 0.1,
        -0.0382684, 1.05, 0.092388, 0.8, 0.3, 0.1,
        -0.0707106, 1.05, 0.0707106, 0.8, 0.3, 0.1,
        -0.092388, 1.05, 0.0382684, 0.8, 0.3, 0.1,
        -0.1, 1.05, 0, 0.8, 0.3, 0.1,
        -0.092388, 1.05, -0.0382684, 0.8, 0.3, 0.1,
        -0.0707106, 1.05, -0.0707106, 0.8, 0.3, 0.1,
        -0.0382684, 1.05, -0.092388, 0.8, 0.3, 0.1,
        -0, 1.05, -0.1, 0.8, 0.3, 0.1,
        0.0382684, 1.05, -0.092388, 0.8, 0.3, 0.1,
        0.0707106, 1.05, -0.0707106, 0.8, 0.3, 0.1,
        0.092388, 1.05, -0.0382684, 0.8, 0.3, 0.1,
        0, 1.05, 0, 1, 0.8, 0.1,
        0.168, 1.05, 0, 1, 0.8, 0.1,
        0.084, 1.05, -0.24, 1, 0.8, 0.1,
        -0.084, 1.05, -0.24, 1, 0.8, 0.1,
        -0.168, 1.05, 0, 1, 0.8, 0.1,
        -0.084, 1.05, 0.24, 1, 0.8, 0.1,
        0.084, 1.05, 0.24, 1, 0.8, 0.1,
        0, 1.2, 0, 1, 0.8, 0.1,
        0.168, 1.2, 0, 1, 0.8, 0.1,
        0.084, 1.2, -0.24, 1, 0.8, 0.1,
        -0.084, 1.2, -0.24, 1, 0.8, 0.1,
        -0.168, 1.2, 0, 1, 0.8, 0.1,
        -0.084, 1.2, 0.24, 1, 0.8, 0.1,
        0.084, 1.2, 0.24, 1, 0.8, 0.1,
        0, 1.5, -0.88, 1, 0.8, 0.1,
        0, 1.5, 0.88, 1, 0.8, 0.1,
        0.12, 1.2, 0, 0.76, 0.76, 0.76,
        0, 1.2, -0.22, 0.76, 0.76, 0.76,
        -0.12, 1.2, 0, 0.76, 0.76, 0.76,
        0, 1.2, 0.22, 0.76, 0.76, 0.76,
        0.12, 6, 0, 0.76, 0.76, 0.76,
        0, 6, -0.22, 0.76, 0.76, 0.76,
        -0.12, 6, 0, 0.76, 0.76, 0.76,
        0, 6, 0.22, 0.76, 0.76, 0.76,
        0, 6.4, 0, 0.76, 0.76, 0.76
    ]
const SwordIdx =
    [
        1, 2, 0,
        2, 3, 0,
        3, 4, 0,
        4, 5, 0,
        5, 6, 0,
        6, 7, 0,
        7, 8, 0,
        8, 9, 0,
        9, 10, 0,
        10, 11, 0,
        11, 12, 0,
        12, 13, 0,
        13, 14, 0,
        14, 15, 0,
        15, 16, 0,
        16, 1, 0,
        1, 2, 18,
        18, 19, 2,
        2, 3, 19,
        19, 20, 3,
        3, 4, 20,
        20, 21, 4,
        4, 5, 21,
        21, 22, 5,
        5, 6, 22,
        22, 23, 6,
        6, 7, 23,
        23, 24, 7,
        7, 8, 24,
        24, 25, 8,
        8, 9, 25,
        25, 26, 9,
        9, 10, 26,
        26, 27, 10,
        10, 11, 27,
        27, 28, 11,
        11, 12, 28,
        28, 29, 12,
        12, 13, 29,
        29, 30, 13,
        13, 14, 30,
        30, 31, 14,
        14, 15, 31,
        31, 32, 15,
        15, 16, 32,
        32, 33, 16,
        16, 1, 33,
        33, 18, 1,
        18, 19, 17,
        19, 20, 17,
        20, 21, 17,
        21, 22, 17,
        22, 23, 17,
        23, 24, 17,
        24, 25, 17,
        25, 26, 17,
        26, 27, 17,
        27, 28, 17,
        28, 29, 17,
        29, 30, 17,
        30, 31, 17,
        31, 32, 17,
        32, 33, 17,
        33, 18, 17,
        34, 35, 51,
        51, 52, 35,
        35, 36, 52,
        52, 53, 36,
        36, 37, 53,
        53, 54, 37,
        37, 38, 54,
        54, 55, 38,
        38, 39, 55,
        55, 56, 39,
        39, 40, 56,
        56, 57, 40,
        40, 41, 57,
        57, 58, 41,
        41, 42, 58,
        58, 59, 42,
        42, 43, 59,
        59, 60, 43,
        43, 44, 60,
        60, 61, 44,
        44, 45, 61,
        61, 62, 45,
        45, 46, 62,
        62, 63, 46,
        46, 47, 63,
        63, 64, 47,
        47, 48, 64,
        64, 65, 48,
        48, 49, 65,
        65, 66, 49,
        49, 34, 66,
        66, 51, 34,
        67, 68, 66,
        68, 69, 66,
        69, 70, 66,
        70, 71, 66,
        71, 72, 66,
        72, 73, 66,
        73, 74, 66,
        74, 75, 66,
        75, 76, 66,
        76, 77, 66,
        77, 78, 66,
        78, 79, 66,
        79, 80, 66,
        80, 81, 66,
        81, 82, 66,
        82, 67, 66,
        67, 68, 83,
        83, 84, 68,
        68, 69, 84,
        84, 85, 69,
        69, 70, 85,
        85, 86, 70,
        70, 71, 86,
        86, 87, 71,
        71, 72, 87,
        87, 88, 72,
        72, 73, 88,
        88, 89, 73,
        73, 74, 89,
        89, 90, 74,
        74, 75, 90,
        90, 91, 75,
        75, 76, 91,
        91, 92, 76,
        76, 77, 92,
        92, 93, 77,
        77, 78, 93,
        93, 94, 78,
        78, 79, 94,
        94, 95, 79,
        79, 80, 95,
        95, 96, 80,
        80, 81, 96,
        96, 97, 81,
        81, 82, 97,
        97, 98, 82,
        82, 67, 98,
        98, 83, 67,
        100, 101, 99,
        101, 102, 99,
        102, 103, 99,
        103, 104, 99,
        104, 105, 99,
        105, 100, 99,
        100, 101, 107,
        107, 108, 101,
        101, 102, 108,
        108, 109, 102,
        102, 103, 109,
        109, 110, 103,
        103, 104, 110,
        110, 111, 104,
        105, 100, 112,
        112, 107, 100,
        107, 108, 106,
        108, 109, 106,
        109, 110, 106,
        110, 111, 106,
        111, 112, 106,
        112, 107, 106,
        101, 102, 113,
        102, 109, 113,
        109, 108, 113,
        108, 101, 113,
        104, 105, 114,
        105, 112, 114,
        112, 111, 104,
        111, 104, 114,
        115, 116, 119,
        119, 120, 116,
        116, 117, 120,
        120, 121, 117,
        117, 118, 121,
        121, 122, 118,
        118, 115, 122,
        122, 119, 115,
        119, 120, 123,
        120, 121, 123,
        121, 122, 123,
        122, 119, 123
    ]

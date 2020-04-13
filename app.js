//2010年と2015年の都道府県ごとの人口推移を集計

'use strict';
const fs = require('fs');       //fs（FileSystem）はファイルを扱うモジュール、requireで読み出している
const readline = require('readline');   //readlineはファイルを1行ずつ読み込むためのモジュール

const rs = fs.createReadStream('./popu-pref.csv');      //ファイルの読み込みをストリームで行う

const rl = readline.createInterface({input: rs, output: {}});   //inputとして、rs(読み込んだcsvファイル)を格納

const prefectureDataMap = new Map();    //連想配列のオブジェクト作成　key: prefecture, value: 集計データのオブジェクト　を格納する予定

rl.on('line', lineString => {
    const columns = lineString.split(',');  //カンマで分けて配列に格納
    const year = parseInt(columns[0]);      //0番目（年を表す箇所）を文字列から数値に変換
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);  //3番目の15~19歳の人口を取得

    if(year === 2010 || year === 2015){     //2010年と2015年の人口に限定

        let value = prefectureDataMap.get(prefecture);      /*　***********すでにprefectureがsetされている（同じ県名の）場合は
                                                                    　     ここでgetできるのでvalueがFalsyにはならない************* */

        if(!value){     //valueがFalsyな場合    現時点ではまだ何もvalueはsetされていないのでundefinedでFalsy
            value = {   //valueプロパティの中にさらに3つのプロパティを作る
                popu10: 0,  //2010年の人口
                popu15: 0,  //2015年の人口
                change: null    //人口の変化率
            };
        }
        if(year === 2010){
            value.popu10 = popu;        
        }
        if(year === 2015){
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);      //prefectureDataMapオブジェクトにプロパティをセット
    }
});
rl.on('close', () => {      //closeイベントは全ての行が読み込み終わったら呼び出される
    for(let[key, value] of prefectureDataMap){      //変数keyにキー、変数valueにバリュー（let key, let value）をprefectureDataMapから代入
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {     //Array.from で連想配列から通常の配列に変換 pair1[0]=key(prefecture), pair1[1]=key(value)になる
                                                                                    //sort関数でpair1とpair2を比較
        return pair2[1].change - pair1[1].change;       //valueのchangeプロパティを比較
    });
    const rankingStrings = rankingArray.map(([key, value]) => {     
        return (
            key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率: ' + value.change
        );
    });
    console.log(rankingStrings);
});
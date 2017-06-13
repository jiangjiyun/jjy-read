//转化封面url为实际url
export const url2Real = (url) => {
    if (url.search(/agent/i) === -1) {
        return 'http://api.zhuishushenqi.com' + url;
    } else {
        return url.replace(/\/agent\//, '');
    }
}
//将时间转化为  xx分钟 xx小时 ………………
export const timeToStr = (stamp) => {
    let time = new Date(new Date() - new Date(stamp)).getTime();
    let min = time / (1000 * 60);
    let hour = min / 60;
    let day = hour / 24;
    let month = day / 30;
    let year = month / 12;
    if (min < 60) {
        return Math.floor(min) + '分钟前';
    } else if (hour < 24) {
        return Math.floor(hour) + '小时前';
    } else if (day < 30) {
        return Math.floor(day) + '天前';
    } else if (month < 12) {
        return Math.floor(month) + '月前';
    } else {
        return Math.floor(year) + '年前';
    }
}
//将字数带上单位 如12345 转化为1.2万字
export const wordCount2Str = (wordCount) => {
    if (Array.from(String(wordCount)).length > 4) {
        let arr = Array.from(String(wordCount));
        arr.length -= 4;
        wordCount = arr.join('') + '万';
    }
    return wordCount + '字';
}
//将一段文字分成若干页面;1.42857143
export const wordToPageArr = (wordText, fontSize) => {
    let win_width = parseInt(document.documentElement.clientWidth) - 30; //屏幕宽度;
    let win_height = parseInt(document.documentElement.clientHeight); //屏幕高度;
    //let line_height = parseInt(fontSize) * 1.42857143; //行高;
    let line_height = fontSize*1.5; //行高;

    let line_num = Math.floor(win_height / line_height); //一页最大行数;
    let line_text_num = Math.floor(win_width / fontSize); //一行最大字数;
    let wordTextArr = wordText.split("\n");
    //let wordTextArrLineNum=[];
    let wordPageArr = [{
        text: "",
        lineNum: 0
    }];
    wordTextArr.map((item, index) => {
        let lineNum = Math.ceil(item.length / line_text_num);
        //wordTextArrLineNum.push(lineNum);
        pushTextToArr(wordPageArr, item, lineNum, line_num, line_text_num);
    })
    return wordPageArr;
}

function pushTextToArr(arr, text, lineNum, lineMaxNum, lineTextNum) {
    if (arr[arr.length - 1].lineNum + lineNum < lineMaxNum) {
        arr[arr.length - 1].text = arr[arr.length - 1].text + "\n" + text;
        arr[arr.length - 1].lineNum = arr[arr.length - 1].lineNum + lineNum;
    } else {
        let newLineNum = arr[arr.length - 1].lineNum + lineNum;
        let hisNum = arr[arr.length - 1].lineNum;
        let pageNum = Math.ceil(newLineNum / lineMaxNum);
        var endNum;
        var endPageNum;
        for (let i = 0; i < pageNum; i++) {
            if (i == 0) {
                arr[arr.length - 1].text = arr[arr.length - 1].text + "\n" + text.substring(0, ((i + 1) * lineMaxNum - hisNum) * lineTextNum);
                arr[arr.length - 1].lineNum = lineMaxNum;
                arr.push({
                    text: "",
                    lineNum: 0
                });
            } else {
                if ((i + 1) * lineMaxNum - hisNum > lineNum) {
                    endNum = lineNum;
                    endPageNum = newLineNum % lineMaxNum;
                } else {
                    endNum = (i + 1) * lineMaxNum - hisNum;
                    endPageNum = lineMaxNum;
                }
                arr[arr.length - 1].text = arr[arr.length - 1].text + text.substring((i * lineMaxNum - hisNum) * lineTextNum, endNum * lineTextNum);
                arr[arr.length - 1].lineNum = endPageNum;
                if (endPageNum == lineMaxNum) {
                    arr.push({
                        text: "",
                        lineNum: 0
                    });
                }
            }
        }
    }
}
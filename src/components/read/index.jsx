import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Link } from 'react-router-dom';
import { timeToStr, wordToPageArr } from '../../method/index.js';
import ReactSwipe from 'react-swipes';
import 'whatwg-fetch';
import 'swipe-js-iso';
import './style.scss';

let testColorArr=["rgba(241,229,201,1)","rgba(199,237,204,1)","rgba(255,255,255,1)"]

class ReadPage extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);
    this.handleSizeBig = this.handleSizeBig.bind(this);
    this.handleSizeSmall = this.handleSizeSmall.bind(this);
    this.state={
      bookSource:[],//书源;
      sourceNum:1,//当前选择的书源;
      bookChapterList:[],//章节列表;
      chapterInfo:"",//章节内容;
      chapterHis:0,//章节阅读历史;
      funShow:false,//功能按钮会否显示;
      funType:null,
      colorArr:{
        bgColorArr:testColorArr,
        bgColorChoose:parseInt(localStorage.getItem("colorIndex")||0)
      },
      fontSize:parseInt(localStorage.getItem("fontSize")||14),//开始默认测试;
      pageNum:0,//当前在第几页;
      bookChapterArr:[],//章节分页数组;
      pageAllNum:1,//总页数
      scrollTop:0
    }
  }

  handleFunTypeChange(type){
    let newType=type;
    if(this.state.funType==newType){
      newType=null;
    }
    this.setState({
      funType:newType
    })
  }

  handleColorChange(index){
    try{
      localStorage.setItem("colorIndex",index);
    }catch(e){}
    this.setState({
      colorArr:{
        bgColorArr:testColorArr,
        bgColorChoose:index
      }
    })
  }

  handleSizeBig(){
    try{
      localStorage.setItem("fontSize",this.state.fontSize+2);
    }catch(e){}
    this.setState({
      fontSize:this.state.fontSize+2,
      pageNum:0
    },()=>{
      this.getPageWord.bind(this,this.state.chapterInfo)();
    })
  }

  handleSizeSmall(){
    if(this.state.fontSize<15){return}
    try{
      localStorage.setItem("fontSize",this.state.fontSize-2);
    }catch(e){}
    this.setState({
      fontSize:this.state.fontSize-2,
      pageNum:0
    },()=>{
      this.getPageWord.bind(this,this.state.chapterInfo)();
    })
  }

  handleClickMidArea(){
    this.setState({
      funShow:!this.state.funShow,
      funType:null
    })
  }
  handleClickLeftArea(){
    if(this.state.pageNum>0){
      window.mySwipe.prev();
    }else{
      if(this.state.chapterHis>0){
        let num=this.state.chapterHis-1;
        this.setState({
          chapterHis:num,
          pageNum:-1
        },()=>{
          this.getChapter.bind(this,this.state.bookChapterList[num].link)();
        });
      }else{
        alert("第一章了");
      }
    }
  }
  handleClicRightArea(){
    if(this.state.pageNum<(this.state.pageAllNum-1)){
      window.mySwipe.next();
    }else{
      if(this.state.chapterHis<this.state.bookChapterList.length-1){
        let num=this.state.chapterHis+1;
        this.setState({
          chapterHis:num,
          pageNum:0
        },()=>{
          this.getChapter.bind(this,this.state.bookChapterList[num].link)();
        });
      }else{
        alert("最后一章了");
      }
    }
  }

  checkIsInLocal(id){
    let returnObj={
      chapterUrl:"",//章节url
      sourceId:"",//疏远id
      chapterNum:"",//阅读章节
      _id:id//书本id
    };
    let bookList=JSON.parse(localStorage.getItem("bookList")||'[]');
    bookList.map((item,index)=>{
      if(item._id==id){
        returnObj=item;
      }
    });
    return returnObj;
  }

  componentDidMount(){
    let bookId=this.props.match.params.id;
    let chapterObj=this.checkIsInLocal.bind(this,bookId)();
    if(chapterObj.scrollTop){
      this.setState({
        scrollTop:chapterObj.scrollTop
      })
    }

    this.getSourceList.bind(this,chapterObj,chapterObj._id)();

    // //检查是否在本地存储中;
    // if(chapterObj.chapterUrl){
    //   //获取章节内容信息;
    //   this.getChapter.bind(this,chapterObj.chapterUrl)();
    // }else if(chapterObj.sourceId){
    //   //获取章节列表信息;
    //   this.getChpaterList.bind(this,chapterObj)();
    // }else{
    //   //获取书源信息;
    //   this.getSourceList.bind(this,chapterObj,chapterObj._id)();
    // }
  }

  getChapter(url){//获取章节内容;
    fetch('/chapter/'+encodeURIComponent(url)+'?k=2124b73d7e2e1945&t=1468223717').then((response)=>{
      return response.json();
    }).then((json)=>{
      this.setState({
        chapterInfo:json.chapter.body
      })
      this.getPageWord.bind(this,json.chapter.body)();
    });
  }

  getChpaterList(obj,id){//获取章节列表;
    fetch('/zhuishusq/toc/'+(obj.sourceId||id)+'?view=chapters').then((response)=>{
      return response.json();
    }).then((json)=>{
      let readNum=obj.chapterNum?obj.chapterNum:0;
      this.setState({
        bookChapterList:json.chapters,
        chapterHis:json.chapters.length>readNum?readNum:json.chapters.length-1
      });
      if(json.chapters.length>readNum){
        obj.chapterNum=readNum;
        obj.chapterUrl=json.chapters[readNum].link;
        this.localSet.bind(this,obj);
        this.getChapter.bind(this,obj.chapterUrl)();
      }else{
        obj.chapterNum=json.chapters.length-1;
        obj.chapterUrl=json.chapters[obj.chapterNum].link;
        this.localSet.bind(this,obj);
        this.getChapter.bind(this,obj.chapterUrl)();
      }
    });
  }

  getSourceList(obj,id){//获取书源列表;
    fetch('/zhuishusq/toc?view=summary&book='+id).then((response)=>{
      return response.json();
    }).then((json)=>{
      let sourceNum=1;
      if(!obj.sourceId){
        obj.sourceId=json[1]?json[1]._id:json._id;
        sourceNum=json[1]?1:0;
      }else{
        if(json[1]){
          json.map((item,index)=>{
            if(item._id==obj.sourceId){
              sourceNum=index;
            }
          })
        }else{
          sourceNum:0
        }
      }
      this.setState({
        bookSource:json,
        sourceNum:sourceNum
      });
      obj.chapterNum=obj.chapterNum?obj.chapterNum:0;
      obj.lastChapter=json[1]?json[1].lastChapter:json.lastChapter;
      this.localSet.bind(this,obj);
      this.getChpaterList.bind(this,obj)();
    });
  }

  localSet(obj){//设置本地列表;
    let bookList=JSON.parse(localStorage.getItem("bookList")||'[]');
    bookList=bookList.map((item,index)=>{
      if(item._id==obj._id){
        return obj;
      }else{
        return item;
      }
    });
    try{
      localStorage.setItem("bookList",JSON.stringify(bookList));
    }catch(e){}
  }

  chapterScroll(refs){//滚动事件,已经停用;
    if(this.changeScroll){
      clearTimeout(this.changeScroll);
    }
    this.changeScroll=setTimeout(()=>{
      let bookId=this.props.match.params.id;
      let scrollTop = this.refs[refs].scrollTop;
      let localObj = this.checkIsInLocal.bind(this,bookId)();
      localObj.scrollTop = scrollTop;
      this.localSet.bind(this,localObj)();
      this.setState({
        scrollTop:scrollTop
      })
    },100);
  }

  componentDidUpdate(prevProps,prevState){
    if(this.state.funType=="chapter"){
      this.refs['chapterScroll'].scrollTop=this.state.scrollTop;
    }
    if(prevState.bookChapterArr[0]!=this.state.bookChapterArr[0]){
      if(this.state.pageNum==-1){
        this.setState({
          pageNum:this.state.pageAllNum-1
        },()=>{
          window.mySwipe = new Swipe(document.getElementById('slider'), {
            startSlide: this.state.pageNum,
            speed: 400,
            auto: false, 
            continuous: true,
            disableScroll: false,
            stopPropagation: false,
            callback: function(index, elem) {
              this.setState({
                pageNum:index
              })
            }.bind(this),
            transitionEnd: function(index, elem) {}
          });
        })
      }else{
        window.mySwipe = new Swipe(document.getElementById('slider'), {
          startSlide: this.state.pageNum,
          speed: 400,
          auto: false, 
          continuous: true,
          disableScroll: false,
          stopPropagation: false,
          callback: function(index, elem) {
            this.setState({
              pageNum:index
            })
          }.bind(this),
          transitionEnd: function(index, elem) {}
        });
      }
    }
  }

  getPageWord(text){//获取章节页面数组;
    let bookChapterArr=wordToPageArr(text,this.state.fontSize);
    this.setState({
      bookChapterArr:bookChapterArr,
      pageAllNum:bookChapterArr.length
    });
  }

  hanleChangeChapter(num){//切换章节;
    if(num>=0 && num<this.state.bookChapterList.length){
      let bookId=this.props.match.params.id;
      let scrollTop = this.refs['chapterScroll'].scrollTop;
      let localObj = this.checkIsInLocal.bind(this,bookId)();
      localObj.scrollTop = scrollTop;
      localObj.chapterNum = num;
      this.localSet.bind(this,localObj)();
      this.setState({
        chapterHis:num,
        funShow:!this.state.funShow,
        funType:null,
        pageNum:0,
        scrollTop:scrollTop
      });
      this.getChapter.bind(this,this.state.bookChapterList[num].link)();
    }
  }

  handleSourceChange(num){//切换书源;
    if(num>=0 && num<this.state.bookSource.length){
      let bookId=this.props.match.params.id;
      let localObj = this.checkIsInLocal.bind(this,bookId)();
      localObj.chapterNum = 0;
      localObj.sourceId = this.state.bookSource[num]._id;
      this.localSet.bind(this,localObj)();
      this.setState({
        sourceNum:num,
        funShow:!this.state.funShow,
        funType:null,
        pageNum:0
      });
      this.getChpaterList.bind(this,{},this.state.bookSource[num]._id)();
    }
  }

  render() {
    let bookId=this.props.match.params.id;
    //当前屏幕高度;
    let win_height = document.documentElement.clientHeight+"px";
    let win_chapter_height = document.documentElement.clientHeight-120+"px";
    let testPageArr=[];
    this.state.bookChapterArr.map((item,index)=>{
      testPageArr.push(<div className="book-page-item" key={index} style={{height:win_height,fontSize:this.state.fontSize}}>
                          <pre style={{lineHeight:this.state.fontSize*1.5+'px'}}>{item.text.replace(/(^\s*)|(\s*$)/g, "")}</pre>
                        </div>)
    })

    //设置当前呼出功能块;
    let funTypeDom=[];
    switch(this.state.funType){
      case "set":
        funTypeDom.push(
          <div className="font-fun" key={0}>
            <p className="color-list">
              {this.state.colorArr.bgColorArr.map((item,index)=>{
                return <span className="color-item" key={index} style={{backgroundColor:item}} onClick={this.handleColorChange.bind(this,index)}></span>
              })}
            </p>
            <p className="size-list">
              <span className="size-big" onClick={this.handleSizeBig}><i className="iconfont icon-icon-yxj-font"></i>+</span>
              <span className="size-small" onClick={this.handleSizeSmall}><i className="iconfont icon-icon-yxj-font"></i>-</span>
            </p>
          </div>
        )
        break;
      case "chapter":
        funTypeDom.push(
          <div className="chapter-list" ref="chapterScroll" key={0} style={{height:win_chapter_height}}>
            {
              //onScroll={this.chapterScroll.bind(this,"chapterScroll")}滚动事件
            }
            {this.state.bookChapterList.map((item,index)=>{
               return <p className={index==this.state.chapterHis?"chapter-item chapter-sel":"chapter-item"} onClick={this.hanleChangeChapter.bind(this,index)} key={index}>
                        <span className="chapter-name">{item.title}</span>
                      </p>
            })}
          </div>
        )
        break;
      case "source":
        funTypeDom.push(
          <div className="source-list" key={0} style={{maxHeight:win_chapter_height}}> 
            {this.state.bookSource.map((item,index)=>{
               return <p className={index==this.state.sourceNum?"source-item source-sel":"source-item"} onClick={this.handleSourceChange.bind(this,index)} key={index}>
                        <span className="source-title">{item.name}</span><br/>
                        <span>{timeToStr(item.updated)}：{item.lastChapter}</span>
                      </p>
            })}
          </div>
        )
        break;
      default :
        funTypeDom.push();
        break;
    } 
    return (
      <div className="read-page" style={{backgroundColor:this.state.colorArr.bgColorArr[this.state.colorArr.bgColorChoose],height:win_height}}>

          { testPageArr.length==0
            ?""
            :<div id="slider" className="swipe">
            <div className="swipe-wrap">
              {testPageArr}
            </div>
          </div>
          }


        {
          //功能呼出区域
        }
        <div className="touch-box" style={{height:win_height}}>
          <div className="touch-page-up touch-fun" onClick={this.handleClickLeftArea.bind(this)} style={{height:win_height}}></div>
          <div className="touch-fun-show touch-fun" onClick={this.handleClickMidArea.bind(this)} style={{height:win_height}}></div>
          <div className="touch-page-down touch-fun" onClick={this.handleClicRightArea.bind(this)} style={{height:win_height}}></div>
        </div>

      	{ //头部功能块;
          this.state.funShow
          ? <div className="read-fun-top">
              <Link to={"/detail/"+bookId}><i className="iconfont icon-fanhui read-back"></i></Link>
              <span className="change-source" onClick={this.handleFunTypeChange.bind(this,"source")}>换源</span>
            </div>
          :""
        }
        { //底部功能块;
          this.state.funShow
          ? <div className="read-fun-bottom">
              <span onClick={this.handleFunTypeChange.bind(this,"set")}><i className="iconfont icon-icon-yxj-font"></i> 设置</span>
              <span onClick={this.handleFunTypeChange.bind(this,"download")}><i className="iconfont icon-xiazai"></i> 缓存</span>
              <span onClick={this.handleFunTypeChange.bind(this,"chapter")}><i className="iconfont icon-mulu"></i> 目录</span>
            </div>
          :""
        }

        {funTypeDom}

      </div>
    )
  }
}

export default ReadPage;
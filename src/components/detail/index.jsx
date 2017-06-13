import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Link , BrowserRouter} from 'react-router-dom';
import { url2Real, timeToStr, wordCount2Str, wordToPageArr} from '../../method/index.js';
import 'whatwg-fetch';
import './style.scss';

let textObj={
  "_id": "",
  "cover": "",
  "title": "",
  "author": "",
  "longIntro": "",
  "cat": "",
  "majorCate": "",
  "minorCate": "",
  "creater": "",
  "_le": false,
  "allowMonthly": false,
  "allowVoucher": true,
  "allowBeanVoucher": false,
  "hasCp": true,
  "postCount": 0,
  "latelyFollower": 0,
  "followerCount": 0,
  "wordCount": 0,
  "serializeWordCount": 0,
  "retentionRatio": "",
  "updated": "",
  "isSerial": true,
  "chaptersCount": 0,
  "lastChapter": "",
  "gender": [
    "male"
  ],
  "tags": [
  ]
}

class DetailPage extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.handleAddOrDel=this.handleAddOrDel.bind(this);
    this.gotoRead=this.gotoRead.bind(this);
    this.state={
    	bookInfo:textObj,
    	colorArr:["#fd4264","#fc9d9a","#f969ad","#c8c8ff","#83af9b"],
      bookList:[],//本地书单;
      isInLocal:false
    }
  }

  //加入书单，或者一出删除
  handleAddOrDel(){
  	//判断是否在本地书单中;
    let newBookList=[];
    if(this.state.isInLocal){
  	   //如果在就移除
       let bookId=this.props.match.params.id;
       this.state.bookList.map((item,index)=>{
          if(item._id!=bookId){
            newBookList.push(item);
          }
       });
       try{
          localStorage.setItem("bookList",JSON.stringify(newBookList));
        }catch(e){}
        this.setState({
          isInLocal:false
       });
    }else{
  	   //如果不在就加入
       newBookList=JSON.parse(JSON.stringify(this.state.bookList));
       newBookList.push({
          _id:this.state.bookInfo._id,
          title:this.state.bookInfo.title,
          cover:this.state.bookInfo.cover,
          lastChapter:this.state.bookInfo.lastChapter
       });
       try{
          localStorage.setItem("bookList",JSON.stringify(newBookList));
        }catch(e){}
       this.setState({
          isInLocal:true
       });
    }
  }

  gotoRead(){
    //判断是否在本地书单中;
    let newBookList=[];
    if(this.state.isInLocal){
    }else{
       //如果不在就加入
       newBookList=JSON.parse(JSON.stringify(this.state.bookList));
       newBookList.push({
          _id:this.state.bookInfo._id,
          title:this.state.bookInfo.title,
          cover:this.state.bookInfo.cover,
          lastChapter:this.state.bookInfo.lastChapter
       });
       try{
          localStorage.setItem("bookList",JSON.stringify(newBookList));
        }catch(e){}
       this.setState({
          isInLocal:true
       });
    }
    BrowserRouter.push('/read/'+this.state.bookInfo._id);
  }

  checkInBookLists(){//检查是否在本地书单中;
    let bookId=this.props.match.params.id;
    this.state.bookList.map((item,index)=>{
      if(item._id==bookId){
        this.setState({
          isInLocal:true
        })
      }
    });
  }

  getLocalBookList(){
    let bookList=JSON.parse(localStorage.getItem("bookList")||'[]');
    this.setState({
      'bookList':bookList
    },()=>{
      this.checkInBookLists.bind(this)();
    })
  }

  componentDidMount(){
    this.getLocalBookList.bind(this)();
    let bookId=this.props.match.params.id;
    fetch('/php/data.php?'+encodeURIComponent('http://api.zhuishushenqi.com/book/'+bookId))
    .then(function(response) {
      return response.json()
    }).then(function(json) {
      console.log(this);
      let searchBookList=json?json:{};
      //设置新的his结束
      this.setState({
        bookInfo:searchBookList
      });
      console.log('parsed json', json)
    }.bind(this)).then(function(data){
      console.log('parsed data', data)
    }).catch(function(ex) {
      console.log('parsing failed', ex)
    });
  }

  render() {
    let bookId=this.props.match.params.id;
  	let wordArr=wordToPageArr(this.state.bookInfo.longIntro,16);
  	console.log(wordArr);
    return (
      <div className="detail-page">
      	<div className="detail-title">
      		<Link to="/search">
      			<i className="detail-title-back iconfont icon-fanhui"></i>
      		</Link>
      		<div className="detail-title-name">书籍详情</div>
      		<span className="detail-share">分享</span>
      	</div>
      	<div className="book-box">
      		<img className="book-img" src={url2Real(this.state.bookInfo.cover)} alt={this.state.bookInfo.title} />
            <div className="book-info">
            	<span className="book-title">{this.state.bookInfo.title}</span><br/>
            	<span className="book-author"><em>{this.state.bookInfo.author}</em> | {this.state.bookInfo.minorCate} | {wordCount2Str(this.state.bookInfo.wordCount)}</span><br/>
            	<span className="book-desc">{timeToStr(this.state.bookInfo.updated)}前更新</span>
            </div>
      	</div>

      	<div className="book-add-info">
      		<span className="book-add" onClick={this.handleAddOrDel}>{this.state.isInLocal?"删除书单":"加入书单"}</span>
          <Link className="book-read" to={"/read/"+bookId}>开始阅读</Link>
          {
            //<Link className="book-read" to={"/read/"+bookId}>开始阅读</Link>
          }
      	</div>

      	<div className="book-read-info">
      		<div className="book-read-num">
      			<span>追书人数</span><br/>
      			{this.state.bookInfo.latelyFollower}
      		</div>
      		<div className="book-read-percent">
      			<span>读者存留率</span><br/>
      			{this.state.bookInfo.retentionRatio}%
      		</div>
      		<div className="book-read-dayWord">
      			<span>日更新字数</span><br/>
      			{this.state.bookInfo.serializeWordCount}
      		</div>
      	</div>

      	<div className="book-tags">{
	        this.state.bookInfo.tags.map((item,index)=>{
	            let num=index%5;
	            return <span className="book-tags-item" key={index} style={{backgroundColor:this.state.colorArr[num]}}>{item}</span>
	        })
	    }</div>


	    {wordArr.map((item,index)=>{
	    	return (
	    			<div className="book-longIntro" key={index}>
	    				<pre>{item.text}</pre>
	    			</div>
	    		)
	    })}


      </div>
    )
  }
}

export default DetailPage;
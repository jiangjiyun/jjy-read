import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { url2Real } from '../../method/index.js';
import { Link } from 'react-router-dom';
import { browserHistory } from 'react-router';
import ReactSwipe from 'react-swipes'

import './style.scss';

testObj=[
        {
          "_id": "57206c3539a913ad65d35c7b",
          "title": "一念永恒",
          "cover": "/agent/http://image.cmfu.com/books/1003354631/1003354631.jpg",
          "lastChapter": "第683章 实力再涨",
        },{
          "_id": "57206c3539a913ad65d35c7b",
          "title": "一念永恒1",
          "cover": "/agent/http://image.cmfu.com/books/1003354631/1003354631.jpg",
          "lastChapter": "第683章 实力再涨",
        },{
          "_id": "57206c3539a913ad65d35c7b",
          "title": "一念永恒3",
          "cover": "/agent/http://image.cmfu.com/books/1003354631/1003354631.jpg",
          "lastChapter": "第683章 实力再涨",
        }
      ];

class Main extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.bookItemDel=this.bookItemDel.bind(this);
    this.state={
      'bookList':[],
      'qita':true
    }
  }

  bookItemDel(index){
    let newBookList=[];
    var bookList=this.state.bookList;
    bookList.map((item,num)=>{
      if(num!=index){
        newBookList.push(item);
      }
    });
    try{
      localStorage.setItem("bookList",JSON.stringify(newBookList));
    }catch(e){}
    this.setState({'bookList':newBookList});
  }

  componentDidMount(){
    let bookList=JSON.parse(localStorage.getItem("bookList")||'[]');
    this.setState({
      'bookList':bookList
    })
  }

  render() {
    return (
    	<div className="index-page">
    		<div className="index-title">
          阅读器
          <Link to="/search"><i name="search" className="iconfont icon-sousuo_sousuo title-search"></i></Link>
        </div>
    		{this.state.bookList!=0?<BookList bookList={this.state.bookList} bookItemDel={this.bookItemDel}/>:""}
    	</div>
    )
  }
}


class BookList extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.handleDel = this.handleDel.bind(this);
  }

  componentDidMount(){
    //左滑、右滑效果;
    // $('.book-item').on('swipeleft', function(event) {
    //     this.className="book-item book-del";
    // }).on('swiperight', function(event) {
    //     this.className="book-item";
    // })

    // $('.book-item').swipeLeft(function(){
    //    this.className="book-item book-del";
    //  }).swipeRight(function(event) {
    //     this.className="book-item";
    // })

    var startPosition, endPosition, moveLength;  
    $('.book-item').bind('touchstart', function(event){  
      var touch = event.originalEvent.touches[0];  
      startPosition = {  
        x: touch.pageX 
      }
    }).bind('touchmove', function(event){  
      var touch = event.originalEvent.touches[0];  
      endPosition = {  
        x: touch.pageX
      };  
      moveLength = parseInt(endPosition.x - startPosition.x);
    }).bind('touchend', function(){
      //console.log(""+endPosition.x+"&"+startPosition.x);
      if(moveLength>50){
        this.className="book-item";
      }else if(moveLength<-50){
        this.className="book-item book-del";
      }
    });

  }

  handleDel(e){
    e.stopPropagation();
    let index=e.target.id.split("-")[1];
    $('#book-item-'+index)[0].className="book-item";
    this.props.bookItemDel(index);
  }

  render(){
    return (
      <ul className="book-list">
        {this.props.bookList.map((item,index)=>{
          return (
            <li className="book-item" id={"book-item-"+index} key={index}>
              <Link to={"/read/"+item._id} className="to-detail">
                <img className="book-img inline-style" src={url2Real(item.cover)} alt={item.title} />
                <div className="book-info inline-style">
                  <div className="book-title">{item.title}</div>
                  <div className="book-desc">{item.lastChapter}</div>
                </div>
              </Link>
              <div className="book-item-del inline-style" id={'del-'+index} onClick={this.handleDel}>删除</div>
            </li>
          )
        })}
      </ul>
    )
  }
}

export default Main;
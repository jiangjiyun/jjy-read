import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { url2Real } from '../../method/index.js';
import { Link } from 'react-router-dom';
import 'whatwg-fetch';
import './style.scss';

class SearchPage extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.handleClickSearch = this.handleClickSearch.bind(this);
    this.handleClickDel = this.handleClickDel.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state={
      bookList:[],
      searchValue:"",
      showHis:true
    }
  }

  handleClickDel(){
    this.setState({
      searchValue:"",
      showHis:true
    })
  }

  handleClickSearch(){
    let searchName=this.state.searchValue;
    if(searchName==""||searchName==null){
      return ;
    }
    //设置新的his
    let hisStr=localStorage.getItem("searchHis");
    let newHisStr;
    if(hisStr==null||hisStr==""){
      newHisStr=searchName;
    }else{
      let hisArr=hisStr.split("&-&");
      if(hisArr.indexOf(searchName)>-1){
        newHisStr=hisStr
      }else{
        newHisStr=searchName+"&-&"+hisStr;
      }
    }
    localStorage.setItem("searchHis",newHisStr);

    fetch('/php/data.php?'+encodeURIComponent('http://api.zhuishushenqi.com/book/fuzzy-search?query='+encodeURIComponent(searchName)+'&start=0&limit=5'))
    .then(function(response) {
      return response.json()
    }).then(function(json) {
      console.log(this);
      let searchBookList=json.books?json.books:[];
      //设置新的his结束
      this.setState({
        bookList:searchBookList,
        showHis:false
      });
      console.log('parsed json', json)
    }.bind(this)).then(function(data){
      console.log('parsed data', data)
    }).catch(function(ex) {
      console.log('parsing failed', ex)
    });

  }

  handleChange(e){
    //时时获取input value
    this.setState({searchValue:e.target.value});
  }

  changeSearch(word){
    console.log(word);
    fetch('/php/data.php?'+encodeURIComponent('http://api.zhuishushenqi.com/book/fuzzy-search?query='+encodeURIComponent(word)+'&start=0&limit=5'))
    .then(function(response) {
      return response.json()
    }).then(function(json) {
      console.log(this);
      let searchBookList=json.books?json.books:[];
      //设置新的his结束
      this.setState({
        bookList:searchBookList,
        showHis:false
      });
      console.log('parsed json', json)
    }.bind(this)).then(function(data){
      console.log('parsed data', data)
    }).catch(function(ex) {
      console.log('parsing failed', ex)
    });
  }

  render() {
    return (
      <div className="serach-page">
      	<div className="search-title">
          <Link to="/"><i name="back" className="title-back iconfont icon-fanhui"></i></Link>
          <input placeholder="请输入搜索关键字" type="text" className="search-input" onChange={this.handleChange} value={this.state.searchValue}/>
          <i name="search" className="title-del iconfont icon-shanchu" onClick={this.handleClickDel}></i>
          <i name="search" className="title-search iconfont icon-sousuo_sousuo" onClick={this.handleClickSearch}></i>
        </div>
        {this.state.showHis?<SearchHis bookList={this.state.bookList} changeSearchFn={this.changeSearch.bind(this)}/>:<SearchList bookList={this.state.bookList}/>}
      </div>
    )
  }
}

class SearchHis extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.hanldeClickDel=this.hanldeClickDel.bind(this);
    this.state={
      searchHis:[],
      colorArr:["#fd4264","#fc9d9a","#f969ad","#c8c8ff","#83af9b"]
    }
  }

  hanldeClickDel(){
    localStorage.setItem("searchHis","");
    let searchHis = localStorage.getItem("searchHis");
    let searchHisArr = (searchHis==null||searchHis=="")?[]:searchHis.split("&-&");
    this.setState({
      searchHis:searchHisArr
    })
  }

  changeSearch(word){
    this.props.changeSearchFn(word);
  }

  componentDidMount(){
    let searchHis = localStorage.getItem("searchHis");
    let searchHisArr = (searchHis==null||searchHis=="")?[]:searchHis.split("&-&");
    this.setState({
      searchHis:searchHisArr
    })
  }

  render(){
    return (
      <div className="his-component">
        <div className="his-title">最近搜索历史</div>
        <div className="his-contain">{
          this.state.searchHis.map((item,index)=>{
            let num=index%5;
            return <span className="his-item" key={index} onClick={this.changeSearch.bind(this,item)} style={{backgroundColor:this.state.colorArr[num]}}>{item}</span>
          })
        }</div>
        <div className="his-del" onClick={this.hanldeClickDel}>清空搜索历史</div>
      </div>
    )
  }
}

class SearchList extends React.Component{
  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

  render(){
    return (
      <ul className="book-list">
        {this.props.bookList.map((item,index)=>{
          return (
            <Link className="book-item" id={"book-item-"+index} key={index} to={"/detail/"+item._id}>
              <img className="book-img inline-style" src={url2Real(item.cover)} alt={item.title} />
              <div className="book-info inline-style">
                <div className="book-title">{item.title}</div>
                <div className="book-desc">{item.latelyFollower+"人在追|"+item.retentionRatio+"％读者存留|"+item.author+"著"}</div>
              </div>
            </Link>
          )
        })}
      </ul>
    )
  }
}

export default SearchPage;
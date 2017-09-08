<template>
  <div id="app">
    <div class="title">
      {{title}}
    </div>
    <div style="height:48px;">
    <div class="search" @click="searchClick" >
      <button class="btn-search" @click="getInfo" ></button>
    <transition name="bounce">
      <input v-if="searchClicked" placeholder="城市名，拼音或汉字均可" v-model.trim="location" v-on:keyup.enter="getInfo" @blur="searchBlur" @focus="searchFocus" v-focus>
    </transition>
    </div>
    <div class="refresh">
      <button class="btn-refresh" @click="refresh"></button>      
    </div>
    </div>
    <div class="error" v-if="error">
      {{errorMsg}}
    </div>
    <div class="now-weather">
      <h3>{{now.location.name}}</h3>
      <p>{{now.location.path}}</p>
      <p>{{now.now.text}}</p>
      <p>{{now.now.temperature}}</p>
      <p>{{today.low}} - {{today.high}}℃</p>
      <p>{{today.date}} {{today.day}}</p>
      <p style="color:#aaa">{{now.last_update}}</p>
    </div>
    <div class="daily-weather">
    <div class="tomorrow-weather">
      <div class="daily-title">
        明天
      </div>
      <p>{{tomorrow.text_day}}</p>
      <p>{{tomorrow.low}} - {{tomorrow.high}}℃</p>      
    </div>
    <div class="dayAfterTomorrow-weather">
      <div class="daily-title">
        后天
      </div>
      <p>{{dayAfterTomorrow.text_day}}</p>
      <p>{{dayAfterTomorrow.low}} - {{dayAfterTomorrow.high}}℃</p>            
    </div>
    </div>
    <div class="footer">
      <a href="https://mccarthey.xin">Copyright © McCarthey </a>
      <a href="https://www.seniverse.com">Powered by Seniverse</a>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'app',
  data () {
    return {
      title:'今日天气',
      location:'',
      now:{
        location:{
          name:'',
          path:'',
        },
        now:{
          text:'',
          temperature:''
        },
        last_update:''
      },
      today:{
        date:'',
        day:'',
        text_day:'',
        low:'',
        high:''
      },
      tomorrow:{
        date:'',
        day:'',
        text_day:'',
        low:'',
        high:''
      },
      dayAfterTomorrow:{
        date:'',
        day:'',
        text_day:'',
        low:'',
        high:''
      },
      searchClicked:true,

      timer:'',

      error:false,
      errorMsg:''
    }
  },
  created:function(){
    if(localStorage.vue_weather_location){
      this.location = localStorage.vue_weather_location;
    }
    this.getInfo();
    this.location='';
  },
  methods:{
    refresh:function(){
      window.location.href = window.location.href;
    },
    searchClick:function(){
      //点击外层div弹出input搜索框
      if(!this.searchClicked){
        this.searchClicked = true;
      }
    },
    searchBlur:function(){
      //失去焦点5s后自动隐藏input
      var that = this;
      this.timer = setTimeout(function(){
        that.searchClicked= false;
      }, 5000)
    },
    searchFocus:function(){
      //input聚焦时停止5s计时器
      clearTimeout(this.timer);
    },
    getInfo:function(){
      if(!this.searchClicked) return false;
      let UID = "U785B76FC9"; // 测试用 用户ID，请更换成您自己的用户ID
      let KEY = "4r9bergjetiv1tsd"; // 测试用key，请更换成您自己的 Key
      let API_NOW = "https://api.seniverse.com/v3/weather/now.json"; // 获取天气实况
      let API_DAILY = "https://api.seniverse.com/v3/weather/daily.json";
      let LOCATION = this.location || "chengdu"; // 除拼音外，还可以使用 v3 id、汉语等形式
      // 获取当前时间戳
      let ts = Math.floor((new Date()).getTime() / 1000);
      // 构造验证参数字符串
      let str = "ts=" + ts + "&uid=" + UID;
      // 使用 HMAC-SHA1 方式，以 API 密钥（key）对上一步生成的参数字符串（raw）进行加密
      // 并将加密结果用 base64 编码，并做一个 urlencode，得到签名 sig
      let sig = CryptoJS.HmacSHA1(str, KEY).toString(CryptoJS.enc.Base64);
      sig = encodeURIComponent(sig);
      str = str + "&sig=" + sig;
      // 构造最终请求的 url
      let url_now = API_NOW + "?location=" + LOCATION + "&" + str + "&callback=?";
      let url_daily = API_DAILY + "?location=" + LOCATION + "&" + str + "&callback=?";

      let days=['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
      let day = new Date().getDay();
      day = days[day];
      let that = this;
      $.getJSON(url_now, function(data) {
        let results = data.results[0];
        that.now.location.name = results.location.name;
        that.now.location.path = results.location.path;
        that.now.now.text = results.now.text;
        //拼接温度字符串
        let temperature = results.now.temperature;
        temperature += '℃';
        that.now.now.temperature = temperature;
        //拼接更新时间字符串
        let last_update = new Date(results.last_update);
        console.log(results.last_update);//格式化返回的日期
        let minutesAgo = '更新于';
        minutesAgo += Math.floor((new Date()-last_update)/1000/60);
        minutesAgo += '分钟前';
        that.now.last_update = minutesAgo;     
      });
      $.getJSON(url_daily,function(){
          console.log("success");
        })
          .done(function (data) {
            that.error = false;
            let results = data.results[0];
            let today = results.daily[0];
            let tomorrow = results.daily[1];
            let dayAfterTomorrow = results.daily[2];
            that.today.text_day = today.text_day;
            that.today.low = today.low;
            that.today.high = today.high;
            that.today.date = today.date;
            that.today.day = day;

            that.tomorrow.text_day = tomorrow.text_day;
            that.tomorrow.low = tomorrow.low;
            that.tomorrow.high = tomorrow.high;
            that.tomorrow.date = tomorrow.date;

            that.dayAfterTomorrow.text_day = dayAfterTomorrow.text_day;
            that.dayAfterTomorrow.low = dayAfterTomorrow.low;
            that.dayAfterTomorrow.high = dayAfterTomorrow.high;
            that.dayAfterTomorrow.date = dayAfterTomorrow.date;

            localStorage.setItem("vue_weather_location", that.location);
            that.location='';
          })
          .fail(function(){
            that.error = true;
            that.errorMsg = '城市名不存在或刷新试一试';
          });  

    }
  }
}
</script>

<style scoped>
@import './assets/weather.css'
</style>

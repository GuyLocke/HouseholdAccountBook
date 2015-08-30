var calApp = calApp || {};
/********************************************************************************
*	カレンダー画面用制御
*
********************************************************************************/

//dominoビューのURL。（vwclndr）
calApp.viewURL = "api/data/collections/name/vwclndr?keysexactmatch=true&sortcolumn=date";

//イベント（JavaScriptのではなく）を格納するための配列
calApp.eventsArray = [];

//カレンダー
calApp.clndr = null;

//Dominoデータをサーバから読み込む
calApp.loadData = function(keys){
	$.ajax({
		url:calApp.viewURL + "&keys=" + keys,
		success:calApp.applyDaysEvent,
		dataType:'json',
		async:false
	});
};

//Dominoから読み込んだデータを名前空間にいったん格納する。
calApp.applyDaysEvent = function(data,dataType){
	_.each(data,function(e){
		//タイムゾーンにより日付がずれてしまうため、時刻部分をはずしておく。
		e.date = e.date.substring(0,10);
	})
	calApp.eventsArray = data;
};
//日クリック時のイベントハンドラ。日の情報を表示する。
calApp.handleClickEvent = function(target){
	var compiled = _.template(calApp.dayInfoTemplate);
	$('.dayInfo_container').html(compiled(target));
};

//前月、翌月が押されたら、詳細をクリアして、Dominoからデータを読み込んで、カレンダーに設定する。
calApp.handleMonthChangeEvent = function(month){
	$('.dayInfo_container').html('');
	calApp.loadData(month.format('YYYYMM'));
	calApp.clndr.setEvents(calApp.eventsArray);
}

//カレンダーを表示する。
calApp.displayCalendar = function(){
	calApp.clndr = $('.calendar_container').clndr({
		events: calApp.eventsArray,
		clickEvents: {
			click:calApp.handleClickEvent,
			onMonthChange:calApp.handleMonthChangeEvent
		},
		showAdjacentMonths: false
	});
}

//当月のカレンダーを表示する。
calApp.showThisMonth = function(){
	$('.dayInfo_container').html('');
	var keys = moment().format('YYYYMM');
	calApp.loadData(keys);
	calApp.displayCalendar();
}

//日ごとの詳細を表示するためのテンプレート
calApp.dayInfoTemplate = "<div class='detail_section'>"+
	"<div class='event_date'><%= date.format('YYYY-MM-DD') %></div>"+
	"<% _.each(events,function(event){ %>"+
	"<div class='event_title'>"+
	"<span class='event_area'><%= event.area%>:</span>"+
	"<span class='event_shopName'><%= event.shopName%></span>"+
	"</div>"+
	"<% }); %>";

$(function(){
	calApp.showThisMonth();
});
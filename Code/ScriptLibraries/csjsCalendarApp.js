var calApp = calApp || {};

//********************************************************************************
//*	カレンダー画面用制御 
//*
//********************************************************************************

//dominoビューのURL。（vwclndr）
calApp.viewURL = "xspAgtCalendarDataSource.xsp";

//sessionScope設定用URL
calApp.urlScopedVarSet = "xspAgtScopedVars.xsp";

//休暇情報取得用
calApp.urlHolidayInfoService = "http://www.finds.jp/ws/calendar.php";

//支出文書新規画面のURL
calApp.xspSpending = "xspSpending.xsp";

//収入文書新規画面のURL
calApp.xspIncome = "xspIncome.xsp";

//イベント（JavaScriptのではなく）を格納するための配列
calApp.eventsArray = [];

//日毎の収支合計
calApp.dailyTotals = {};

//カレンダー
calApp.clndr = null;

//祝祭日
calApp.holidays = [];

//Dominoデータをサーバから読み込む
calApp.loadData = function(keys){
	$.ajax({
		url:calApp.viewURL + "?keys=" + keys,
		success:calApp.applyDaysEvent,
		dataType:'json',
		async:false
	});
};

//対象の年月をsessionScopeに格納する。(結果は無視)
calApp.setScopedVar = function(key,value){
	var _url = calApp.urlScopedVarSet;
	_url += ("?" + key + "=" + value);
	$.ajax({
		url:_url,
		dataType:'json',
		async:true
	});
};

//休暇情報を取得する。
calApp.applyHolidays = function(month){
	var _url,
		y = month.substring(0,4),
		m = month.substring(4,6),
		d,
		classname,
		holidays;
	_url = calApp.urlHolidayInfoService;
	_url += ('?l=2&y=' + y + '&m=' + m);
	$.ajax({
		type:'GET',
		url:_url,
		jsonp:'jsonp',
		dataType:'jsonp',
		jsonpCallback:'holidays',
		async:false
	}).done(function(data){
		holidays = data.result.day;
		_.each(holidays,function(holiday){
			d = ('0'+holiday.mday).slice(-2);
			classname = 'calendar-day-' + y + '-' + m + '-' + d;
			if(holiday.htype == '1'){
				$('.' + classname).addClass('holiday');
			}else if(holiday.wday == '1'){
				$('.' + classname).addClass('sunday');				
			}else if(holiday.wday == '7'){
				$('.' + classname).addClass('saturday');
			}else{
				$('.' + classname).addClass('workday');
			}
		});
	});
};

//Dominoから読み込んだデータを名前空間にいったん格納する。
calApp.applyDaysEvent = function(data){
	var items = data.items;
	_.each(items,function(e){
		//タイムゾーンにより日付がずれてしまうため、時刻部分をはずしておく。
		e.date = e.date.substring(0,10);
	})
	calApp.eventsArray = items;
	calApp.year = data.year;
	calApp.month = data.month;
};
//日クリック時のイベントハンドラ。日の情報を表示する。
calApp.handleClickEvent = function(target){
	$('.dayInfo_container').html(calApp.dayInfoTemplate(target));
	$('.new_spending_button').click(function(){
		$('body').pagecontainer('change','xspSample1.xsp');
	});
};
	
//前月、翌月が押されたら、詳細をクリアして、Dominoからデータを読み込んで、カレンダーに設定する。
calApp.handleMonthChangeEvent = function(month){
	$('.dayInfo_container').html('');
	calApp.loadData(month.format('YYYYMM'));
	calApp.applyHolidays(month.format('YYYYMM'));
	calApp.setScopedVar('currentYM',month.format('YYYYMM'));
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
		showAdjacentMonths: false,
		template:calApp.template,
		doneRendering:function(){
			//年月をクリックしたら、ページをリロードする。
			$('.month-button').on('click',function(){
				location.reload();
			});
			calApp.calcEachDaysTotal();
			calApp.applyDailyTotal();
		}
	});
};

//当月のカレンダーを表示する。
calApp.showThisMonth = function(){
	$('.cal1').html('');
	$('.dayInfo_container').html('');
	var keys = moment().format('YYYYMM');
	calApp.loadData(keys);
	calApp.applyHolidays(keys);
	calApp.displayCalendar();
};

//各日の合計を計算する。
calApp.calcEachDaysTotal = function(){
	var initialItem;
	_.each(calApp.eventsArray,function(obj){
		if(!calApp.dailyTotals.hasOwnProperty(obj.date)){
			calApp.dailyTotals[obj.date] = {
				date:obj.date,	
				income:0,
				outgoing:0
			};
		}
		calApp.dailyTotals[obj.date][obj.type] += obj.total;
	});
}

//日毎の合計をカレンダーに埋め込む
calApp.applyDailyTotal = function(){
	_.each(calApp.dailyTotals,function(total){
		$('td.calendar-day-' + total.date + ' .day-contents').append(calApp.daylyTotalTemplate(total));
	});
};

//カレンダー画面のテンプレート
calApp.template = "<div class='clndr-controls'>" +
"<div class='clndr-control-button'><span class='clndr-previous-button'>前月</span></div>" +
"<div class='month'><span class='month-button'><%= year %>年<%= month %> </span></div>"+
"<div class='clndr-control-button rightalign'><span class='clndr-next-button'>翌月</span></div>" +
"</div>" +
"<table class='clndr-table' border='0' cellspacing='0' cellpadding='0'>" +
"<thead>" +
"<tr class='header-days'>" +
	"<td class='header-day'>日</td>" +
	"<td class='header-day'>月</td>" +
	"<td class='header-day'>火</td>" +
	"<td class='header-day'>水</td>" +
	"<td class='header-day'>木</td>" +
	"<td class='header-day'>金</td>" +
	"<td class='header-day'>土</td>" +
"</tr>" +
"</thead>" +
"<tbody>" +
"<% for(var i = 0; i < numberOfRows; i++){ %>" +
  "<tr>" +
  "<% for(var j = 0; j < 7; j++){ %>" +
    "<% var d = j + i * 7; %>" +
      "<td class='<%= days[d].classes %>'><div class='day-contents'><%= days[d].day %>" +
    "</div></td>" +
  "<% } %>" +
  "</tr>" +
"<% } %>" +
"</tbody>" +
"</table>";

//日ごとの詳細を表示するためのテンプレート
calApp.dayInfoTemplate = _.template("<div class='detail_section'>"+
	"<div class='event_date'><%= date.format('YYYY-MM-DD') %></div>"+
	"<% _.each(events,function(event){ %>"+
	"<div class='event_title'>"+
	"<span class='event_area'><%= event.area%>:</span>"+
	"<a href='<%= event.url %>'>"+
	"<span class='event_shopName'><a href='<%= event.url %>'><%= event.shopName%>(&yen<%= event.total %>)</a></span>"+
	"</div>"+
	"<% }); %>"+
	"<div><span class='new_spending_button'>追加</span></div>");

//カレンダー内に各日の合計を表示するためのテンプレート
calApp.daylyTotalTemplate = _.template("<br>"+
	"<% if(income > 0){ %>"+
	"<span class='day-income'>入:<%= income %></span>"+
	"<% } %>"+
	"<br>"+
	"<% if(outgoing > 0){ %>"+
	"<span class='day-outgoing'>出:<%= outgoing %></span>"+
	"<% } %>"+
	"");

//新規の支出文書画面を開く
calApp.newSpending = function(){
	console.log("hoge");
	$('body').pagecontainer('change','xspSample1.xsp');
};

//ページロード時に実行
$(function(){
	moment.locale('ja');
	calApp.showThisMonth();
});

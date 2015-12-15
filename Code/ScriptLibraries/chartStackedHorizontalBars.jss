function getChartdata(){
	//文書取得用のキー設定
	var key = @UserName()+"201509";
	
	//出費した金額の取得
	var Array_val = @DbLookup("","vwReportsByDate",key,"total");
	
	//取得したデータの分だけ変数の設定を行う
	//var Array_val = [5,10,15,20];//テスト用データ
	viewScope.chartdata1 = "var ";
	for(i=0;i<Array_val.length;i++){
		viewScope.chartdata1 += "d" + i + " = [[" + Array_val[i] + ",0]],";
	}
	viewScope.chartdata1 += "graph";
	print("getChartdata viewScope.chartdata1="+viewScope.chartdata1);
	//以下のような文字列が出来上がる
	//var d0 = [[25000,0]],d1 = [[30000,0]],d2 = [[75000,0]],graph
	
	
	//出費の項目を取得
	var Array_label = @DbLookup("","vwReportsByDate",key,"spendingType");
	
	//取得したデータの分だけ項目名の設定をする
	//金額のd0,d1....と項目名のd0,d1.....は関連付ける必要がある
	viewScope.chartdata2 = "[";
	for(i=0;i<Array_label.length;i++){
		viewScope.chartdata2 += "{data: d" + i + ",label:'" + Array_label[i] + "'},";
	}
	viewScope.chartdata2.substr( 0 , (viewScope.chartdata2.length-1) );//末尾のコンマを削除
	viewScope.chartdata2 += "]";
	print("getChartdata viewScope.chartdata2="+viewScope.chartdata2);
	
	//以下のような文字列が出来上がる
	//[{data: d0,label: '食費'}, {data: d1, label: '光熱費'}, { data: d2,label: '家賃'}];
}

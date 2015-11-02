var genReportDoc = function(ym:String){
	var key:java.util.Vector = new java.util.Vector();
	key.add(@UserName());
	key.add(ym);

	// Parse Year and Month from param
	var dtYM:Date = I18n.parseDate(ym+"/01", "yyyy/MM/dd");
	var yr = dtYM.getFullYear();
	var mon = dtYM.getMonth();

	// Get Spending entries by Year,Month
	var vwSpend:NotesView = database.getView("vwSpendingsByYearMonth");
	var vwSpendDetail:NotesView = database.getView("vwSpendingDetailsByType");
	vwSpend.setAutoUpdate(false);
	vwSpendDetail.setAutoUpdate(false);

	var nvec:NotesViewEntryCollection = vwSpend.getAllEntriesByKey(key);
	var entry:NotesViewEntry = nvec.getFirstEntry();
	while(entry != null){
		var cols = entry.getColumnValues();
		var unid = cols.get(2);

		// Get SpendingDetail entries by Spending Doc UNID
		var nvn:NotesViewNavigator = vwSpendDetail.createViewNavFromCategory(unid);
		var entryDetail:NotesViewEntry = nvn.getFirst();

		while(entryDetail != null){
			print("entryDetail.isDocument()="+entryDetail.isDocument());		
			
			if(entryDetail.isCategory()){
				var colDetail = entryDetail.getColumnValues();
				var type = colDetail.get(1);
				var subTotal = colDetail.get(2);
				
				// Create Report doc
				var doc:NotesDocument = database.createDocument();
				doc.replaceItemValue("Form", "frmReport");
				doc.replaceItemValue("year", @Text(yr));
				doc.replaceItemValue("month", @Right("0"+@Text(mon+1),2));
				doc.replaceItemValue("spendingType", type);
				doc.replaceItemValue("spendingTypeSubTotal", subTotal);
				doc.replaceItemValue("total", subTotal);
				doc.replaceItemValue("readears", @UserName());
				doc.replaceItemValue("authors", @UserName());
				
				doc.computeWithForm(true, true);
				doc.save();
			}

			var tmpentry = nvn.getNextCategory();
			entryDetail.recycle();
			entryDetail = tmpentry;	
		}
		nvn.recycle();
		
		var tmpentry = nvec.getNextEntry(entry);
		entry.recycle();
		entry = tmpentry;	
	}
	nvec.recycle();
	vwSpend.recycle();
	vwSpendDetail.recycle();
	
}

function genReportChart(){
	//文書取得用のキー設定
	var key = @UserName()+"201509";
	
	//出費した金額の取得
	var Array_val = @DbLookup("","vwReportsByDate",key,"total");
	
	//取得したデータの分だけ変数の設定を行う
	//var Array_val = [5,10,15,20];//テスト用データ
	viewScope.chartdata1 = "var ";
	for(i=0;i<Array_val.length;i++){
		viewScope.chartdata1 += "d" + i + " = [[0, " + Array_val[i] + "]],";
	}
	viewScope.chartdata1 += "graph";
	//以下のような文字列が出来上がる
	//var d0 = [[0,25000]],d1 = [[0,30000]],d2 = [[0,75000]],graph
	
	
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
	
	//以下のような文字列が出来上がる
	//[{data: d0,label: '食費'}, {data: d1, label: '光熱費'}, { data: d2,label: '家賃'}];
}

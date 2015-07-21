if(define && define.amd){ 
	// undefine define.amd while loading jquery modules so as not to use amd loader 
	var tempAmd = define.amd; 
	define.amd = undefined; 
}

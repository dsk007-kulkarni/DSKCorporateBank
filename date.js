module.exports.getHours=getHours;
function getHours(){
	var h = new Date().getHours();
	if(h>=0 && h<12){
		return ("Good Morning");
	}else if(h>=12 && h<17){
		return ("Good Afternoon");
	}else if(h>=17 && h<=23){
		return ("Good Evening");
	}
}
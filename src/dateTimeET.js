//function dateFormattedET(){
const dateFormattedET = function(type = 0){
	let timeNow = new Date();
	
	const monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	
	const folkMonthNamesET = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu','lehekuu', 'jaanakuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'viinakuu', 'talvekuu', 'jõulukuu'];
	
	const monthName = type === 1
		? folkMonthNamesET[timeNow.getMonth()]
		: monthNamesET[timeNow.getMonth()];
	
	return timeNow.getDate() + '. ' + monthName + ' ' + timeNow.getFullYear();
}

const weekdayFormattedET = function(){
	let timeNow = new Date();
	
	const weekdayNamesET = ['pühapäev','esmaspäev', 'teisipäev', 'kolmapäev','neljapäev', 'reede', 'laupäev'];

	return weekdayNamesET[timeNow.getDay()];
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	
	if(minuteNow < 10){
		minuteNow = '0' + minuteNow;
	}
	
	if(secondNow < 10){
		secondNow = '0' + secondNow;
	}
	return hourNow + ':' + minuteNow + ':' + secondNow;
}

module.exports = {dateET: dateFormattedET, timeET: timeFormattedET, weekdayET: weekdayFormattedET};
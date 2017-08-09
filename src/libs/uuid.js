/**
 * [UUID 生成UUID]
 */
function UUID() {
	this.id = this.createUUID();
}

/**
 * [valueOf 重写 valueOf 方法]
 * @return {String} [description]
 */
UUID.prototype.valueOf = function() {
	return this.id;
};

/**
 * [valueOf 重写 toString 方法]
 * @return {String} [description]
 */
UUID.prototype.toString = function() {
	return this.id;
};

/**
 * [createUUID 创建UUID]
 * @return {String} [description]
 */
UUID.prototype.createUUID = function() {
	var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
	var dc = new Date();
	var t = dc.getTime() - dg.getTime();
	var h = '';
	var tl = UUID.getIntegerBits(t, 0, 31);
	var tm = UUID.getIntegerBits(t, 32, 47);
	var thv = UUID.getIntegerBits(t, 48, 59) + '1'; // version 1, security version is 2
	var csar = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
	var csl = UUID.getIntegerBits(UUID.rand(4095), 0, 7);
	var n = UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
		UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
		UUID.getIntegerBits(UUID.rand(8191), 0, 7) +
		UUID.getIntegerBits(UUID.rand(8191), 8, 15) +
		UUID.getIntegerBits(UUID.rand(8191), 0, 15); // this last number is two octets long
	return tl + h + tm + h + thv + h + csar + csl + h + n;
};

/**
 * [getIntegerBits description]
 * @param  {[type]} val   [description]
 * @param  {[type]} start [description]
 * @param  {[type]} end   [description]
 * @return {[type]}       [description]
 */
UUID.getIntegerBits = function(val, start, end) {
	var base16 = UUID.returnBase(val, 16);
	var quadArray = new Array();
	var quadString = '';
	var i = 0;
	for (i = 0; i < base16.length; i++) {
		quadArray.push(base16.substring(i, i + 1));
	}
	for (i = Math.floor(start / 4); i <= Math.floor(end / 4); i++) {
		if (!quadArray[i] || quadArray[i] == ''){
			quadString += '0';
		}
		else{
			quadString += quadArray[i];
		}
	}
	return quadString;
};

/**
 * [returnBase description]
 * @param  {[type]} number [description]
 * @param  {[type]} base   [description]
 * @return {[type]}        [description]
 */
UUID.returnBase = function(number, base) {
	var convert = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
		output;
	if (number < base)
		output = convert[number];
	else {
		var MSD = '' + Math.floor(number / base);
		var LSD = number - MSD * base;
		if (MSD >= base)
			output = this.returnBase(MSD, base) + convert[LSD];
		else
			output = convert[MSD] + convert[LSD];
	}
	return output;
};

/**
 * [rand description]
 * @param  {[type]} max [description]
 * @return {[type]}     [description]
 */
UUID.rand = function(max) {
	return Math.floor(Math.random() * max);
};

module.exports = UUID;
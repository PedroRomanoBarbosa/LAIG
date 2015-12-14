
function Server(port) {
	this.port = port;
	this.answer = "";
	this.replyReady = false;
};

Server.prototype.makeRequest = function(requestStr){

	var request = new XMLHttpRequest();
	request.server = this;
	request.open('GET', 'http://localhost:'+this.port+'/'+requestStr, true);

	request.onload = function(data){
		//console.log("Request successful. Reply: " + data.target.response);
		request.server.answer = data.target.response;
		request.server.replyReady = true;
	};

	request.onerror = function(){
		//console.log("Error waiting for response");
		request.server.answer = "";
	};

	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	request.send();
};
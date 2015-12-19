function Emoticons(iconArray) {
	this.namedImages = {};
	this.names = []
	this.imgHtmls = []

	this._init = function(iconArray) {
		for(var i=0;i<iconArray.length / 2;i++) {
			this.namedImages[iconArray[i]] = iconArray[i+1];
		}

		for(var name in this.namedImages) {
			if(name.indexOf("\"")>=0) {
				throw "name cannot contain double quote\"";
			}
			var url = this.namedImages[name];
			if(url.indexOf("'") >=0 || url.indexOf("\"") >=0) {
				throw "url cannot contain single/double quote";
			}
			this.names.push(name);
			this.imgHtmls.push("<img src='"+url+"'>");
		}
	}
	this._init(this.namedImages);

	this.render = function(text) {
		for(var i=0;i<this.names.length;i++) {
			var name = this.names[i];
			var imgHtml = this.imgHtmls[i];
			var arr = text.split(name);
			text = arr[0];
			for(var i=1;i<arr.length;i++) {
				text += imgHtml + arr[i];
			}
		}
		return text;
	}

	this.getImageUrl = function(name) {
		return this.namedImages[name];
	}

	this.getEmoticonText = function(name) {
		return "[" + name + "]";
	}

	this.renderHtmlGrid = function() {
		var html = '<ul class="list-unstyled thumbnails" style="width:400px;height:200px;">';
		for(var name in this.namedImages) {
			html += '<li style="margin-bottom:0;" class="col-xs-1 thumbnail"><img class="emoticon" title="'+name+'" src="'+this.namedImages[name]+'"></li>'
		}
		html += "</ul>"
		return html;
	}

	this.emoticonClick = function(name, url) {
		// override this function
	}
	this.emoticonMouseover = function() {
		$(this).addClass('animated bounceIn')
	}
	this.emoticonMouseout = function() {
		$(this).removeClass('animated bounceIn')
	}

	var _emoticons = this;

	$('img.emoticon').click(function() {
		var img = $(this)
		_emoticons.emoticonClick(img.attr("title"), img.attr("src"));
	});
	$('img.emoticon').mouseover(function() {
		_emoticons.emoticonMouseover();
	});
	$('img.emoticon').mouseout(function() {
		_emoticons.emoticonMouseout();
	});

}
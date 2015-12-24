function Emoticons(iconArray) {
	this.namedImages = {};
	this.names = []
	this.imgHtmls = []

	this._init = function(iconArray) {
		for(var i=0;i<iconArray.length;i+=2) {
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
	this._init(iconArray);

	this.render = function(text) {
		text = escapeHtml(text);
		for(var i=0;i<this.names.length;i++) {

			var name = this.names[i];
			console.log(name);
			var imgHtml = this.imgHtmls[i];
			var arr = text.split(name);
			text = arr[0];
			console.log(text);
			console.log(imgHtml);
			for(var j=1;j<arr.length;j++) {
			 	text += imgHtml + arr[j];
			}

		}
		return text;
	}

	function escapeHtml(text) {
		return $("<div>").text(text).html()
	}

	this.getImageUrl = function(name) {
		return this.namedImages[name];
	}

	this.getEmoticonText = function(name) {
		return "[" + name + "]";
	}

	this.renderHtmlGrid = function() {
		var html = '<ul class="list-unstyled thumbnails" style="width:400px;height:400px;">';
		for(var name in this.namedImages) {
			html += '<li style="margin-bottom:0;" class="col-xs-1 thumbnail"><img class="emoticon" title="'+name+'" src="'+this.namedImages[name]+'"></li>'
		}
		html += "</ul>"
		return html;
	}

    this.renderToDivs = function(queryString) {
        $(queryString).each(function(index, element) {
            var text = $(this).text();
            var t = _emoticons.render(text);
            $(this).html(t);
        });
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

	$(document).ready(function() {

		$('img.emoticon').mouseover(function() {
			_emoticons.emoticonMouseover();
		});
		$('img.emoticon').mouseout(function() {
			_emoticons.emoticonMouseout();
		});
	});

}

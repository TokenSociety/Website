(function (Q, $, window, document, undefined) {

var Users = Q.Users;
var Streams = Q.Streams;

/**
 * TokenSociety Tools
 * @module TokenSociety-tools
 */

/**
 * @class TokenSociety import
 * @constructor
 * @param {array} [options] this array contains function parameters
 *   @param {String} [options.taskStream] Task stream for current tool. If it null, it will bre created from client.
 */
Q.Tool.define("TokenSociety/importNFT", function (options) {
	var tool = this;
	var state = this.state;

	Q.addStylesheet('{{TokenSociety}}/css/importNFT.css');

	Q.Text.get('TokenSociety/content', function (err, content) {
		var msg = Q.firstErrorMessage(err, content);
		if (msg) {
			console.error(msg);
			return;
		}

		tool.text = content.NFT.import;
		tool.refresh();
	});

	// Listen messages from Streams/tasks
	Users.Socket.onEvent('Streams/post').set(function (message) {
		if (!Streams.isStream(state.taskStream)) {
			return;
		}

		message = Streams.Message.construct(message);
		var publisherId = Q.getObject(["publisherId"], message);
		var streamName = Q.getObject(["streamName"], message);
		var messageType = Q.getObject(["type"], message);

		// filter by Streams/tasks stream name
		if (streamName !== state.taskStream.fields.name) {
			return;
		}

		switch (messageType) {
			case "Streams/task/progress":
				tool.$progressbar.width(parseInt(message.getInstruction('progress')) + '%');
				break;
			case "Streams/task/error":
				var instructions = message.getAllInstructions();
				var $table = $("<table class='TokenSociety_importNFT_errors'>");
				for (var key in instructions) {
					$table.append($("<tr><td>" + key + ":</td><td>" + instructions[key] + "</td></tr>"));
				}
				Q.Dialogs.push({
					'title': tool.text.errorsTitle,
					'content': $table,
					'className': 'Q_alert',
					'fullscreen': false,
					'hidePrevious': true
				});
				tool.$form.removeClass("Q_working");
				break;
			case "Streams/task/complete":
				tool.$processElement.attr('data-status', 'complete');
				tool.$form.removeClass("Q_working");
				break;
		}
	}, tool);
},

{
	taskStream: null
},

{
	refresh: function () {
		var tool = this;
		var state = tool.state;

		if (!tool.element.innerHTML) {
			var fields = {
				text: tool.text,
				prefix: tool.id
			};
			Q.Template.render('TokenSociety/importNFT/tool', fields, function (err, html) {
				tool.element.innerHTML = html;

				tool.$form = $('form', tool.element);
				tool.$processElement = $(".TokenSociety_importNFT_process", tool.element);
				tool.$progressbar = $(".TokenSociety_task_progress_bar", tool.$processElement);

				$("button[name=sampleCSV]", tool.element).on('click', function () {
					window.location = Q.url("{{baseUrl}}/importNFT/sample");
					return false;
				});

				_continue();
			});
		} else {
			_continue();
		}
		function _continue() {
			var $input = tool.$('input[type=file]')
				.click(function (event) {
					event.stopPropagation();
				}).change(_change);
			// for browsers that don't support the change event, have an interval
			this.ival = setInterval(function () {
				if ($input.val()) {
					_change();
				}
			}, 100);
		}

		function _change() {
			if (!this.value) {
				return; // it was canceled
			}

			tool.$form.addClass("Q_working");
			tool.$processElement.attr('data-status', 'process');
			tool.$progressbar.width(0);

			// task stream already defined, no need define it again
			if (Streams.isStream(state.taskStream)) {
				tool.postFile();
			} else {
				Streams.create({
					publisherId: Users.loggedInUserId(),
					type: 'Streams/task',
					title: 'Importing NFT'
				}, function (err) {
					if (err) {
						return;
					}

					state.taskStream = this;

					// join current user to task stream to get messages
					this.join(function (err) {
						if (err) {
							return;
						}

						state.taskStream.refresh(function () {
							tool.postFile();
						}, {
							evenIfNotRetained: true
						});
					});

					$("input[name=taskStreamName]", tool.element).val(state.taskStream.fields.name);
				});
			}
		}
	},
	/**
	 * send CSV file to server
	 * @method postFile
	 */
	postFile: function () {
		var tool = this;
		var state = this.state;

		if (!Streams.isStream(state.taskStream)) {
			throw new Q.Error("task stream invalid");
		}

		tool.$processElement.show();

		Q.req("TokenSociety/importNFT", [], function (err, response) {
			var msg = Q.firstErrorMessage(err, response && response.errors);
			if (msg) {
				tool.$form.removeClass("Q_working");
				return Q.alert(msg);
			}

		}, {
			method: 'POST',
			form: tool.$form[0]
		});

		tool.$form[0].reset();
	},
	Q: {
		beforeRemove: function () {
			if (this.ival) {
				clearInterval(this.ival);
			}
		}
	}
}

);

Q.Template.set('TokenSociety/importNFT/tool',
'<h1>{{text.importNFT}}</h1>'
	+ '<form enctype="multipart/form-data">'
	+ '	<fieldset>'
	+ '		<legend>{{text.fileLabel}}</legend>'
	+   	'<input type="file" id="{{prefix}}_file" name="file">'
	+   	'<button name="sampleCSV">{{text.sampleCSV}}</button>'
	+ '	</fieldset>'
	+ '	<input type="hidden" name="taskStreamName" value="{{taskStreamName}}">'
	+ ' <div class="TokenSociety_importNFT_process" data-status="process">'
	+ '		<fieldset>'
	+ '			<legend>{{text.importProgress}}</legend>'
	+ '			<div class="TokenSociety_importNFT_progress"><div class="TokenSociety_task_progress_bar"></div></div>'
	+ '			<div class="TokenSociety_importNFT_complete">{{text.complete}}!!!</div>'
	+ '		</fieldset>'
	+ '</div>'
	+ '</form>'
);

})(Q, Q.$, window, document);

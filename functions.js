const fs = require('fs');
const { dialog } = require('electron');
const remote = require('electron').remote

let oldSearchTerm = '';


let preview = document.getElementById('preview');
let input = document.getElementById('input');
let saveBtn = document.getElementById('saveBtn');
let loadBtn = document.getElementById('loadBtn');
let headline = document.getElementById('headline');
let fatty = document.getElementById('fatty');
let cursive = document.getElementById('cursive');
let search = document.getElementById('search');
let replace = document.getElementById('replace');

document.addEventListener('keyup', function(e) {

	generateMarkdown();

	if (e.ctrlKey && e.which === 72) {
		addHeadline();
	} else if (e.altKey && e.which === 65) {
		makeFat();
	} else if (e.altKey && e.which === 66) {
		makeCursive();
	} else if (e.ctrlKey && e.which === 83) {
		saveFile();
	} else if (e.altKey && e.which === 83) {
		loadFile();
	} else if (e.altKey && e.which === 81) {
		let w = remote.getCurrentWindow();
		w.close();
	}
});

//https://stackoverflow.com/questions/52743841/find-and-highlight-word-in-text-using-js/52747318
search.addEventListener('input', function() {
	if(search.value.length > 0){
		search.style.color = "#f3f3f3";
	}
	
	highlight();
});

saveBtn.addEventListener('click', function() {
	saveFile();
});

loadBtn.addEventListener('click', function() {
	loadFile();
});

headline.addEventListener('click', function() {
	addHeadline();
});

fatty.addEventListener('click', function() {
	makeFat();
});

cursive.addEventListener('click', function() {
	makeCursive();
});

function generateMarkdown() {
	const marked = require('marked');
	const rendered = marked(input.value);
	preview.innerHTML = rendered;
	highlight();
}

function addHeadline() {
	var text = input.value;
	var selectionStart = input.selectionStart;
	var selectionEnd = input.selectionEnd;

	var indexOfLastLineBreak = 0;
	var amoutOfLineBreaks = 0;

	for (let i = 0; i < selectionStart; i++) {
		if (text[i] === '\n') {
			indexOfLastLineBreak = i;
			amoutOfLineBreaks++;
		}
	}
	indexOfLastLineBreak++;

	var splitTxt = text.split('\n');
	var offset = (splitTxt[amoutOfLineBreaks].match(/#/g) || []).length;
	if (selectionEnd === selectionStart) {
		var newText =
			text.substring(0, indexOfLastLineBreak + offset) +
			'# ' +
			text.substring(indexOfLastLineBreak + offset, text.length);
	} else {
		if (indexOfLastLineBreak > 1) {
			var newText =
				text.substring(0, indexOfLastLineBreak + offset) +
				'# ' +
				text.substring(selectionStart - 1, text.length);
		} else {
			var newText = text.substring(0, offset) + '# ' + text.substring(selectionStart, text.length);
		}
	}
	input.value = newText;
}

function makeFat() {
	var text = input.value;
	var selectionStart = input.selectionStart;
	var selectionEnd = input.selectionEnd;

	var newText =
		text.substring(0, selectionStart) +
		'**' +
		text.substring(selectionStart, selectionEnd) +
		'**' +
		text.substring(selectionEnd, text.length);

	input.value = newText;
}

function makeCursive() {
	var text = input.value;
	var selectionStart = input.selectionStart;
	var selectionEnd = input.selectionEnd;

	var newText =
		text.substring(0, selectionStart) +
		'*' +
		text.substring(selectionStart, selectionEnd) +
		'*' +
		text.substring(selectionEnd, text.length);

	input.value = newText;
}

function saveFile() {
	dialog
		.showSaveDialog({
			filters: [
				{
					name: 'Markdown File (*.md)',
					extensions: ['md'],
				},
			],
		})
		.then(dialogObject => {
			if (dialogObject.canceled === true) {
				return;
			}

			fs.writeFileSync(dialogObject.filePaths[0], input.value);
		});
}

function loadFile() {
	dialog
		.showOpenDialog({
			filters: [
				{
					name: 'Markdown File (*.md)',
					extensions: ['md'],
				},
			],
		})
		.then(dialogObject => {
			if (dialogObject.canceled === true) {
				return;
			}

			let val;

			fs.readFileSync(dialogObject.filePaths[0], val);

			input.value = val;
		});
}

// https://stackoverflow.com/questions/52743841/find-and-highlight-word-in-text-using-js
function highlight() {
	let opar = preview.innerHTML;
	let searchTerm = search.value;

	if (searchTerm !== oldSearchTerm) {
		oldSearchTerm = searchTerm;
	}

	searchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); //https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex

	var re = new RegExp(searchTerm, 'g');

	if (searchTerm.length > 0) {
		preview.innerHTML = opar.replace(re, `<mark className="found">$&</mark>`);
	} else {
		preview.innerHTML = opar;
	}
}

function replace(){
	let replaceables = document.getElementsByClassName('found');
	if(replaceables.length === 0){
		return;
	}

	input.innerHTML.replace(replaceables, )

}
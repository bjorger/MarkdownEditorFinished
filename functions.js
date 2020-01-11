const fs = require('fs');
const { dialog } = require('electron').remote;
const remote = require('electron').remote;

const { ipcRenderer } = require('electron');

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
let line = document.getElementById('line');
let link = document.getElementById('link');
let email = document.getElementById('email');

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

	if (replace.value.length > 0 && search.value.length > 0 && e.keyCode === 13) {
		replaceFunction();
	}
});

//https://stackoverflow.com/questions/52743841/find-and-highlight-word-in-text-using-js/52747318
search.addEventListener('input', function() {
	if (search.value.length > 0) {
		search.style.color = '#f3f3f3';
	}

	highlight();
});

saveBtn.addEventListener('click', function() {
	saveFile();
	generateMarkdown();
});

headline.addEventListener('click', function() {
	addHeadline();
	generateMarkdown();
});

fatty.addEventListener('click', function() {
	makeFat();
	generateMarkdown();
});

cursive.addEventListener('click', function() {
	makeCursive();
	generateMarkdown();
});

line.addEventListener('click', function() {
	var text = input.value;
	var selectionStart = input.selectionStart;

	var newText = text.substring(0, selectionStart) + '\n\n---\n\n' + text.substring(selectionStart, text.length);

	input.value = newText;
	generateMarkdown();
});

link.addEventListener('click', function() {
	var text = input.value;
	var selectionStart = input.selectionStart;

	var newText =
		text.substring(0, selectionStart) +
		'[Link-Text](http://www.google.at)' +
		text.substring(selectionStart, text.length);

	input.value = newText;
	generateMarkdown();
});

email.addEventListener('click', function() {
	var text = input.value;
	var selectionStart = input.selectionStart;

	var newText =
		text.substring(0, selectionStart) + '<mail@example.com>' + text.substring(selectionStart, text.length);

	input.value = newText;
	generateMarkdown();
});

function generateMarkdown() {
	const marked = require('marked');
	const rendered = marked(input.value);
	preview.innerHTML = rendered;
	highlight();
}

function addHeadline() {
	var text = input.value;
	var sign = '# '

	for(let i = input.selectionStart; i >= 0; i--){
		if(text[i] == '#'){
			sign = '#'
		}
		if(text[i] == '\n'){
			input.value = text.substring(0, i) + '\n' + sign + text.substring(i + 1, text.length)
			break
		}
		if( i == 0 ){
			input.value = text.substring(0, i) + sign + text.substring(i, text.length)
		}	
	}
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

ipcRenderer.send('saveFile', saveFile);

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
		.then(({ canceled, filePath }) => {
			if (canceled === true) {
				return;
			}

			fs.writeFileSync(filePath, input.value);
		});
}

loadBtn.addEventListener('click', function() {
	ipcRenderer.send('openFiles');
});

ipcRenderer.on('openFile', (e, msg) => {
	loadFile(msg.path);
});

function loadFile(path) {
	let val;
	val = fs.readFileSync(path, {encoding: 'utf-8'});
	console.log(val);
	input.value = val;
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
		preview.innerHTML = opar.replace(re, `<mark class="found">$&</mark>`);
	} else {
		preview.innerHTML = opar;
	}
}

function replaceFunction() {
	let replaceables = document.getElementsByClassName('found');
	if (replaceables.length === 0) {
		return;
	}

	for (var i = 0; i < replaceables.length; i++) {
		preview.innerHTML = preview.innerHTML.replace(replaceables[i].innerHTML, replace.value);
		input.value = preview.textContent;
	}
}

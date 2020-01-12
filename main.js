const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron');

let window;

function createWindow() {
	window = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		}
	});

	window.loadFile('index.html');

	window.webContents.openDevTools();

	window.on('closed', () => {
		window = null;
	});

	window.maximize();
}
app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});

function openFile() {

	const { dialog } = require('electron');
	dialog
		.showOpenDialog({
			properties: ['openFile'],
			filters: [
				{ name: 'Markdown Files (.md)', extensions: ['md'] },
				{ name: 'All Files (*)', extensions: ['*'] },
			],
		})
		.then(({ canceled, filePaths }) => {
			if (canceled === true) {
				return;
      }

			window.webContents.send('openFile', { path: filePaths[0] });
		});
}

let menu = new Menu();
menu.append(new MenuItem({
	label: 'Save',
	accelerator: 'CommandOrControl+S',
	click: () => window.webContents.send('saveFile')
}))

menu.append(new MenuItem({
	label: 'Open',
	accelerator: 'CommandOrControl+L',
	click: openFile
}))

Menu.setApplicationMenu(menu)

ipcMain.on('openFiles', openFile);

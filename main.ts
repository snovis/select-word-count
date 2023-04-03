import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';


// Remember to rename these classes and interfaces!

interface NovisPluginSettings {
	selectionOnly: boolean;
}

const DEFAULT_SETTINGS: NovisPluginSettings = {
	selectionOnly: true
}


function countWords(str: string) : number {
	if (str.length === 0) {
		return 0;
	}

	const words = str.trim().split(/\s+/);
	return words.length;
}

export default class NovisPlugin extends Plugin {
	settings: NovisPluginSettings;


	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('flower', 'Select WordCount', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('Should Display Word Count!');
			// const wc = countWords(editor.getSelection());
			console.log("NOVIS-SWC: User clicked the flower");
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('novis-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('NOVIS Plugin');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new NovisModal(this.app).open();
			}
		});
		// This adds an editor command to count the number of words in the selection.
		this.addCommand({
			id: 'count-words',
			name: 'Count words',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				const wc = countWords(editor.getSelection());
				console.log("NOVIS-SWC: Word Count: ", wc);
				new NovisWCModal(this.app,wc).open();
				navigator.clipboard.writeText("Word Count: " + wc.toString());
				
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new NovisModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new NovisSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class NovisWCModal extends Modal {
	selectionWordCount = 0;
	constructor(app: App, wordCount: number) {
		super(app);
		this.selectionWordCount = wordCount;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Selected Text Word Count: ' + this.selectionWordCount.toString());
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class NovisModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('NovisPlugin Modal Box!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class NovisSettingTab extends PluginSettingTab {
	plugin: NovisPlugin;

	constructor(app: App, plugin: NovisPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for select word count plugin.'});

		new Setting(containerEl)
			.setName('Selection Only')
			.setDesc('Count selection or whole document')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.selectionOnly).onChange(async (value) => {
					console.log("Selection only: " + value);
					this.plugin.settings.selectionOnly = value;
					await this.plugin.saveSettings();
				})
			);

	}
}

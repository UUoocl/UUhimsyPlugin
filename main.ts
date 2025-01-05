import { Notice, Plugin, normalizePath, DataAdapter,WorkspaceLeaf } from 'obsidian';
import { uuhimsySettingsTab } from 'settings';
import { UUhimsyEntranceSuggest, UUhimsyExitSuggest } from 'suggest';
import { UUHIMSY_VIEW_TYPE, UUhimsyView } from 'view';

//include system command 
const { execSync } = require('child_process');

// pathToPlugin contains "my-folder/file" not "//my-folder\"

const { Client, Server, Message } = require("node-osc")
const OBSWebSocket = require("obs-websocket-js").default;

interface uuhimsyPluginSettings{
	websocketIP_Text: string;
	websocketPort_Text: string;
	websocketPW_Text: string;
	obsAppName_Text: string;
	obsAppPath_Text: string;
	obsCollection_Text: string;
	obsDebug_Text: string;
	obsDebugPort_Text: string;
	oscIP_Text: string;
	oscInPort_Text: string;
	oscOutPort_Text: string;
}

const DEFAULT_SETTINGS: Partial<uuhimsyPluginSettings> = {
	websocketIP_Text: "localhost",
	websocketPort_Text: "4455",
	websocketPW_Text: "password",
	oscIP_Text: "localhost",
	oscInPort_Text: "4466",
	oscOutPort_Text: "4477",
	obsAppName_Text: "OBS",
	obsAppPath_Text: "C:\\\\Program Files\\\\obs-studio\\\\bin\\\\64bit\\\\",
	obsCollection_Text: "Key_and_Mouse_Visuals_Collection",  
	obsDebug_Text: "Y",
	obsDebugPort_Text: "9222"
};

export default class uuhimsyPlugin extends Plugin {
	settings: uuhimsyPluginSettings;
	
	async loadSettings(){
		this.settings = Object.assign(
			{}, 
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}
	
	async saveSettings(){
		this.saveData(this.settings);
	}


		
	async onload() {

		await this.loadSettings();
		
		this.registerView(UUHIMSY_VIEW_TYPE, (leaf) => new UUhimsyView(leaf))
		

		this.addRibbonIcon("wand-sparkles", "UUhimsy tags", () => {
			this.openView();
		})
		this.addSettingTab(new uuhimsySettingsTab(this.app, this))
		
		new Notice("Enabled OSC plugin")	
		new Notice(this.settings.websocketIP_Text)	
		new Notice(this.app.vault.configDir)
			 
//
//
//		 
//	#region OSC Server connection feature
//
// 
//		
		this.addCommand({
			id: 'start-osc-to-websocket',
			name: 'Start OSC to OBS Websocket connection',
			callback:() => {
			//this.addRibbonIcon("activity","start OSC to Websocket", () =>{
			new Notice("Starting OSC Server")
			let websocketIP = this.settings.websocketIP_Text;
			let websocketPort = this.settings.websocketPort_Text;
			let websocketPassword = this.settings.websocketPW_Text;
			let oscIP = this.settings.oscIP_Text;
			let oscInPORT = this.settings.oscInPort_Text;
			let oscOutPORT = this.settings.oscOutPort_Text;
			
			setOSCconnection(
				websocketIP,
				websocketPort,
				websocketPassword,
				oscIP,
				oscInPORT,
				oscOutPORT
			);
			
			async function setOSCconnection(
				websocketIP,
				websocketPort,
				websocketPassword,
				oscIP,
				oscInPORT,
				oscOutPORT
			) {
				
				/*
				*Connect this app to OBS
				* 
				*/
				
				const obs = new OBSWebSocket(websocketIP, websocketPort, websocketPassword);
				try {
					const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
						`ws://${websocketIP}:${websocketPort}`,
						websocketPassword,
						{
							rpcVersion: 1,
						}
					);
					console.log(
						`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
					);
					new Notice("Connected to OBS WebSocket Server")
					initWebsocketFunctions();
					//document.title = "connection set";
				} catch (error) {
					new Notice("Failed to connect to OBS WebSocket Server")
					console.error("Failed to connect", error.code, error.message);
				}

				function initWebsocketFunctions(){

					obs.on("error", (err) => {
						console.error("Socket error:", err);
					});
					console.log(`ws://${websocketIP}:${websocketPort}`);
					
					/*
					*Create an OSC Server connection
					*OSC app -- to--> OBS
					*/
					
					let oscServer = new Server(oscInPORT, oscIP);
					
					oscServer.on("listening", () => {
						console.log("OSC Server is listening.");
					});
					
					oscServer.on("message", (msg) => {
						console.log(`Message: ${msg}`);
						sendToOBS(msg, obs, "osc-message");
					});
					
					function sendToOBS(msgParam, obsParam, eventName) {
						console.log("sending message:", JSON.stringify(msgParam));
						const webSocketMessage = JSON.stringify(msgParam);
						//send results to OBS Browser Source
						obsParam.call("CallVendorRequest", {
							vendorName: "obs-browser",
							requestType: "emit_event",
							requestData: {
								event_name: eventName,
								event_data: { webSocketMessage },
							},
						});
					}
				}
				
				
				/*
				*Create OSC Client Out Port
				*message from OBS --to--> OSC app
				*/
				const oscClient = new Client(oscIP, oscOutPORT);
				console.log("oscClient", oscClient, oscIP, oscOutPORT, oscInPORT);
				
				obs.on("CustomEvent", function (event) {
					console.log("Message from OBS",event);
					if (event.event_name === "OSC-out") {
						const message = new Message(event.address);
						if (Object.hasOwn(event, "arg1")) {
							message.append(event.arg1);
							console.log("arg1", message);
						}
						if (Object.hasOwn(event, "arg2")) {
							message.append(event.arg2);
							console.log(message);
						}
						if (Object.hasOwn(event, "arg3")) {
							message.append(event.arg3);
							console.log(message);
						}
						if (Object.hasOwn(event, "arg4")) {
							message.append(event.arg4);
							console.log(message);
						}
						if (Object.hasOwn(event, "arg5")) {
							message.append(event.arg5);
							console.log(message);
						}
						if (Object.hasOwn(event, "arg6")) {
							message.append(event.arg6);
							console.log(message);
						}
						if (Object.hasOwn(event, "arg7")) {
							message.append(event.arg7);
							console.log(message);
						}
						console.log("message to OSC device", message);
						oscClient.send(message, (err) => {
							if (err) {
								console.error(new Error(err));
							}
						});
						//client.send(`${event.command} "${event.data}"`)
					}
				});
			}
			
		}})
		
// #endregion

// 
//
//	
//	#region Get Scenes from OBS feature
//  1. populate the _slide_Tags folder with OBS Scenes
//	2. Add tags to slides
//	3. 
//
		this.addCommand({
			id: 'get-obs-scene-tags',
			name: 'Get OBS tags',
			callback: async() => {
		 //this.addRibbonIcon("image-down","get OBS Scene Options", async () =>{
			new Notice("Getting OBS Tags")
			let websocketIP = this.settings.websocketIP_Text;
			let websocketPort = this.settings.websocketPort_Text;
			let websocketPassword = this.settings.websocketPW_Text;
			
			/*
			*Connect this app to OBS
			*/
			const obs = new OBSWebSocket(websocketIP, websocketPort, websocketPassword);
			try {
				const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
					`ws://${websocketIP}:${websocketPort}`,
					websocketPassword,
					{
						rpcVersion: 1,
					}
				);
				console.log(
					`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
				);
				new Notice("Connected to OBS WebSocket Server")
				//document.title = "connection set";
			} catch (error) {
				new Notice("Failed to connect to OBS WebSocket Server")
				console.error("Failed to connect", error.code, error.message);
			}
			obs.on("error", (err) => {
				console.error("Socket error:", err);
			});
			console.log(`ws://${websocketIP}:${websocketPort}`);
			
			//
			// Get Scenes and camera
			//
			//setTimeout(() => obs.disconnect(), 3000);
			
			//create Scene Template Notes
				const sceneList = await obs.call("GetSceneList");
				console.log(sceneList)
				sceneList.scenes.forEach(async (scene, index) => {
					// find scenes starting with "scene"
					if (scene.sceneName.startsWith("scene|||")) {
						const sceneName = scene.sceneName.split("|||");
						
						let fileName = `Scene - ${sceneName[1]}`;
						let existing = await this.app.vault.adapter.exists(normalizePath(`_slide_Tags/${fileName}`));
						if (!existing) {
							await this.app.vault.create(`_slide_Tags/${fileName}.md`, 
								``,
							);		
						}

						// fileName = `Exit Scene - ${sceneName[1]}`;
						// existing = await this.app.vault.adapter.exists(normalizePath(`_slide_Tags/${fileName}`));
						// if (!existing) {
						// 	await this.app.vault.create(`_slide_Tags/${fileName}.md`, 
						// 		`<!-- slide data-scene-exit="${sceneName[1]}" --> `,
						// 	);
							
						// }
					}	
				});
				//}
				
			//create Camera Template Notes
				let cameraSources = await obs.call("GetSceneItemList", { sceneName: "Input Camera" });
				cameraSources.sceneItems.forEach(async(source, index) => {
				
					let fileName = `Camera - ${source.sourceName}`;
					let existing = await this.app.vault.adapter.exists(normalizePath(`_slide_Tags/${fileName}`));
					if (!existing) {
						await this.app.vault.create(`_slide_Tags/${fileName}.md`, 
							``,
						);		
					}
					
					// fileName = `Exit Camera - ${source.sourceName}`;
					// existing = await this.app.vault.adapter.exists(normalizePath(`_slide_Tags/${fileName}`));
					
					// if (!existing) {
					// 	await this.app.vault.create(`_slide_Tags/${fileName}.md`, 
					// 		`<!-- slide data-camera-exit="${source.sourceName}" --> `,
					// 		);		
					// }
				});
             //End of get scene function
			 obs.disconnect();
			}})

			// this.addRibbonIcon("scroll", "entrance tag", () => {
			// 	new UUhimsyEntranceSuggest(this.app).open();
			// })

			this.addCommand({
				id: 'insert-entrance-tag',
				name: 'Insert slide entrance tag',
				editorCallback: (editor: Editor, view: MarkdownView) => {
					new UUhimsyEntranceSuggest(this.app).open();
				}
			});

			this.addCommand({
				id: 'insert-exit-tag',
				name: 'Insert slide exit tag',
				editorCallback: (editor: Editor, view: MarkdownView) => {
					new UUhimsyExitSuggest(this.app).open();
				}
			});
// #endregion

// 
//
//		
// #region Send PTZ camera position to OBS feature
//  Only show this command to macOS users
//
//	Send a PTZ camera position message every second
		
			this.addCommand({
				id: 'send-camera-position-to-obs',
				name: 'Start sending camera PTZ position to OBS',
				checkCallback: async(checking) => {
					let isMac = process.platform === 'darwin';
					if (isMac){
						if(!checking){
							
							console.log("true")
							let websocketIP = this.settings.websocketIP_Text;
							let websocketPort = this.settings.websocketPort_Text;
							let websocketPassword = this.settings.websocketPW_Text;
			
			/*
			*Connect this app to OBS
			*/
			const obs = new OBSWebSocket(websocketIP, websocketPort, websocketPassword);
			try {
				const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
					`ws://${websocketIP}:${websocketPort}`,
					websocketPassword,
					{
						rpcVersion: 1,
					}
				);
				console.log(
					`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
				);
				new Notice("Connected to OBS WebSocket Server")
				//document.title = "connection set";
			} catch (error) {
				new Notice("Failed to connect to OBS WebSocket Server")
				console.error("Failed to connect", error.code, error.message);
			}
			obs.on("error", (err) => {
				console.error("Socket error:", err);
			});
			console.log(`ws://${websocketIP}:${websocketPort}`);

			//
			//PTZ details
			//

			//https://forum.obsidian.md/t/how-to-get-vault-absolute-path/22965
			//@ts-ignore
///////////make vaultPath an onLoad global variable
			const vaultPath = normalizePath(`${this.app.vault.adapter.basePath}/${this.app.vault.configDir}/plugins/UUhimsyPlugin`)
			const util = require('util');
			const exec = util.promisify(require('child_process').exec);
			let previousPTZ ="";
			
			setInterval( async() =>{

				let pt = await getCameraPanTilt(vaultPath, util, exec);
				let z = await getCameraZoom(vaultPath, util, exec);
				let ptzMessage = `${pt}${z}}`
				
				if(ptzMessage != previousPTZ){
					//send results to OBS
					previousPTZ = ptzMessage
					
					//send results to text source
					await obs.call("SetInputSettings", {
						inputName: 'PTZ values',
						inputSettings: {
							text: `${ptzMessage}`,
						}
					});
					
					//send results to OBS Browser Source
					obs.call("CallVendorRequest", {
						vendorName: "obs-browser",
						requestType: "emit_event",
						requestData: {
							event_name: "ptz-message",
							event_data: { ptzMessage },
						},
					});
				}
			}, 2000);

			async function getCameraPanTilt(vaultPath, util, exec) {				
				try {
				console.log(vaultPath)
				const { stdout, stderr } = await exec(`'${vaultPath}/uvc-util' -I 0 -o pan-tilt-abs`);
				//console.log('stdout:', stdout);
				//console.log('stderr:', stderr);
				let ptResult = stdout.toString();
				ptResult = ptResult.replace(/\n/g,'').replace('pan','"pan"').replace('}',', "zoom": ').replace(/=/g,': ').replace('tilt','"tilt"')
				return ptResult;
				
				} catch (e) {
				  console.error(e); // should contain code (exit code) and signal (that caused the termination).
				}
			  }

			async function getCameraZoom(vaultPath, util, exec) {
				try {
				const { stdout, stderr } = await exec(`'${vaultPath}/uvc-util' -I 0 -o zoom-abs`);
				//console.log('stdout:', stdout);
				//console.log('stderr:', stderr);
				return stdout.replace(/\n/g, "");
			
				} catch (e) {
				  console.error(e); // should contain code (exit code) and signal (that caused the termination).
				}
			  }
			
			  obs.on("CustomEvent", async function (event){
				
				console.log("Message from OBS",event);
				if (event.event_name === "set-ptz") {
					console.log('command',`'shortcuts' run ${event.shortcut_name}`)
					const stdout =  await exec(`'${vaultPath}/uvc-util' -I 0 -o pan-tilt-abs`);
					console.log(stdout)
				}
			  })

				//end checking 
				}
				return true;
				}
				return false;
				}
			//end get PTZ command	
			});


	//stop sending camera position		
	this.addCommand({
		id: 'stop-camera-position-to-obs',
		name: 'Stop sending camera PTZ position to OBS',
		callback:() =>{
			// Set a fake timeout to get the highest timeout id
			let highestTimeoutId = setTimeout(";");
			for (let i = 0 ; i < highestTimeoutId ; i++) {
				clearTimeout(i); 
			}
		}

	})

// #endregion

// 
//
//		
// #region Run Apple Shortcuts script feature
//  Only show this command to macOS users
//
//	Run Shortcuts and return results 

//COMMAND: Get list of Shortcut tags
this.addCommand({
	id: 'get-shortcuts-tags',
	name: 'Get Apple Shortcuts tags',
	checkCallback: async(checking) => {
		let isMac = process.platform === 'darwin';
		if (isMac){
			if(!checking){
				//This is a Mac computer run the command
				const util = require('util');
				const exec = util.promisify(require('child_process').exec);	
				const { stdout, stderr } = await exec(`'shortcuts' list`);
				//let shortcuts =  JSON.stringify(stdout)
				let shortcuts =  stdout.split('\n')

				shortcuts = shortcuts.filter((shortcut) => {return shortcut.toLowerCase().startsWith("uuhimsy")})
				console.log(shortcuts);
				console.log(typeof shortcuts);
				const shortcutCount = Object.keys(shortcuts).length;
				Object.entries(shortcuts).forEach(async([key, shortcut]) => {
				//shortcuts.foreach(async (shortcut, index) => {
				console.log(key, shortcut, shortcutCount)
					let fileName = `Shortcuts - ${shortcut}.md`;
						let existing = await this.app.vault.adapter.exists(normalizePath(`_slide_Tags/${fileName}`));
						if (!existing) {
							await this.app.vault.create(`_slide_Tags/${fileName}`, 
								``,
							);		
						}
						if (Number(key) == shortcutCount - 1) {
							// This is the last item
							this.openView();
						  }
						// fileName = `Exit Shortcuts - ${shortcut}.md`;
						// existing = await this.app.vault.adapter.exists(normalizePath(`_slide_Tags/${fileName}`));
						// console.log(fileName)
						// console.log("existing",existing)
						// if (!existing) {
						// 	await this.app.vault.create(`_slide_Tags/${fileName}`, 
						// 		`<!-- slide data-shortcut-exit="${shortcut}" --> `,
						// 	);
						// }
				})
			};
		}
	} 
})


//LISTEN for Shortcut Request
this.addCommand({
	id: 'run-apple-shortcut',
	name: 'Start Apple Shortcut Connection',
	callback: async() => {
		
		
		//connect to OBS
		let websocketIP = this.settings.websocketIP_Text;
		let websocketPort = this.settings.websocketPort_Text;
		let websocketPassword = this.settings.websocketPW_Text;
		
		/*
		*Connect this app to OBS
		*/
		const obs = new OBSWebSocket(websocketIP, websocketPort, websocketPassword);
		try {
			const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
				`ws://${websocketIP}:${websocketPort}`,
				websocketPassword,
				{
					rpcVersion: 1,
				}
			);
			console.log(
				`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
			);
			new Notice("Connected to OBS WebSocket Server")
		} catch (error) {
			new Notice("Failed to connect to OBS WebSocket Server")
			console.error("Failed to connect", error.code, error.message);
		}
		obs.on("error", (err) => {
			console.error("Socket error:", err);
		});
		console.log(`ws://${websocketIP}:${websocketPort}`);
		
		//listen for Shortcut Request
		obs.on("CustomEvent", async function (event){
			if (event.event_name === "run-shortcut") {
				console.log("message from OBS",event);
				console.log(JSON.stringify(event.event_data));
				//update OBS Source CommandText
				await obs.call("SetInputSettings", {
					inputName: "CommandText",
					inputSettings: {
						text: `${event.event_name} ${event.event_data.shortcut_name}`
					}
				});
				console.log('command',`'shortcuts' run ${event.event_data.shortcut_name}`)
				console.log("prop check",Object.hasOwn(event.event_data, "shortcut_input"))
				//if has input
				let stdout 
				if (Object.hasOwn(event.event_data, "shortcut_input")) {
					console.log("running with input")
					stdout =  execSync(`'shortcuts' run '${event.event_data.shortcut_name}' <<< '${event.event_data.shortcut_input}'`,{encoding: 'utf8',});
				}else{
					console.log("running with OUT input")
					stdout =  execSync(`'shortcuts' run '${event.event_data.shortcut_name}'`,{encoding: 'utf8',});
				}
				console.log("shortcut result ",stdout)
				//console.log(stderr)
				//If Shortcut returns a result, then call OBS
				//Update OBS Source CommandResultsText
				await obs.call("SetInputSettings", {
					inputName: "CommandResultsText",
					inputSettings: {
					  text: `${stdout}`
					}
				});
			}
		})
	}})

// #endregion


// 
//
//		
// #region Open OBS feature
// 
//
//	Execute a command line to Open OBS

		this.addCommand({
			id: 'open-obs',
			name: 'Open OBS',
			callback: async () => {
				const util = require('util');
				const exec = util.promisify(require('child_process').exec);
				//build command string
				
				let commandString ="hello"
				if (process.platform === 'darwin') {
					commandString = `open -n -a "${this.settings.obsAppName_Text}"`;
					commandString += ` --args --collection "${this.settings.obsCollection_Text}"`;
					commandString += ` --remote-debugging-port=${this.settings.obsDebugPort_Text}`;
					commandString += ` --remote-allow-origins=http://localhost:${this.settings.obsDebugPort_Text}`;
					commandString += ` --websocket_port "${this.settings.websocketPort_Text}"`;
					commandString += ` --websocket_password "${this.settings.websocketPW_Text}"`;
					commandString += ` --multi`;
					exec(commandString);
				}
				if (process.platform === 'win32') {
					const path = require('path');
					const obsPath = `${this.settings.obsAppPath_Text}${this.settings.obsAppName_Text}`
					const obsDir = path.dirname(obsPath);
					process.chdir(obsDir)
		
					commandString = `${this.settings.obsAppName_Text}`;
					commandString += ` --args --collection "${this.settings.obsCollection_Text}"`;
					commandString += ` --remote-debugging-port=${this.settings.obsDebugPort_Text}`;
					commandString += ` --remote-allow-origins=http://localhost:${this.settings.obsDebugPort_Text}`;
					commandString += ` --websocket_port "${this.settings.websocketPort_Text}"`;
					commandString += ` --websocket_password "${this.settings.websocketPW_Text}"`;
					commandString += ` --multi`;
		
					exec(commandString, (error, stdout, stderr) => {
					  if (error) {
						  console.error(`exec error: ${error}`);
						  return;
					  }
					  console.log(`stdout: ${stdout}`);
					  console.error(`stderr: ${stderr}`);
					});
				  }
				console.log(commandString)

				}
			}
		)

// #endregion

//
//
//
// #region Start OBS Websocket connection
//
this.addCommand({
	id: 'connect-to-obs',
	name: 'Start OBS Connection',
	callback: async() => {
		
		//connect to OBS
		let websocketIP = this.settings.websocketIP_Text;
		let websocketPort = this.settings.websocketPort_Text;
		let websocketPassword = this.settings.websocketPW_Text;
		
		//
		// #region Connect this app to OBS
		//
		const obs = new OBSWebSocket(websocketIP, websocketPort, websocketPassword);
		try {
			const { obsWebSocketVersion, negotiatedRpcVersion } = await obs.connect(
				`ws://${websocketIP}:${websocketPort}`,
				websocketPassword,
				{
					rpcVersion: 1,
				}
			);
			console.log(
				`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`
			);
			new Notice("Connected to OBS WebSocket Server")
		} catch (error) {
			new Notice("Failed to connect to OBS WebSocket Server")
			console.error("Failed to connect", error.code, error.message);
		}
		obs.on("error", (err) => {
			console.error("Socket error:", err);
		});
		console.log(`ws://${websocketIP}:${websocketPort}`);
		// #endregion

		//listen for Custom Events
		obs.on("CustomEvent", async function (event){
			if (event.event_name === "add-obsidian-tag") {
				console.log("tag message from OBS",event);
				const tag = JSON.parse(event.event_data.tag);
				app.workspace.activeEditor?.editor?.replaceSelection(tag)
			}
			if (event.event_name === "open-gum-page") {
				console.log("open gum message from OBS",event);
				console.log("open gum message from OBS",this);
				const port = app.plugins.plugins['slides-extended'].port;
				window.open(`http://localhost:${port}/_GUM`)
			}
		});
	}
})



// #endregion


//End of onload()
}

async openView(){
	const { workspace } = this.app;
	this.app.workspace.detachLeavesOfType(UUHIMSY_VIEW_TYPE)	
	let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(UUHIMSY_VIEW_TYPE);

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0];
    } else {
      // Our view could not be found in the workspace, create a new leaf
      // in the right sidebar for it
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: UUHIMSY_VIEW_TYPE, active: true });
    }

    // "Reveal" the leaf in case it is in a collapsed sidebar
    workspace.revealLeaf(leaf);
  }

	onunload() {
		this.app.workspace.detachLeavesOfType(UUHIMSY_VIEW_TYPE)
		new Notice("Disabled UUhimsy plugin")

	}
}
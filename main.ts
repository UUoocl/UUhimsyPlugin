import { Notice, Plugin, normalizePath, DataAdapter } from 'obsidian';
import { uuhimsySettingsTab } from 'settings';
import { UUhimsyEntranceSuggest, UUhimsyExitSuggest } from 'suggest';


// pathToPlugin contains "my-folder/file" not "//my-folder\"

const { Client, Server, Message } = require("node-osc")
const OBSWebSocket = require("obs-websocket-js").default;

interface uuhimsyPluginSettings{
	websocketIP_Text: string;
	websocketPort_Text: string;
	websocketPW_Text: string;
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
	oscOutPort_Text: "4477"
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
		
		this.addSettingTab(new uuhimsySettingsTab(this.app, this))
		
		new Notice("Enabled OSC plugin")	
		new Notice(this.settings.websocketIP_Text)	
			 
//
//
//		 
//	#region OSC Server connection feature
//
// 
//		
		this.addCommand({
			id: 'start-osc-to-websocket',
			name: 'UUhimsy Start OSC to OBS Websocket connection',
			callback:() => {
			//this.addRibbonIcon("activity","start OSC to Websocket", () =>{
			new Notice("Starting OSC Server")
			var websocketIP = this.settings.websocketIP_Text;
			var websocketPort = this.settings.websocketPort_Text;
			var websocketPassword = this.settings.websocketPW_Text;
			var oscIP = this.settings.oscIP_Text;
			var oscInPORT = this.settings.oscInPort_Text;
			var oscOutPORT = this.settings.oscOutPort_Text;
			
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
					
					var oscServer = new Server(oscInPORT, oscIP);
					
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
//  1. populate the template folder with OBS Scenes
//	2. Add tags to slides
//
		this.addCommand({
			id: 'uuhimsy-get-obs-scene-tags',
			name: 'UUhimsy get OBS Scene tags',
			callback: async() => {
		//this.addRibbonIcon("image-down","get OBS Scene Options", async () =>{
			new Notice("Get OBS Scenes")
			var websocketIP = this.settings.websocketIP_Text;
			var websocketPort = this.settings.websocketPort_Text;
			var websocketPassword = this.settings.websocketPW_Text;
			
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
					// find scenes starting with "Scene"
					if (scene.sceneName.startsWith("scene|||")) {
						const sceneName = scene.sceneName.split("|||");
						
						let fileName = `Entrance Scene - ${sceneName[1]}`;
						let existing = await this.app.vault.adapter.exists(normalizePath(`_templates/${fileName}`));
						if (!existing) {
							await this.app.vault.create(`_templates/${fileName}.md`, 
								`<!-- slide data-scene-entrance="${sceneName[1]}" --> `,
							);		
						}

						fileName = `Exit Scene - ${sceneName[1]}`;
						existing = await this.app.vault.adapter.exists(normalizePath(`_templates/${fileName}`));
						console.log(fileName)
						console.log("existing",existing)
						if (!existing) {
							await this.app.vault.create(`_templates/${fileName}.md`, 
								`<!-- slide data-scene-exit="${sceneName[1]}" --> `,
							);
						}
					}	
				});
				//}
				
			//create Camera Template Notes
				let cameraSources = await obs.call("GetSceneItemList", { sceneName: "Camera" });
				cameraSources.sceneItems.forEach(async(source, index) => {
				
					let fileName = `Entrance Camera - ${source.sourceName}`;
					let existing = await this.app.vault.adapter.exists(normalizePath(`_templates/${fileName}`));
					if (!existing) {
						await this.app.vault.create(`_templates/${fileName}.md`, 
							`<!-- slide data-camera-entrance="${source.sourceName}" --> `,
						);		
					}
					
					fileName = `Exit Camera - ${source.sourceName}`;
					existing = await this.app.vault.adapter.exists(normalizePath(`_templates/${fileName}`));
					if (!existing) {
						await this.app.vault.create(`_templates/${fileName}.md`, 
							`<!-- slide data-camera-exit="${source.sourceName}" --> `,
							);		
					}
				});
//End of get scene function
			}})

			// this.addRibbonIcon("scroll", "entrance tag", () => {
			// 	new UUhimsyEntranceSuggest(this.app).open();
			// })

			this.addCommand({
				id: 'uuhimsy-insert-entrance-tag',
				name: 'UUhimsy insert entrance tag',
				editorCallback: (editor: Editor, view: MarkdownView) => {
					new UUhimsyEntranceSuggest(this.app).open();
				}
			});

			this.addCommand({
				id: 'uuhimsy-insert-exit-tag',
				name: 'UUhimsy insert exit tag',
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
				id: 'uuhimsy-send-camera-position-to-obs',
				name: 'UUhimsy send camera position to obs',
				checkCallback: async(checking) => {
					let isMac = process.platform === 'darwin';
					if (isMac){
						if(!checking){
							
							console.log("true")
							var websocketIP = this.settings.websocketIP_Text;
							var websocketPort = this.settings.websocketPort_Text;
							var websocketPassword = this.settings.websocketPW_Text;
			
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
			const vaultPath = normalizePath(`${this.app.vault.adapter.basePath}/.obsidian/plugins/UUhimsyPlugin`)
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
		id: 'uuhimsy-stop-camera-position-to-obs',
		name: 'UUhimsy stop sending camera position to obs',
		callback:() =>{
			// Set a fake timeout to get the highest timeout id
			var highestTimeoutId = setTimeout(";");
			for (var i = 0 ; i < highestTimeoutId ; i++) {
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
	id: 'uuhimsy-get-shortcuts-tags',
	name: 'UUhimsy get Shortcuts tags',
	checkCallback: async(checking) => {
		let isMac = process.platform === 'darwin';
		if (isMac){
			if(!checking){
				//This is a Mac computer fun the command
				const util = require('util');
				const exec = util.promisify(require('child_process').exec);	
				const { stdout, stderr } = await exec(`'shortcuts' list`);
				//let shortcuts =  JSON.stringify(stdout)
				let shortcuts =  stdout.split('\n')

				shortcuts = shortcuts.filter((shortcut) => {return shortcut.toLowerCase().startsWith("uu")})
				console.log(shortcuts);
				console.log(typeof shortcuts);
				Object.entries(shortcuts).forEach(async([key, shortcut]) => {
				//shortcuts.foreach(async (shortcut, index) => {
					let fileName = `Entrance Shortcuts - ${shortcut}.md`;
						let existing = await this.app.vault.adapter.exists(normalizePath(`_templates/${fileName}`));
						if (!existing) {
							await this.app.vault.create(`_templates/${fileName}`, 
								`<!-- slide data-shortcut-entrance="${shortcut}" --> `,
							);		
						}

						fileName = `Exit Shortcuts - ${shortcut}.md`;
						existing = await this.app.vault.adapter.exists(normalizePath(`_templates/${fileName}`));
						console.log(fileName)
						console.log("existing",existing)
						if (!existing) {
							await this.app.vault.create(`_templates/${fileName}`, 
								`<!-- slide data-shortcut-exit="${shortcut}" --> `,
							);
						}
				})	
			};
		}
	} 
})


//LISTEN for Shortcut Request
this.addCommand({
	id: 'uuhimsy-run-shortcut',
	name: 'UUhimsy run Shortcut',
	callback: async() => {
		
		
		//connect to OBS
		var websocketIP = this.settings.websocketIP_Text;
		var websocketPort = this.settings.websocketPort_Text;
		var websocketPassword = this.settings.websocketPW_Text;
		
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
		
		//include system command 
		const { execSync } = require('child_process');
		//listen for Shortcut Request
		obs.on("CustomEvent", async function (event) {
			console.log("Message from OBS",event);
			if (event.event_name === "run-shortcut") {
				console.log('command',`'shortcuts' run ${event.shortcut_name}`)
				const stdout =  execSync(`'shortcuts' run ${event.shortcut_name}`,{encoding: 'utf8',});
				//let stdout = execSync('ls');
				console.log(stdout)
				//console.log(stderr)
				//If Shortcut returns a result, then call OBS

	}
})
	}})

// #endregion

// 
//
//	TODO: a feature to automate modifying the "Slides Extended" template with Whimsy scripts
// #region Modify 'Slides Extended' with UUhimsy Script
// This allows the Slides Extended Plugin to connect to OBS  
//
//	

//COMMAND: find 'Slides Extended' Template file

//If file does not contain <script src="OBS Connect", then replace the </body> with <script>...</body> 

// #endregion

// 
//
//	TODO: a feature to automate setting file paths that OBS references.  Use the Obsidian vault location as the base file path 
// #region Modify OBS Collection file paths 
// 
//
//	

//COMMAND: find OBS Collection file and change the file paths 

// #endregion

//End of onload()
}

	onunload() {
		new Notice("Disabled UUhimsy plugin")
	}
}
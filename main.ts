import { Notice, Plugin, normalizePath } from 'obsidian';
import { uuhimsySettingsTab } from 'settings';
import { UUhimsyEntranceSuggest } from 'suggest';

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
		
		 		 
/*
*
*	 		 
*	OSC Server connection 
*
* 
*/		
				
		this.addRibbonIcon("activity","start OSC to Websocket", () =>{
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
					//document.title = "connection set";
				} catch (error) {
					new Notice("Failed to connect to OBS WebSocket Server")
					console.error("Failed to connect", error.code, error.message);
				}
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
		})
		
/* 
*
*		
*	Get Scene Options from OBS 
*
*
*/

		this.addRibbonIcon("image-down","get OBS Scene Options", async () =>{
			new Notice("1 Get OBS Scenes")
			var websocketIP = this.settings.websocketIP_Text;
			var websocketPort = this.settings.websocketPort_Text;
			var websocketPassword = this.settings.websocketPW_Text;
			
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
			})

			this.addRibbonIcon("scroll", "entrance tag", () => {
				new UUhimsyEntranceSuggest(this.app).open();
			})

			this.addCommand({
				id: 'uuhimsy-entrance-command',
				name: 'UUhimsy entrance tags',
				editorCallback: (editor: Editor, view: MarkdownView) => {
					const fileContent = new UUhimsyEntranceSuggest(this.app).open();

					editor.replaceSelection(fileContent);
				}
			});

//End of onload()
}
	
 

	onunload() {
		new Notice("Disabled UUhimsy plugin")
	}
}
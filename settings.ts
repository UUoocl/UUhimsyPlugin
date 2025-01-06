import uuhimsyPlugin from "main";
import {App, Notice, PluginSettingTab, Setting, normalizePath } from "obsidian";

export class uuhimsySettingsTab extends PluginSettingTab {
    plugin: uuhimsyPlugin;

    constructor(app: App, plugin: uuhimsyPlugin){
        super(app,plugin);
        this.plugin = plugin;
    }
    
    display(){
        let { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
        .setName("OBS WebSocket Server")
        .setHeading()
        .setDesc("Set the OBS Websocket Server Settings")
        
        new Setting(containerEl)
        .setName("IP")
        .setDesc("Enter the IP address or 'localhost'")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketIP_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketIP_Text = value;
                    this.plugin.saveSettings()
                    refresh_websocketDetailsJS(this)
             })
        });

        new Setting(containerEl)
        .setName("PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketPort_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketPort_Text = value;
                    this.plugin.saveSettings()
                    refresh_websocketDetailsJS(this)
             })
        });

        new Setting(containerEl)
        .setName("Password")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketPW_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketPW_Text = value;
                    this.plugin.saveSettings()
                    refresh_websocketDetailsJS(this)
             })
        });

        new Setting(containerEl)
        .setName("OBS Launch Parameters")
        .setHeading()
        .setDesc("Open OBS with these options.")
        
        if(process.platform === "darwin"){
            new Setting(containerEl)
            .setName("Name")
            .setDesc("Enter 'OBS' or a custom name")
            .addText((item) => {
                item.setValue(this.plugin.settings.obsAppName_Text).onChange(
                    (value) => {
                        this.plugin.settings.obsAppName_Text = value;
                        this.plugin.saveSettings()
                    })
                });
            }
        
        if(process.platform === "win32"){
            new Setting(containerEl)
            .setName("Name")
            .setDesc("Enter 'obs64.exe' or a custom name")
            .addText((item) => {
                item.setValue(this.plugin.settings.obsAppName_Text).onChange(
                    (value) => {
                        this.plugin.settings.obsAppName_Text = value;
                        this.plugin.saveSettings()
                    })
                });

            new Setting(containerEl)
            .setName("Path to OBS app")
            .addText((item) => {
                item.setValue(this.plugin.settings.obsAppPath_Text).onChange(
                    (value) => {
                        this.plugin.settings.obsAppPath_Text = value;
                        this.plugin.saveSettings()
                    })
                });
            }

        new Setting(containerEl)
        .setName("Collection")
        .addText((item) => {
            item.setValue(this.plugin.settings.obsCollection_Text).onChange(
                (value) => {
                    this.plugin.settings.obsCollection_Text = value;
                    this.plugin.saveSettings()
            })
        });

        new Setting(containerEl)
        .setName("OBS Browser Source Debug Port")
        .setDesc("Enter a Port for the Remote Debugger, or leave blank to skip this option")
        .addText((item) => {
            item.setValue(this.plugin.settings.obsDebugPort_Text).onChange(
                (value) => {
                    this.plugin.settings.obsDebugPort_Text = value;
                    this.plugin.saveSettings()
            })
        });

        new Setting(containerEl)
        .setName("OSC Server")
        .setHeading()

        new Setting(containerEl)
        .setName("IP")
        .setDesc("Enter the IP address or 'localhost'")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscIP_Text).onChange(
                (value) => {
                    this.plugin.settings.oscIP_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("Incoming Message PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscInPort_Text).onChange(
                (value) => {
                    this.plugin.settings.oscInPort_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("Out going Message PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscOutPort_Text).onChange(
                (value) => {
                    this.plugin.settings.oscOutPort_Text = value;
                    this.plugin.saveSettings()
                    
                })
            });
        
        new Setting(containerEl)
        .setName("Add UUhimsy scripts to Slides Extended Template")
        .setHeading()
        .setDesc("UUhimsy scripts will be included when exporting Slides Extended slides")
        .addButton((button) => {
            button
                .setButtonText("Add UUhimsy scripts to Slides Extended Template")
                .setTooltip("UUhimsy scripts are included when exporting from Slides Extended")
                .setCta()
                .onClick(async ()=>{
                    const fileName = `.obsidian/plugins/slides-extended/template/reveal.html`;
                    const existing = await this.app.vault.adapter.exists(normalizePath(`${fileName}`));
                    if (existing) {
                        let file = await this.app.vault.adapter.read(normalizePath(`${fileName}`))
                        if(file.includes(`<script src="/_browser_Sources/js/revealSlideControls.js"></script>`)){
                            new Notice('template already includes uuhimsy scripts')
                        }
                        else{
                            new Notice('adding UUhimsy scripts to Slides Extended Template')
                            return await this.app.vault.adapter.process(normalizePath(`${fileName}`), (data) =>{
                                return data.replace('</body>',`    <script src="/_browser_Sources/obs_webSocket_details/websocketDetails.js"></script>
    <script src="/_browser_Sources/obs_webSocket_details/obs-ws.js"></script>
    <script src="/_browser_Sources/obs_webSocket_details/obsConnect.js"></script>
    <script src="/_browser_Sources/obs_webSocket_details/startConnection.js"></script>
    <script src="/_browser_Sources/js/revealSlideControls.js"></script>
</body>`)
                        })
                    }
                }
            })
                //     this.plugin.settings.oscOutPort_Text).onChange(
                // (value) => {
                //     this.plugin.settings.oscOutPort_Text = value;
                //     this.plugin.saveSettings()
                //  })
        });

        async function refresh_websocketDetailsJS(obsidian){
            const fileName = `_browser_Sources/obs_webSocket_details/websocketDetails.js`;
            const existing = await obsidian.app.vault.adapter.exists(normalizePath(`${fileName}`));
            if (!existing) {
                await obsidian.app.vault.create(`${fileName}`, 
                    `var wssDetails = {
                    "IP":"${obsidian.plugin.settings.websocketIP_Text}",
                    "PORT":"${obsidian.plugin.settings.websocketPort_Text}",
                    "PW":"${obsidian.plugin.settings.websocketPW_Text}"
                };`,);
            } else{
                await obsidian.app.vault.delete(obsidian.app.vault.getFileByPath(fileName));
                await obsidian.app.vault.create(`${fileName}`, 
                    `var wssDetails = {
    "IP":"${obsidian.plugin.settings.websocketIP_Text}",
    "PORT":"${obsidian.plugin.settings.websocketPort_Text}",
    "PW":"${obsidian.plugin.settings.websocketPW_Text}"
};`,);      
            }
        }
    }

}
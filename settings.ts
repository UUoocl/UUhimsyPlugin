import uuhimsyPlugin from "main";
import {App, PluginSettingTab, Setting, normalizePath } from "obsidian";

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
        .setName("OBS WebSocket Server Settings")
        .setHeading()
        .setDesc("Set the OBS Websocket Server Settings")
        
        new Setting(containerEl)
        .setName("OBS WebSocket Server IP")
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
        .setName("OBS WebSocket Server PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketPort_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketPort_Text = value;
                    this.plugin.saveSettings()
                    refresh_websocketDetailsJS(this)
             })
        });

        new Setting(containerEl)
        .setName("OBS WebSocket Server Password")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketPW_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketPW_Text = value;
                    this.plugin.saveSettings()
                    refresh_websocketDetailsJS(this)
             })
        });

        new Setting(containerEl)
        .setName("Open OBS")
        .setHeading()
        .setDesc("Open OBS with these options.")
        
        if(process.platform === "darwin"){
            new Setting(containerEl)
            .setName("OBS app Name")
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
            .setName("OBS app Name")
            .setDesc("Enter 'OBS' or a custom name")
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
        .setName("OBS Collection")
        .addText((item) => {
            item.setValue(this.plugin.settings.obsCollection_Text).onChange(
                (value) => {
                    this.plugin.settings.obsCollection_Text = value;
                    this.plugin.saveSettings()
            })
        });

        new Setting(containerEl)
        .setName("OBS Debug Port")
        .setDesc("Enter a Port for the Remote Debugger, or leave blank to skip this option")
        .addText((item) => {
            item.setValue(this.plugin.settings.obsDebugPort_Text).onChange(
                (value) => {
                    this.plugin.settings.obsDebugPort_Text = value;
                    this.plugin.saveSettings()
            })
        });

        new Setting(containerEl)
        .setName("OSC Server Settings")
        .setHeading()

        new Setting(containerEl)
        .setName("OSC IP address")
        .setDesc("Enter the IP address or 'localhost'")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscIP_Text).onChange(
                (value) => {
                    this.plugin.settings.oscIP_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OSC Incoming Message PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscInPort_Text).onChange(
                (value) => {
                    this.plugin.settings.oscInPort_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OSC Out going Message PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.oscOutPort_Text).onChange(
                (value) => {
                    this.plugin.settings.oscOutPort_Text = value;
                    this.plugin.saveSettings()
                    
             })
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


// var websocketIP = this.settings.websocketIP_Text;
// var websocketPort = this.settings.websocketPort_Text;
// var websocketPassword = this.settings.websocketPW_Text;
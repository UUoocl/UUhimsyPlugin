import uuhimsyPlugin from "main";
import {App, PluginSettingTab, Setting } from "obsidian";

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
        .setDesc("Copy the Websocket Server Settings from OBS")
        
        new Setting(containerEl)
        .setName("OBS WebSocket Server IP")
        .setDesc("Enter the IP address or 'localhost'")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketIP_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketIP_Text = value;
                    this.plugin.saveSettings()
                    this.app.vault.getMarkdownFiles
             })
        });

        new Setting(containerEl)
        .setName("OBS WebSocket Server PORT")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketPort_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketPort_Text = value;
                    this.plugin.saveSettings()
             })
        });

        new Setting(containerEl)
        .setName("OBS WebSocket Server Password")
        .addText((item) => {
            item.setValue(this.plugin.settings.websocketPW_Text).onChange(
                (value) => {
                    this.plugin.settings.websocketPW_Text = value;
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

    }

}

# UUhimsy Plugin

This is a plugin for Obsidian (https://obsidian.md).

This project adds OBS automation functionality to Obsidian. 

the [Slides Extended Plugin](https://github.com/ebullient/obsidian-slides-extended).  

Start with the [UUhimsy vault](https://github.com/UUoocl/UUhimsy)  

This plugin has the following features.
- A settings page to configure OBS, OBS webSocket Server and an OSC Server
- Adds a command to open the OBS app with launch parameters.
- Adds a command to add "Tags" to slides
- Creates a websocket connection between OBS and Apple Shortcuts
- Creates a websocket connection between OBS and ZoomOSC
- Creates a websocket connection between OBS and UVC-Util CLI

![image](https://github.com/user-attachments/assets/4789585c-021e-4a50-ac6d-ee1c19f1913f)

## How to use UUhimsy Plugin

### Connect to OBS 
In the UUhimsy settings tab, configure the OBS launch parameters. The settings will be used in the "Open OBS" command.  

![image](https://github.com/user-attachments/assets/10e24711-c2d0-48a7-98c3-cd20de8d9bb4)

#### **OBS WebSocket Server (WSS) Settings**
  |Settings| Value |
  |---|---|
  |IP| 'localhost' or the host machines IP|
  |PORT| default 4455.  
  |Password| set a secure password.  
  
#### **OBS Launch Parameters**
  |Settings| Value |
  |---|---|
  |Name| If multiple instances of OBS are installed enter the custom OBS name. |
  |Folder Path|Windows Only. Enter the Folder Path to the OBS executable|
  |Collection| Enter an OBS Scene Collection name   
  |OBS Debug Port| OBS Browser Sources can be debugged at https://localhost:{Port}. Default Port = 9222  

#### **Open OBS**
  The UUhimsy Plugin features a command to open OBS.  

  Open the command palette and enter "**Open OBS**"

![image](https://github.com/user-attachments/assets/3352b9c9-1886-4c0e-aaf8-0a0c567474d2)

OBS should launch with the choosen parameters  

- Command line executed by "Open OBS"
  - MacOS: 
```
  open -n -a "{Name}" --args --collection "{Collection}" --remote-debugging-port={Debugging Port} --remote-allow-origins=http://localhost:{Debuggin Port} --websocket_port "{WSS Port}" --websocket_password "{WSS Password} --multi"
```
  - Windows:  
```
  {App Name} --args --collection "{Collection}" --remote-debugging-port={Debugging Port} --remote-allow-origins=http://localhost:{Debugging Port} --websocket_port "{WSS Port}" --websocket_password "{WSS Password} --multi"
```

#### **Create Slide Tags**

  UUhimsy uses slide tags to automate actions when a slide transitions.  For example, use a slide to change scenes in OBS when a slide transition starts. 

  In the UUhimsy settings, click the "Add UUhimsy scripts to Slides Extended Template" button.  

  Slide tags are created with the commands. Open the Command Palette and choose an

  |Slide tag| Command| Notes|
  |---|---|---|
  |OBS Scenes|"Get OBS Scene tags"|- A tag is made for each Scene starting with "scene\|\|\|" and  <br>- A tag is made for each Source in the "Input Camera" scene|
  |Apple Shortcut|"Get Apple Shortcuts Tags"|- A tag is made for each Shortcut starting with "uu". MacOS only feature.|
  |USB Camera: Pan, Tilt, Zoom |"**Start sending camera PTZ position to OBS**"|The utility application [UVC-Util](https://github.com/jtfrey/uvc-util) is included to retrieve Pan, Tilt, Zoom (PTZ) data from USB PTZ cameras. <br>  MacOS only feature.|
  |ZoomOSC|"Start OSC to OBS Websocket connection"| [ZoomOSC](https://www.liminalet.com/zoomosc) is a client by Zoom with an OSC interface.|

#### **Insert a Slide Tag**

  In a Slides Extended slide, position the cursor above the slide break indicator "---".
  Open the command palette, and choose "Insert slide exit tag" or "Insert slide entrance tag".  

  >[!NOTE] Tag Types
  >'Exit' tags run when a slide transition starts 
  >'Entrance' tags run when a slide transition ends

After choosing to insert a tag, then a list of tags appear in the command palette. Select the tag to insert

## UUhimsy system

This plugin is a part of the [UUhimsy](https://github.com/UUoocl/UUhimsy) system.
The UUhimsy repo combines the 3 tools
- [UUhimsy plugin](https://github.com/UUoocl/UUhimsyPlugin)
- [Keyboard and Mouse Visualization](https://github.com/UUoocl/keyboard_and_mouse_visuals)
- [Get User Media](https://github.com/UUoocl/GUM)  


![image](https://github.com/user-attachments/assets/cc50192c-9ba6-4c2f-bdc3-92f8751bcbc3)

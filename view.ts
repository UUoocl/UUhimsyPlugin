import { ItemView, WorkspaceLeaf, Setting, Notice, Editor, MarkdownView, MarkdownEditView } from "obsidian";

export const UUHIMSY_VIEW_TYPE = "uuhimsy-view"

export class UUhimsyView extends ItemView{
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
      }

    getViewType(): string {
        return UUHIMSY_VIEW_TYPE;
    }

    getDisplayText(): string {
        return "UUhimsy Tags";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        container.createEl('h4', { text: 'UUhimsy Tags' });

        const files = this.app.vault.getFolderByPath("_slide_Tags").children;
        console.log(files)
        files.forEach(file => {
            console.log("basename",file.basename)
            console.log("files",files)
            
            let tag = file.basename.split(' - ')
            tag[0] = tag[0].toLowerCase()
            new Setting(container).setName(file.basename)
            .addButton((item) =>{
                console.log(item)
                console.log("tag",tag)
                item.setButtonText("Entrance")
                .setCta()
                .onClick(() => {
                    const lastLeaf = this.app.workspace.getMostRecentLeaf()
                    console.log("ll",lastLeaf)
                    const lastLeafWorkspace = this.app.workspace.getLeafById(lastLeaf?.id)
                    console.log(lastLeafWorkspace)
                    
                    this.app.workspace.setActiveLeaf(lastLeafWorkspace,true,true);
                    lastLeaf?.setEphemeralState(lastLeaf?.getEphemeralState())
                    this.app.workspace.activeEditor?.editor?.replaceSelection(`<!-- slide data-${tag[0]}-entrance="${tag[1]}" -->
`)
                
                    new Notice(`Inserted tag${tag[1]}`)
                    })
                })
                .addButton( item => {
                    //console.log(item)
                    console.log(file)
                    
                    item.setButtonText("Exit")
                    .onClick(() => {
                        const lastLeaf = this.app.workspace.getMostRecentLeaf()
                        const lastLeafWorkspace = this.app.workspace.getLeafById(lastLeaf?.id)
                        this.app.workspace.setActiveLeaf(lastLeafWorkspace,true,true);
                        lastLeaf?.setEphemeralState(lastLeaf?.getEphemeralState())
                        this.app.workspace.activeEditor?.editor?.replaceSelection(`<!-- slide data-${tag[0]}-exit="${tag[1]}" -->
    `)
                    
                        new Notice(`Inserted tag${tag[1]}`)
                    })
                })
            //container.createEl('p', {text: file.basename})
        });
        // const choices = files.filter((file) => {return file.basename.startsWith("Entrance")})
        // console.log(choices)
        // for (const choice in choices) {
        //     console.log(choice.)
        //     console.log(`${choice}: ${choice['basename']}`);
        //   }
      }
    
      async onClose() {
        // Nothing to clean up.
      }
}
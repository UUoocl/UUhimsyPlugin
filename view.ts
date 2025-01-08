import { ItemView, WorkspaceLeaf, Setting, Notice, Editor, MarkdownView, MarkdownEditView, IconName } from "obsidian";

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

    getIcon(): IconName {
        return "wand-sparkles";
    }

    async onOpen() {
        const container = this.containerEl.children[1];

        container.empty();
        container.createDiv('Header')
        new Setting(container).setName('UUhimsy Tags')
        .setHeading()
        .setDesc('refresh the view after running a "Get tags" command')
        .addButton((button) =>{
            button.setButtonText("refresh view")
            .onClick(() => {this.addTagButtons(tagsContainer)})
        })

        const tagsContainer = container.createDiv('tags')

        this.addTagButtons(tagsContainer)
      }

      addTagButtons(container){
        container.empty()
        const files = this.app.vault.getFolderByPath("_slide_Tags").children;
        files.forEach(file => {
            let tag = file.basename.split(' - ')
            tag[0] = tag[0].toLowerCase()
            new Setting(container).setName(file.basename)
            .addButton((item) =>{
            item.setButtonText("Entrance")
                .setCta()
                .onClick(() => {
                    const lastLeaf = this.app.workspace.getMostRecentLeaf()
                    const lastLeafWorkspace = this.app.workspace.getLeafById(lastLeaf?.id)
                    
                    this.app.workspace.setActiveLeaf(lastLeafWorkspace,true,true);
                    lastLeaf?.setEphemeralState(lastLeaf?.getEphemeralState())
                    this.app.workspace.activeEditor?.editor?.replaceSelection(`<!-- slide data-${tag[0]}-entrance="${tag[1]}" -->
`)
                    //new Notice(`Inserted tag ${tag[1]}`)
                    })
                })
                .addButton( item => {                
                    item.setButtonText("Exit")
                    .onClick(() => {
                        const lastLeaf = this.app.workspace.getMostRecentLeaf()
                        const lastLeafWorkspace = this.app.workspace.getLeafById(lastLeaf?.id)
                        this.app.workspace.setActiveLeaf(lastLeafWorkspace,true,true);
                        lastLeaf?.setEphemeralState(lastLeaf?.getEphemeralState())
                        this.app.workspace.activeEditor?.editor?.replaceSelection(`<!-- slide data-${tag[0]}-exit="${tag[1]}" -->
`)              
                        //new Notice(`Inserted tag ${tag[1]}`)
                    })
                })
           });
      }

      async onClose() {
        // Nothing to clean up.
      }
}
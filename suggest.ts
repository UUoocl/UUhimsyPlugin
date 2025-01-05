import { Editor, FuzzySuggestModal, TFile } from "obsidian";

export class UUhimsyEntranceSuggest extends FuzzySuggestModal<TFile> {
    getItems(): TFile[] {
        const files = this.app.vault.getFolderByPath("_slide_Tags").children
        //const choices = files.filter((file) => {return file.basename.startsWith("Entrance")})
        const choices = files
        
        return choices;
    }
    getItemText(item: TFile): string {
        return item.basename
    }
    async onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {  
        new Notice("Selected " + item.basename);
        const tag = item.basename.toLowerCase().split(' - ');
        //console.log(await this.app.vault.read(item))
        this.app.workspace.activeEditor?.editor?.replaceSelection(`<!-- slide data-${tag[0]}-entrance="${tag[1]}" -->
`)
    }
}

export class UUhimsyExitSuggest extends FuzzySuggestModal<TFile> {
    getItems(): TFile[] {
        const files = this.app.vault.getFolderByPath("_slide_Tags").children;
        const choices = files
        
        return choices;
    }
    getItemText(item: TFile): string {
        return item.basename
    }
    async onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {  
        new Notice("Selected " + item.basename);
        const tag = item.basename.toLowerCase().split(' - ');
        //console.log(await this.app.vault.read(item))
        this.app.workspace.activeEditor?.editor?.replaceSelection(`<!-- slide data-${tag[0]}-exit="${tag[1]}" -->
`)
    }
}
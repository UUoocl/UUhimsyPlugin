import { Editor, FuzzySuggestModal, TFile } from "obsidian";

export class UUhimsyEntranceSuggest extends FuzzySuggestModal<TFile> {
    getItems(): TFile[] {
        const files = this.app.vault.getMarkdownFiles();

        const choices = files.filter((file) => {return file.basename.startsWith("Entrance")})

        return choices;
    }
    getItemText(item: TFile): string {
        return item.basename
    }
    async onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {  
        //new Notice("Selected " + item.basename);
        //console.log(await this.app.vault.read(item))
        this.app.workspace.activeEditor?.editor?.replaceSelection(await this.app.vault.read(item))
    }
}

export class UUhimsyExitSuggest extends FuzzySuggestModal<TFile> {
    getItems(): TFile[] {
        const files = this.app.vault.getMarkdownFiles();

        const choices = files.filter((file) => {return file.basename.startsWith("Exit")})

        return choices;
    }
    getItemText(item: TFile): string {
        return item.basename
    }
    async onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {  
        this.app.workspace.activeEditor?.editor?.replaceSelection(await this.app.vault.read(item))
    }
}
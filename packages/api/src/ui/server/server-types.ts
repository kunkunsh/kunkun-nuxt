import type { IEvent, IFs, ISystem } from "../client"

export interface IFsServer {
	fsReadDir: IFs["readDir"]
	fsReadFile: IFs["readFile"]
	fsReadTextFile: IFs["readTextFile"]
	fsStat: IFs["stat"]
	fsLstat: IFs["lstat"]
	fsExists: IFs["exists"]
	fsMkdir: IFs["mkdir"]
	fsCreate: IFs["create"]
	fsCopyFile: IFs["copyFile"]
	fsRemove: IFs["remove"]
	fsRename: IFs["rename"]
	fsTruncate: IFs["truncate"]
	fsWriteFile: IFs["writeFile"]
	fsWriteTextFile: IFs["writeTextFile"]
	fsFileSearch: IFs["fileSearch"]
}

export interface ISystemServer {
	systemOpenTrash: ISystem["openTrash"]
	systemEmptyTrash: ISystem["emptyTrash"]
	systemShutdown: ISystem["shutdown"]
	systemReboot: ISystem["reboot"]
	systemSleep: ISystem["sleep"]
	systemToggleSystemAppearance: ISystem["toggleSystemAppearance"]
	systemShowDesktop: ISystem["showDesktop"]
	systemQuitAllApps: ISystem["quitAllApps"]
	systemSleepDisplays: ISystem["sleepDisplays"]
	systemSetVolume: ISystem["setVolume"]
	systemSetVolumeTo0: ISystem["setVolumeTo0"]
	systemSetVolumeTo25: ISystem["setVolumeTo25"]
	systemSetVolumeTo50: ISystem["setVolumeTo50"]
	systemSetVolumeTo75: ISystem["setVolumeTo75"]
	systemSetVolumeTo100: ISystem["setVolumeTo100"]
	systemTurnVolumeUp: ISystem["turnVolumeUp"]
	systemTurnVolumeDown: ISystem["turnVolumeDown"]
	systemToggleStageManager: ISystem["toggleStageManager"]
	systemToggleBluetooth: ISystem["toggleBluetooth"]
	systemToggleHiddenFiles: ISystem["toggleHiddenFiles"]
	systemEjectAllDisks: ISystem["ejectAllDisks"]
	systemLogoutUser: ISystem["logoutUser"]
	systemToggleMute: ISystem["toggleMute"]
	systemMute: ISystem["mute"]
	systemUnmute: ISystem["unmute"]
	systemGetFrontmostApp: ISystem["getFrontmostApp"]
	systemHideAllAppsExceptFrontmost: ISystem["hideAllAppsExceptFrontmost"]
	systemGetSelectedFilesInFileExplorer: ISystem["getSelectedFilesInFileExplorer"]
}

export interface IEventServer {
	eventOnDragDrop: IEvent["onDragDrop"]
	eventOnDragEnter: IEvent["onDragEnter"]
	eventOnDragLeave: IEvent["onDragLeave"]
	eventOnDragOver: IEvent["onDragOver"]
	eventOnWindowBlur: IEvent["onWindowBlur"]
	eventOnWindowCloseRequested: IEvent["onWindowCloseRequested"]
	eventOnWindowFocus: IEvent["onWindowFocus"]
}

// export interface IShellServer {

// }

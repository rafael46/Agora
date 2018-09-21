// Modules
import { ipcRenderer } from 'electron';
// Types
import {
	UPDATE_FILE,
	ADD_FILES,
	REMOVE_FILE,
	REMOVE_ALL_FILES,
	CONVERT_PROGRESS,
	CONVERT_COMPLETE
} from './types';

/**
 * @brief Update File Data
 * @param file <object> File data object
 */
export const updateFile = file => dispatch => {
	dispatch({ type:UPDATE_FILE,payload:file });
}

export const addFiles = files => dispatch => {
	// Process files
	files = files.map(({ fileName, path, size, type }) => {
		const name = fileName.split(/\./gi)[0];
		return { name, fileName, path, size, type, completed:false, progress:0 };
	});
	// Notify of files
	ipcRenderer.send('files:added', files);
	// Handle file metadata from the main process
	ipcRenderer.on('files:meta', (event, filesWithMeta) => {
		dispatch({type:ADD_FILES,payload:filesWithMeta});
	});
}

export const convertFiles = files => dispatch => {
	// Removed completed or in progress
	files = files.filter((file) => {
		return !(file.completed || file.progress <= 0);
	});
	// Begin conversion
	ipcRenderer.send('convert:start', files);

	ipcRenderer.on('convert:progress', (event, file) => {
		console.log(file.path, file.progress);
		dispatch({ type:CONVERT_PROGRESS, payload:file });
	});

	ipcRenderer.on('convert:end', (event, { file, outputPath }) => {
		dispatch({ type:CONVERT_COMPLETE, payload:file });
	});
}

export const removeFile = file => dispatch => {
	dispatch({ type:REMOVE_FILE, payload:file });
}

export const removeAllFiles = () => dispatch => {
	dispatch({ type:REMOVE_ALL_FILES });
}

export const showInFolder = path => dispatch => {
	ipcRenderer.send('file:show', path);
}
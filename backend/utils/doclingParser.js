const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

/**
 * Parses a PDF file using the Docling Python script.
 * @param {string} filePath - Path to the PDF file.
 * @param {string} outputDir - Directory to save extracted images.
 * @param {string} format - Output format ('markdown' or 'json').
 * @param {Function} onProgress - Callback for progress updates.
 * @returns {Promise<{content: string, images: Array, status: string}>}
 */
const parsePdfWithDocling = (filePath, outputDir, format = 'markdown', onProgress = null) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '..', 'python_scripts', 'parse_pdf.py');
        const pythonCmd = os.platform() === 'win32' ? 'py' : 'python3';
        
        console.log(`Executing: ${pythonCmd} ${scriptPath} ${filePath} ${outputDir}`);
        const pythonProcess = spawn(pythonCmd, [scriptPath, filePath, outputDir, format]);

        let stdoutData = '';
        let stderrData = '';

        pythonProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            for (const line of lines) {
                if (line.startsWith('PROGRESS:')) {
                    const parts = line.split(':');
                    const progress = parseInt(parts[1]);
                    const message = parts[2] || '';
                    const stage = parts[3] || '';
                    if (!isNaN(progress) && onProgress) {
                        onProgress(progress, message, stage);
                    }
                } else if (line.trim()) {
                    console.log(`[Python Stdout]: ${line}`);
                    stdoutData += line;
                }
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Docling script exited with code ${code}`);
                console.error(`Stderr: ${stderrData}`);
                return reject(new Error(stderrData || `Process exited with code ${code}`));
            }

            try {
                // Find the full JSON object in the stdout data (capture from first { to last })
                const jsonStartIndex = stdoutData.indexOf('{');
                const jsonEndIndex = stdoutData.lastIndexOf('}');
                
                if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                    throw new Error('No JSON output found');
                }

                const jsonString = stdoutData.substring(jsonStartIndex, jsonEndIndex + 1);
                const result = JSON.parse(jsonString);
                
                if (result.error) {
                    return reject(new Error(result.error));
                }
                resolve(result);
            } catch (e) {
                console.error('Failed to parse Docling JSON output:', stdoutData);
                reject(new Error(`Failed to parse script output: ${e.message}`));
            }
        });
    });
};

module.exports = {
    parsePdfWithDocling
};

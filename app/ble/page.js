"use client"
import { useState } from 'react';

var fileBlockCharacteristic, fileLengthCharacteristic, fileMaximumLengthCharacteristic;
var getBlockOfFileCharacteristic, commandCharacteristic, transferStatusCharacteristic;
var getFileCharacteristic, getFileLengthCharacteristic;
var isFileTransferInProgress = false;

const BleFileTransferExample = () => {
  const [errorMessages, setErrorMessages] = useState([]);
  const [status, setStatus] = useState('Click button to connect to the board');

  const SERVICE_UUID = "bf88b656-0000-4a61-86e0-769c741026c0";
  const FILE_BLOCK_UUID = "bf88b656-3000-4a61-86e0-769c741026c0";
  const FILE_LENGTH_UUID = "bf88b656-3001-4a61-86e0-769c741026c0";
  const FILE_MAXIMUM_LENGTH_UUID = "bf88b656-3002-4a61-86e0-769c741026c0";
  const FILE_CHECKSUM_UUID = "bf88b656-3003-4a61-86e0-769c741026c0";
  const COMMAND_UUID = "bf88b656-3004-4a61-86e0-769c741026c0";
  const TRANSFER_STATUS_UUID = "bf88b656-3005-4a61-86e0-769c741026c0";
  const ERROR_MESSAGE_UUID = "bf88b656-3006-4a61-86e0-769c741026c0";

  const connect = async () => {
    setStatus('Requesting device ...');

    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID]
      });

      setStatus('Connecting to device ...');

      function onDisconnected(event) {
        setStatus(`Device ${device.name} is disconnected.`);
      }

      device.addEventListener('gattserverdisconnected', onDisconnected);

      const server = await device.gatt.connect();

      setStatus('Getting primary service ...');
      const service = await server.getPrimaryService(SERVICE_UUID);

      setStatus('Getting characteristics ...');
      fileBlockCharacteristic = await service.getCharacteristic(FILE_BLOCK_UUID);
      fileLengthCharacteristic = await service.getCharacteristic(FILE_LENGTH_UUID);
      fileMaximumLengthCharacteristic = await service.getCharacteristic(FILE_MAXIMUM_LENGTH_UUID);
      getBlockOfFileCharacteristic = await service.getCharacteristic(FILE_CHECKSUM_UUID);
      commandCharacteristic = await service.getCharacteristic(COMMAND_UUID);
      transferStatusCharacteristic = await service.getCharacteristic(TRANSFER_STATUS_UUID);
      await transferStatusCharacteristic.startNotifications();
      transferStatusCharacteristic.addEventListener('characteristicvaluechanged', onTransferStatusChanged);
      getFileCharacteristic = await service.getCharacteristic(ERROR_MESSAGE_UUID);
      getFileLengthCharacteristic = await service.getCharacteristic('bf88b656-3007-4a61-86e0-769c741026c0');

      isFileTransferInProgress = false;

      setStatus('Connected to device');
    } catch (error) {
      console.error(error);
      logError(error.message);
    }
  };

    const prepareDummyFileContents = async () => {
        const fileInput = document.getElementById('fileInput');

      // Check if a file is selected
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const readAsTextPromise = (file) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();

              reader.onload = function(event) {
                const textContent = event.target.result;
                resolve(textContent);
              };

              reader.onerror = function() {
                reject(new Error('Error reading file.'));
              };

              reader.readAsText(file);
            });
          };
        try {
          // Read the file as text using await
          const textContent = await readAsTextPromise(file);

          // Convert text content to ArrayBuffer
          const arrayBuffer = new TextEncoder().encode(textContent).buffer;

          return arrayBuffer;
        } catch (error) {
          logError(error.message);
        }
      } else {
        logError('No file selected.');
      }
  }
  const transferFile = async () => {
    const fileContents = await prepareDummyFileContents();

    try {
      const maximumLength = 48000000;

      if (fileContents.byteLength > maximumLength) {
        setStatus(`File length is too long: ${fileContents.byteLength} bytes but maximum is ${maximumLength}`);
        return;
      }
    } catch (error) {
      logError(error.message);
    }

    if (isFileTransferInProgress) {
      setStatus('Another file transfer is already in progress');
      return;
    }

    try {
      let fileLengthArray = new TextEncoder().encode(fileContents.byteLength.toString());

      await fileLengthCharacteristic.writeValue(fileLengthArray);

      let commandArray = Int32Array.of(1);
      await commandCharacteristic.writeValue(commandArray);

      sendFileBlock(fileContents, 0);
      setStatus('File transfer succeeded');
    } catch (error) {
      logError(error.message);
    }
  };


   const sendFileBlock = async(fileContents, bytesAlreadySent) => {

    let bytesRemaining = fileContents.byteLength - bytesAlreadySent;

    const maxBlockLength = 128;
    const blockLength = Math.min(bytesRemaining, maxBlockLength);
    var blockView = new Uint8Array(
      fileContents,
      bytesAlreadySent,
      blockLength
    );
    fileBlockCharacteristic
      .writeValue(blockView)
      .then((_) => {
        bytesRemaining -= blockLength;
        if (bytesRemaining > 0 && isFileTransferInProgress) {
            setStatus("File block written - " + bytesRemaining + " bytes remaining");
            bytesAlreadySent += blockLength;
            sendFileBlock(fileContents, bytesAlreadySent);
        }
      })
      .catch((error) => {
        setErrorMessages(error.message);
        setStatus(
          "File block write error with " +
            bytesRemaining +
            " bytes remaining, see console"
        );
      });
  }

  const getTransferedFiled = async () => {
    try {
      console.log('Initiate file get');
      await getBlockOfFileCharacteristic.writeValue(new TextEncoder().encode('1'));
      const fileResivedData = [];
      console.log('Initiate file 222');
      await callableFileTransfer();

      async function callableFileTransfer() {
        const decoder = new TextDecoder();
        const fileLength = await getFileLengthCharacteristic.readValue();
        const decodeFileLength = parseInt(decoder.decode(fileLength));
        console.log(decodeFileLength);

        const unitMaintain = await getBlockOfFileCharacteristic.readValue();
        const decodeUnitMaintain = parseInt(decoder.decode(unitMaintain));

        console.log(decodeUnitMaintain);

        if (decodeFileLength >= decodeUnitMaintain) {
          const value = await getFileCharacteristic.readValue();
          console.log(value);
          await getBlockOfFileCharacteristic.writeValue(new TextEncoder().encode((decodeUnitMaintain + 1).toString()));
          const pre = fileResivedData.pop();
          if (!pre) fileResivedData.push(value.buffer);
          else {
            const array1 = new Uint8Array(pre);
            const array2 = new Uint8Array(value.buffer);
            const totalLength = array1.length + array2.length;
            const newArray = new Uint8Array(totalLength);
            newArray.set(array1, 0);
            newArray.set(array2, array1.length);
            const mergedBuffer = newArray.buffer;
            fileResivedData.push(mergedBuffer);
            console.log(fileResivedData);
          }
          await callableFileTransfer();
        }
      }

      saveArrayBufferToFile(fileResivedData[0], 'output.txt');

      function saveArrayBufferToFile(arrayBuffer, fileName) {
        // Convert ArrayBuffer to text
        const textContent = new TextDecoder().decode(arrayBuffer);

        // Create Blob from text content
        const blob = new Blob([textContent], { type: 'text/plain' });

        // Create download link
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = fileName;

        // Trigger download
        a.click();
      }
    } catch (error) {
      logError(error.message);
    }
  };

  const onTransferStatusChanged = (event) => {
    let value = new Uint8Array(event.target.value.buffer);
    let utf8Decoder = new TextDecoder();
    let decodeMessage = utf8Decoder.decode(value);
    let statusCode = parseInt(decodeMessage);

    if (statusCode === 0) {
      onTransferSuccess();
    } else if (statusCode === 1) {
      onTransferError();
    } else if (statusCode === 2) {
      onTransferInProgress();
    }
  };

  const onTransferInProgress = () => {
    isFileTransferInProgress = true;
  };

  const onTransferError = () => {
    isFileTransferInProgress = false;
    setStatus('File transfer error');
  };

  const onTransferSuccess = () => {
    isFileTransferInProgress = false;
    setStatus('File transfer succeeded');
  };

  const logError = (error) => {
    setErrorMessages((prevErrors) => [...prevErrors, JSON.stringify(error)]);
  };

  return (
    <div>
      <div>
        Test file transfer over BLE. To use:
        <ul>
          <li>Click the connect button and pair with the board.</li>
          <li>Press the transfer file button.</li>
        </ul>
        You should see the bytes remaining count down, and then a 'File transfer succeeded' message at the end.
      </div>
      <div>
        <button onClick={connect}>Connect</button>
        <button onClick={transferFile}>Transfer File</button>
        <button onClick={getTransferedFiled}>Get File</button>
        <label htmlFor="fileInput" className="custom-file-upload">
          Custom Upload
          <input type="file" id="fileInput" style={{ display: 'none' }} />
        </label>

        <div id="status-label">{status}</div>
        <div style={{ padding: '20px', color: 'black', backgroundColor: '#e0e0e0' }}>
          <pre id="error-custom">{
            errorMessages.map(item => <>
                {JSON.stringify(item)}
                <br />
            </>)
          }</pre>
        </div>
      </div>
    </div>
  );
};

export default BleFileTransferExample;

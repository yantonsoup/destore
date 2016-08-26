const Ethereum = nodeRequire('../../libs/ethereum/ethereum.js');
const web3 = Ethereum.init();
const Host = nodeRequire('../../libs/HostMethods.js');
const User = nodeRequire('../../libs/UserMethods.js');
const Watcher = nodeRequire('../../libs/watcherMethods.js');
const IPFS = nodeRequire('../../libs/ipfs/ipfs.js');
const path = nodeRequire('path');
const Config = nodeRequire('electron-config');
const config = new Config();
const fs = nodeRequire('fs');
const getSize = nodeRequire('get-folder-size');

const uploadFile = nodeRequire('../../libs/uploadFile.js');
const hostFile = nodeRequire('../../libs/hostFile.js');

var hash;
var recInstance = {address: '0x8ca22b74e3640541462b04399479212958df0490'};
var masterInstance = {address: '0x06e38819b55bfb71459858f9c81ffd20fa9f8000'};

var senderInstance;

let i = 0;

var index, filePathArray, fileSizeArray, fileHashArray, fileIpfsArray, filePath, fileSize, ipfsHash, folder, count = 0;

var fileContractArray;

// if(config.get('key')=={sup:'sup'}) console.log('GETTTT', config.get('key'));

//Initializes daemon when on page
IPFS.init();
IPFS.daemon();

//Makes encrypt/download folder (hidden) if not made
User.mkdir('fileStorage');

//load from localstorage to page on startup
filePathArray = config.get('fileList.path');
fileSizeArray = config.get('fileList.size');
fileHashArray = config.get('fileList.hash');
fileContractArray = config.get('fileList.contract');

// fileIpfsArray = config.get('fileList.address');
if (filePathArray) {
  //removes all null/undefined from arrays
  while (count < filePathArray.length) {
    if (!filePathArray[count]) {
      filePathArray.splice(count, 1);
      fileSizeArray.splice(count, 1);
      fileHashArray.splice(count, 1);
      // fileContractArray.splice(count, 1);
      // fileIpfsArray.splice(count, 1);
      // console.log('Removed 1', filePathArray);
    } else count++;
    // console.log('LOOOP')
  }
  config.set('fileList', {
    path: filePathArray,
    size: fileSizeArray,
    hash: fileHashArray,
    // address: fileIpfsArray
    contract: fileContractArray
  });
  //adds each file to DOM
  for (count = 0; count < filePathArray.length; count++) {
    if (filePathArray[count]) {
      filePath = filePathArray[count];
      $('#fileTable').append('<div class="file" id="file' + count + '">' + path.basename(filePath) + '<button class="send">Send</button><button class="delete">Delete</button></div>');
    }
  }
fileIpfsArray = config.get('fileList.address');

}
//TODO: MAKE A SEND ALL FUNCTION
//TODO: ON CLOSE, take out all undefined

$("button.addMasterList").click(() => {
  Ethereum.deploy('MasterList')
    .then(function(instance) {
      masterInstance = instance;
    });
});

$("button.addHost").click(() => {
  var value = $('#hostInput').val();
  value = value * 1024 * 1024;
  $('.addHost').prop('disabled', true);
  Ethereum.deploy('Receiver', [value, masterInstance.address])
    .then(function(instance) {
      recInstance = instance;
    });
});

// $("button.mkdir").click(function() {
// 	//get file path
// 	// var dirPath = path.join(__dirname, '../../DeStoreWatch');
// 	// Watch.startWatch(dirPath);
// });

$(document).on('click', '.hostLink', () => {
  config.set('startup', {path: 'host.html'})
});

$(document).on('click', '.userLink', () => {
  config.set('startup', {path: 'user.html'})
});


// adds a sender file contract
$("button.addUser").click(() => {
  hash = $('#hash').val();
  var filesize = $('#user').val();
  deploySender(hash, filesize);
});

// tests masterInstance to see if it got a Receiver
$("button.test").click(() => {
  masterInstance.testReceiver().then(function(res) {
    console.log('Host Address', res[0]);
    console.log('Available Storage', res[1].toNumber());
  });
});

// tests the current sender file contract's saved hash address
$("button.test2").click(function() {
  var value = $('#user').val();
  var hash1 = hash.substring(0, 23);
  var hash2 = hash.substring(23 - 10, 46 - 10);
  senderInstance.testSender(hash1, hash2).then(function(res) {
    console.log('Latest Hash: ', web3.toAscii(res[0]) + web3.toAscii(res[1]));
  });
});

// retrives all files stored in reciever contract and downloads
$("button.test3").click(function() {
  console.log('press download');
  hostFile(recInstance.address);
});

// gets config storage
$("button.test4").click(() => {
  console.log(config.get('fileList'));
});

// clears config storage
$("button.clear").click(() => {
  config.clear('fileList');
  $('#fileTable').html("");
  count = 0;
});

const getFileSize = (filename) => {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats['size'];
  return fileSizeInBytes;
};

// DROPZONE FUNCTIONALITY
document.ondragover = document.ondrop = (ev) => {
  ev.preventDefault();
};

$('.upload-drop-zone').on('dragover', (ev) => {
  $('.upload-drop-zone').css('background-color', '#4c83db')
});

$('.upload-drop-zone').on('dragleave', (ev) => {
  $('.upload-drop-zone').css('background-color', 'white')
});

$(".upload-drop-zone").on("drop", (ev) => {
  ev.preventDefault();
  $('.upload-drop-zone').css('background-color', 'white')
  if (!count) count = 0;
  filePath = ev.originalEvent.dataTransfer.files[0].path;
  getSize(filePath, (err, res) => {
    fileSize = res;
    if (config.get('fileList') === undefined) {
      filePathArray = [];
      fileSizeArray = [];
      fileHashArray = [];
      fileContractArray = [];
    } else {
      filePathArray = config.get('fileList.path');
      fileSizeArray = config.get('fileList.size');
      fileHashArray = config.get('fileList.hash');
      fileContractArray = config.get('fileList.contract');
    }
    filePathArray.push(filePath);
    fileSizeArray.push(fileSize);
    fileHashArray.push(undefined);
    fileContractArray.push(undefined);
    //saves filepath and filesize to local storage
    config.set('fileList', {
      path: filePathArray,
      size: fileSizeArray,
      hash: fileHashArray,
      contract: fileContractArray
    });
    //create html element for each file
    $('#fileTable').append('<div class="file" id="file' + count + '">' + path.basename(filePath) + '<button class="send">Send</button><button class="delete">Delete</button></div>');
    console.log('FILE: ', filePath, ' SIZE: ', fileSize);
    count++;
  });
});

$('body').on('click', '.send', function() {
  index = $(this).closest('.file').prop('id').replace(/file/, "");
  filePathArray = config.get('fileList.path');
  console.log(index);
  console.log('ARRAY', filePathArray);
  uploadFile(filePathArray[index], masterInstance.address);
  $(this).replaceWith('<button class="retrieve">Retrieve</button>');
});

$('body').on('click', '.retrieve', function() {
  User.mkdir('Downloaded');
  index = $(this).closest('.file').prop('id').replace(/file/, "");
  fileHashArray = config.get('fileList.hash');
  filePathArray = config.get('fileList.path');
  console.log(path.join(__dirname + '/../../files/download/' + path.basename(filePathArray[index])));
  IPFS.download(fileHashArray[index], path.join(__dirname + '/../../files/download/' + path.basename(filePathArray[index])))
    .then((res) => console.log(res))
    .catch(res => console.log('ERROR: ', res));
});

$('body').on('click', '.delete', function() {
  index = $(this).closest('.file').prop('id').replace(/file/, "");
  filePathArray = config.get('fileList.path');
  fileSizeArray = config.get('fileList.size');
  fileHashArray = config.get('fileList.size');
  console.log(index);
  console.log(filePathArray);
  filePathArray[index] = undefined;
  fileSizeArray[index] = undefined;
  fileHashArray[index] = undefined;
  fileContractArray[index] = undefined;
  console.log(filePathArray);
  config.set('fileList', {
    path: filePathArray,
    size: fileSizeArray,
    hash: filePathArray,
    contract: fileContractArray
  });
  $(this).closest('.file').remove();
});

$('body').on('click', '.clearML', function() {
  Ethereum.execAt('MasterList', masterInstance.address)
    .clearReceivers()
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log('clear error');
      console.log(err);
    })

  if($('.addHost').prop('disabled')===true) $('.addHost').prop('disabled', false);
});

document.body.ondrop = (ev) => {
  ev.preventDefault();
};

window.onbeforeunload = (ev) => {
  ev.preventDefault();
  config.set('check', {
    sup: 'sup'
  });
};

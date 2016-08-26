'use strict';

const program = require('commander');
const Ethereum = require('./libs/ethereum/ethereum.js');
const IPFS = require('./libs/ipfs/ipfs.js');
const hostFile = require('./libs/hostFile.js');
const uploadFile = require('./libs/uploadFile.js');
const saveContracts = require('./libs/saveContracts.js');

const Upload = require('./models/Upload.js');
const Host = require('./models/Host.js');

program
  .version('0.0.1')
  .option('init', 'Initialize')
  .option('check', 'Check Ethereum Connection')
  .option('accounts', 'Get a list of Ethereum accounts')
  // .option('test', 'test command to test random things')
  .option('test', 'test command to test random things')
  .option('save', 'Save a contract with ether-pudding into .sol.js')
  .option('deploy', 'Deploy a pudding contract ')
  .option('exec', 'Execute a deployed pudding contract')
  .option('execAt', 'Execute a pudding contract at specifiied address')
  .option('delete', 'Deletes all entries in database')
  .option('ipfsTest')
  .option('ipfsDaemon')
  .option('ethTest')
  .option('resetHost')
  .option('resetUpload')
  .parse(process.argv);

if (program.init) {
  console.log('Initialize');
  Ethereum._init();
  Ethereum.check();
}


if (program.shray) {
  saveContracts('testContract');
}

if (program.check) {
  console.log('check');
  Ethereum.check();
}

if (program.accounts) {
  console.log('accounts');
  Ethereum.getAccounts();
}

if (program.save) {
  console.log('save');
  saveContracts('MasterList');
}

if (program.deploy) {
  console.log('deploy');
  Ethereum.deploy('MasterList')
    .then(function(res) {
      console.log(res.address);
    })
    .catch(function(err) {
      console.log(err);
    });
}

if (program.exec) {
  console.log('exec');
  Ethereum.exec('Test').getValue()
    .then((res) => {
      console.log(res);
    });
}

if (program.execAt) {
  console.log('execAt');
  Ethereum.execAt('MasterList', '0x7e99708685f1a3be4e2a87da2aa3f8d24e203670')
    .testReceiver()
    .then((res) => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
}

if (program.test2) {

}

if (program.ipfsInit) {
  console.log('===== ipfsInit ====');
  IPFS.init();
}

if (program.ipfsDaemon) {
  console.log('===== ipfs deamon====');
  IPFS.daemon();
}
if (program.ipfsTest) {
  console.log('===== init =====');
  IPFS.init();

  console.log('===== ipfsAdd =====');
  const happy = './upload/kb.png';
  // const test = './user/files/files';
  // const png = './user/files/kb.png';
  // const download = './user/download/download';
  // const taylor = './user/files/together.mp3';

  uploadFile([happy], '0x4e140616dc42d606909864d9ae8911f95b752133');
  // IPFS.addFiles([happy, test, png, download])
  //   .then(res => {
  //     console.log(res);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });

  console.log('===== ipfsGet =====');
  const writePath = __dirname + '/kb-logo.png';
  IPFS.download('QmPz54CotK8DLCjsLVMHUfFpGD293qE4tRfEHgtcZoQMAc', writePath)
    .then((res) => {
      console.log('in res');
      console.log(res[0]);
    })
    .catch((err) => {
      console.log('in error');
      console.log(err);
    });
}

if (program.ethTest) {
  Ethereum.unlock('0x1e97d4a2597bc9cee0fbd47a6c1297145e586402', 'hello');
}

if (program.resetHost) {
  Host.reset();
}

if (program.resetUpload) {
  Upload.reset();
}


if (program.test) {
  Host.db.find({}, (err, res) => {
    console.log('host db');
    console.log(res);
  });

  Upload.db.find({}, (err, res) => {
    console.log('upload db');
    console.log(res);
  });

  Host.reset();

  Upload.reset();

  const kb = './files/upload/kb.png';

  IPFS.init();
  Ethereum.deploy('MasterList')
    .then(masterInstance => {
      console.log('==== deployed masterlist ===');
      const masterAddress = masterInstance.address;
      const availStorage = 1000000000;
      Ethereum.deploy('Receiver', [availStorage, masterAddress])
        .then(receiverInstance => {
          console.log('=== deployed receiver ===');
          const receiverAddress = receiverInstance.address;
          console.log(receiverAddress);
          uploadFile(kb, masterAddress, (err, res) => {
            if (err) console.error(err);
            else {
              console.log(res);
              console.log('upload file');
              hostFile(receiverAddress);
            }
          });
        })
        .catch(err => {
          console.error(err);
        });
    })
    .catch(err => {
      console.error(err);
    });


}

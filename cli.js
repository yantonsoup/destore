'use strict';

const program = require('commander');
const Ethereum = require('./libs/ethereum/ethereum.js');
const IPFS = require('./libs/ipfs/ipfs.js');
const hostFile = require('./libs/hostFile.js');
const uploadFile = require('./libs/uploadFile.js');
const saveContracts = require('./libs/saveContracts.js');

const Upload = require('./models/Upload.js');
const Host = require('./models/Host.js');
const DeStoreAddress = require('./models/DeStoreAddress.js');

const config = require('./libs/config/config.js');

const lol = console.log.bind(console);

program
  .version('0.0.1')
  .option('init', 'Initialize')
  .option('start')
  .option('check', 'Check Ethereum Connection')
  .option('accounts', 'Get a list of Ethereum accounts')
  // .option('test', 'test command to test random things')
  .option('test', 'test command to test random things')
  // .option('save', 'Save a contract with ether-pudding into .sol.js')
  .option('deploy', 'Deploy DeStore Contract ')
  .option('exec', 'Execute a deployed pudding contract')
  .option('execAt', 'Execute a pudding contract at specifiied address')
  .option('delete', 'Deletes all entries in database')
  .option('ipfsTest')
  .option('ipfsDaemon')
  .option('ethTest')
  .option('resetHost')
  .option('resetUpload')
  .option('etest1')
  .option('etest2')
  .option('etest3')
  .option('etest4')
  .option('etest5')
  .option('etest6')
  .option('etest7')
  .option('etest8')
  .option('etest9')
  .option('etest10')
  .option('etest11');

program
  .command('save <file>')
  .action(function (file) {
    console.log('save');
    saveContracts(file);
  });

program
  .command('save-test <file>')
  .action(function (file) {
    console.log('save-test');
    saveContracts(file, config.contracts.testPath);
  });


program.parse(process.argv);

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
  const nothing = '';
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

if (program.etest1) {
  console.log('etest');
  console.log('===== SimpleStorage =====');
  Ethereum.deploy('SimpleStorage')
    .then(ins => {
      console.log('deployed SimpleStorage');
      return Promise.all([ins.set(100), ins]);
    })
    .then(tx => {
      const ins = tx[1];
      return ins.get();
    })
    .then(tx => {
      console.log(tx);
    })
    .catch(err => {
      console.error(err);
    });
}

if (program.etest2) {
  lol('etest2');
  lol('===== Coin ======');
  Ethereum.deploy('Coin')
    .then(ins => {
      console.log('deployed SimpleStorage');
      lol('adding 300');
      return Promise.all([ins, ins.mint(Ethereum.account, 100), ins.mint(Ethereum.account, 100), ins.mint(Ethereum.account, 100)]);
    })
    .then(arr => {
      lol('checking owner balance');
      const ins = arr[0];
      return Promise.all([ins, ins.queryBalance(Ethereum.account)]);
    })
    .then(arr => {
      lol('sending 200 to account 2');
      const ins = arr[0];
      return Promise.all([ins, ins.send(Ethereum.accounts[1], 200)]);
    })
    .then(arr => {
      lol('checking balance account 2');
      const ins = arr[0];
      return Promise.all([ins, ins.queryBalance(Ethereum.accounts[1])]);
    })
    .then(arr => {
      console.log(arr[1]);
    })
    .catch(err => {
      lol(err);
    });
}

if (program.etest3) {
  lol('etest3');
  Ethereum.deploy('ArrayContract')
    .then(ins => {
      lol('deployed ArrayContract');
      lol('setting all flag pairs');
      return Promise.all([ins, ins.setAllFlagPairs([[true, true], [false, false], [true, false], [true, true]])]);
    })
    .then(arr => {
      lol('set flag pairs');
      const ins = arr[0];
      return Promise.all([ins, ins.setFlagPair(0, false, true)]);
    })
    .then(arr => {
      const ins = arr[0];
      lol('checking get flag pairs');
      return Promise.all([ins, ins.getFlagPairs()]);
    })
    .then(arr => {
      const ins = arr[0];
      lol('flag pairs: ');
      lol(arr[1]);
      return Promise.all([ins, ins.getFlagPairsLength()]);
      // lol('sending 200 to account 2');
      // return Promise.all([ins, ins.send(Ethereum.accounts[1], 200)]);
    })
    .then(arr => {
      const ins = arr[0];
      lol('checking flags length');
      lol(arr[1]);
      ins.getFlagPairsLength()
        .then(tx => {
          lol('lots of integers');
          lol(tx);
        })
        .catch(err => {
          lol(err);
        });
    })
    .catch(err => {
      lol(err);
    });
}

if (program.etest4) {
  lol('deploying crowdfunding');
  Ethereum.deploy('CrowdFunding')
    .then(ins => {
      lol('new campaign');
      ins.newCampaign(Ethereum.account, 10)
        .then(tx => {
          lol(tx);
          lol('contributing');
          return ins.contribute(tx);
        })
        .then(tx => {
          lol('checkgoal');
        });
    })
    .catch(err => {
      lol(err);
    });
}

if (program.etest5) {
  Ethereum.deploy('Hash', ['QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'])
    .then(ins => {
      ins.getHash()
        .then(tx => {
          lol(tx);
        })
        .catch(err => {
          lol(err);
        });
    })
    .catch(err => {
      lol(err);
    });
}

if (program.etest6) {
  Ethereum.deploy('List')
    .then(list => {
      lol(list);
      Promise.all([
        Ethereum.deploy('Hash', ['QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn', list.address]),
        Ethereum.deploy('Hash', ['QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvAAAA', list.address]),
        Ethereum.deploy('Hash', ['QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvAXXX', list.address]),
      ])
      .then(hash => {
        lol('deployed');
        list.get(0)
          .then(tx => {
            lol(tx);
          })
          .catch(err => {
            lol(err);
          });
        list.get(1)
          .then(tx => {
            lol(tx);
          })
          .catch(err => {
            lol(err);
          });
        list.get(2)
          .then(tx => {
            lol(tx);
          })
          .catch(err => {
            lol(err);
          });
      })
      .catch(err => {
        lol(err);
      });
    })
    .catch(err => {
      lol(err);
    });
}

const hash1 = 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn';
const hash2 = 'QmcSwTAwqbtGTt1MBobEjKb8rPwJJzfCLorLMs5m97axDW';
const hash3 = 'QmRtDCqYUyJGWhGRhk1Bbk4PvE9mbCS1HKkDAo6xUAqN4H';
const hash4 = 'QmbFMke1KXqnYyBBWxB74N4c5SBnJMVAiMNRcGu6x1AwQH';

const add = '0xb8fffe94ead237909cdbd6640e18b343452f9831';
function split(inputHash) {
  const half1 = inputHash.substring(0,23);
  const half2 = inputHash.substring(23,46);
  return [half1, half2];
}

const web3 = Ethereum.init();

function fromBytes(byteArray) {
  const hashes = [];
  for (var i = 0; i < byteArray.length; i += 2) {
    let hashAddress = (web3.toAscii(byteArray[i]) + web3.toAscii(byteArray[i + 1]));
    hashAddress = hashAddress.split('').filter(char => {
      return char.match(/[A-Za-z0-9]/);
    }).join('');
    hashes.push(hashAddress);
  }
  return hashes;
}

const options = {
  from: Ethereum.account,
  value: 10
};

if (program.etest7) {
  let instance;
  Ethereum.deploy('Sender', [split(hash1), 100, add], options)
    .then(ins => {
      instance = ins;
      return ins.addHash(split(hash2)[0], split(hash2)[1]);
    })
    .then(tx => {
      lol(tx);
      instance.getHashes()
        .then(tx => {
          lol(tx);
          lol(fromBytes(tx));
        })
        .catch(err => {
          lol(err);
        });
      instance.getBalance()
        .then(tx => {
          lol('balance');
          lol(tx);
        });
    })
    .catch(err => {
      lol(err);
    });
}

if (program.etest8) {
  Ethereum.init();
  const address = DeStoreAddress.get();
  console.log(address);
  Ethereum.execAt('DeStore', address)
    .receiverAdd(100, {from: Ethereum.account})
    .then(tx => {
      console.log(tx);
    })
    .catch(err => {
      console.log('error');
      console.error(err);
    });
    // .receiverAdd(100)
    // .then(tx => {
    //   console.log(tx);
    // })
    // .catch(err => {
    //   console.error(err);
    // });
}

if (program.deploy) {
  Ethereum.changeAccount(0);
  const deployOptions = {
    from: Ethereum.account
  };
  Ethereum.deploy('DeStore', [], deployOptions)
    .then(instance => {
      config.contracts.deStore = instance.address;
      console.log(instance.address);
      DeStoreAddress.save(instance.address);
    })
    .catch(err => {
      console.error(err);
    });
}

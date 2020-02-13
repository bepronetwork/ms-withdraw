export default {
    eth : {
        network : 'kovan',
        url : 'https://kovan.infura.io/v3/811fe4fa5c4b41cb9b92f9656aaeaa3b',
        keys : {
            user : '0x6E390AC06C6CCFB01D8F10C417EFD5A23B5217A9268D95D6E0B9E8FE035D1156',
            home : '0x0B65E4D1DB96EEF7FAD9EC98ABCDFB410C6DD1A9F6210F3AB7DDF02B4C5C7393',
            master : '0x6E390AC06C6CCFB01D8F10C417EFD5A23B5217A9268D95D6E0B9E8FE035D1156',
            mgmt : '0xA109C83409D4DCB71DD1CFAA8048004969126D9CAEF12BB86E0CA6056BB67DA6'
        },
        erc20Address : '0xd6835a70ac85c51a0844baad61be7ff5d4700360'
    },
    mongo : {
        connection_string : "mongodb://BetProtocolAdmin:wNmm4OmASXEp8UXi@cluster0-shard-00-00-2gxjd.mongodb.net:27017,cluster0-shard-00-01-2gxjd.mongodb.net:27017,cluster0-shard-00-02-2gxjd.mongodb.net:27017/",
        dbs : {
            "main" : "main?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true",
            "ecosystem" : "ecosystem?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true"
        }
    }
}
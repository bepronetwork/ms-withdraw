
let populate_integrations_all = [
    {
        path : 'chat',
        model : 'Chat',
        select : { '__v': 0},
    },
    {
        path : 'mailSender',
        model : 'MailSender',
        select : { '__v': 0},
    },
    {
        path : 'moonpay',
        model : 'MoonPay',
        select : { '__v': 0},
    },
    {
        path : 'cripsr',
        model : 'Cripsr',
        select : { '__v': 0},
    },
    {
        path : 'kyc',
        model : 'Kyc',
        select : { '__v': 0},
    }
] 

export default populate_integrations_all;
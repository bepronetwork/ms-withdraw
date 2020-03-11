import { MailSenderRepository } from "../../db/repos";
import { Security } from "../../controllers/Security";
import { Logger } from "../../helpers/logger";
import { SendInBlue } from "../third-parties/sendInBlue";
import { throwError } from "../../controllers/Errors/ErrorManager";

class Mailer{
    constructor(){}
    
    setTextNotification(TYPE_NOTIFICATION, AMOUNT = '', TICKER = '') {
        switch (TYPE_NOTIFICATION) {
            case 'DEPOSIT':
                let textDeposit = `There is a deposit of ${AMOUNT} ${TICKER} in your account`
                return textDeposit;
            case 'WITHDRAW':
                let textWithdraw = `There is a withdraw of ${AMOUNT} ${TICKER} in your account`
            return textWithdraw;
        }
    };

    async sendEmail({app_id, user, action, attributes={}}){
        let send = await MailSenderRepository.prototype.findApiKeyByAppId(app_id);
        try{
            if ((send.apiKey != null) && (send.apiKey != undefined)) {
                let template = send.templateIds.find((t) => { return t.functionName == action });
                if(!template){throw new Error(`Email Action ${action} does not exist`)}
                let apiKey = await Security.prototype.decryptData(send.apiKey)

                /* Create Sendinblue Client */
                var sendinBlueClient = new SendInBlue({key : apiKey});

                attributes = {
                    YOURNAME: user.name,
                    ...attributes
                };

                let templateId = template.template_id;
                let listIds = template.contactlist_Id;

                try {
                    await sendinBlueClient.createContact(user.email, attributes, [listIds]);
                } catch (e) {
                   await sendinBlueClient.updateContact(user.email, attributes);
                }
                await sendinBlueClient.sendTemplate(templateId, [user.email]);
            }

        }catch(err){
            Logger.error(err);
            console.log("Full Stack Error ", err)
        }
    }


}


export default Mailer;


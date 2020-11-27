import { SENDINBLUE_API_KEY } from '../../../config';
import SibApiV3Sdk from 'sib-api-v3-sdk';

class SendInBlue {

    constructor({ key }) {
        this.key = key;
        this.contactsAPI = new SibApiV3Sdk.ContactsApi();
        this.smtpAPI = new SibApiV3Sdk.SMTPApi();

        this.setAPI();
    }

    setAPI = () => {
        this.__getInstanceWithKeysToInstanceType(this.key);
    }

    __getInstanceWithKeysToInstanceType(key) {
        this.contactsAPI.apiClient.authentications['partner-key'].apiKey = key;
        this.smtpAPI.apiClient.authentications['api-key'].apiKey = key;
    }

    async createFolder(name) {
        this.setAPI();
        // let name = "Test Folder"
        let createFolder = { name };
        const data = await this.contactsAPI.createFolder(createFolder);
        return data;
    }

    async getFolders() {
        this.setAPI();
        let limit = 10;
        let offset = 0;
        const data = await this.contactsAPI.getFolders(limit, offset);
        return data;
    }

    async createList() {
        this.setAPI();
        let name = "Test List";
        let folderId = 3;
        let createList = { name, folderId };
        const data = await this.contactsAPI.createList(createList);
        return data;
    }

    async getLists() {
        this.setAPI();
        const data = await this.contactsAPI.getLists();
        return data;
    }

    async createAttribute(attributeName) {
        try {
            this.setAPI();
            let attributeCategory = "normal";
            // let attributeName = "TOKEN";
            let type = "text";
            let createAttribute = { type };
            const data = await this.contactsAPI.createAttribute(attributeCategory, attributeName, createAttribute);
            return data;
        } catch (error) {
            console.log({ status: error.status, message: error.message, origin: "SendInBlue-createAttribute" })
            return {
                error: true
            }
        }

    }

    async createContact(email, attributes, listIds) {
        try {
            this.setAPI();
            // email       => string with email to create
            // attributes  => object with the attributes what you desire to pass
            // listIds     => array of listIds that this contact will belong
            const createContact = { email, attributes, listIds };
            const data = await this.contactsAPI.createContact(createContact);
            return data;

        } catch (error) {
            console.log({ status: error.status, message: error.message, origin: "SendInBlue-createContact" })
            return {
                error: true
            }
        }
    }

    async updateContact(email, attributes) {
        try {
            this.setAPI();
            // email => email what you desire to update
            // attributes => parameters what you desire to update
            const updateContact = { attributes }
            const data = await this.contactsAPI.updateContact(email, updateContact);
            return data;
        } catch (error) {
            console.log({ status: error.status, message: error.message, origin: "SendInBlue-updateContact" })
            return {
                error: true
            }
        }

    }

    async getAtributes() {
        this.setAPI();
        const data = await this.contactsAPI.getAttributes();
        return data;
    }

    async getContacts() {
        try {
            this.setAPI();
            const data = await this.contactsAPI.getContacts();
            return data;
        } catch (error) {
            console.log({ status: error.status, message: error.message, origin: "SendInBlue-getContacts" })
            return {
                error: true
            }
        }
    }

    async getSmtpTemplates() {
        this.setAPI();
        const data = await this.smtpAPI.getSmtpTemplates();
        return data;
    }

    async sendTemplate(templateId, emailTo) {
        try {
            this.setAPI();
            const sendEmail = { emailTo };
            const data = await this.smtpAPI.sendTemplate(templateId, sendEmail);
            return data;
        } catch (error) {
            console.log({ status: error.status, message: error.message, origin: "SendInBlue-sendTemplate" })
            return {
                error: true
            }
        }

    }
}

let SendinBlueSingleton = new SendInBlue({ key: SENDINBLUE_API_KEY });

export {
    SendinBlueSingleton, // Default for the APp Itself
    SendInBlue
}
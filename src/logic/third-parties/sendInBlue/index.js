import { SENDINBLUE_API_KEY } from '../../../config';
import SibApiV3Sdk from 'sib-api-v3-sdk';

class SendInBlue {

    constructor({key}) {
        this.key = key;

        this.contactsAPI = new SibApiV3Sdk.ContactsApi();
        this.smtpAPI = new SibApiV3Sdk.SMTPApi();

        this.setAPI();
    }

    setAPI = () => {
        this.__getInstanceWithKeysToInstanceType(this.key);
    }

    __getInstanceWithKeysToInstanceType(key){
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
        this.setAPI();
        let attributeCategory = "normal";
        // let attributeName = "TOKEN";
        let type = "text";
        let createAttribute = { type };
        const data = await this.contactsAPI.createAttribute(attributeCategory, attributeName, createAttribute);
        return data;
    }

    async createContact(email, attributes, listIds) {
        this.setAPI();
        // email       => string with email to create
        // attributes  => object with the attributes what you desire to pass
        // listIds     => array of listIds that this contact will belong
        const createContact = { email, attributes, listIds };
        const data = await this.contactsAPI.createContact(createContact);
        return data;
    }

    async updateContact(email, attributes) {
        this.setAPI();
        // email => email what you desire to update
        // attributes => parameters what you desire to update
        const updateContact = { attributes }
        const data = await this.contactsAPI.updateContact(email, updateContact);
        return data;
    }

    async getAtributes() {
        this.setAPI();
        const data = await this.contactsAPI.getAttributes();
        return data;
    }

    async getContacts() {
        this.setAPI();
        const data = await this.contactsAPI.getContacts();
        return data;
    }

    async getSmtpTemplates() {
        this.setAPI();
        const data = await this.smtpAPI.getSmtpTemplates();
        return data;
    }

    async sendTemplate(templateId, emailTo) {
        this.setAPI();
        const sendEmail = { emailTo };
        const data = await this.smtpAPI.sendTemplate(templateId, sendEmail);
        return data;
    }
}

let SendinBlueSingleton = new SendInBlue({key : SENDINBLUE_API_KEY});

export {
    SendinBlueSingleton, // Default for the APp Itself
    SendInBlue
}
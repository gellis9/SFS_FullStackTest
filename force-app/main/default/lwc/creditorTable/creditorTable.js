import { LightningElement, wire, track } from 'lwc';
import getDebtList from '@salesforce/apex/DebtController.getDebtList';
import getCountDebt from '@salesforce/apex/DebtController.getCountDebt';
import getTotalDebt from '@salesforce/apex/DebtController.getTotalDebt';
import deleteDebtList from '@salesforce/apex/DebtController.deleteDebtList';
import { createRecord } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import DEBT_OBJECT from '@salesforce/schema/Debt__c';
import ID_FIELD from '@salesforce/schema/Debt__c.Id';
import CREDITOR_FIELD from '@salesforce/schema/Debt__c.Creditor__c';
import FIRSTNAME_FIELD from '@salesforce/schema/Debt__c.First_Name__c';
import LASTNAME_FIELD from '@salesforce/schema/Debt__c.Last_Name__c';
import MINPAY_FIELD from '@salesforce/schema/Debt__c.Min_Pay__c';
import BALANCE_FIELD from '@salesforce/schema/Debt__c.Balance__c';

const tableHeaders = [
    { label: 'Creditor', fieldName: 'Creditor__c', editable: true },
    { label: 'First Name', fieldName: 'First_Name__c', editable: true },
    { label: 'Last Name', fieldName: 'Last_Name__c', editable: true  },
    { label: 'Min Pay%', fieldName: 'Min_Pay__c', editable: true },
    { label: 'Balance', fieldName: 'Balance__c', type: 'currency' , editable: true }
];

export default class CreditorTable extends LightningElement {
    // reactive variable
    @track error;
    @track columns = tableHeaders;
    @track draftValues = [];
    @track totalRecords;
    @track totalBalance;
    @wire(getDebtList) debtRecords;
    @wire(getCountDebt) countDebtRecords;
    @wire(getTotalDebt) totalBalance;

    @track buttonLabel = 'Delete Selected Debt Records';
    @track isTrue = false;
    @track recordsCount = 0;
    @track selectedBalance = 0;

    //used for deleting record
    selectedRecords = [];

    //used for creating record
    debtObject = DEBT_OBJECT;
    myFields = [CREDITOR_FIELD, FIRSTNAME_FIELD,LASTNAME_FIELD, MINPAY_FIELD, BALANCE_FIELD];

    // Getting selected rows 
    getSelectedRecords(event) {
        // getting selected rows
        const selectedRows = event.detail.selectedRows;
        let selectedBalanceTemp = 0;
        this.recordsCount = event.detail.selectedRows.length;
        

        // this set elements the duplicates if any
        let debtIds = new Set();

        // getting selected record id
        for (let i = 0; i < selectedRows.length; i++) {
            debtIds.add(selectedRows[i].Id);
            selectedBalanceTemp += selectedRows[i].Balance__c;
        }

        this.selectedBalance = selectedBalanceTemp;

        // coverting to array
        this.selectedRecords = Array.from(debtIds);
    }

    deleteDebt(){
        if (this.selectedRecords) {
            // setting values to reactive variables
            this.buttonLabel = 'Processing....';
            this.isTrue = true;

            // calling apex class to delete selected records.
            deleteDebtList({listDebts: this.selectedRecords})
            .then(result => {
                this.buttonLabel = 'Delete Selected Debt Records';
                this.isTrue = false;

                // showing success message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success', 
                        message: this.recordsCount + ' Debt records are deleted.', 
                        variant: 'success'
                    }),
                );
                
                // Clearing selected row indexs 
                this.template.querySelector('lightning-datatable').selectedRows = [];

                this.recordsCount = 0;

                // refreshing table data using refresh apex
                return refreshApex(this.debtRecords);

            })
            .catch(error => {
                window.console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error while getting Debt Records', 
                        message: error.message, 
                        variant: 'error'
                    }),
                );
            });
        }
    }  

    handleDebtCreated() {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Debt created',
                variant: 'success',
            }),
        );

        setInterval(window.location.reload(),3000);
    }

    handleSave(event) {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[CREDITOR_FIELD.fieldApiName] = event.detail.draftValues[0].Creditor__c;
        fields[FIRSTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].First_Name__c;
        fields[LASTNAME_FIELD.fieldApiName] = event.detail.draftValues[0].Last_Name__c;
        fields[MINPAY_FIELD.fieldApiName] = event.detail.draftValues[0].Min_Pay__c;
        fields[BALANCE_FIELD.fieldApiName] = event.detail.draftValues[0].Balance__c;

        const recordInput = {fields};

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Debt updated',
                    variant: 'success'
                })
            );
            // Clear all draft values
            this.draftValues = [];

            // Display fresh data in the datatable
            return refreshApex(this.debtRecords);
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }
}
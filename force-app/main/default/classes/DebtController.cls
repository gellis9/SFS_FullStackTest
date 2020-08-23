public with sharing class DebtController {
    public static List<Debt__c> debtList = [SELECT Id, Creditor__c, First_Name__c, Last_Name__c, Min_Pay__c, Balance__c FROM Debt__c];
    @AuraEnabled(cacheable=true)
    public static List<Debt__c> getDebtList() {
        //List<Debt__c> debtList = [SELECT Id, Creditor__c, First_Name__c, Last_Name__c, Min_Pay__c, Balance__c FROM Debt__c];
        return debtList;
    }

    @AuraEnabled(cacheable=true)
    public static Integer getCountDebt() {
        return debtList.size();
    }

    @AuraEnabled(cacheable=true)
    public static Decimal getTotalDebt() {
        Decimal totalBalance = 0;
        for (Debt__c i : debtList){
            totalBalance += i.Balance__c;
        }
        return totalBalance;
    }

    @AuraEnabled
    public static void deleteDebtList(List<Id> listDebts){

        List<Debt__c> debtToDelete = [SELECT Id FROM Debt__c WHERE Id IN: listDebts];
        try {
            delete debtToDelete;
        } catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
        
    }
}
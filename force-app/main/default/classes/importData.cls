public class importData {
    @InvocableMethod
    public static void importData(List<String> URL) {
        List<Debt__c> debtToCreate = new List<Debt__c>();
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        System.debug(URL[0]);
        request.setEndpoint(URL[0]);
        request.setMethod('GET');
        request.setHeader('Content-Type', 'application/json');
        
        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() == 200){
            List<Object> debtObjs = (List<Object>) JSON.deserializeUntyped(response.getBody());
            System.debug(debtObjs);
            for (Object ithObj : debtObjs) {
                Map<String, Object> debtFields = (Map<String, Object>)ithObj;
                //Create Debt Records
                Debt__c newDebtRecord = new Debt__c(
                    Creditor__c  = (String)debtFields.get('creditorName'),
                    First_Name__c  = (String)debtFields.get('firstName'),
                    Last_Name__c  = (String)debtFields.get('lastName'),
                    External_ID__c = (Integer)debtFields.get('id'),
                    Min_Pay__c = (Decimal)debtFields.get('minPaymentPercentage'),
                    Balance__c = (Decimal)debtFields.get('balance')
                );
                debtToCreate.add(newDebtRecord);
            }
            
        } else {
            System.debug('The status code returned was not expected: ' +
                         response.getStatusCode() + ' ' + response.getStatus());
        }
        
        if (debtToCreate.size() > 0){
            Insert debtToCreate;
        }
    }
}

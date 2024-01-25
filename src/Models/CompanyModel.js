// CompanyModel.js
class CompanyModel {
    constructor(snapshot) {
        if (!CompanyModel.validateSnapshot(snapshot)) {
            console.error("Invalid snapshot structure");
            return; // or handle this situation appropriately
        }

        this.name = snapshot['Company Name'];
        this.contact = snapshot['Contact'];
        this.country = snapshot['Country'];
        this.description = snapshot['Description'];
        this.email = snapshot['Email'];
        this.file = snapshot['File']; // URL to a file, presumably
        this.isAdmin = snapshot['Is Admin']; // Boolean
        this.packages = snapshot['Package']; // Array of strings
        this.password = snapshot['Password']; // Presumably for authentication
        this.uid = snapshot.id; // Ensure 'id' is provided in the snapshot
    }

    static validateSnapshot(snapshot) {
        // Ensure all required fields are present in the snapshot
        const requiredFields = [
            'Company Name', 'Contact', 'Country', 'Description',
            'Email', 'File', 'Is Admin', 'Package', 'Password'
        ];
        return requiredFields.every(field => snapshot.hasOwnProperty(field));
    }

    // Add any other necessary static methods or helper functions here
}

export default CompanyModel;
